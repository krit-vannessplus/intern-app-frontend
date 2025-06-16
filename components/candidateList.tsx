"use client";

import { useEffect, useState } from "react";
import axios from "axios";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { API_URL } from "@/utils/config";

import CandidateInfo from "./candidateInfo"; // ←– the detail component we built earlier

/* ────────────────────────────────────────────────────────── */
/* types                                                     */
/* ────────────────────────────────────────────────────────── */
interface User {
  email: string;
  role: string;
  status: string;
}

/* ────────────────────────────────────────────────────────── */
/* component                                                 */
/* ────────────────────────────────────────────────────────── */
export default function CandidateList() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : "";

  /* fetch all candidates every time we return to the list */
  useEffect(() => {
    if (selectedEmail) return; // don’t refetch while viewing details

    setLoading(true);
    setError(null);

    axios
      .get(`${API_URL}/api/users/getAll`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(({ data }) => {
        // adjust to your BE shape: data.users or raw array
        const fetched: User[] = data.users ?? data ?? [];
        setUsers(fetched);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load candidate list.");
      })
      .finally(() => setLoading(false));
  }, [selectedEmail, token]);

  /* ─────────────────────────────────────────────────────── render ────── */

  /* 1. detail view */
  if (selectedEmail) {
    return (
      <CandidateInfo
        email={selectedEmail}
        backAction={() => setSelectedEmail(null)}
      />
    );
  }

  /* 2. list view */
  if (loading) return <p>Loading…</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="max-w-xl mx-auto space-y-4 bg-white p-6 rounded-lg shadow-md">
      <h1 className="text-xl font-bold">Candidates</h1>
      {users.length === 0 ? (
        <p>No candidates found.</p>
      ) : (
        <ScrollArea className="h-72 w-full rounded-md border bg-gray-50">
          <div className="p-4 space-y-2">
            {users.map((u) => (
              <div key={u.email}>
                <div
                  className="cursor-pointer hover:text-blue-600"
                  onClick={() => setSelectedEmail(u.email)}
                >
                  <span className="font-medium">{u.email}</span>{" "}
                  <span className="text-sm text-muted-foreground">
                    ({u.status})
                  </span>
                </div>
                <Separator className="my-2" />
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
