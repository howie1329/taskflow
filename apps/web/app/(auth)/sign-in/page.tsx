import { AuthCard } from "@/components/auth/auth-card";
import { SignInForm } from "@/components/auth/auth-forms";
import { isAuthenticatedNextjs } from "@convex-dev/auth/nextjs/server";
import { redirect } from "next/navigation";

export default async function SignInPage() {
  // Redirect to /app if already authenticated
  if (await isAuthenticatedNextjs()) {
    redirect("/app");
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      <AuthCard
        title="Welcome back"
        description="Sign in to continue to Taskflow"
      >
        <SignInForm />
      </AuthCard>
    </div>
  );
}
