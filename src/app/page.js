import { Button } from "@/components/ui/button";
import {
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
  SignedIn,
} from "@clerk/nextjs";
import { Link } from "lucide-react";

export default function Home() {
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
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
          <UserButton afterSignedOutUrl="/" />
          <Link href="/mainview/schedule">
            <Button variant="ghost">Schedule</Button>
          </Link>
        </SignedIn>
      </div>
      Landing Page
    </div>
  );
}
