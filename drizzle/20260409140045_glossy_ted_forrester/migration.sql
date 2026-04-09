CREATE TYPE "channelMembershipStatus" AS ENUM('pending', 'active');--> statement-breakpoint
CREATE TABLE "channelMemberships" (
	"channelTid" varchar NOT NULL,
	"userDid" varchar NOT NULL,
	"status" "channelMembershipStatus" DEFAULT 'active'::"channelMembershipStatus" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "channels" (
	"tid" varchar NOT NULL,
	"name" varchar,
	"parentTid" varchar
);
