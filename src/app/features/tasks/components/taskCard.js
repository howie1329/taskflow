import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import useIsComplete from "@/hooks/useIsComplete";

export const TaskCard = ({
  title,
  description = null,
  date = null,
  id,
  isCompleted,
}) => {
  const mutation = useIsComplete();

  const buttonClick = () => {
    const data = { isCompleted: !isCompleted };
    mutation.mutate({ id: id, data: data });
  };
  return (
    <Card className="flex flex-col mb-2 p-1">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardFooter>
        <div className="flex gap-2">
          {isCompleted ? (
            <Button size="status" variant="ghostComplete" onClick={buttonClick}>
              Completed
            </Button>
          ) : (
            <Button
              size="status"
              variant="ghostIncomplete"
              onClick={buttonClick}
            >
              Not Completed
            </Button>
          )}
          <div>Due Date: {date}</div>
        </div>
      </CardFooter>
    </Card>
  );
};
