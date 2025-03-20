"use client";
import useFetchNote from "@/hooks/useFetchNote";

const NotePage = ({ params }) => {
  const { data, isLoading } = useFetchNote(params);
  console.log(data);
  return (
    <div>
      {isLoading ? <p>Loading...</p> : data && <NotePageContent data={data} />}
    </div>
  );
};

const NotePageContent = ({ data }) => {
  return (
    <div>
      <h1>{data.title}</h1>
      <p>{data.description}</p>
    </div>
  );
};

export default NotePage;
