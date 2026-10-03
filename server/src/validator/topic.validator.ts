import{ z} from "zod";

export const spinTopicSchema=z.object({
    category: z.string().min(1).optional(),
  difficulty: z
    .enum(["beginner", "intermediate", "advanced"])
    .optional(),
})