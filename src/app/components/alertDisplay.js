import React from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import useTimeout from "@/hooks/useTimeout";

const AlertDisplay = ({ alert, setAlert }) => {
  useTimeout(
    () => {
      setAlert(false);
    },
    alert ? 2000 : null
  );

  if (!alert) return null;

  return (
    <Alert>
      <AlertTitle>Task Flow</AlertTitle>
      <AlertDescription>
        Your task has been added successfully.
      </AlertDescription>
    </Alert>
  );
};

export default AlertDisplay;
