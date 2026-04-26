import { relations } from "drizzle-orm"
import { index, pgTableCreator } from "drizzle-orm/pg-core"
import { createInsertSchema } from "drizzle-zod"

export const createTable = pgTableCreator((name) => `guardportal_${name}`)

export const peerConfigTable = createTable(
  "peer_config",
  (d) => ({
    allowedIP: d.text("allowed_ip").notNull(),
    configurationAddress: d.text("configuration_address").notNull(),
    configurationListenPort: d.integer("configuration_listen_port").notNull(),
    configurationName: d.text("configuration_name").notNull(),
    configurationPrivateKey: d.text("configuration_private_key").notNull(),
    configurationPublicKey: d.text("configuration_public_key").notNull(),
    dns: d.text("dns").notNull(),
    endpoint: d.text("endpoint").notNull(),
    endpointAllowedIPs: d.text("endpoint_allowed_ips").notNull(),
    id: d.text("id").primaryKey(),
    keepAlive: d.integer("keep_alive").notNull().default(21),
    mtu: d.integer("mtu").notNull().default(1420),
    name: d.text("name").notNull(),
    preSharedKey: d.text("pre_shared_key"),
    privateKey: d.text("private_key").notNull(),
    publicKey: d.text("public_key").notNull(),
    userId: d
      .text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  }),
  (t) => [index("peer_config_userId_idx").on(t.userId)],
)

export const peerConfigInsertSchema = createInsertSchema(peerConfigTable)
export type PeerConfig = typeof peerConfigTable.$inferSelect

export const user = createTable(
  "user",
  (d) => ({
    banExpires: d.timestamp("ban_expires"),
    banned: d.boolean("banned").default(false),
    banReason: d.text("ban_reason"),
    createdAt: d.timestamp("created_at").defaultNow().notNull(),
    email: d.text("email").notNull().unique(),
    emailVerified: d.boolean("email_verified").default(false).notNull(),
    id: d.text("id").primaryKey(),
    image: d.text("image").default("https://gravatar.com/avatar/HASH"),
    name: d.text("name").notNull(),
    role: d.text("role"),
    updatedAt: d
      .timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  }),
  (t) => [
    index("user_name_idx").on(t.name),
    index("user_email_idx").on(t.email),
  ],
)

export const userInsertSchema = createInsertSchema(user)

export const session = createTable(
  "session",
  (d) => ({
    createdAt: d.timestamp("created_at").defaultNow().notNull(),
    expiresAt: d.timestamp("expires_at").notNull(),
    id: d.text("id").primaryKey(),
    impersonatedBy: d.text("impersonated_by"),
    ipAddress: d.text("ip_address"),
    token: d.text("token").notNull().unique(),
    updatedAt: d
      .timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    userAgent: d.text("user_agent"),
    userId: d
      .text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  }),
  (t) => [index("session_userId_idx").on(t.userId)],
)

export const account = createTable(
  "account",
  (d) => ({
    accessToken: d.text("access_token"),
    accessTokenExpiresAt: d.timestamp("access_token_expires_at"),
    accountId: d.text("account_id").notNull(),
    createdAt: d.timestamp("created_at").defaultNow().notNull(),
    id: d.text("id").primaryKey(),
    idToken: d.text("id_token"),
    password: d.text("password"),
    providerId: d.text("provider_id").notNull(),
    refreshToken: d.text("refresh_token"),
    refreshTokenExpiresAt: d.timestamp("refresh_token_expires_at"),
    scope: d.text("scope"),
    updatedAt: d
      .timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    userId: d
      .text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  }),
  (t) => [index("account_userId_idx").on(t.userId)],
)

export const verification = createTable(
  "verification",
  (d) => ({
    createdAt: d.timestamp("created_at").defaultNow().notNull(),
    expiresAt: d.timestamp("expires_at").notNull(),
    id: d.text("id").primaryKey(),
    identifier: d.text("identifier").notNull(),
    updatedAt: d
      .timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    value: d.text("value").notNull(),
  }),
  (t) => [index("verification_identifier_idx").on(t.identifier)],
)

export const userRelations = relations(user, ({ many }) => ({
  accounts: many(account),
  sessions: many(session),
}))

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}))

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}))
