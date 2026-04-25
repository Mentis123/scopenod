ALTER TABLE "job_photos" ADD COLUMN "client_upload_id" text;--> statement-breakpoint
CREATE UNIQUE INDEX "job_photos_client_upload_idx" ON "job_photos" USING btree ("client_upload_id");