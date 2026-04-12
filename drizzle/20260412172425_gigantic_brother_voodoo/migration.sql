CREATE TABLE "messages" (
	"tid" varchar PRIMARY KEY,
	"authorDid" varchar,
	"channelTid" varchar NOT NULL,
	"body" varchar
);
--> statement-breakpoint
ALTER TABLE "channels" ADD PRIMARY KEY ("tid");--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "indexedAt" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "indexedAt" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_authorDid_users_did_fkey" FOREIGN KEY ("authorDid") REFERENCES "users"("did") ON DELETE SET NULL ON UPDATE CASCADE;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_channelTid_channels_tid_fkey" FOREIGN KEY ("channelTid") REFERENCES "channels"("tid") ON DELETE CASCADE ON UPDATE CASCADE;