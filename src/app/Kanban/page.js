"use client";
import React, { useState } from "react";
import Loading from "../components/loading";
import useGetTasks from "@/hooks/useGetTasks";

const Page = () => {
  const { data, isLoading, error, isError } = useGetTasks();
  if (isLoading) {
    return <Loading />;
  }
  if (isError) {
    return <p>{error.message}</p>;
  }
  return (
    <div className="flex w-full h-screen bg-neutral-500 text-neutral-50">
      <Board />
    </div>
  );
};

const Board = () => {
  const [cards, setCards] = useState([]);
  return (
    <div className="flex h-full w-full gap-3 overflow-scroll p-12">Hello</div>
  );
};

const columns = ({ title, headingColor, column, cards, setCards }) => {
  return <div></div>;
};

export default Page;
