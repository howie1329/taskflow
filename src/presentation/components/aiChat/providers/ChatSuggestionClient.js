import { Spinner } from "@/components/ui/spinner";
import { useChatSuggestionContext } from "./ChatSuggestionProvider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const ChatSuggestionClient = ({ setUserInput }) => {
  const { suggestedMessages, suggestedMessagesLoading } =
    useChatSuggestionContext();

  if (suggestedMessagesLoading) {
    return (
      <div className="flex justify-center items-center">
        <Badge variant="outline">
          <Spinner />
          Loading Suggested Messages...
        </Badge>
      </div>
    );
  }
  if (!suggestedMessages || suggestedMessages.length === 0) {
    return (
      <div className="flex justify-center items-center">
        <Badge variant="outline"> No Suggested Messages</Badge>
      </div>
    );
  }
  return (
    <div className="flex flex-row gap-2 w-[80vw] min-h-[40px] max-h-[200px] overflow-y-auto">
      {suggestedMessages &&
        suggestedMessages.map((suggestedMessage) => (
          <Button
            variant="outline"
            size="lg"
            key={suggestedMessage.id}
            onClick={() => setUserInput(suggestedMessage.message)}
          >
            <div className="flex flex-col text-left text-sm font-normal gap-0">
              <p className="text-xs font-normal text-muted-foreground text-wrap line-clamp-2">
                {suggestedMessage.question}
              </p>
            </div>
          </Button>
        ))}
    </div>
  );
};
