ALTER TABLE "guardportal_peer_config" ADD COLUMN "configuration_address" text NOT NULL;--> statement-breakpoint
ALTER TABLE "guardportal_peer_config" ADD COLUMN "configuration_listen_port" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "guardportal_peer_config" ADD COLUMN "configuration_name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "guardportal_peer_config" ADD COLUMN "configuration_private_key" text NOT NULL;--> statement-breakpoint
ALTER TABLE "guardportal_peer_config" ADD COLUMN "configuration_public_key" text NOT NULL;