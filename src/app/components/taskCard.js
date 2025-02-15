import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";

export const TaskCard = ({ title, description = null, dueDate = null }) => {
  return (
    <Card className="w-3/4 p-2 m-2">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardFooter>{dueDate}</CardFooter>
    </Card>
  );
};
