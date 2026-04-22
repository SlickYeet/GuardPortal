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
CREATE TABLE "guardportal_user" (
	"ban_expires" timestamp,
	"banned" boolean DEFAULT false,
	"ban_reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"image" text,
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
ALTER TABLE "guardportal_session" ADD CONSTRAINT "guardportal_session_user_id_guardportal_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."guardportal_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "guardportal_account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "guardportal_session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_name_idx" ON "guardportal_user" USING btree ("name");--> statement-breakpoint
CREATE INDEX "user_email_idx" ON "guardportal_user" USING btree ("email");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "guardportal_verification" USING btree ("identifier");