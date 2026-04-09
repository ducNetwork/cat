CREATE TYPE "relationshipStatus" AS ENUM('pending', 'active');--> statement-breakpoint
ALTER TYPE "relationship_type" RENAME TO "relationshipType";--> statement-breakpoint
ALTER TABLE "relationships" ADD COLUMN "status" "relationshipStatus" NOT NULL;--> statement-breakpoint
ALTER TABLE "relationships" DROP CONSTRAINT "relationships_pkey";--> statement-breakpoint
ALTER TABLE "relationships" ADD PRIMARY KEY ("fromDid","toDid");