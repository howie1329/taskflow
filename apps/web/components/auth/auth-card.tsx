"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ReactNode } from "react";

interface AuthCardProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function AuthCard({ title, description, children }: AuthCardProps) {
  return (
    <Card className="w-full max-w-sm rounded-xl border-border/40 shadow-none">
      <CardHeader className="space-y-1.5 pb-2">
        <CardTitle className="text-xl font-semibold tracking-tight text-foreground">
          {title}
        </CardTitle>
        {description && (
          <CardDescription className="text-sm leading-relaxed text-muted-foreground">
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="pb-6 pt-2">{children}</CardContent>
    </Card>
  );
}
