"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Image from "next/image";

import { API_URL } from "@/utils/config";
import LogoutButton from "./logoutButton";

export function Navbar() {
  const [user, setUser] = useState<any>(null);
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : "";

  /* fetch current user once on mount */
  useEffect(() => {
    if (!token) return;

    axios
      .get(`${API_URL}/api/users/user`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(({ data }) => setUser(data))
      .catch(() => setUser(null));
  }, [token]);

  return (
    <nav className="flex items-center bg-white p-4">
      {/* logo */}
      <Image
        src="/logo.jpg"
        alt="Logo"
        width={50}
        height={50}
        className="mr-4"
      />

      {/* title */}
      <span className="text-black text-lg font-semibold">
        Internship&nbsp;Application
      </span>

      {/* push everything after this to the far right */}
      <div className="ml-auto">{user && <LogoutButton />}</div>
    </nav>
  );
}
