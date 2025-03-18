import React from "react";
import Tiptap from "./components/TipTap";

const Page = () => {
  return (
    <div className="flex m-2 flex-col items-center flex-1 border-black border-2">
      <div className="flex justify-evenly items-center w-full">
        <h1 className=" font-bold text-lg">Notes - Dashboard</h1>
      </div>
      <div>
        <p>Body Part</p>
        <Tiptap />
      </div>
    </div>
  );
};

export default Page;
