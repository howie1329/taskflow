import { redirect } from "next/navigation";
import { AppShell } from "@/components/app/app-shell";
import { isAuthenticatedNextjs } from "@convex-dev/auth/nextjs/server";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!(await isAuthenticatedNextjs())) {
    return redirect("/sign-in");
  }

  return <AppShell>{children}</AppShell>;
}
