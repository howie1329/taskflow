import { AuthSide } from "@/components/auth/auth-side";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthPlaceholderSignUp } from "@/components/auth/auth-placeholder-form";

export default function SignUpPage() {
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
            <AuthPlaceholderSignUp />
          </AuthCard>
        </div>
      </div>
    </div>
  );
}
