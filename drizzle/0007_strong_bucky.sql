CREATE TABLE "guardportal_site_settings" (
	"announcement_enabled" boolean DEFAULT false NOT NULL,
	"announcement_message" text DEFAULT '' NOT NULL,
	"app_description" text DEFAULT 'An open-source WireGuard VPN client portal.' NOT NULL,
	"app_name" text DEFAULT 'GuardPortal' NOT NULL,
	"default_fetch_limit" integer DEFAULT 10 NOT NULL,
	"discord_url" text DEFAULT '' NOT NULL,
	"fallback_qr_url" text DEFAULT 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"maintenance_mode" boolean DEFAULT false NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
