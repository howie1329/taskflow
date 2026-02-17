"use client";

import { Component } from "react";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
} from "@/components/ui/empty";
import { HugeiconsIcon } from "@hugeicons/react";
import { AlertCircleIcon, RefreshIcon } from "@hugeicons/core-free-icons";

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class InboxErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Inbox error:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex h-full w-full min-h-0 flex-col overflow-hidden rounded-xl border border-border/60 bg-card/40 dark:bg-card/20">
          <div className="flex flex-1 min-h-0 flex-col gap-4 p-4">
            <Empty className="min-h-[300px]">
              <EmptyHeader>
                <EmptyMedia variant="icon" className="text-destructive">
                  <HugeiconsIcon icon={AlertCircleIcon} className="size-8" />
                </EmptyMedia>
                <EmptyTitle>Something went wrong</EmptyTitle>
                <EmptyDescription>
                  We encountered an error loading your inbox. Please try again.
                </EmptyDescription>
              </EmptyHeader>
              <Button onClick={this.handleRetry} variant="outline">
                <HugeiconsIcon icon={RefreshIcon} className="size-4 mr-2" />
                Retry
              </Button>
            </Empty>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
