import { z } from "zod";

const categorySchema = z.object({
  name: z.string().trim().min(1),
  subcategories: z
    .array(z.string().trim().min(1))
    .optional(),
}).strict();



export const spinTopicSchema = z.object({
  categories: z
    .array(
      z.object({
        id: z.string().min(1),
        subcategories: z.array(z.string().min(1)),
      }).strict()
    )
    .min(1)
    .optional(),
}).strict();

export type SpinFilters = z.infer<typeof spinTopicSchema>;