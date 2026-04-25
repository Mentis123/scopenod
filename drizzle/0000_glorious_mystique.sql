CREATE TYPE "public"."acknowledgement_kind" AS ENUM('scope', 'completion');--> statement-breakpoint
CREATE TYPE "public"."approval_link_status" AS ENUM('active', 'used', 'expired', 'revoked');--> statement-breakpoint
CREATE TYPE "public"."approval_purpose" AS ENUM('scope', 'completion', 'service_record');--> statement-breakpoint
CREATE TYPE "public"."job_state" AS ENUM('draft', 'scope_sent', 'scope_acknowledged', 'scope_note_added', 'scope_unavailable', 'in_progress', 'scope_changed_after_ack', 'completion_sent', 'completion_note_added', 'completion_unavailable', 'completed', 'cancelled', 'blocked');--> statement-breakpoint
CREATE TYPE "public"."photo_check_result" AS ENUM('pending', 'usable', 'suggest_retake', 'check_unavailable');--> statement-breakpoint
CREATE TYPE "public"."photo_kind" AS ENUM('before', 'checkpoint', 'after', 'exception', 'other');--> statement-breakpoint
CREATE TYPE "public"."photo_upload_status" AS ENUM('queued', 'uploaded', 'failed');--> statement-breakpoint
CREATE TYPE "public"."scope_item_kind" AS ENUM('included', 'excluded', 'change');--> statement-breakpoint
CREATE TYPE "public"."unavailable_reason" AS ENUM('customer_dropped_keys_not_on_site', 'customer_asked_to_skip_review', 'no_mobile_signal', 'customer_declined_link_or_qr', 'other');--> statement-breakpoint
CREATE TABLE "approval_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" uuid NOT NULL,
	"service_record_id" uuid,
	"purpose" "approval_purpose" NOT NULL,
	"token_hash" text NOT NULL,
	"token_preview" text NOT NULL,
	"status" "approval_link_status" DEFAULT 'active' NOT NULL,
	"viewed_at" timestamp with time zone,
	"used_at" timestamp with time zone,
	"revoked_at" timestamp with time zone,
	"expires_at" timestamp with time zone NOT NULL,
	"created_by_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid,
	"job_id" uuid,
	"actor_user_id" uuid,
	"event_type" text NOT NULL,
	"public_summary" text,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customer_acknowledgements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" uuid NOT NULL,
	"approval_link_id" uuid,
	"kind" "acknowledgement_kind" NOT NULL,
	"customer_name" text NOT NULL,
	"customer_note" text,
	"checkbox_accepted" boolean DEFAULT true NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"acknowledged_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "job_exceptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" uuid NOT NULL,
	"preset" text,
	"title" text NOT NULL,
	"location" text,
	"note" text,
	"severity" text DEFAULT 'low' NOT NULL,
	"customer_visible" boolean DEFAULT true NOT NULL,
	"created_by_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "job_photos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" uuid NOT NULL,
	"checkpoint_id" uuid,
	"exception_id" uuid,
	"kind" "photo_kind" NOT NULL,
	"label" text NOT NULL,
	"note" text,
	"blob_url" text,
	"thumbnail_url" text,
	"raw_blob_url" text,
	"blob_pathname" text,
	"content_type" text,
	"size_bytes" integer,
	"status" "photo_upload_status" DEFAULT 'queued' NOT NULL,
	"captured_at" timestamp with time zone,
	"uploaded_at" timestamp with time zone,
	"exif" jsonb,
	"metadata" jsonb,
	"created_by_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"template_id" uuid,
	"created_by_id" uuid,
	"customer_name" text NOT NULL,
	"customer_phone" text,
	"customer_email" text,
	"customer_label" text NOT NULL,
	"service_label" text NOT NULL,
	"subject_label" text NOT NULL,
	"location_label" text,
	"public_note" text,
	"internal_note" text,
	"state" "job_state" DEFAULT 'draft' NOT NULL,
	"scope_changed_after_ack" boolean DEFAULT false NOT NULL,
	"scope_unavailable_reason" "unavailable_reason",
	"scope_unavailable_note" text,
	"completion_unavailable_reason" "unavailable_reason",
	"completion_unavailable_note" text,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "memberships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" text DEFAULT 'worker' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "photo_checks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" uuid,
	"photo_id" uuid,
	"provider" text DEFAULT 'stub' NOT NULL,
	"model_id" text,
	"result" "photo_check_result" NOT NULL,
	"confidence" integer,
	"suggestion" text,
	"latency_ms" integer,
	"estimated_cost_micros" integer,
	"raw_response" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scope_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" uuid NOT NULL,
	"kind" "scope_item_kind" NOT NULL,
	"label" text NOT NULL,
	"detail" text,
	"position" integer DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "service_checkpoints" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"template_id" uuid NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"instruction" text NOT NULL,
	"position" integer NOT NULL,
	"required" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "service_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" uuid NOT NULL,
	"public_token_hash" text,
	"public_token_preview" text,
	"status" text DEFAULT 'pending_acknowledgement' NOT NULL,
	"generated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"customer_acknowledged_at" timestamp with time zone,
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "service_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "approval_links" ADD CONSTRAINT "approval_links_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "approval_links" ADD CONSTRAINT "approval_links_service_record_id_service_records_id_fk" FOREIGN KEY ("service_record_id") REFERENCES "public"."service_records"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "approval_links" ADD CONSTRAINT "approval_links_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_events" ADD CONSTRAINT "audit_events_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_events" ADD CONSTRAINT "audit_events_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_events" ADD CONSTRAINT "audit_events_actor_user_id_users_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_acknowledgements" ADD CONSTRAINT "customer_acknowledgements_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_acknowledgements" ADD CONSTRAINT "customer_acknowledgements_approval_link_id_approval_links_id_fk" FOREIGN KEY ("approval_link_id") REFERENCES "public"."approval_links"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_exceptions" ADD CONSTRAINT "job_exceptions_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_exceptions" ADD CONSTRAINT "job_exceptions_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_photos" ADD CONSTRAINT "job_photos_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_photos" ADD CONSTRAINT "job_photos_checkpoint_id_service_checkpoints_id_fk" FOREIGN KEY ("checkpoint_id") REFERENCES "public"."service_checkpoints"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_photos" ADD CONSTRAINT "job_photos_exception_id_job_exceptions_id_fk" FOREIGN KEY ("exception_id") REFERENCES "public"."job_exceptions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_photos" ADD CONSTRAINT "job_photos_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_template_id_service_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."service_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "photo_checks" ADD CONSTRAINT "photo_checks_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "photo_checks" ADD CONSTRAINT "photo_checks_photo_id_job_photos_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."job_photos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scope_items" ADD CONSTRAINT "scope_items_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_checkpoints" ADD CONSTRAINT "service_checkpoints_template_id_service_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."service_templates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_records" ADD CONSTRAINT "service_records_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_templates" ADD CONSTRAINT "service_templates_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "approval_links_token_hash_idx" ON "approval_links" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "approval_links_job_purpose_idx" ON "approval_links" USING btree ("job_id","purpose");--> statement-breakpoint
CREATE INDEX "audit_events_job_created_at_idx" ON "audit_events" USING btree ("job_id","created_at");--> statement-breakpoint
CREATE INDEX "audit_events_event_type_idx" ON "audit_events" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "customer_acknowledgements_job_kind_idx" ON "customer_acknowledgements" USING btree ("job_id","kind");--> statement-breakpoint
CREATE INDEX "job_exceptions_job_idx" ON "job_exceptions" USING btree ("job_id");--> statement-breakpoint
CREATE INDEX "job_photos_job_kind_idx" ON "job_photos" USING btree ("job_id","kind");--> statement-breakpoint
CREATE INDEX "job_photos_checkpoint_idx" ON "job_photos" USING btree ("checkpoint_id");--> statement-breakpoint
CREATE INDEX "jobs_organization_state_idx" ON "jobs" USING btree ("organization_id","state");--> statement-breakpoint
CREATE INDEX "jobs_created_at_idx" ON "jobs" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "memberships_organization_user_idx" ON "memberships" USING btree ("organization_id","user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "organizations_slug_idx" ON "organizations" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "photo_checks_photo_idx" ON "photo_checks" USING btree ("photo_id");--> statement-breakpoint
CREATE INDEX "photo_checks_job_idx" ON "photo_checks" USING btree ("job_id");--> statement-breakpoint
CREATE INDEX "scope_items_job_kind_idx" ON "scope_items" USING btree ("job_id","kind");--> statement-breakpoint
CREATE INDEX "service_checkpoints_template_position_idx" ON "service_checkpoints" USING btree ("template_id","position");--> statement-breakpoint
CREATE UNIQUE INDEX "service_checkpoints_template_slug_idx" ON "service_checkpoints" USING btree ("template_id","slug");--> statement-breakpoint
CREATE UNIQUE INDEX "service_records_job_idx" ON "service_records" USING btree ("job_id");--> statement-breakpoint
CREATE UNIQUE INDEX "service_records_public_token_hash_idx" ON "service_records" USING btree ("public_token_hash");--> statement-breakpoint
CREATE UNIQUE INDEX "service_templates_organization_slug_idx" ON "service_templates" USING btree ("organization_id","slug");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");