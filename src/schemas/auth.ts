import { z } from "zod"

export const SignInSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(12, "Password must be at least 12 characters long"),
  rememberMe: z.boolean().optional(),
})

export const SignUpSchema = z
  .object({
    name: z.string().optional(),
    email: z.email("Invalid email address").optional(),
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

export const FirstTimeLoginSchema = z
  .object({
    email: z.email("Please enter a valid email address"),
    password: z
      .string()
      .min(12, "Password must be at least 12 characters long")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(
        /[^A-Za-z0-9]/,
        "Password must contain at least one special character",
      ),
    confirmPassword: z.string().nonempty("Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
