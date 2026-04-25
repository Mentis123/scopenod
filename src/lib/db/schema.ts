import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid
} from "drizzle-orm/pg-core";

export const jobStateEnum = pgEnum("job_state", [
  "draft",
  "scope_sent",
  "scope_acknowledged",
  "scope_note_added",
  "scope_unavailable",
  "in_progress",
  "scope_changed_after_ack",
  "completion_sent",
  "completion_note_added",
  "completion_unavailable",
  "completed",
  "cancelled",
  "blocked"
]);

export const scopeItemKindEnum = pgEnum("scope_item_kind", ["included", "excluded", "change"]);
export const photoKindEnum = pgEnum("photo_kind", [
  "before",
  "checkpoint",
  "after",
  "exception",
  "other"
]);
export const photoUploadStatusEnum = pgEnum("photo_upload_status", [
  "queued",
  "uploaded",
  "failed"
]);
export const photoCheckResultEnum = pgEnum("photo_check_result", [
  "pending",
  "usable",
  "suggest_retake",
  "check_unavailable"
]);
export const approvalPurposeEnum = pgEnum("approval_purpose", [
  "scope",
  "completion",
  "service_record"
]);
export const approvalLinkStatusEnum = pgEnum("approval_link_status", [
  "active",
  "used",
  "expired",
  "revoked"
]);
export const acknowledgementKindEnum = pgEnum("acknowledgement_kind", ["scope", "completion"]);
export const unavailableReasonEnum = pgEnum("unavailable_reason", [
  "customer_dropped_keys_not_on_site",
  "customer_asked_to_skip_review",
  "no_mobile_signal",
  "customer_declined_link_or_qr",
  "other"
]);

const id = () => uuid("id").defaultRandom().primaryKey();
const createdAt = () =>
  timestamp("created_at", { withTimezone: true }).notNull().defaultNow();
const updatedAt = () =>
  timestamp("updated_at", { withTimezone: true }).notNull().defaultNow();

export const organizations = pgTable("organizations", {
  id: id(),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  createdAt: createdAt(),
  updatedAt: updatedAt()
}, (table) => ({
  slugIdx: uniqueIndex("organizations_slug_idx").on(table.slug)
}));

export const users = pgTable("users", {
  id: id(),
  email: text("email").notNull(),
  name: text("name"),
  createdAt: createdAt(),
  updatedAt: updatedAt()
}, (table) => ({
  emailIdx: uniqueIndex("users_email_idx").on(table.email)
}));

