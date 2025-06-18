"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    /* 1️⃣ strip client-side auth artifacts */
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    /* …clear any other persisted user data you keep… */

    /* 2️⃣ push the user to the login screen */
    router.push("/login");
  };

  return (
    <Button variant="ghost" onClick={handleLogout}>
      Log&nbsp;out
    </Button>
  );
}
