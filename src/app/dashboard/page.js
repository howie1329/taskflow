import react from "react";
import Dash from "./components/dash";

function Page() {
  return (
    <div className="flex m-2 flex-col items-center h-screen">
      <h1 className="font-bold text-2xl">Task Flow - Dashboard</h1>
      <Dash />
    </div>
  );
}

export default Page;
