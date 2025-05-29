import { AccessRequestStatus } from "@prisma/client"
import { z } from "zod"

export const RequestAccessSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  reason: z.string().optional(),
})

export const UpdateAccessRequestSchema = z.object({
  id: z.string().cuid("Invalid request ID"),
  status: z.nativeEnum(AccessRequestStatus, {
    errorMap: () => ({ message: "Invalid status" }),
  }),
})
