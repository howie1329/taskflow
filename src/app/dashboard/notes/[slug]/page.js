import React from "react";
import NotePage from "../components/NotePage";

export default async function Page({ params }) {
  const { slug } = await params;
  return (
    <div>
      <h1>{slug}</h1>
      <NotePage params={slug} />
    </div>
  );
}
