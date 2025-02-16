import React from "react";
import { Button } from "@/components/ui/button";

export const CreateTaskModal = ({ handleModalToggle }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-4 rounded">
        <h2 className="text-xl font-semibold">Modal Title</h2>
        <p>Modal Content</p>
        <Button onClick={handleModalToggle}>Close</Button>
      </div>
    </div>
  );
};
