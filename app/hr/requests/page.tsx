import { Navbar } from "@/components/navbar";
import RequestList from "@/components/requestList";
import { ReturnButton } from "@/components/returnButton";

export default function RequestsPage() {
  return (
    <div className="bg-gray-100 w-full min-h-screen">
      <Navbar />
      <div className="justify-center m-auto pt-5 w-full">
        <ReturnButton />
        <RequestList />
      </div>
    </div>
  );
}
