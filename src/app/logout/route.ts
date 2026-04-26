import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SERVICE_COOKIE_NAME } from "@/lib/service-auth";

export function GET() {
  cookies().delete(SERVICE_COOKIE_NAME);
  redirect("/login");
}
