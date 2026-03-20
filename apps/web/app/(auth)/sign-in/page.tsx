import { AuthSide } from "@/components/auth/auth-side";
import { AuthCard } from "@/components/auth/auth-card";
import { SignInForm } from "@/components/auth/auth-forms";
import { isAuthenticatedNextjs } from "@convex-dev/auth/nextjs/server";
import { redirect } from "next/navigation";

export default async function SignInPage() {
  if (await isAuthenticatedNextjs()) {
    redirect("/app");
  }

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2">
        <div className="hidden min-h-[420px] lg:block">
          <AuthSide mode="signin" />
        </div>

        <div className="flex justify-center lg:justify-end">
          <AuthCard
            title="Welcome back"
            description="Sign in to continue to Taskflow"
          >
            <SignInForm />
          </AuthCard>
        </div>
      </div>
    </div>
  );
}
