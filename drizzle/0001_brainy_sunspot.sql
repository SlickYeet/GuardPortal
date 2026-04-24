CREATE TABLE "guardportal_peer_config" (
	"allowed_ips" text NOT NULL,
	"dns" text NOT NULL,
	"endpoint" text NOT NULL,
	"endpoint_allowed_ip" text NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"keep_alive" integer DEFAULT 21 NOT NULL,
	"mtu" integer DEFAULT 1420 NOT NULL,
	"name" text NOT NULL,
	"pre_shared_key" text NOT NULL,
	"private_key" text NOT NULL,
	"public_key" text NOT NULL,
	"user_id" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "guardportal_user" ALTER COLUMN "image" SET DEFAULT 'https://gravatar.com/avatar/HASH';--> statement-breakpoint
ALTER TABLE "guardportal_peer_config" ADD CONSTRAINT "guardportal_peer_config_user_id_guardportal_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."guardportal_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "peer_config_userId_idx" ON "guardportal_peer_config" USING btree ("user_id");