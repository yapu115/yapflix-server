import { z } from "zod";

const postSchema = z.object({
  userId: z.string().uuid(),
  date: z.date().optional(),
  likes: z.number().int().nonnegative().default(0),
  comments: z.array(z.string()).optional(),
  pictures: z.array(z.string().url("Invalid URL")).optional(),
  message: z.string().max(500, "Message is too long").optional(),
  urlMediaImage: z.string().url("invalid URL"),
});

export function validatePost(input) {
  return postSchema.safeParse(input);
}

export function validatePartialPost(input) {
  return postSchema.partial().safeParse(input);
}
