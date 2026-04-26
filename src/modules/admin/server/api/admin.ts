import { TRPCError } from "@trpc/server"
import { and, desc, eq, getTableColumns, lt, or } from "drizzle-orm"
import { headers } from "next/headers"
import * as z from "zod"

import { DEFAULT_FETCH_LIMIT } from "@/constants"
import { env } from "@/env"
import { generatePeerConfig } from "@/helpers/generate-peer-config"
import { deleteUserSchema } from "@/modules/admin/schema/user"
import { adminProcedure, createTRPCRouter } from "@/server/api/init"
import { auth } from "@/server/auth"
import {
  peerConfigInsertSchema,
  peerConfigTable,
  userInsertSchema,
  user as userTable,
} from "@/server/db/schema"

export const adminRouter = createTRPCRouter({
  peerConfig: createTRPCRouter({
    create: adminProcedure
      .input(
        peerConfigInsertSchema.pick({
          allowedIP: true,
          name: true,
          userId: true,
        }),
      )
      .mutation(async ({ input }) => {
        return await generatePeerConfig({
          allowedIP: input.allowedIP,
          name: input.name,
          userId: input.userId,
        })
      }),
  }),

  users: createTRPCRouter({
    create: adminProcedure
      .input(
        userInsertSchema.pick({
          email: true,
          emailVerified: true,
          name: true,
          role: true,
        }),
      )
      .mutation(async ({ input }) => {
        const role = (input.role ?? "user") as "admin" | "user"

        const newUser = await auth.api.createUser({
          body: {
            data: {
              emailVerified: input.emailVerified,
            },
            email: input.email,
            name: input.name,
            // TODO: generate a random password and email it to the user
            // password: crypto.randomUUID(),
            role,
          },
        })

        if (!newUser) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create user",
          })
        }

        /**
         * ? Peer configs are created using databaseHooks in the auth config.
         * * src/server/auth/index.ts
         */

        return newUser
      }),

    delete: adminProcedure
      .input(deleteUserSchema)
      .mutation(async ({ ctx, input }) => {
        const { id: adminUserId } = ctx.session.user

        if (input.id === adminUserId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "You cannot delete your own user",
          })
        }

        const [existingUser] = await ctx.db
          .select({
            id: userTable.id,
            peerConfigId: peerConfigTable.id,
          })
          .from(userTable)
          .leftJoin(peerConfigTable, eq(userTable.id, peerConfigTable.userId))
          .where(eq(userTable.id, input.id))

        if (!existingUser) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: `User with ID ${input.id} not found`,
          })
        }

        if (input.deleteConfig) {
          const reqOpts: RequestInit = {
            body: JSON.stringify({
              peers: [existingUser.peerConfigId],
            }),
            headers: {
              "Content-Type": "application/json",
              "wg-dashboard-apikey": env.WIREGUARD_API_KEY,
            },
            method: "POST",
            redirect: "follow",
          }

          const res = await fetch(
            `${env.WIREGUARD_API_ENDPOINT}/deletePeers/${env.WIREGUARD_CONFIG_NAME}`,
            reqOpts,
          )

          if (!res.ok) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Failed to delete peer config from WireGuard",
            })
          }

          await ctx.db
            .delete(peerConfigTable)
            .where(eq(peerConfigTable.userId, input.id))
        }

        const deletedUser = await auth.api.removeUser({
          body: {
            userId: input.id,
          },
          headers: await headers(),
        })

        if (!deletedUser) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to delete user",
          })
        }

        return deletedUser
      }),

    list: adminProcedure
      .input(
        z.object({
          cursor: z
            .object({
              createdAt: z.date(),
              id: z.string(),
            })
            .nullish(),
          limit: z.number().min(1).max(100).default(DEFAULT_FETCH_LIMIT),
        }),
      )
      .query(async ({ ctx, input }) => {
        const { cursor, limit } = input

        const users = await ctx.db
          .select({
            ...getTableColumns(userTable),
            peerConfig: {
              ...getTableColumns(peerConfigTable),
            },
          })
          .from(userTable)
          .leftJoin(peerConfigTable, eq(userTable.id, peerConfigTable.userId))
          .where(
            cursor
              ? or(
                  lt(userTable.createdAt, cursor.createdAt),
                  and(
                    eq(userTable.createdAt, cursor.createdAt),
                    lt(userTable.id, cursor.id),
                  ),
                )
              : undefined,
          )
          .orderBy(desc(userTable.createdAt), desc(userTable.id))
          .limit(limit + 1)

        const hasMore = users.length > limit
        const items = hasMore ? users.slice(0, -1) : users
        const lastItem = items[items.length - 1]
        const nextCursor =
          hasMore && lastItem
            ? { createdAt: lastItem.createdAt, id: lastItem.id }
            : null

        return {
          items,
          nextCursor,
        }
      }),

    update: adminProcedure
      .input(userInsertSchema.partial())
      .mutation(async ({ ctx, input }) => {
        const { id: adminUserId } = ctx.session.user

        if (!input.id) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "User ID is required",
          })
        }
        if (input.id === adminUserId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "You cannot update your own user",
          })
        }

        const [existingUser] = await ctx.db
          .select()
          .from(userTable)
          .where(eq(userTable.id, input.id))

        if (!existingUser) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: `User with ID ${input.id} not found`,
          })
        }

        const [updatedUser] = await ctx.db
          .update(userTable)
          .set(input)
          .where(eq(userTable.id, input.id))
          .returning()

        if (!updatedUser) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to update user",
          })
        }

        return updatedUser
      }),
  }),

  wireguard: createTRPCRouter({
    getAvailablePeerIPs: adminProcedure.query(async () => {
      const reqOpts: RequestInit = {
        headers: {
          "wg-dashboard-apikey": env.WIREGUARD_API_KEY,
        },
        method: "GET",
        redirect: "follow",
      }

      const res = await fetch(
        `${env.WIREGUARD_API_ENDPOINT}/getAvailablePeerIPs/${env.WIREGUARD_CONFIG_NAME}`,
        reqOpts,
      )

      if (!res.ok) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch available peer IPs",
        })
      }

      const json = await res.json()
      return json.data
    }),
  }),
})
