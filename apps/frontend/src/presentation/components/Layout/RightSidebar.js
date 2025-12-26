"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Calendar02Icon,
  CheckListIcon,
  Notebook02Icon,
  AiChat02Icon,
} from "@hugeicons/core-free-icons/index";
import { ScrollArea } from "@/components/ui/scroll-area";

/**
 * RightSidebar component - A contextual sidebar that appears on the right side
 * This can be customized per page to show relevant information
 */
export default function RightSidebar({ children, defaultContent = true }) {
  if (!defaultContent && children) {
    return (
      <aside className="hidden lg:block w-80 border-l bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <ScrollArea className="h-full">
          <div className="p-4">{children}</div>
        </ScrollArea>
      </aside>
    );
  }

  return (
    <aside className="hidden lg:block w-80 border-l bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <ScrollArea className="h-full">
        <div className="p-4 space-y-4">
          {/* Today's Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center space-x-2">
                <HugeiconsIcon
                  icon={Calendar02Icon}
                  size={16}
                  strokeWidth={2}
                />
                <span>Today's Overview</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Tasks Due</span>
                <Badge variant="secondary">3</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Events</span>
                <Badge variant="secondary">2</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Notes</span>
                <Badge variant="secondary">5</Badge>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center space-x-2">
                <HugeiconsIcon
                  icon={CheckListIcon}
                  size={16}
                  strokeWidth={2}
                />
                <span>Quick Stats</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Completed Today</span>
                  <span className="font-medium">8/12</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full"
                    style={{ width: "66%" }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-xs">
                <div className="flex items-start space-x-2">
                  <HugeiconsIcon
                    icon={CheckListIcon}
                    size={14}
                    strokeWidth={2}
                    className="text-muted-foreground mt-0.5"
                  />
                  <div className="flex-1">
                    <p className="text-foreground">Task completed</p>
                    <p className="text-muted-foreground">2 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <HugeiconsIcon
                    icon={Notebook02Icon}
                    size={14}
                    strokeWidth={2}
                    className="text-muted-foreground mt-0.5"
                  />
                  <div className="flex-1">
                    <p className="text-foreground">Note created</p>
                    <p className="text-muted-foreground">15 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <HugeiconsIcon
                    icon={AiChat02Icon}
                    size={14}
                    strokeWidth={2}
                    className="text-muted-foreground mt-0.5"
                  />
                  <div className="flex-1">
                    <p className="text-foreground">AI chat started</p>
                    <p className="text-muted-foreground">1 hour ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {children}
        </div>
      </ScrollArea>
    </aside>
  );
}
