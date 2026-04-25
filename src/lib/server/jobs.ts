import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { getDb, hasDatabase } from "@/lib/db/client";
import {
  auditEvents,
  jobs,
  memberships,
  organizations,
  scopeItems,
  serviceCheckpoints,
  serviceTemplates,
  users
} from "@/lib/db/schema";
import {
  demoJobs,
  excludedScope,
  getJob,
  includedScope,
  type DemoJob,
  type JobState
} from "@/lib/demo-data";

export const createJobInputSchema = z.object({
  customerName: z.string().trim().min(1).default("Maya Chen"),
  customerPhone: z.string().trim().optional(),
  customerEmail: z.string().trim().email().optional().or(z.literal("")),
  subjectLabel: z.string().trim().min(1).default("Honda Accord - Black"),
  serviceLabel: z.string().trim().min(1).default("Exterior Detail"),
  locationLabel: z.string().trim().optional(),
  publicNote: z.string().trim().optional(),
  internalNote: z.string().trim().optional()
});

export type CreateJobInput = z.infer<typeof createJobInputSchema>;

const checkpointSeeds = [
  {
    slug: "starting-condition",
    title: "Starting condition",
    instruction: "Capture the vehicle before work begins.",
    position: 1
  },
  {
    slug: "mid-work",
    title: "Mid-work evidence",
    instruction: "Show the work in progress clearly.",
    position: 2
  },
  {
    slug: "final-walkaround",
    title: "Final walkaround",
    instruction: "Capture the finished service from a clear angle.",
    position: 3
  }
];

export async function listJobsForToday(): Promise<DemoJob[]> {
  if (!hasDatabase()) {
    return demoJobs;
  }

  try {
    const db = getDb();
    const rows = await db.select().from(jobs).orderBy(desc(jobs.createdAt)).limit(12);

    if (rows.length === 0) {
      return demoJobs;
    }

    return rows.map((job) => ({
      id: job.id,
      customer: job.customerName,
      vehicle: job.subjectLabel,
      service: job.serviceLabel,
      scheduled: formatCreatedAt(job.createdAt),
      state: job.state,
      nextAction: nextActionForState(job.state),
      progress: progressForState(job.state),
      statusTone: toneForState(job.state)
    }));
  } catch {
    return demoJobs;
  }
}

export async function getJobForDisplay(jobId?: string): Promise<DemoJob> {
  if (!jobId || !hasDatabase()) {
    return getJob(jobId);
  }

  try {
    const db = getDb();
    const [job] = await db.select().from(jobs).where(eq(jobs.id, jobId)).limit(1);

    if (!job) {
      return getJob(jobId);
    }

    return {
      id: job.id,
      customer: job.customerName,
      vehicle: job.subjectLabel,
      service: job.serviceLabel,
      scheduled: formatCreatedAt(job.createdAt),
      state: job.state,
      nextAction: nextActionForState(job.state),
      progress: progressForState(job.state),
      statusTone: toneForState(job.state)
    };
  } catch {
    return getJob(jobId);
  }
}

export async function createJob(input: CreateJobInput) {
  const db = getDb();
  const workspace = await ensurePilotWorkspace();
  const [job] = await db
    .insert(jobs)
    .values({
      organizationId: workspace.organizationId,
      templateId: workspace.templateId,
      createdById: workspace.userId,
      customerName: input.customerName,
      customerPhone: input.customerPhone || null,
      customerEmail: input.customerEmail || null,
      customerLabel: input.customerName,
      serviceLabel: input.serviceLabel,
      subjectLabel: input.subjectLabel,
      locationLabel: input.locationLabel || null,
      publicNote: input.publicNote || null,
      internalNote: input.internalNote || null,
      state: "draft"
    })
    .returning();

  await db.insert(scopeItems).values([
    ...includedScope.map((item, index) => ({
      jobId: job.id,
      kind: "included" as const,
      label: item.label,
      detail: item.detail,
      position: index + 1
    })),
    ...excludedScope.map((item, index) => ({
      jobId: job.id,
      kind: "excluded" as const,
      label: item.label,
      detail: item.detail,
      position: index + 1
    }))
  ]);

  await db.insert(auditEvents).values({
    organizationId: workspace.organizationId,
    jobId: job.id,
    actorUserId: workspace.userId,
    eventType: "job.created",
    publicSummary: "Job shell created.",
    metadata: {
      source: "pilot_form",
      serviceLabel: input.serviceLabel,
      subjectLabel: input.subjectLabel
    }
  });

  return job;
}

export async function ensurePilotWorkspace() {
  const db = getDb();
  const organizationSlug = "clear-finish-detailing";
  const templateSlug = "car-detail-exterior";
  const userEmail = "pilot@scopenod.app";

  let organization = (
    await db.select().from(organizations).where(eq(organizations.slug, organizationSlug)).limit(1)
  )[0];

  if (!organization) {
    [organization] = await db
      .insert(organizations)
      .values({
        name: "Clear Finish Detailing",
        slug: organizationSlug
      })
      .returning();
  }

  let user = (await db.select().from(users).where(eq(users.email, userEmail)).limit(1))[0];

  if (!user) {
    [user] = await db
      .insert(users)
      .values({
        email: userEmail,
        name: "Alex Johnson"
      })
      .returning();
  }

  await db
    .insert(memberships)
    .values({
      organizationId: organization.id,
      userId: user.id,
      role: "owner"
    })
    .onConflictDoNothing();

  let template = (
    await db
      .select()
      .from(serviceTemplates)
      .where(
        and(
          eq(serviceTemplates.organizationId, organization.id),
          eq(serviceTemplates.slug, templateSlug)
        )
      )
      .limit(1)
  )[0];

  if (!template) {
    [template] = await db
      .insert(serviceTemplates)
      .values({
        organizationId: organization.id,
        slug: templateSlug,
        name: "Car Detail - Exterior Detail",
        description: "V1 seeded car-detailing template."
      })
      .returning();
  }

  await db
    .insert(serviceCheckpoints)
    .values(checkpointSeeds.map((checkpoint) => ({ ...checkpoint, templateId: template.id })))
    .onConflictDoNothing();

  return {
    organizationId: organization.id,
    userId: user.id,
    templateId: template.id
  };
}

function formatCreatedAt(date: Date) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(date);
}

function nextActionForState(state: JobState) {
  switch (state) {
    case "draft":
      return "Send scope link";
    case "scope_sent":
      return "Waiting for scope nod";
    case "scope_acknowledged":
    case "in_progress":
      return "Capture mid-work proof";
    case "completion_sent":
      return "Waiting for completion nod";
    case "completed":
      return "Service Record ready";
    case "blocked":
      return "Review customer note";
    default:
      return "Open job";
  }
}

function progressForState(state: JobState) {
  const progress: Record<JobState, number> = {
    draft: 12,
    scope_sent: 22,
    scope_acknowledged: 38,
    scope_note_added: 26,
    scope_unavailable: 32,
    in_progress: 58,
    scope_changed_after_ack: 66,
    completion_sent: 84,
    completion_note_added: 86,
    completion_unavailable: 92,
    completed: 100,
    cancelled: 0,
    blocked: 18
  };

  return progress[state];
}

function toneForState(state: JobState): DemoJob["statusTone"] {
  if (state === "completed") {
    return "blue";
  }

  if (state.includes("note") || state === "blocked" || state === "scope_sent") {
    return "amber";
  }

  if (state === "draft" || state === "cancelled") {
    return "neutral";
  }

  return "green";
}
