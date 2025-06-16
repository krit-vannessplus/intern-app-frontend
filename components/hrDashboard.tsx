"use client";

import { useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@radix-ui/react-label";

const HrDashboard = () => {
  const router = useRouter();

  const sections = [
    { label: "Manage Positions", path: "setPosition" },
    { label: "Manage Skill Tests", path: "setSkillTest" },
    { label: "Manage Requests", path: "requests" },
    { label: "Manage Offers", path: "offers" },
    { label: "Manage Candidates", path: "candidate" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">HR Management</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {sections.map(({ label, path }) => (
          <div key={path} className="flex flex-col items-start space-y-2">
            <Label className="text-lg">{label + ": "}</Label>
            <Button className="mt-2" onClick={() => router.push(`/hr/${path}`)}>
              Go to {label}
            </Button>
          </div>
        ))}
      </CardContent>
      <CardFooter />
    </Card>
  );
};

export default HrDashboard;
