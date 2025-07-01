"use client";
import Image from "next/image";
import LogoutButton from "@/components/logoutButton";

export function Navbar({ token }: { token: string | null }) {
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
      <div className="ml-auto">{token && <LogoutButton />}</div>
    </nav>
  );
}
