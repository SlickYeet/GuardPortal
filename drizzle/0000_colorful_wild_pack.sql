CREATE TABLE "guardportal_account" (
	"access_token" text,
	"access_token_expires_at" timestamp,
	"account_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"id_token" text,
	"password" text,
	"provider_id" text NOT NULL,
	"refresh_token" text,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"updated_at" timestamp NOT NULL,
	"user_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "guardportal_peer_config" (
	"allowed_ip" text NOT NULL,
	"configuration_address" text NOT NULL,
	"configuration_listen_port" integer NOT NULL,
	"configuration_name" text NOT NULL,
	"configuration_private_key" text NOT NULL,
	"configuration_public_key" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"dns" text NOT NULL,
	"endpoint" text NOT NULL,
	"endpoint_allowed_ips" text NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"keep_alive" integer DEFAULT 21 NOT NULL,
	"mtu" integer DEFAULT 1420 NOT NULL,
	"name" text NOT NULL,
	"pre_shared_key" text,
	"private_key" text NOT NULL,
	"public_key" text NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"user_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "guardportal_session" (
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"impersonated_by" text,
	"ip_address" text,
	"token" text NOT NULL,
	"updated_at" timestamp NOT NULL,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "guardportal_session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "guardportal_site_settings" (
	"announcement_enabled" boolean DEFAULT false NOT NULL,
	"announcement_message" text DEFAULT '' NOT NULL,
	"app_description" text DEFAULT 'An open-source WireGuard VPN client portal.' NOT NULL,
	"app_name" text DEFAULT 'GuardPortal' NOT NULL,
	"default_fetch_limit" integer DEFAULT 10 NOT NULL,
	"discord_url" text DEFAULT 'https://discord.gg/JyPaEB9Thj' NOT NULL,
	"fallback_qr_url" text DEFAULT 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"maintenance_mode" boolean DEFAULT false NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "guardportal_user" (
	"ban_expires" timestamp,
	"banned" boolean DEFAULT false,
	"ban_reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"image" text DEFAULT 'https://gravatar.com/avatar/HASH',
	"name" text NOT NULL,
	"role" text,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "guardportal_user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "guardportal_verification" (
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"value" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "guardportal_account" ADD CONSTRAINT "guardportal_account_user_id_guardportal_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."guardportal_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guardportal_peer_config" ADD CONSTRAINT "guardportal_peer_config_user_id_guardportal_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."guardportal_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guardportal_session" ADD CONSTRAINT "guardportal_session_user_id_guardportal_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."guardportal_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "guardportal_account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "peer_config_userId_idx" ON "guardportal_peer_config" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "guardportal_session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_name_idx" ON "guardportal_user" USING btree ("name");--> statement-breakpoint
CREATE INDEX "user_email_idx" ON "guardportal_user" USING btree ("email");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "guardportal_verification" USING btree ("identifier");