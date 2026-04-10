ALTER TABLE "users" RENAME COLUMN "authorityHost" TO "homeHost";--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "displayName" varchar;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "avatar" varchar;