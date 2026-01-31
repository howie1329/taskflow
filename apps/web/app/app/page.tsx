import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export default function AppPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="gap-4 text-center">
          <CardTitle className="text-2xl">Workspace</CardTitle>
          <CardDescription>
            Your personal AI-assisted workplace is coming online soon.
          </CardDescription>
          <div className="pt-4">
            <Link href="/">
              <Button variant="outline">Back to landing page</Button>
            </Link>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
}
