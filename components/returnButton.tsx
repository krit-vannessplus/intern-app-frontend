"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export const ReturnButton = () => {
  const router = useRouter();

  const handleClick = () => {
    router.push("/hr");
  };

  return <Button onClick={handleClick}>Back to Menu</Button>;
};
