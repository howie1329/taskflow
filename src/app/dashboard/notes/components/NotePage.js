"use client";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import useDeleteNote from "@/hooks/useDeleteNote";
import { useFetchNote } from "@/hooks/useFetchNote";
import HTMLReactParser from "html-react-parser";
import { Trash2Icon } from "lucide-react";
import { useRouter } from "next/navigation";

const NotePage = ({ params }) => {
  const { data, isLoading } = useFetchNote(params);
  return (
    <div>
      {isLoading ? <p>Loading...</p> : data && <NotePageContent data={data} />}
    </div>
  );
};

const NotePageContent = ({ data }) => {
  const deleteMutation = useDeleteNote();
  const router = useRouter();

  const deleteNote = () => {
    console.log("about to delete note with id: ", data.id);
    deleteMutation.mutate({ id: data.id, parent_id: data.task_id || "" });
    router.push("/dashboard/notes");
  };

  console.log("Data:", data);

  return (
    <div className="m-5">
      <h1>{data.title}</h1>
      <p>{data.description}</p>
      <Separator />
      <div>{HTMLReactParser(data.content)}</div>
      <Button onClick={deleteNote}>
        <Trash2Icon />
      </Button>
    </div>
  );
};

export default NotePage;
