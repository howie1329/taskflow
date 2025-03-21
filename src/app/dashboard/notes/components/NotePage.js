"use client";
import useFetchNote from "@/hooks/useFetchNote";
import HTMLReactParser from "html-react-parser";

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
      <div>{HTMLReactParser(data.content)}</div>
    </div>
  );
};

export default NotePage;
