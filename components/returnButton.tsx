// components/ui/ReturnButton.jsx
"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export const ReturnButton = ({ children = "Return to HR", ...props }) => {
  const router = useRouter();

  const handleClick = () => {
    router.push("/hr");
  };

  return (
    <Button onClick={handleClick} {...props}>
      {children}
    </Button>
  );
};
