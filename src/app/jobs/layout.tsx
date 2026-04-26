import { requireServiceSession } from "@/lib/server/service-gate";

export default async function JobsLayout({ children }: { children: React.ReactNode }) {
  await requireServiceSession("/jobs/new");

  return children;
}
