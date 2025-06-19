"use client";

import React, { useState, useEffect, ChangeEvent } from "react";
import axios from "axios";
import { API_URL } from "@/utils/config";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { Offer } from "@/utils/typeInterface";

interface SlillTestBoxProps {
  action: () => void;
}

type OfferSkillTest = {
  name: string;
  uploadedFiles: string[];
  status: string;
  rank: number;
  explanation: string;
  pdf?: string;
  position?: string;
};

export function SkillTestBox({ action }: SlillTestBoxProps) {
  const [email, setEmail] = useState("");
  const [dueTime, setDueTime] = useState("");
  const [skillTests, setSkillTests] = useState<OfferSkillTest[]>([]);
  const [newFiles, setNewFiles] = useState<Record<string, File[]>>({});
  const [userStatusUpdated, setUserStatusUpdated] = useState(false);
  const router = useRouter();

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : "";

  const enrichSkillTest = async (offer: Offer) => {
    const merged: OfferSkillTest[] = await Promise.all(
      offer.skillTests.map(async (st: OfferSkillTest) => {
        try {
          const { data } = await axios.get(
            `${API_URL}/api/skillTests/getByName/${encodeURIComponent(st.name)}`
          );
          return { ...st, pdf: data.pdf, position: data.position };
        } catch {
          return st;
        }
      })
    );
    setSkillTests(merged);
  };
  // AUTO‐SUBMIT handler
  const handleAutoSubmit = async (testName: string) => {
    if (!email) return;
    const test = skillTests.find((t) => t.name === testName);
    if (!test) return;
    const fd = new FormData();
    fd.append("keepFiles", JSON.stringify(test.uploadedFiles));
    try {
      const { data } = await axios.patch(
        `${API_URL}/api/offers/submit/${encodeURIComponent(
          email
        )}/${encodeURIComponent(testName)}`,
        fd,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      enrichSkillTest(data.offer);
      if (data.allSubmitted) {
        window.location.reload();
      }
    } catch (e) {
      console.error("Auto‐submit error:", e);
    }
  };

  // 1) Fetch user → offer → enrich
  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        // get user email
        const {
          data: { email: userEmail },
        } = await axios.get(`${API_URL}/api/users/user`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEmail(userEmail);

        // get offer by email
        const {
          data: { offer },
        } = await axios.get(
          `${API_URL}/api/offers/getByEmail/${encodeURIComponent(userEmail)}`
        );
        setDueTime(offer.dueTime);

        // enrich each test with pdf + position
        enrichSkillTest(offer);
      } catch (e) {
        console.error("Error fetching user or offer:", e);
        router.push("/login"); // Redirect to login on error
      }
    })();
  }, [router, token]);

  // 2) Auto‐submit overdue tests
  useEffect(() => {
    if (!dueTime) return;
    const now = new Date();
    if (new Date(dueTime) <= now) {
      skillTests.forEach((t) => {
        if (t.status === "doing") handleAutoSubmit(t.name);
      });
    }
  }, [dueTime, skillTests, handleAutoSubmit]);

  // 3) When all submitted → bump user status
  useEffect(() => {
    if (
      skillTests.length > 0 &&
      skillTests.every((t) => t.status === "submitted") &&
      !userStatusUpdated
    ) {
      axios
        .patch(
          `${API_URL}/api/users/status`,
          { status: "considering", email },
          { headers: { Authorization: `Bearer ${token}` } }
        )
        .then(() => setUserStatusUpdated(true))
        .catch((e) => console.error("User status error:", e));
    }
  }, [skillTests, userStatusUpdated, email, token]);

  // delete an existing file from the UI list
  const handleDeleteFile = (testName: string, path: string) => {
    setSkillTests((prev) =>
      prev.map((t) =>
        t.name === testName
          ? { ...t, uploadedFiles: t.uploadedFiles.filter((p) => p !== path) }
          : t
      )
    );
  };

  // remove a new file before upload
  const handleRemoveNewFile = (testName: string, idx: number) => {
    setNewFiles((prev) => {
      const copy = { ...prev };
      copy[testName] = copy[testName].filter((_, i) => i !== idx);
      return copy;
    });
  };

  // add files to newFiles
  const handleFileChange = (
    testName: string,
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    setNewFiles((prev) => ({
      ...prev,
      [testName]: [...(prev[testName] || []), ...files],
    }));
  };

  // SAVE: updateOffer
  const handleSave = async (testName: string) => {
    if (!email) return;
    const updates = skillTests.map((t) => ({
      name: t.name,
      rank: t.rank,
      explanation: t.explanation,
      keepFiles: t.uploadedFiles,
    }));
    const formData = new FormData();
    formData.append("skillTests", JSON.stringify(updates));
    // attach new files under field = testName
    Object.entries(newFiles).forEach(([tn, files]) => {
      files.forEach((f) => formData.append(tn, f));
    });

    try {
      const { data } = await axios.patch(
        `${API_URL}/api/offers/update/${encodeURIComponent(email)}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      enrichSkillTest(data.offer);
      // clear only this test's new files
      setNewFiles((prev) => {
        const c = { ...prev };
        delete c[testName];
        return c;
      });
    } catch (e) {
      console.error("Save error:", e);
    }
  };

  // SUBMIT one test
  const handleSubmit = async (testName: string) => {
    if (!email) return;
    const test = skillTests.find((t) => t.name === testName);
    if (!test) return;
    const fd = new FormData();
    fd.append("keepFiles", JSON.stringify(test.uploadedFiles));
    (newFiles[testName] || []).forEach((f) => fd.append("file", f));

    try {
      const { data } = await axios.patch(
        `${API_URL}/api/offers/submit/${encodeURIComponent(
          email
        )}/${encodeURIComponent(testName)}`,
        fd,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      enrichSkillTest(data.offer);
      setNewFiles((prev) => {
        const c = { ...prev };
        delete c[testName];
        return c;
      });
      if (data.allSubmitted) {
        window.location.reload();
      }
    } catch (e) {
      console.error("Submit error:", e);
    }
  };

  // DISMISS one test
  const handleDismiss = async (testName: string) => {
    if (!email) return;
    try {
      const { data } = await axios.patch(
        `${API_URL}/api/offers/dismiss/${encodeURIComponent(
          email
        )}/${encodeURIComponent(testName)}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      enrichSkillTest(data.offer);
      setNewFiles((prev) => {
        const c = { ...prev };
        delete c[testName];
        return c;
      });
    } catch (e) {
      console.error("Dismiss error:", e);
    }
  };

  // Rank swapping
  const handleRankChange = (testName: string, newRank: number) => {
    setSkillTests((prev) => {
      const oldRank = prev.find((t) => t.name === testName)?.rank ?? newRank;
      return prev.map((t) => {
        if (t.name === testName) return { ...t, rank: newRank };
        if (t.rank === newRank) return { ...t, rank: oldRank };
        return t;
      });
    });
  };

  const maxRank = skillTests.length;

  return (
    <Card className="w-full max-w-3xl mx-auto space-y-6">
      <CardHeader>
        <Button onClick={action}>Back</Button>
        <CardTitle className="text-xl">Skill Test Submissions</CardTitle>
        <p
          className={
            new Date(dueTime) < new Date()
              ? "text-red-600 font-bold text-sm text-muted-foreground"
              : "text-sm text-muted-foreground"
          }
        >
          {`Due Time: ${
            new Date(dueTime).toLocaleString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            }) || "Not set"
          }`}
        </p>
      </CardHeader>
      <CardContent>
        {skillTests.length === 0 ? (
          <p>No skill tests assigned.</p>
        ) : (
          skillTests.map((test) => (
            <Card key={test.name} className="mb-6 border rounded">
              <CardHeader>
                <CardTitle>
                  {test.name}{" "}
                  <span
                    className={`px-2 py-1 text-sm rounded ${
                      test.status === "submitted"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {test.status}
                  </span>
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-3">
                <div>
                  <Label>Position</Label>
                  <p>{test.position || "N/A"}</p>
                </div>

                <div>
                  <Label>Instructions</Label>
                  {test.pdf ? (
                    <a
                      href={`${test.pdf}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 underline"
                    >
                      View PDF
                    </a>
                  ) : (
                    <p>No PDF available.</p>
                  )}
                </div>

                <div>
                  <Label>Uploaded Files</Label>
                  <ul className="list-disc ml-5 space-y-1">
                    {test.uploadedFiles.map((p, i) => (
                      <li key={i} className="flex items-center space-x-2">
                        <a
                          href={`${p}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {p.split("/").pop() || `File ${i + 1}`}
                        </a>
                        {test.status === "doing" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteFile(test.name, p)}
                          >
                            ✕
                          </Button>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>

                {test.status === "doing" && (
                  <>
                    <div>
                      <Label>New Files to Upload</Label>
                      <ul className="list-disc ml-5 space-y-1">
                        {(newFiles[test.name] || []).map((f, i) => (
                          <li key={i} className="flex items-center space-x-2">
                            <span>{f.name}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveNewFile(test.name, i)}
                            >
                              ✕
                            </Button>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <Label>Add Files (max 10 total)</Label>
                      <Input
                        type="file"
                        multiple
                        onChange={(e) => handleFileChange(test.name, e)}
                      />
                    </div>
                  </>
                )}

                <div>
                  <Label>Rank</Label>
                  <select
                    value={test.rank}
                    onChange={(e) =>
                      handleRankChange(test.name, +e.target.value)
                    }
                    className="border rounded p-1"
                  >
                    {Array.from({ length: maxRank }, (_, i) => i + 1).map(
                      (n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div>
                  <Label>Explanation</Label>
                  <Textarea
                    value={test.explanation}
                    onChange={(e) =>
                      setSkillTests((prev) =>
                        prev.map((t) =>
                          t.name === test.name
                            ? { ...t, explanation: e.target.value }
                            : t
                        )
                      )
                    }
                  />
                </div>
              </CardContent>

              <CardFooter className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => handleDismiss(test.name)}
                >
                  Dismiss
                </Button>
                {test.status === "doing" && (
                  <>
                    <Button
                      variant="secondary"
                      onClick={() => handleSave(test.name)}
                    >
                      Save
                    </Button>
                    <Button onClick={() => handleSubmit(test.name)}>
                      Submit
                    </Button>
                  </>
                )}
                {test.status === "submitted" && (
                  <Button disabled>Submitted</Button>
                )}
              </CardFooter>
            </Card>
          ))
        )}
      </CardContent>
    </Card>
  );
}
