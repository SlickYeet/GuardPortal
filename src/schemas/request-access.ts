import { AccessRequestStatus } from "@prisma/client"
import { z } from "zod"

export const RequestAccessSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email("Invalid email address"),
  reason: z.string().optional(),
})

export const UpdateAccessRequestSchema = z.object({
  id: z.cuid("Invalid request ID"),
  status: z.enum(Object.values(AccessRequestStatus) as [string, ...string[]], {
    message: "Invalid status",
  }),
})
