import { Spinner } from "@/components/ui/spinner";
import { useChatSuggestionContext } from "./ChatSuggestionProvider";
import { Button } from "@/components/ui/button";

export const ChatSuggestionClient = ({ setUserInput }) => {
  const { suggestedMessages, suggestedMessagesLoading } =
    useChatSuggestionContext();
  if (suggestedMessagesLoading) {
    return <Spinner />;
  }
  if (suggestedMessages.length === 0) {
    return null;
  }
  return (
    <div className="flex flex-row gap-2 w-[80vw] min-h-[40px] max-h-[200px] overflow-y-auto">
      {suggestedMessages.map((suggestedMessage) => (
        <Button
          variant="outline"
          size="lg"
          key={suggestedMessage.id}
          onClick={() => setUserInput(suggestedMessage.message)}
        >
          <div className="flex flex-col text-left text-sm font-normal gap-0">
            <h1 className="text-sm font-normal">{suggestedMessage.message}</h1>
            <p className="text-xs font-normal text-muted-foreground">
              {suggestedMessage.reason}
            </p>
          </div>
        </Button>
      ))}
    </div>
  );
};
