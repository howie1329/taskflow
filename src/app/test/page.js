"use client";
import { Button } from "@/components/ui/button";
import { SignIn, SignUp } from "@clerk/nextjs";
import { shadcn } from "@clerk/themes";
import { Moon02Icon, Sun02Icon } from "@hugeicons/core-free-icons/index";
import { HugeiconsIcon } from "@hugeicons/react";
import { useTheme } from "next-themes";
import React, { useState } from "react";

/**
 * This page is used to test the new home page design .
 * It is not used in the production environment.
 */
const Page = () => {
  return (
    <div className="min-h-screen bg-background grid grid-rows-[40px_1fr]">
      <div className="flex justify-center">
        <MainPageHeader />
      </div>
      <div className="grid grid-cols-[3fr_2fr] ">
        <div className="flex items-center justify-center border-1 border-accent">
          <InfoSection />
        </div>
        <div className="flex items-center justify-center border-1 border-l-0 border-accent">
          <SignInSignUpComponent />
        </div>
      </div>
    </div>
  );
};

/**
 * This component is used to display the header of the main landing page.
 */
const MainPageHeader = () => {
  const { theme, setTheme } = useTheme();
  return (
    <div className="flex flex-row items-center justify-between w-full h-fit px-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="justify-self-start"
      >
        {theme === "dark" ? (
          <HugeiconsIcon icon={Sun02Icon} size={20} strokeWidth={2} />
        ) : (
          <HugeiconsIcon icon={Moon02Icon} size={20} strokeWidth={2} />
        )}
      </Button>
    </div>
  );
};

const SignInSignUpComponent = () => {
  const [signIn, setSignIn] = useState(true);
  return (
    <div className="flex justify-center items-center w-full h-full">
      {signIn ? (
        <div className="flex flex-col items-center justify-center border shadow-sm bg-accent/70">
          <SignIn
            appearance={{
              theme: shadcn,
              variables: {
                borderRadius: "none",
              },
              elements: {
                footer: {
                  display: "none",
                },
              },
            }}
            forceRedirectUrl="/mainview/inbox"
          />
          <p className="text-xs text-muted-foreground">
            Dont Have an Account?{" "}
            <Button variant="link" onClick={() => setSignIn(false)}>
              Sign Up
            </Button>
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center border shadow-sm bg-accent/70">
          <SignUp
            appearance={{
              theme: shadcn,
              variables: { borderRadius: "none" },
              elements: {
                footer: {
                  display: "none",
                },
              },
            }}
            forceRedirectUrl="/mainview/inbox"
          />
          <p className="text-xs text-muted-foreground">
            Already Have an Account?
            <Button variant="link" onClick={() => setSignIn(true)}>
              Sign In
            </Button>
          </p>
        </div>
      )}
    </div>
  );
};

const InfoSection = () => {
  return (
    <div className="flex flex-col justify-center items-start w-full h-full px-8 md:px-12 lg:px-16 max-w-4xl mx-auto">
      {/* Main Heading */}
      <div className="mb-8 space-y-4">
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-foreground">
          TaskFlow
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
          Your AI-powered productivity workspace. Manage tasks, capture notes,
          and stay organized—all in one place.
        </p>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mb-8">
        <div className="flex items-start gap-3 p-4 rounded-lg bg-card border border-border hover:bg-accent/50 transition-colors">
          <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-foreground mb-1">
              Smart Task Management
            </h3>
            <p className="text-sm text-muted-foreground">
              Kanban boards with drag-and-drop, priorities, and project
              organization
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-4 rounded-lg bg-card border border-border hover:bg-accent/50 transition-colors">
          <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-foreground mb-1">AI Assistant</h3>
            <p className="text-sm text-muted-foreground">
              Natural language interactions to create and manage your work
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-4 rounded-lg bg-card border border-border hover:bg-accent/50 transition-colors">
          <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-foreground mb-1">Rich Notes</h3>
            <p className="text-sm text-muted-foreground">
              Block-based editor with markdown support and powerful search
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-4 rounded-lg bg-card border border-border hover:bg-accent/50 transition-colors">
          <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-foreground mb-1">
              Real-Time Sync
            </h3>
            <p className="text-sm text-muted-foreground">
              Live updates across all your devices instantly
            </p>
          </div>
        </div>
      </div>

      {/* Key Benefits */}
      <div className="flex flex-wrap gap-2">
        <span className="px-3 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary border border-primary/20">
          AI-Powered
        </span>
        <span className="px-3 py-1 text-xs font-medium rounded-full bg-secondary text-secondary-foreground border border-border">
          Real-Time
        </span>
        <span className="px-3 py-1 text-xs font-medium rounded-full bg-accent text-accent-foreground border border-border">
          Organized
        </span>
        <span className="px-3 py-1 text-xs font-medium rounded-full bg-muted text-muted-foreground border border-border">
          Collaborative
        </span>
      </div>
    </div>
  );
};

export default Page;
