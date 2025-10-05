"use client";
import React, { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  ArrowRightIcon,
  ArrowUpIcon,
  PlusIcon,
  TrashIcon,
  XIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group";
export default function Page() {
  const { user } = useUser();
  const [items, setItems] = useState([]);
  const [input, setInput] = useState("");
  const [hoverIndex, setHoverIndex] = useState(null);
  const handleEnter = () => {
    setItems([...items, input]);
    setInput("");
  };
  const handleDelete = (index) => {
    setItems(items.filter((i, iIndex) => iIndex !== index));
  };

  const handleClear = () => {
    setInput("");
  };
  return (
    <div className="grid grid-rows-[auto_1fr] overflow-hidden h-full rounded-md p-1">
      {/* Header */}
      <div className="flex flex-col w-full border-b">
        <h1 className="text-lg font-bold ">Inbox</h1>
        <p className="text-sm text-gray-500">
          Welcome,{" "}
          {user?.firstName?.charAt(0).toUpperCase() + user?.firstName?.slice(1)}{" "}
          to your inbox!
        </p>
      </div>
      {/* Inbox Content */}
      <div className="flex flex-col w-full h-full items-center">
        <div className="flex flex-col w-[80%] h-full items-center gap-1">
          <h2 className="text-lg font-bold ">Inbox</h2>
          <div className="flex flex-row w-full gap-1">
            <InputGroup>
              <InputGroupTextarea
                placeholder="Type Anything..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              {input.trim() !== "" && (
                <InputGroupAddon align="block-end">
                  <InputGroupButton onClick={handleEnter} variant="outline">
                    Add To Inbox
                    <ArrowUpIcon className="w-3 h-3" />
                  </InputGroupButton>
                  <InputGroupButton onClick={handleClear} variant="outline">
                    Clear
                    <XIcon className="w-3 h-3" />
                  </InputGroupButton>
                </InputGroupAddon>
              )}
            </InputGroup>
          </div>

          <div className="flex flex-col w-full h-[85%] gap-1 overflow-auto">
            {items.map((item, index) => (
              <Card
                key={index}
                onMouseEnter={() => setHoverIndex(index)}
                onMouseLeave={() => setHoverIndex(null)}
              >
                <CardContent className="flex flex-row gap-1 items-center">
                  <XIcon
                    className={`w-4 h-4 cursor-pointer ${
                      hoverIndex === index ? "text-red-500" : "text-transparent"
                    }`}
                    onClick={() => handleDelete(index)}
                  />
                  <div className="flex flex-col gap-1 ">
                    <p key={index}>
                      {item.charAt(0).toUpperCase() + item.slice(1)}
                    </p>
                    <p>This will be used for an AI suggestion</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
