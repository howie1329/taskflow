import Link from "next/link";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, CheckCircle, Clock, BarChart } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen w-full bg-background">
      {/* Header */}
      <header className="fixed top-0 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-14 items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold">TaskFlow</span>
          </div>
          <div className="flex items-center gap-4">
            <SignedOut>
              <SignInButton mode="modal">
                <Button variant="ghost">Sign In</Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button>Sign Up</Button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
              <Link href="/dashboard">
                <Button variant="ghost">Dashboard</Button>
              </Link>
            </SignedIn>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12 md:pt-32 md:pb-24">
        <div className="flex flex-col items-center text-center space-y-8">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
            The Ultimate All-In-One
            <span className="text-primary"> Productivity App</span>
          </h1>
          <p className="max-w-[700px] text-muted-foreground md:text-xl">
            Streamline your workflow, boost productivity, and achieve more with
            TaskFlow&apos;s comprehensive suite of tools.
          </p>
          <div className="flex gap-4">
            <SignedOut>
              <SignUpButton mode="modal">
                <Button size="lg">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard">
                <Button size="lg">
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </SignedIn>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-24">
        <div className="grid gap-8 md:grid-cols-3">
          <Card className="p-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <CheckCircle className="h-12 w-12 text-primary" />
              <h3 className="text-xl font-bold">Task Management</h3>
              <p className="text-muted-foreground">
                Organize and track your tasks with our intuitive interface. Set
                priorities, deadlines, and never miss a beat.
              </p>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <Clock className="h-12 w-12 text-primary" />
              <h3 className="text-xl font-bold">Time Tracking</h3>
              <p className="text-muted-foreground">
                Monitor your productivity with detailed time tracking and
                analytics to optimize your workflow.
              </p>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <BarChart className="h-12 w-12 text-primary" />
              <h3 className="text-xl font-bold">Progress Analytics</h3>
              <p className="text-muted-foreground">
                Visualize your progress with comprehensive analytics and
                insights to help you stay on track.
              </p>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
