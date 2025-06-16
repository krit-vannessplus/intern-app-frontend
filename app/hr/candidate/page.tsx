import { Navbar } from "@/components/navbar";
import CandidateList from "@/components/candidateList";
import { ReturnButton } from "@/components/returnButton";

export default function CandidatePage() {
  return (
    <div className="bg-gray-100 w-full min-h-screen">
      <Navbar />
      <div className="justify-center m-auto pt-5 w-full">
        <ReturnButton />
        <CandidateList />
      </div>
    </div>
  );
}
