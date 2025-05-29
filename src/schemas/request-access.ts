import { z } from "zod"

export const RequestAccessSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  reason: z.string().optional(),
})
