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
            forceRedirectUrl="/mainview/schedule"
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
            forceRedirectUrl="/mainview/schedule"
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
    <div className="flex justify-center items-center w-full h-full">
      <p>This is the info section</p>
    </div>
  );
};

export default Page;
