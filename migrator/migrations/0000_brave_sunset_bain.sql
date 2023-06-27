CREATE TABLE IF NOT EXISTS "user_profile" (
	"id" uuid,
	"email" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
