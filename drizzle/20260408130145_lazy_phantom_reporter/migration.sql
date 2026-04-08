CREATE TYPE "relationship_type" AS ENUM('friend', 'blocked');--> statement-breakpoint
CREATE TABLE "authorities" (
	"host" varchar PRIMARY KEY
);
--> statement-breakpoint
CREATE TABLE "atproto_auth_sessions" (
	"did" varchar PRIMARY KEY,
	"data" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "atproto_auth_states" (
	"key" varchar PRIMARY KEY,
	"data" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auth_sessions" (
	"userDid" varchar NOT NULL,
	"token" varchar PRIMARY KEY,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auth_settings" (
	"userDid" varchar NOT NULL,
	"authId" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE "relationships" (
	"type" "relationship_type",
	"fromDid" varchar,
	"toDid" varchar,
	CONSTRAINT "relationships_pkey" PRIMARY KEY("fromDid","toDid","type")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"did" varchar PRIMARY KEY,
	"handle" varchar NOT NULL,
	"authorityHost" varchar,
	"indexedAt" timestamp
);
--> statement-breakpoint
ALTER TABLE "auth_sessions" ADD CONSTRAINT "auth_sessions_userDid_users_did_fkey" FOREIGN KEY ("userDid") REFERENCES "users"("did") ON DELETE CASCADE ON UPDATE CASCADE;--> statement-breakpoint
ALTER TABLE "auth_settings" ADD CONSTRAINT "auth_settings_userDid_users_did_fkey" FOREIGN KEY ("userDid") REFERENCES "users"("did") ON DELETE CASCADE ON UPDATE CASCADE;--> statement-breakpoint
ALTER TABLE "relationships" ADD CONSTRAINT "relationships_fromDid_users_did_fkey" FOREIGN KEY ("fromDid") REFERENCES "users"("did");--> statement-breakpoint
ALTER TABLE "relationships" ADD CONSTRAINT "relationships_toDid_users_did_fkey" FOREIGN KEY ("toDid") REFERENCES "users"("did");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_authorityHost_authorities_host_fkey" FOREIGN KEY ("authorityHost") REFERENCES "authorities"("host");