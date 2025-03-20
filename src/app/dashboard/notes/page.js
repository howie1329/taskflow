"use client";
import React, { useState } from "react";
import Tiptap from "./components/TipTap";
import { Input } from "@/components/ui/input";

const Page = () => {
  const [note, setNote] = useState();
  const onChange = (content) => {
    setNote(content);
  };
  return (
    <div className="flex m-2 flex-col items-center flex-1 ">
      <div className="flex justify-evenly items-center w-full">
        <h1 className=" font-bold text-lg">Notes - Dashboard</h1>
      </div>
      <div className="flex flex-col w-full h-full items-center">
        <div className="flex flex-col w-3/4 gap-2">
          <Input />
          <Tiptap content={note} onChange={onChange} />
        </div>
      </div>
    </div>
  );
};

export default Page;
