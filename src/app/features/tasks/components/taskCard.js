import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";

export const TaskCard = ({ title, description = null, date = null }) => {
  return (
    <Card className="flex flex-col mb-2 p-1">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardFooter>{date}</CardFooter>
    </Card>
  );
};
