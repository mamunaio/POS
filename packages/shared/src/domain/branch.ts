import { z } from "zod";

export const BranchSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  address: z.string().nullable().optional(),
  active: z.boolean().default(true),
  updatedAt: z.string().datetime(),
});

export type Branch = z.infer<typeof BranchSchema>;
