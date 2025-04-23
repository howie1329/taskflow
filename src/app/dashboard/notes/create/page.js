import React from "react";
import NotesEditorComponent from "../components/NotesEditorComponent";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const Page = () => {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/notes">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-2xl font-semibold">Create New Note</h1>
          </div>
        </div>

        <Card className="p-6">
          <NotesEditorComponent />
        </Card>
      </div>
    </div>
  );
};

export default Page;
