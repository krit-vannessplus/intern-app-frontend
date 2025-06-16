"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { API_URL } from "@/utils/config";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    // try {
    //   /* optional: hit your BE logout route so the server can clear cookies */
    //   await axios.post(`${API_URL}/api/auth/logout`, null, {
    //     withCredentials: true, // only matters if you use http-only cookies
    //   });
    // } catch {
    //   /* a failure here shouldn't block the UX-side logout */
    // }

    /* 1️⃣ strip client-side auth artifacts */
    localStorage.removeItem("token");
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
