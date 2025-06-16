import { Navbar } from "@/components/navbar";
import PositionManager from "@/components/positionManager";
import { ReturnButton } from "@/components/returnButton";

export default function SetPositionPage() {
  return (
    <div className="bg-gray-100 w-full min-h-screen">
      <Navbar />
      <div className="justify-center m-auto pt-5 w-full">
        <ReturnButton />
        <PositionManager />
      </div>
    </div>
  );
}
