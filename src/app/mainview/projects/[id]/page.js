"use client";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import useFetchSingleProject from "@/hooks/projects/useFetchSingleProject";
import { ArrowBigLeftIcon, PlusIcon } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React from "react";

export default function Page() {
  const { id } = useParams();
  const router = useRouter();
  const { data: project } = useFetchSingleProject(id);
  return (
    <div>
      <div className="flex flex-col justify-between items-center">
        <div className="flex flex-row justify-between items-center w-full p-2">
          <Button onClick={() => router.back()}>
            <ArrowBigLeftIcon className="w-2 h-2" />
          </Button>
          <div className="flex flex-col">
            <p className="text-lg font-medium text-center">{project?.title}</p>
            <p className="text-sm text-gray-500">{project?.description}</p>
          </div>

          <Button variant="outline" className="p-1 h-6 w-6 rounded-full">
            <PlusIcon className="w-2 h-2" />
          </Button>
        </div>
        <Separator />
      </div>

      <div>
        <h1>Tasks</h1>
      </div>
    </div>
  );
}
