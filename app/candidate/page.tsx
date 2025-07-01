"use client";
import { API_URL } from "@/utils/config"; // Ensure you have the correct API URL
import { useEffect, useState } from "react";
import axios from "axios";
import { RequestBox } from "@/components/requestBox";
import { PersonalInfoBox } from "@/components/personalInfoBox";
import { SkillTestBox } from "@/components/skillTestBox";
import ConsideringBox from "@/components/consideringBox";
import ResultBox from "@/components/resultBox";
import { useRouter } from "next/navigation";
import { User } from "@/utils/typeInterface";
import { ProgressBar } from "@/components/progressBar";

export default function CandidatePage() {
  const [user, setUser] = useState<User | null>(null);

  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token"); // Assuming you store the token
        const response = await axios.get(`${API_URL}/api/users/user`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data);
      } catch (err: unknown) {
        console.error("Error fetching user:", err);
      }
    };
    fetchUser();
  }, [router]);

  return (
    <div className="justify-center m-auto pt-14 flex-1 w-9/12 max-w-[450px] space-y-4">
      <ProgressBar
        status={
          user?.status as
            | "waiting"
            | "requesting"
            | "offering"
            | "considering"
            | "accepted"
            | "rejected"
            | "result"
            | undefined
        }
      />

      {/* status is waiting or requesting show the requestBox*/}
      {(user?.status === "waiting" || user?.status === "requesting") && (
        <RequestBox {...user} />
      )}
      {/* status is offering show the personalInfoBox and skillTestBox */}
      {user?.status === "offering" && <PersonalInfoBox email={user.email} />}
      {user?.status === "offering" && <SkillTestBox email={user.email} />}
      {/* status is considering show the consideringBox */}
      {user?.status === "considering" && <ConsideringBox email={user.email} />}
      {/* status is accepted or rejected show the resultBox */}
      {(user?.status === "accepted" || user?.status === "rejected") && (
        <ResultBox email={user.email} />
      )}
    </div>
  );
}
