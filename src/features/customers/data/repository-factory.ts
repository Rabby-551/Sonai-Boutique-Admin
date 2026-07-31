import "server-only";
import { env } from "@/lib/env";
import type { CustomerRepository } from "./repository";
import { FileCustomerRepository } from "./file-repository";
import { HttpCustomerRepository } from "./http-repository";

export function getCustomerRepository(): CustomerRepository {
  return env.DATA_SOURCE === "api"
    ? new HttpCustomerRepository()
    : new FileCustomerRepository();
}
