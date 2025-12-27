import { Card, CardContent } from "@/components/ui/card";

export const EventCard = ({ event }) => {
  return (
    <Card className="bg-white rounded-lg p-1 flex-shrink-0 cursor-pointer hover:bg-gray-50">
      <CardContent className="flex flex-col gap-1 p-1">
        <h3 className="text-xs font-medium line-clamp-1 flex-1 min-w-0">
          {event.task.title}
        </h3>
        <p className="text-xs text-gray-500 line-clamp-2">
          {event.task.description}
        </p>
        <div className="flex flex-row gap-1">
          <p className="text-xs text-gray-500 line-clamp-1">
            Time: {event.time}
          </p>
          <p className="text-xs text-gray-500 line-clamp-1">
            Estimated Time: {event.estimatedTime} minutes
          </p>
          <p className="text-xs text-gray-500 line-clamp-1">
            Actual Time: {event.actualTime} minutes
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