export const memberships = pgTable("memberships", {
  id: id(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  role: text("role").notNull().default("worker"),
  createdAt: createdAt()
}, (table) => ({
  organizationUserIdx: uniqueIndex("memberships_organization_user_idx").on(
    table.organizationId,
    table.userId
  )
}));

export const serviceTemplates = pgTable("service_templates", {
  id: id(),
  organizationId: uuid("organization_id").references(() => organizations.id, {
    onDelete: "cascade"
  }),
  slug: text("slug").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  active: boolean("active").notNull().default(true),
  createdAt: createdAt(),
  updatedAt: updatedAt()
}, (table) => ({
  organizationSlugIdx: uniqueIndex("service_templates_organization_slug_idx").on(
    table.organizationId,
    table.slug
  )
}));

export const serviceCheckpoints = pgTable("service_checkpoints", {
  id: id(),
  templateId: uuid("template_id")
    .notNull()
    .references(() => serviceTemplates.id, { onDelete: "cascade" }),
  slug: text("slug").notNull(),
  title: text("title").notNull(),
  instruction: text("instruction").notNull(),
  position: integer("position").notNull(),
  required: boolean("required").notNull().default(true),
  createdAt: createdAt()
}, (table) => ({
  templatePositionIdx: index("service_checkpoints_template_position_idx").on(
    table.templateId,
    table.position
  ),
  templateSlugIdx: uniqueIndex("service_checkpoints_template_slug_idx").on(
    table.templateId,
    table.slug
  )
}));

export const jobs = pgTable("jobs", {
  id: id(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  templateId: uuid("template_id").references(() => serviceTemplates.id),
  createdById: uuid("created_by_id").references(() => users.id),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone"),
  customerEmail: text("customer_email"),
  customerLabel: text("customer_label").notNull(),
  serviceLabel: text("service_label").notNull(),
  subjectLabel: text("subject_label").notNull(),
  locationLabel: text("location_label"),
  publicNote: text("public_note"),
  internalNote: text("internal_note"),
  state: jobStateEnum("state").notNull().default("draft"),
  scopeChangedAfterAck: boolean("scope_changed_after_ack").notNull().default(false),
  scopeUnavailableReason: unavailableReasonEnum("scope_unavailable_reason"),
  scopeUnavailableNote: text("scope_unavailable_note"),
  completionUnavailableReason: unavailableReasonEnum("completion_unavailable_reason"),
  completionUnavailableNote: text("completion_unavailable_note"),
  startedAt: timestamp("started_at", { withTimezone: true }),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  createdAt: createdAt(),
  updatedAt: updatedAt()
}, (table) => ({
  organizationStateIdx: index("jobs_organization_state_idx").on(
    table.organizationId,
    table.state
  ),
  createdAtIdx: index("jobs_created_at_idx").on(table.createdAt)
}));

export const scopeItems = pgTable("scope_items", {
  id: id(),
  jobId: uuid("job_id")
    .notNull()
    .references(() => jobs.id, { onDelete: "cascade" }),
  kind: scopeItemKindEnum("kind").notNull(),
  label: text("label").notNull(),
  detail: text("detail"),
  position: integer("position").notNull().default(0),
  active: boolean("active").notNull().default(true),
  createdAt: createdAt()
}, (table) => ({
  jobKindIdx: index("scope_items_job_kind_idx").on(table.jobId, table.kind)
}));

export const jobExceptions = pgTable("job_exceptions", {
  id: id(),
  jobId: uuid("job_id")
    .notNull()
    .references(() => jobs.id, { onDelete: "cascade" }),
  preset: text("preset"),
  title: text("title").notNull(),
  location: text("location"),
  note: text("note"),
  severity: text("severity").notNull().default("low"),
  customerVisible: boolean("customer_visible").notNull().default(true),
  createdById: uuid("created_by_id").references(() => users.id),
  createdAt: createdAt(),
  updatedAt: updatedAt()
}, (table) => ({
  jobIdx: index("job_exceptions_job_idx").on(table.jobId)
}));

export const jobPhotos = pgTable("job_photos", {
  id: id(),
  clientUploadId: text("client_upload_id"),
  jobId: uuid("job_id")
    .notNull()
    .references(() => jobs.id, { onDelete: "cascade" }),
  checkpointId: uuid("checkpoint_id").references(() => serviceCheckpoints.id),
  exceptionId: uuid("exception_id").references(() => jobExceptions.id, {
    onDelete: "set null"
  }),
  kind: photoKindEnum("kind").notNull(),
  label: text("label").notNull(),
  note: text("note"),
  blobUrl: text("blob_url"),
  thumbnailUrl: text("thumbnail_url"),
  rawBlobUrl: text("raw_blob_url"),
  blobPathname: text("blob_pathname"),
  contentType: text("content_type"),
  sizeBytes: integer("size_bytes"),
  status: photoUploadStatusEnum("status").notNull().default("queued"),
  capturedAt: timestamp("captured_at", { withTimezone: true }),
  uploadedAt: timestamp("uploaded_at", { withTimezone: true }),
  exif: jsonb("exif").$type<Record<string, unknown>>(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
  createdById: uuid("created_by_id").references(() => users.id),
  createdAt: createdAt(),
  updatedAt: updatedAt()
}, (table) => ({
  clientUploadIdx: uniqueIndex("job_photos_client_upload_idx").on(table.clientUploadId),
  jobKindIdx: index("job_photos_job_kind_idx").on(table.jobId, table.kind),
  checkpointIdx: index("job_photos_checkpoint_idx").on(table.checkpointId)
}));

export const photoChecks = pgTable("photo_checks", {
  id: id(),
  jobId: uuid("job_id").references(() => jobs.id, { onDelete: "cascade" }),
  photoId: uuid("photo_id").references(() => jobPhotos.id, { onDelete: "cascade" }),
  provider: text("provider").notNull().default("stub"),
  modelId: text("model_id"),
  result: photoCheckResultEnum("result").notNull(),
  confidence: integer("confidence"),
  suggestion: text("suggestion"),
  latencyMs: integer("latency_ms"),
  estimatedCostMicros: integer("estimated_cost_micros"),
  rawResponse: jsonb("raw_response").$type<Record<string, unknown>>(),
  createdAt: createdAt()
}, (table) => ({
  photoIdx: index("photo_checks_photo_idx").on(table.photoId),
  jobIdx: index("photo_checks_job_idx").on(table.jobId)
}));

export const serviceRecords = pgTable("service_records", {
  id: id(),
  jobId: uuid("job_id")
    .notNull()
    .references(() => jobs.id, { onDelete: "cascade" }),
  publicTokenHash: text("public_token_hash"),
  publicTokenPreview: text("public_token_preview"),
  status: text("status").notNull().default("pending_acknowledgement"),
  generatedAt: timestamp("generated_at", { withTimezone: true }).notNull().defaultNow(),
  customerAcknowledgedAt: timestamp("customer_acknowledged_at", { withTimezone: true }),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  createdAt: createdAt(),
  updatedAt: updatedAt()
}, (table) => ({
  jobIdx: uniqueIndex("service_records_job_idx").on(table.jobId),
  tokenHashIdx: uniqueIndex("service_records_public_token_hash_idx").on(table.publicTokenHash)
}));

export const approvalLinks = pgTable("approval_links", {
  id: id(),
  jobId: uuid("job_id")
    .notNull()
    .references(() => jobs.id, { onDelete: "cascade" }),
  serviceRecordId: uuid("service_record_id").references(() => serviceRecords.id, {
    onDelete: "set null"
  }),
  purpose: approvalPurposeEnum("purpose").notNull(),
  tokenHash: text("token_hash").notNull(),
  tokenPreview: text("token_preview").notNull(),
  status: approvalLinkStatusEnum("status").notNull().default("active"),
  viewedAt: timestamp("viewed_at", { withTimezone: true }),
  usedAt: timestamp("used_at", { withTimezone: true }),
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdById: uuid("created_by_id").references(() => users.id),
  createdAt: createdAt(),
  updatedAt: updatedAt()
}, (table) => ({
  tokenHashIdx: uniqueIndex("approval_links_token_hash_idx").on(table.tokenHash),
  jobPurposeIdx: index("approval_links_job_purpose_idx").on(table.jobId, table.purpose)
}));

export const customerAcknowledgements = pgTable("customer_acknowledgements", {
  id: id(),
  jobId: uuid("job_id")
    .notNull()
    .references(() => jobs.id, { onDelete: "cascade" }),
  approvalLinkId: uuid("approval_link_id").references(() => approvalLinks.id, {
    onDelete: "set null"
  }),
  kind: acknowledgementKindEnum("kind").notNull(),
  customerName: text("customer_name").notNull(),
  customerNote: text("customer_note"),
  checkboxAccepted: boolean("checkbox_accepted").notNull().default(true),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  acknowledgedAt: timestamp("acknowledged_at", { withTimezone: true }).notNull().defaultNow(),
  createdAt: createdAt()
}, (table) => ({
  jobKindIdx: index("customer_acknowledgements_job_kind_idx").on(table.jobId, table.kind)
}));

export const auditEvents = pgTable("audit_events", {
  id: id(),
  organizationId: uuid("organization_id").references(() => organizations.id, {
    onDelete: "cascade"
  }),
  jobId: uuid("job_id").references(() => jobs.id, { onDelete: "cascade" }),
  actorUserId: uuid("actor_user_id").references(() => users.id, { onDelete: "set null" }),
  eventType: text("event_type").notNull(),
  publicSummary: text("public_summary"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default(sql`'{}'::jsonb`),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: createdAt()
}, (table) => ({
  jobCreatedAtIdx: index("audit_events_job_created_at_idx").on(table.jobId, table.createdAt),
  eventTypeIdx: index("audit_events_event_type_idx").on(table.eventType)
}));

export type Job = typeof jobs.$inferSelect;
export type NewJob = typeof jobs.$inferInsert;
export type ApprovalLink = typeof approvalLinks.$inferSelect;
export type ServiceRecord = typeof serviceRecords.$inferSelect;
