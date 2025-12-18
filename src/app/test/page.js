"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { useIsMobile } from "@/hooks/use-mobile";
import React from "react";

/**
 * This page is used to test the new home page design .
 * It is not used in the production environment.
 */
const Page = () => {
  return (
    <div className="min-h-screen bg-background border-2 border-red-500 grid grid-rows-[100px_1fr]">
      <div className="flex justify-center pt-1">
        <MainPageHeader />
      </div>
      <div className="grid grid-cols-[3fr_2fr] gap-1 border-2 border-green-500">
        <div className="border-2 border-blue-500">Content</div>
        <div className="flex items-center justify-center border-2 border-blue-500">
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
  const isMobile = useIsMobile();
  return (
    <Card className="flex items-center justify-center rounded-none min-w-fit h-10">
      <NavigationMenu viewport={isMobile}>
        <NavigationMenuList className="flex-wrap justify-evenly w-2xl">
          <NavigationMenuItem>
            <NavigationMenuTrigger>Home</NavigationMenuTrigger>
            <NavigationMenuContent>
              <div className="w-64">
                <p>This is the home page</p>
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Home</NavigationMenuTrigger>
            <NavigationMenuContent>
              <p>This is the home page</p>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Home</NavigationMenuTrigger>
            <NavigationMenuContent>
              <p>This is the home page</p>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Home</NavigationMenuTrigger>
            <NavigationMenuContent>
              <p>This is the home page</p>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </Card>
  );
};

const SignInSignUpComponent = () => {
  return (
    <div className="flex justify-center border-2 border-black w-full h-3/6">
      <Button variant="outline">Sign In</Button>
      <Button variant="outline">Sign Up</Button>
    </div>
  );
};

export default Page;
