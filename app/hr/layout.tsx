"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "@/utils/config";

interface Props {
  children: React.ReactNode;
}

export default function ProtectedLayout({ children }: Props) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem("token");

      // No token? → straight to login
      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        // Hit an endpoint that simply returns 200 if the token is valid
        await axios.get(`${API_URL}/api/users/verify-token`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // All good – show the protected page
        setChecking(false);
      } catch (err) {
        // Invalid / expired – clear and bounce to login
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        router.replace("/login");
      }
      const role = localStorage.getItem("role");
      if (role !== "admin") {
        // If the user is not an admin, redirect to the candidate page
        router.replace("/candidate");
      }
    };

    verifyToken();
  }, [router]);

  // Basic splash while we’re verifying
  if (checking) {
    return (
      <div className="flex h-screen items-center justify-center">
        <span className="animate-pulse text-sm text-muted-foreground">
          Checking session…
        </span>
      </div>
    );
  }

  return <>{children}</>;
}
