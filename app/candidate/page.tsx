"use client";
import { API_URL } from "@/utils/config"; // Ensure you have the correct API URL
import { use, useEffect, useState } from "react";
import axios from "axios";
import RequestBox from "@/components/requestBox";
import { PersonalInfoBox } from "@/components/personalInfoBox";
import { SkillTestBox } from "@/components/skillTestBox";
import { Navbar } from "@/components/navbar";
import ConsideringBox from "@/components/consideringBox";
import ResultBox from "@/components/resultBox";
import { useRouter } from "next/navigation";

export default function CandidatePage() {
  const [status, setStatus] = useState<string | null>(null);
  const [showSkillTest, setShowSkillTest] = useState(false);
  const [email, setEmail] = useState<string>("");

  const router = useRouter();

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const token = localStorage.getItem("token"); // Assuming you store the token
        const response = await axios.get(`${API_URL}/api/users/user`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStatus(response.data.status);
        setEmail(response.data.email);
      } catch (error) {
        console.error("Error fetching user status:", error);
        router.push("/login"); // Redirect to login if there's an error
      }
    };

    fetchStatus();
  }, []);

  return (
    <div className="bg-gray-100 w-full min-h-screen">
      <Navbar />
      <div className="justify-center m-auto pt-14 flex w-9/12 max-w-[450px]">
        <div className="flex-1">
          {/* status is waiting or requesting show the requestBox*/}
          {(status === "waiting" || status === "requesting") && <RequestBox />}
          {/* status is offering show the personalInfoBox and skillTestBox */}
          {status === "offering" && !showSkillTest && (
            <PersonalInfoBox action={() => setShowSkillTest(true)} />
          )}
          {showSkillTest && (
            <SkillTestBox action={() => setShowSkillTest(false)} />
          )}
          {/* status is considering show the consideringBox */}
          {status === "considering" && <ConsideringBox />}
          {(status === "accepted" || status === "rejected") && (
            <ResultBox email={email} />
          )}
        </div>
      </div>
    </div>
  );
}
