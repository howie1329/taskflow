"use client";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import useDeleteNote from "@/features/notes/hooks/useDeleteNote";
import { useFetchNote } from "@/features/notes/hooks/useFetchNote";
import { useAuth } from "@clerk/nextjs";
import HTMLReactParser from "html-react-parser";
import { Trash2Icon, ArrowLeftIcon } from "lucide-react";
import { useRouter } from "next/navigation";

const NotePage = ({ params }) => {
  const { data, isLoading } = useFetchNote(params);
  return (
    <div className="min-h-screen bg-gray-50">
      {isLoading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        data && <NotePageContent data={data} />
      )}
    </div>
  );
};

const NotePageContent = ({ data }) => {
  const { getToken } = useAuth();
  const deleteMutation = useDeleteNote(getToken);
  const router = useRouter();

  const deleteNote = () => {
    console.log("about to delete note with id: ", data.id);
    deleteMutation.mutate({ id: data.id, parent_id: data.task_id || "" });
    router.push("/dashboard/notes");
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard/notes")}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Notes
          </Button>
          <Button
            variant="ghost"
            onClick={deleteNote}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2Icon className="h-4 w-4 mr-2" />
            Delete Note
          </Button>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">{data.title}</h1>
        {data.description && (
          <p className="text-gray-600 mb-6">{data.description}</p>
        )}

        <Separator className="my-6" />

        <div className="prose prose-gray max-w-none">
          {HTMLReactParser(data.content)}
        </div>
      </div>
    </div>
  );
};

export default NotePage;
