import { z } from "zod"

export const SignInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(12, "Password must be at least 12 characters long"),
  rememberMe: z.boolean().optional(),
})

export const SignUpSchema = z
  .object({
    name: z.string().optional(),
    email: z.string().email("Invalid email address").optional(),
    password: z
      .string()
      .min(12, "Password must be at least 12 characters long")
      .optional(),
    confirmPassword: z
      .string()
      .min(12, "Confirm password must be at least 12 characters long")
      .optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
  })
