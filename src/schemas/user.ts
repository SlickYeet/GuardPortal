import { z } from "zod"

export const userSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long"),
  email: z.string().email("Invalid email address"),
  ipAddress: z
    .string()
    .optional()
    .refine((value) => value === "" || value?.startsWith("10."), {
      message: "IP address must start with 10.",
    }),
})
