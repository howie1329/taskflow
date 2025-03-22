import React from "react";
import NotePage from "../components/NotePage";

export default async function Page({ params }) {
  const { slug } = await params;
  return (
    <div className="flex flex-col flex-1 w-full h-full">
      <NotePage params={slug} />
    </div>
  );
}
