import { z } from "zod";

export const moduleRowSchema = z
  .object({ id: z.string().min(1) })
  .catchall(z.union([z.string(), z.number()]));
export const moduleListSchema = z.array(moduleRowSchema);
export type ModuleRow = z.infer<typeof moduleRowSchema>;
