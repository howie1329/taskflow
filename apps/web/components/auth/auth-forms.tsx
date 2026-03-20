"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const inputClassName =
  "h-8 px-3 text-sm transition-[color,box-shadow,background-color] duration-(--duration-ui) ease-(--ease-snap)";

export function SignInForm() {
  const { signIn } = useAuthActions();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    formData.append("flow", "signIn");

    try {
      await signIn("password", formData);
      toast.success("Signed in successfully");
      router.push("/app");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to sign in");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="email" className="sr-only">
          Email
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="Email address"
          className={inputClassName}
          required
          disabled={isLoading}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password" className="sr-only">
          Password
        </Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="Password"
          className={inputClassName}
          required
          disabled={isLoading}
        />
      </div>
      <Button
        type="submit"
        className="marketing-press w-full"
        disabled={isLoading}
      >
        {isLoading ? "Signing in..." : "Continue"}
      </Button>

      <div className="pt-2 text-center text-xs text-muted-foreground">
        <span>Don&apos;t have an account? </span>
        <Link
          href="/sign-up"
          className="font-medium text-foreground underline-offset-4 transition-[color,opacity] duration-(--duration-ui) ease-(--ease-snap) hover:underline"
        >
          Sign up
        </Link>
      </div>
    </form>
  );
}

export function SignUpForm() {
  const { signIn } = useAuthActions();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    formData.append("flow", "signUp");

    try {
      await signIn("password", formData);
      toast.success("Account created successfully");
      router.push("/app");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create account",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName" className="text-sm font-medium">
            First name
          </Label>
          <Input
            id="firstName"
            name="firstName"
            placeholder="Jane"
            className={inputClassName}
            disabled={isLoading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName" className="text-sm font-medium">
            Last name
          </Label>
          <Input
            id="lastName"
            name="lastName"
            placeholder="Doe"
            className={inputClassName}
            disabled={isLoading}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium">
          Email
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          className={inputClassName}
          required
          disabled={isLoading}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password" className="text-sm font-medium">
          Password
        </Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="Create a password"
          className={inputClassName}
          required
          disabled={isLoading}
          minLength={8}
        />
        <p className="text-xs text-muted-foreground">
          Password must be at least 8 characters
        </p>
      </div>
      <Button
        type="submit"
        className="marketing-press w-full"
        disabled={isLoading}
      >
        {isLoading ? "Creating account..." : "Create account"}
      </Button>

      <div className="pt-2 text-center text-xs text-muted-foreground">
        <span>Already have an account? </span>
        <Link
          href="/sign-in"
          className="font-medium text-foreground underline-offset-4 transition-[color,opacity] duration-(--duration-ui) ease-(--ease-snap) hover:underline"
        >
          Sign in
        </Link>
      </div>
    </form>
  );
}
