import type {
  Customer,
  LoyaltySettings,
  LoyaltyTransaction,
} from "../schemas/customers";
import type { Order } from "@/features/orders/schemas/orders";

export interface CustomerListInput {
  query?: string;
  status?: "all" | Customer["status"];
  loyalty?: "all" | "enrolled" | "guest";
  branchId?: string | null;
  page?: number;
  pageSize?: number;
}

export interface CustomerSummary extends Customer {
  loyaltyBalance: number;
  orderCount: number;
  totalSpendMinor: number;
  lastOrderAt: string | null;
}

export interface CustomerDetail extends CustomerSummary {
  orders: readonly Order[];
  loyaltyTransactions: readonly LoyaltyTransaction[];
  complaintCount: number;
}

export interface CustomerPage {
  items: readonly CustomerSummary[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface CustomerMutationInput {
  name: string;
  phone: string;
  email: string | null;
  birthday: string | null;
  notes: string;
  address: string | null;
  enrollLoyalty: boolean;
}

/** Customer and loyalty contract shared by file and future HTTP adapters. */
export interface CustomerRepository {
  list(input: CustomerListInput): Promise<CustomerPage>;
  get(id: string): Promise<CustomerDetail | null>;
  create(input: CustomerMutationInput, actorId: string): Promise<Customer>;
  update(
    id: string,
    input: CustomerMutationInput,
    expectedVersion: number,
    actorId: string,
  ): Promise<Customer>;
  archive(
    id: string,
    expectedVersion: number,
    actorId: string,
  ): Promise<Customer>;
  adjustLoyalty(
    id: string,
    points: number,
    reason: string,
    commandId: string,
    actorId: string,
  ): Promise<LoyaltyTransaction>;
  getLoyaltySettings(): Promise<LoyaltySettings>;
  updateLoyaltySettings(
    spendPerPointMinor: number,
    pointsPerUnit: number,
    expectedVersion: number,
    actorId: string,
  ): Promise<LoyaltySettings>;
}
