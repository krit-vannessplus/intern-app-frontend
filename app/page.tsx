"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  router.push("/candidate");
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <Image
        src="/logo.png"
        alt="Logo"
        width={150}
        height={150}
        className="mb-6"
      />
      <h1 className="text-2xl font-bold mb-4">
        Welcome to Vanness Plus Consulting
      </h1>
      <h2 className="text-lg mb-2">Your internship application portal</h2>
      <p className="text-gray-600 mb-8">Redirecting...</p>
    </div>
  );
}
