import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ArrowDown01 } from "@hugeicons/core-free-icons/index";
import { HugeiconsIcon } from "@hugeicons/react";

export const ChatSingleArtifactClient = ({ artifact }) => {
  console.log("Single Artifact Client: ", artifact);
  return (
    <Collapsible>
      <div className="flex flex-row gap-2 items-center justify-between border">
        <p>{artifact.toolName}</p>
        <p>Cost: {artifact.outputs.cost.total}</p>
        <CollapsibleTrigger>
          <Button variant="outline" size="icon">
            <HugeiconsIcon icon={ArrowDown01} strokeWidth={2} />
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent></CollapsibleContent>
    </Collapsible>
  );
};
