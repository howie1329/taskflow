import NotePage from "@/features/notes/NotePage";
import React from "react";

export default async function Page({ params }) {
  const { slug } = await params;
  return (
    <div className="flex flex-col flex-1 w-full h-full">
      <NotePage params={slug} />
    </div>
  );
}
