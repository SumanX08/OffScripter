import { z } from "zod";

const categorySchema = z.object({
  name: z.string().trim().min(1),
  subcategories: z
    .array(z.string().trim().min(1))
    .optional(),
}).strict();

export const spinTopicSchema = z.object({
  categories: z
    .array(categorySchema)
    .min(1)
    .max(13)
    .optional(),
}).strict().superRefine((data, ctx) => {
  const categories = data.categories ?? [];

  const categoryNames = categories.map((c) => c.name);

  if (new Set(categoryNames).size !== categoryNames.length) {
    ctx.addIssue({
      code: "custom",
      path: ["categories"],
      message: "Duplicate categories are not allowed.",
    });
  }

  categories.forEach((category, index) => {
    const subcategories = category.subcategories ?? [];

    if (new Set(subcategories).size !== subcategories.length) {
      ctx.addIssue({
        code: "custom",
        path: ["categories", index, "subcategories"],
        message: "Duplicate subcategories are not allowed.",
      });
    }
  });
});

export type SpinFilters = z.infer<typeof spinTopicSchema>;