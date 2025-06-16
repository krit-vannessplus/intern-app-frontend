import HrDashboard from "@/components/hrDashboard";
import { Navbar } from "@/components/navbar";

export default function HrPage() {
  return (
    <div className="bg-gray-100 w-full min-h-screen">
      <Navbar />
      <div className="justify-center m-auto pt-14 flex w-9/12 max-w-[450px]">
        <div className="flex-1">
          <HrDashboard />
        </div>
      </div>
    </div>
  );
}
