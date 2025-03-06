import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import React from "react";

export const SubTaskModal = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button></Button>
      </DialogTrigger>
    </Dialog>
  );
};
