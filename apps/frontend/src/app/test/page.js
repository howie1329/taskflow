"use client";
import { Button } from "@/components/ui/button";
import { SignIn, SignUp } from "@clerk/nextjs";
import { shadcn } from "@clerk/themes";
import {
  Moon02Icon,
  Sun02Icon,
  AiChat02Icon,
  CheckListIcon,
  Notebook02Icon,
  Calendar02Icon,
  Folder02Icon,
} from "@hugeicons/core-free-icons/index";
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
      <div className="grid grid-rows-1 lg:grid-cols-[3fr_2fr] ">
        <div className="hidden lg:flex items-center justify-center border-1 border-accent">
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
    <div className="flex flex-col justify-center items-start w-full h-full px-8 md:px-12 lg:px-16 max-w-5xl mx-auto">
      {/* Main Heading */}
      <div className="mb-10 lg:mb-12 space-y-5">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-2">
          <HugeiconsIcon
            icon={AiChat02Icon}
            size={14}
            strokeWidth={2}
            className="text-primary"
          />
          <span className="text-xs font-medium text-primary">
            AI-Powered Productivity
          </span>
        </div>
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-[1.1]">
          TaskFlow
        </h1>
        <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground leading-relaxed max-w-2xl">
          Your AI-powered productivity workspace. Manage tasks, capture notes,
          and stay organized—all in one place.
        </p>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5 w-full mb-8 lg:mb-10">
        <div className="group flex items-start gap-4 p-5 rounded-xl bg-card/80 border border-border hover:bg-accent/40 hover:border-primary/30 transition-all duration-300 hover:shadow-md">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <HugeiconsIcon
              icon={CheckListIcon}
              size={20}
              strokeWidth={2}
              className="text-primary"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground mb-1.5 text-base lg:text-lg">
              Smart Task Management
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Kanban boards with drag-and-drop, priorities, and project
              organization
            </p>
          </div>
        </div>

        <div className="group flex items-start gap-4 p-5 rounded-xl bg-card/80 border border-border hover:bg-accent/40 hover:border-primary/30 transition-all duration-300 hover:shadow-md">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <HugeiconsIcon
              icon={AiChat02Icon}
              size={20}
              strokeWidth={2}
              className="text-primary"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground mb-1.5 text-base lg:text-lg">
              AI Assistant
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Natural language interactions to create and manage your work
            </p>
          </div>
        </div>

        <div className="group flex items-start gap-4 p-5 rounded-xl bg-card/80 border border-border hover:bg-accent/40 hover:border-primary/30 transition-all duration-300 hover:shadow-md">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <HugeiconsIcon
              icon={Notebook02Icon}
              size={20}
              strokeWidth={2}
              className="text-primary"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground mb-1.5 text-base lg:text-lg">
              Rich Notes
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Block-based editor with markdown support and powerful search
            </p>
          </div>
        </div>

        <div className="group flex items-start gap-4 p-5 rounded-xl bg-card/80 border border-border hover:bg-accent/40 hover:border-primary/30 transition-all duration-300 hover:shadow-md">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <HugeiconsIcon
              icon={Calendar02Icon}
              size={20}
              strokeWidth={2}
              className="text-primary"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground mb-1.5 text-base lg:text-lg">
              Real-Time Sync
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Live updates across all your devices instantly
            </p>
          </div>
        </div>
      </div>

      {/* Key Benefits */}
      <div className="flex flex-wrap gap-2.5">
        <span className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-full bg-primary/10 text-primary border border-primary/20">
          <HugeiconsIcon icon={AiChat02Icon} size={12} strokeWidth={2} />
          AI-Powered
        </span>
        <span className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-full bg-secondary text-secondary-foreground border border-border">
          <HugeiconsIcon icon={Calendar02Icon} size={12} strokeWidth={2} />
          Real-Time
        </span>
        <span className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-full bg-accent text-accent-foreground border border-border">
          <HugeiconsIcon icon={Folder02Icon} size={12} strokeWidth={2} />
          Organized
        </span>
        <span className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-full bg-muted text-muted-foreground border border-border">
          <HugeiconsIcon icon={CheckListIcon} size={12} strokeWidth={2} />
          Collaborative
        </span>
      </div>
    </div>
  );
};

export default Page;
