"use client";
import axios from "axios";
import { useEffect, useState } from "react";
import { API_URL } from "@/utils/config";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface ResultBoxProps {
  email: string;
}
interface Result {
  email: string;
  result: string;
  positions: string[];
}

export default function ResultBox({ email }: ResultBoxProps) {
  const [result, setResult] = useState<Result | null>(null);

  useEffect(() => {
    // Simulate fetching result data based on the email
    const fetchResult = async () => {
      // Replace with actual API call
      const res = await axios.get(
        `${API_URL}/api/results/get/${encodeURIComponent(email)}`
      );
      setResult(res.data);
    };

    fetchResult();
  }, [email]);

  return (
    <Card>
      <CardHeader>
        {" "}
        <CardTitle className="text-xl">Result for {email}</CardTitle>{" "}
      </CardHeader>
      <CardContent>
        {result?.result === "accepted" ? (
          <div>
            <p className="text-md">
              Congratulation, you&apos;ve been accepted.
            </p>
            <p className="text-md">Positions: {result.positions.join(", ")}</p>
          </div>
        ) : (
          <div>
            <p className="text-md">
              We&apos;re so sorry, you&apos;ve been rejected
            </p>
            <p className="text-md">Keep fighting, one day will be your day!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
