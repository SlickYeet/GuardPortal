import { z } from "zod"

export const ConfigSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long"),
  content: z.string(),
  userId: z.string().min(1, "User is required"),
  ipAddress: z
    .string()
    .optional()
    .refine((value) => value === "" || value?.startsWith("10."), {
      message: "IP address must start with 10.",
    }),
})
