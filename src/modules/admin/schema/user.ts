import * as z from "zod"

export const deleteUserSchema = z.object({
  deleteConfig: z.boolean(),
  id: z.string(),
})
