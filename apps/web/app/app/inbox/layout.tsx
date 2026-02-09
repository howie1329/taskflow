import { InboxErrorBoundary } from "@/components/inbox";

export const metadata = {
  title: "Inbox | Taskflow",
  description: "Capture fast, triage later",
};

export default function InboxLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <InboxErrorBoundary>{children}</InboxErrorBoundary>;
}
