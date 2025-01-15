import { z } from "zod";

const userSchema = z.object({
  username: z
    .string({
      invalid_type_error: "Username must be a string",
      required_error: "Username is required",
    })
    .min(3, "Username must be at least 3 characters long")
    .max(20, "Username can't be more than 20 characters long"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  email: z
    .string({
      invalid_type_error: "Email must be a string",
      required_error: "Email is required",
    })
    .email("Invalid email address format")
    .max(100, "Email can't be more than 100 characters long"),
});

export function validateUser(input) {
  return userSchema.safeParse(input);
}

export function validatePartialUser(input) {
  return userSchema.partial().safeParse(input); // If the propieties are there it will validate, if not it wont
}
