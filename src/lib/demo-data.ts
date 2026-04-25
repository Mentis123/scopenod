import type { CSSProperties } from "react";

export type JobState =
  | "draft"
  | "scope_sent"
  | "scope_acknowledged"
  | "scope_note_added"
  | "scope_unavailable"
  | "in_progress"
  | "scope_changed_after_ack"
  | "completion_sent"
  | "completion_note_added"
  | "completion_unavailable"
  | "completed"
  | "cancelled"
  | "blocked";

export type PhotoKind = "before" | "after" | "checkpoint" | "exception";

export type DemoPhoto = {
  id: string;
  label: string;
  kind: PhotoKind;
  position: string;
};

export type ScopeItem = {
  label: string;
  detail?: string;
};

export type DemoJob = {
  id: string;
  customer: string;
  vehicle: string;
  service: string;
  scheduled: string;
  state: JobState;
  nextAction: string;
  progress: number;
  statusTone: "green" | "amber" | "blue" | "neutral";
};

export const demoBusiness = {
  name: "Clear Finish Detailing",
  worker: "Alex Johnson",
  poweredBy: "ScopeNod"
};

export const demoJobs: DemoJob[] = [
  {
    id: "honda-accord",
    customer: "Maya Chen",
    vehicle: "Honda Accord - Black",
    service: "Exterior Detail",
    scheduled: "Today, 2:00 PM",
    state: "in_progress",
    nextAction: "Capture mid-work proof",
    progress: 58,
    statusTone: "green"
  },
  {
    id: "rav4",
    customer: "Priya Singh",
    vehicle: "Toyota RAV4 - White",
    service: "Exterior Detail",
    scheduled: "Today, 9:30 AM",
    state: "completed",
    nextAction: "Service Record ready",
    progress: 100,
    statusTone: "blue"
  },
  {
    id: "bmw-x5",
    customer: "Oliver Grant",
    vehicle: "BMW X5 - Black",
    service: "Interior Detail",
    scheduled: "Today, 1:30 PM",
    state: "scope_sent",
    nextAction: "Waiting for scope nod",
    progress: 22,
    statusTone: "amber"
  }
];

export const includedScope: ScopeItem[] = [
  { label: "Hand wash and dry" },
  { label: "Wheels and tyres" },
  { label: "Windows exterior" },
  { label: "Door jambs" },
  { label: "Final walkaround" }
];

export const excludedScope: ScopeItem[] = [
  { label: "Engine bay cleaning" },
  { label: "Paint correction / polishing" },
  { label: "Scratch removal" }
];

export const exceptions = [
  {
    title: "Pre-existing scratch",
    location: "Left rear door",
    note: "Light scratch on door edge. Customer shown.",
    severity: "low"
  }
];

export const checkpoints = [
  {
    id: "starting-condition",
    eyebrow: "Checkpoint 1 of 3",
    title: "Starting condition",
    instruction: "Capture the vehicle before work begins.",
    aiState: "Looks good.",
    tone: "green"
  },
  {
    id: "mid-work",
    eyebrow: "Checkpoint 2 of 3",
    title: "Mid-work evidence",
    instruction: "Show the work in progress clearly.",
    aiState: "Want a closer one?",
    tone: "amber"
  },
  {
    id: "final-walkaround",
    eyebrow: "Checkpoint 3 of 3",
    title: "Final walkaround",
    instruction: "Capture the finished service from a clear angle.",
    aiState: "Saved, checking.",
    tone: "blue"
  }
];

export const photos: DemoPhoto[] = [
  { id: "before-exterior", label: "Before exterior", kind: "before", position: "16% 57%" },
  { id: "before-wheel", label: "Wheel condition", kind: "before", position: "50% 18%" },
  { id: "before-rear", label: "Rear exterior", kind: "before", position: "64% 20%" },
  { id: "mid-work", label: "Foam and wash", kind: "checkpoint", position: "14% 69%" },
  { id: "interior", label: "Interior trim", kind: "checkpoint", position: "24% 77%" },
  { id: "exception", label: "Scratch noted", kind: "exception", position: "58% 23%" },
  { id: "after-front", label: "After front", kind: "after", position: "69% 56%" },
  { id: "after-finish", label: "After finish", kind: "after", position: "75% 44%" },
  { id: "after-detail", label: "Paint detail", kind: "after", position: "83% 20%" }
];

export function photoStyle(photo: DemoPhoto): CSSProperties {
  return {
    backgroundImage: "url('/scopenod_moodboard.png')",
    backgroundPosition: photo.position,
    backgroundSize: "260%"
  };
}

export function stateLabel(state: JobState) {
  return state
    .split("_")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

export function getJob(id?: string) {
  return demoJobs.find((job) => job.id === id) ?? demoJobs[0];
}
