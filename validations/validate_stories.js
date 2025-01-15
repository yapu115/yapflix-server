import { z } from "zod";

const storySchema = z.object({
  userId: z.string().uuid(),
  date: z.date().optional(),
  type: z.enum(["image", "video"], "Invalid type").default("image"),
  media: z.array(z.string().url("Invalid URL")).optional(),
  expirationDate: z.date().optional(),
});

export function validateStory(input) {
  return storySchema.safeParse(input);
}

export function validatePartialStory(input) {
  return storySchema.partial().safeParse(input);
}
