import { Card, CardDescription, CardHeader } from "@/components/ui/card";
import { useQueryClient } from "@tanstack/react-query";

const SingleNoteCard = ({ note }) => {
  const queryClient = useQueryClient();
  const preFetch = () => {
    queryClient.prefetchQuery({
      queryKey: ["note", note.id],
      queryFn: () => singleNote(note.id),
      staleTime: 300_000,
    });
  };
  return (
    <Card className="flex flex-col w-[20rem]" onMouseEnter={() => preFetch()}>
      <div className="flex flex-col m-2">
        <CardHeader>{note.title}</CardHeader>
        <CardDescription className="overflow-hidden truncate">
          {note.description}
        </CardDescription>
      </div>
    </Card>
  );
};

export default SingleNoteCard;
