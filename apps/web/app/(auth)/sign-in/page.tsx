import { AuthSide } from "@/components/auth/auth-side";
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
    <div className="w-full max-w-5xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left side: value prop - hidden on mobile */}
        <div className="hidden lg:block h-[500px]">
          <AuthSide mode="signin" />
        </div>

        {/* Right side: sign-in form */}
        <div className="flex justify-center lg:justify-end">
          <AuthCard
            title="Sign in"
            description="Enter your credentials to access your account"
          >
            <SignInForm />
          </AuthCard>
        </div>
      </div>
    </div>
  );
}
