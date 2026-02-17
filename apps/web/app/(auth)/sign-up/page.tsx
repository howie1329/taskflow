import { AuthSide } from "@/components/auth/auth-side";
import { AuthCard } from "@/components/auth/auth-card";
import { SignUpForm } from "@/components/auth/auth-forms";
import { isAuthenticatedNextjs } from "@convex-dev/auth/nextjs/server";
import { redirect } from "next/navigation";

export default async function SignUpPage() {
  // Redirect to /app if already authenticated
  if (await isAuthenticatedNextjs()) {
    redirect("/app");
  }

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left side: value prop - hidden on mobile */}
        <div className="hidden lg:block h-[500px]">
          <AuthSide mode="signup" />
        </div>

        {/* Right side: sign-up form */}
        <div className="flex justify-center lg:justify-end">
          <AuthCard
            title="Create account"
            description="Enter your details to get started with Taskflow"
          >
            <SignUpForm />
          </AuthCard>
        </div>
      </div>
    </div>
  );
}
