import { Navbar } from "@/components/navbar";
import { ReturnButton } from "@/components/returnButton";
import SkillTestManager from "@/components/skillTestManager";

export default function SetSkillTestPage() {
  return (
    <div className="bg-gray-100 w-full min-h-screen">
      <Navbar />
      <div className="justify-center m-auto pt-5 w-full">
        <ReturnButton />
        <SkillTestManager />
      </div>
    </div>
  );
}
