import { useDroppable } from "@dnd-kit/core";
import { EventCard } from "./EventCard";

export const ScheduleColumn = ({ column, eventData }) => {
  const { isOver, setNodeRef } = useDroppable({
    id: column.id,
  });

  const style = {
    backgroundColor: isOver ? "lightgreen" : undefined,
  };
  return (
    <div
      key={column.id}
      className="col-span-1 bg-[#fafafa] shadow-md rounded-lg p-1"
      ref={setNodeRef}
      style={style}
    >
      <h2 className="text-sm font-semibold text-gray-700 text-center">
        {column.title}
      </h2>
      <div className="flex flex-col gap-1 flex-1 overflow-y-auto h-[83vh]">
        {eventData
          .filter((event) => event.date === column.id)
          .map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
      </div>
    </div>
  );
};
