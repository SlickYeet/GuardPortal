import { TRPCError } from "@trpc/server"
import { and, desc, eq, getTableColumns, lt, or } from "drizzle-orm"
import { headers } from "next/headers"
import * as z from "zod"

import {
  DEFAULT_FETCH_LIMIT,
  DEFAULT_SITE_SETTINGS,
  SITE_SETTINGS_ID,
} from "@/constants"
import { env } from "@/env"
import { formatPeerConfigName } from "@/helpers/format-peer-config-name"
import { generatePeerConfig } from "@/helpers/generate-peer-config"
import {
  deletePeerConfigSchema,
  peerConfigInsertSchema,
} from "@/modules/admin/schema/config"
import { siteSettingsUpdateSchema } from "@/modules/admin/schema/site-settings"
import { deleteUserSchema } from "@/modules/admin/schema/user"
import { adminProcedure, createTRPCRouter } from "@/server/api/init"
import { auth } from "@/server/auth"
import {
  peerConfigTable,
  siteSettingsTable,
  userInsertSchema,
  user as userTable,
} from "@/server/db/schema"

export const adminRouter = createTRPCRouter({
  peerConfigs: createTRPCRouter({
    create: adminProcedure
      .input(
        peerConfigInsertSchema.omit({
          id: true,
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const [user] = await ctx.db
          .select()
          .from(userTable)
          .where(eq(userTable.id, input.userId))

        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: `User with ID ${input.userId} not found`,
          })
        }

        const configName = input.name
          ? input.name
          : formatPeerConfigName(user.name)

        return await generatePeerConfig({
          allowedIP: input.allowedIP,
          configName,
          userId: input.userId,
        })
      }),

    delete: adminProcedure
      .input(deletePeerConfigSchema)
      .mutation(async ({ ctx, input }) => {
        const [existingPeerConfig] = await ctx.db
          .select()
          .from(peerConfigTable)
          .where(eq(peerConfigTable.id, input.id))

        if (!existingPeerConfig) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: `Peer config with ID ${input.id} not found`,
          })
        }

        const reqOpts: RequestInit = {
          body: JSON.stringify({
            peers: [existingPeerConfig.id],
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

        const [deletedPeerConfig] = await ctx.db
          .delete(peerConfigTable)
          .where(eq(peerConfigTable.id, input.id))
          .returning()

        if (!deletedPeerConfig) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to delete peer config from database",
          })
        }

        return deletedPeerConfig
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
          peerId: z.string().nullish(),
        }),
      )
      .query(async ({ ctx, input }) => {
        const { cursor, limit } = input

        const peerConfigs = await ctx.db
          .select({
            ...getTableColumns(peerConfigTable),
            user: {
              email: userTable.email,
              id: userTable.id,
              name: userTable.name,
            },
          })
          .from(peerConfigTable)
          .leftJoin(userTable, eq(peerConfigTable.userId, userTable.id))
          .where(
            and(
              input.peerId ? eq(peerConfigTable.id, input.peerId) : undefined,
              cursor
                ? or(
                    lt(peerConfigTable.createdAt, cursor.createdAt),
                    and(
                      eq(peerConfigTable.createdAt, cursor.createdAt),
                      lt(peerConfigTable.id, cursor.id),
                    ),
                  )
                : undefined,
            ),
          )
          .orderBy(desc(peerConfigTable.createdAt), desc(peerConfigTable.id))
          .limit(limit + 1)

        const hasMore = peerConfigs.length > limit
        const items = hasMore ? peerConfigs.slice(0, -1) : peerConfigs
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
      .input(peerConfigInsertSchema.partial())
      .mutation(async ({ ctx, input }) => {
        if (!input.id) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Peer config ID is required",
          })
        }

        const [existingPeerConfig] = await ctx.db
          .select()
          .from(peerConfigTable)
          .where(eq(peerConfigTable.id, input.id))

        if (!existingPeerConfig) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: `Peer config with ID ${input.id} not found`,
          })
        }

        const wireguardPayload = {
          allowed_ip: input.allowedIP ?? existingPeerConfig.allowedIP,
          DNS: existingPeerConfig.dns,
          endpoint_allowed_ip: existingPeerConfig.endpointAllowedIPs,
          id: existingPeerConfig.id,
          keepalive: existingPeerConfig.keepAlive,
          mtu: existingPeerConfig.mtu,
          name: input.name ?? existingPeerConfig.name,
          preshared_key: existingPeerConfig.preSharedKey ?? "",
          private_key: existingPeerConfig.privateKey,
        }

        const reqOpts: RequestInit = {
          body: JSON.stringify(wireguardPayload),
          headers: {
            "Content-Type": "application/json",
            "wg-dashboard-apikey": env.WIREGUARD_API_KEY,
          },
          method: "POST",
          redirect: "follow",
        }

        const res = await fetch(
          `${env.WIREGUARD_API_ENDPOINT}/updatePeerSettings/${env.WIREGUARD_CONFIG_NAME}`,
          reqOpts,
        )

        if (!res.ok) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to update peer config in WireGuard",
          })
        }

        const [updatedPeerConfig] = await ctx.db
          .update(peerConfigTable)
          .set(input)
          .where(eq(peerConfigTable.id, input.id))
          .returning()

        if (!updatedPeerConfig) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to update peer config",
          })
        }

        return updatedPeerConfig
      }),
  }),

  siteSettings: createTRPCRouter({
    update: adminProcedure
      .input(siteSettingsUpdateSchema)
      .mutation(async ({ ctx, input }) => {
        const [settings] = await ctx.db
          .insert(siteSettingsTable)
          .values({
            announcementEnabled: input.announcementEnabled,
            announcementMessage: input.announcementMessage,
            appDescription: input.appDescription,
            appName: input.appName,
            defaultFetchLimit: input.defaultFetchLimit,
            discordUrl: input.discordUrl,
            fallbackQrUrl: input.fallbackQrUrl,
            id: SITE_SETTINGS_ID,
            maintenanceMode: input.maintenanceMode,
          })
          .onConflictDoUpdate({
            set: {
              announcementEnabled: input.announcementEnabled,
              announcementMessage: input.announcementMessage,
              appDescription: input.appDescription,
              appName: input.appName,
              defaultFetchLimit: input.defaultFetchLimit,
              discordUrl: input.discordUrl,
              fallbackQrUrl: input.fallbackQrUrl,
              maintenanceMode: input.maintenanceMode,
            },
            target: siteSettingsTable.id,
          })
          .returning()

        return (
          settings ?? {
            ...DEFAULT_SITE_SETTINGS,
            id: SITE_SETTINGS_ID,
            updatedAt: new Date(0),
          }
        )
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
        `${env.WIREGUARD_API_ENDPOINT}/getAvailableIPs/${env.WIREGUARD_CONFIG_NAME}`,
        reqOpts,
      )

      if (!res.ok) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch available peer IPs",
        })
      }

      const json = await res.json()
      const availableIPs = json.data as Record<string, string[]>

      return availableIPs
    }),
  }),
})
