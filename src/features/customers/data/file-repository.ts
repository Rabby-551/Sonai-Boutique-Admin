import { randomUUID } from "node:crypto";
import { ShonaiFileStore } from "@/lib/mock-store/file-store";
import type { ShonaiStore } from "@/lib/mock-store/schema";
import { OperationsError } from "@/lib/operations-error";
import type { Customer, LoyaltyTransaction } from "../schemas/customers";
import { normalizeBangladeshPhone } from "../utils/customer-contact";
import type {
  CustomerDetail,
  CustomerListInput,
  CustomerMutationInput,
  CustomerRepository,
  CustomerSummary,
} from "./repository";

export class FileCustomerRepository implements CustomerRepository {
  constructor(private readonly store = new ShonaiFileStore()) {}

  async list(input: CustomerListInput) {
    const store = await this.store.read();
    const query = input.query?.trim().toLowerCase();
    const items = store.customers.filter((customer) => {
      const branchMatch =
        !input.branchId ||
        store.orders.some(
          (order) =>
            order.customerId === customer.id &&
            order.fulfillmentLocationId === input.branchId,
        );
      return (
        branchMatch &&
        (!query ||
          `${customer.name} ${customer.phone} ${customer.email ?? ""}`
            .toLowerCase()
            .includes(query)) &&
        (!input.status ||
          input.status === "all" ||
          customer.status === input.status) &&
        (!input.loyalty ||
          input.loyalty === "all" ||
          (input.loyalty === "enrolled"
            ? customer.loyaltyEnrolledAt !== null
            : customer.loyaltyEnrolledAt === null))
      );
    });
    const summaries = items
      .map((item) => this.summary(store, item))
      .toSorted((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    const pageSize = Math.min(Math.max(input.pageSize ?? 20, 1), 100);
    const totalPages = Math.max(1, Math.ceil(summaries.length / pageSize));
    const page = Math.min(Math.max(input.page ?? 1, 1), totalPages);
    return {
      items: summaries.slice((page - 1) * pageSize, page * pageSize),
      page,
      pageSize,
      totalItems: summaries.length,
      totalPages,
    };
  }

  async get(id: string): Promise<CustomerDetail | null> {
    const store = await this.store.read();
    const customer = store.customers.find((item) => item.id === id);
    if (!customer) return null;
    return {
      ...this.summary(store, customer),
      orders: store.orders
        .filter((order) => order.customerId === id)
        .toSorted((a, b) => b.createdAt.localeCompare(a.createdAt)),
      loyaltyTransactions: store.loyaltyTransactions
        .filter((entry) => entry.customerId === id)
        .toSorted((a, b) => b.occurredAt.localeCompare(a.occurredAt)),
      complaintCount: store.complaints.filter((item) => item.customerId === id)
        .length,
    };
  }

  async create(input: CustomerMutationInput, actorId: string) {
    void actorId;
    return this.store.transaction((store) => {
      const phone = this.phone(input.phone);
      this.assertUnique(store, phone, input.email, null);
      const now = new Date().toISOString();
      const customer: Customer = {
        id: `cus-${randomUUID()}`,
        name: input.name,
        phone,
        email: input.email,
        birthday: input.birthday,
        notes: input.notes,
        status: "active",
        kind: input.enrollLoyalty ? "registered" : "guest",
        loyaltyEnrolledAt: input.enrollLoyalty ? now : null,
        addresses: input.address
          ? [
              {
                id: `addr-${randomUUID()}`,
                label: "Primary",
                address: input.address,
              },
            ]
          : [],
        createdAt: now,
        updatedAt: now,
        version: 1,
      };
      store.customers.push(customer);
      return customer;
    });
  }

  async update(
    id: string,
    input: CustomerMutationInput,
    expectedVersion: number,
    actorId: string,
  ) {
    void actorId;
    return this.store.transaction((store) => {
      const customer = this.customer(store, id, expectedVersion);
      const phone = this.phone(input.phone);
      this.assertUnique(store, phone, input.email, id);
      customer.name = input.name;
      customer.phone = phone;
      customer.email = input.email;
      customer.birthday = input.birthday;
      customer.notes = input.notes;
      if (input.address) {
        const primary = customer.addresses[0];
        if (primary) primary.address = input.address;
        else
          customer.addresses.push({
            id: `addr-${randomUUID()}`,
            label: "Primary",
            address: input.address,
          });
      }
      if (input.enrollLoyalty && !customer.loyaltyEnrolledAt) {
        customer.loyaltyEnrolledAt = new Date().toISOString();
        customer.kind = "registered";
      }
      customer.version += 1;
      customer.updatedAt = new Date().toISOString();
      return customer;
    });
  }

  async archive(id: string, expectedVersion: number, actorId: string) {
    void actorId;
    return this.store.transaction((store) => {
      const customer = this.customer(store, id, expectedVersion);
      customer.status = "archived";
      customer.version += 1;
      customer.updatedAt = new Date().toISOString();
      return customer;
    });
  }

  async adjustLoyalty(
    id: string,
    points: number,
    reason: string,
    commandId: string,
    actorId: string,
  ) {
    return this.store.transaction((store) => {
      const existing = store.loyaltyTransactions.find(
        (item) => item.commandId === commandId,
      );
      if (existing) return existing;
      const customer = store.customers.find((item) => item.id === id);
      if (!customer)
        throw new OperationsError("NOT_FOUND", "Customer not found.");
      if (!customer.loyaltyEnrolledAt)
        throw new OperationsError(
          "VALIDATION",
          "Enroll the customer before adjusting loyalty.",
        );
      const balance = this.loyaltyBalance(store, id);
      if (balance + points < 0)
        throw new OperationsError(
          "VALIDATION",
          "Loyalty balance cannot become negative.",
        );
      const entry: LoyaltyTransaction = {
        id: `loy-${randomUUID()}`,
        customerId: id,
        type: "adjustment",
        points,
        reason,
        orderId: null,
        returnId: null,
        spendPerPointMinor: null,
        pointsPerUnit: null,
        actorId,
        commandId,
        occurredAt: new Date().toISOString(),
      };
      store.loyaltyTransactions.push(entry);
      store.processedCommands.push(commandId);
      return entry;
    });
  }

  async getLoyaltySettings() {
    return (await this.store.read()).loyaltySettings;
  }

  async updateLoyaltySettings(
    spendPerPointMinor: number,
    pointsPerUnit: number,
    expectedVersion: number,
    actorId: string,
  ) {
    return this.store.transaction((store) => {
      if (store.loyaltySettings.version !== expectedVersion)
        throw new OperationsError(
          "CONFLICT",
          "Loyalty settings changed. Refresh and review them.",
        );
      store.loyaltySettings = {
        spendPerPointMinor,
        pointsPerUnit,
        version: expectedVersion + 1,
        updatedAt: new Date().toISOString(),
        updatedBy: actorId,
      };
      return store.loyaltySettings;
    });
  }

  private summary(store: ShonaiStore, customer: Customer): CustomerSummary {
    const orders = store.orders.filter(
      (order) => order.customerId === customer.id,
    );
    const delivered = orders.filter((order) => order.status === "delivered");
    return {
      ...customer,
      loyaltyBalance: this.loyaltyBalance(store, customer.id),
      orderCount: orders.length,
      totalSpendMinor: delivered.reduce(
        (sum, order) => sum + order.totalMinor,
        0,
      ),
      lastOrderAt:
        orders.toSorted((a, b) => b.createdAt.localeCompare(a.createdAt))[0]
          ?.createdAt ?? null,
    };
  }

  private loyaltyBalance(store: ShonaiStore, id: string) {
    return store.loyaltyTransactions
      .filter((entry) => entry.customerId === id)
      .reduce((sum, entry) => sum + entry.points, 0);
  }

  private customer(store: ShonaiStore, id: string, version: number) {
    const customer = store.customers.find((item) => item.id === id);
    if (!customer)
      throw new OperationsError("NOT_FOUND", "Customer not found.");
    if (customer.version !== version)
      throw new OperationsError(
        "CONFLICT",
        "Customer changed. Refresh and review it.",
      );
    return customer;
  }

  private assertUnique(
    store: ShonaiStore,
    phone: string,
    email: string | null,
    exceptId: string | null,
  ) {
    const duplicatePhone = store.customers.find(
      (item) => item.id !== exceptId && item.phone === phone,
    );
    if (duplicatePhone)
      throw new OperationsError(
        "DUPLICATE_CUSTOMER",
        `A customer already uses this phone (${duplicatePhone.id}).`,
      );
    const duplicateEmail =
      email &&
      store.customers.find(
        (item) =>
          item.id !== exceptId &&
          item.email?.toLowerCase() === email.toLowerCase(),
      );
    if (duplicateEmail)
      throw new OperationsError(
        "DUPLICATE_CUSTOMER",
        `Review the customer already using this email (${duplicateEmail.id}).`,
      );
  }

  private phone(value: string) {
    try {
      return normalizeBangladeshPhone(value);
    } catch {
      throw new OperationsError(
        "VALIDATION",
        "Use a valid Bangladesh mobile number.",
      );
    }
  }
}
