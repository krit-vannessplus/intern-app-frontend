"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "@/utils/config";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  User,
  Result,
  PersonalInfo,
  Offer,
  Filter,
  SkillTestOffer,
} from "@/utils/typeInterface"; // Adjust the import path as needed
import RequestInfo from "./requestInfo";

interface CandidateInfoProps {
  email: string;
  backAction: () => void;
}

/* ────────────────────────────────────────────────────────── */
/* misc helpers                                              */
/* ────────────────────────────────────────────────────────── */

const FILE_FIELDS = [
  "videoClip",
  "gradeReport",
  "homeRegistration",
  "idCard",
  "slidePresentation",
];

const formatKey = (key: string) =>
  key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());

/* ────────────────────────────────────────────────────────── */
/* component                                                 */
/* ────────────────────────────────────────────────────────── */

export default function CandidateInfo({
  email: propEmail,
  backAction,
}: CandidateInfoProps) {
  /* state buckets */
  const [user, setUser] = useState<User | null>(null); // email, role, status
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo | null>(null);
  const [offer, setOffer] = useState<Offer | null>(null);
  const [filter, setFilter] = useState<Filter | null>(null); // for future filtering needs
  const [result, setResult] = useState<Result | null>(null); // for future result handling

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* JWT for protected endpoints */
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : "";

  /* fetch everything in one go */
  useEffect(() => {
    if (!propEmail) return;

    const fetchAll = async () => {
      setLoading(true);
      setError(null);

      try {
        /* 1. user  -------------------------------------------------------- */
        const { data: user } = await axios.get(
          `${API_URL}/api/users/getByEmail/${encodeURIComponent(propEmail)}`
        );
        console.log("User Record:", user);
        setUser(user ?? {});

        if (user.status !== "waiting" && user.status !== "requesting") {
          /* 2. personal-info ----------------------------------------------- */
          const { data: pi } = await axios.get(
            `${API_URL}/api/personalInfos/getByEmail/${encodeURIComponent(
              propEmail
            )}`
          );
          console.log("Personal Info Record:", pi);
          setPersonalInfo(pi.personalInfo ?? pi);

          /* 3. offer (skill-test bundle) ----------------------------------- */
          const { data: of } = await axios.get(
            `${API_URL}/api/offers/getByEmail/${encodeURIComponent(propEmail)}`
          );
          console.log("Offer Record:", of);
          setOffer(of.offer ?? of);
        }

        if (
          user.status === "accepted" ||
          user.status === "rejected" ||
          user.status === "considering"
        ) {
          /* 5. filter (get filter info) ------------------------------------- */
          const { data: filterData } = await axios.get(
            `${API_URL}/api/filters/getByEmail/${encodeURIComponent(propEmail)}`
          );
          console.log("Filter Record:", filterData);
          setFilter(filterData.filter ?? filterData);
          if (user.status === "accepted") {
            const fetchResult = async () => {
              // Replace with actual API call
              const res = await axios.get(
                `${API_URL}/api/results/get/${encodeURIComponent(propEmail)}`
              );
              setResult(res.data);
            };

            fetchResult();
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [propEmail, token]);

  /* ─────────────────────────────────────────────────────── render ────── */

  if (loading) return <p>Loading…</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  //   if (!user || !personalInfo || !offer) return null;

  return (
    <div className="max-w-xl mx-auto space-y-4 bg-white p-6 rounded-lg shadow-md">
      {/* Request Info */}
      {user?.status !== "waiting" && <RequestInfo email={user?.email} />}
      {/* Candidate Info Card */}
      <Card className="w-full space-y-4">
        <CardHeader>
          <CardTitle className="text-xl">
            Candidate Info: <span className="font-normal">{propEmail}</span>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          <div>
            <Label>Email</Label>
            <p>{user?.email}</p>
          </div>

          <div>
            <Label>Role</Label>
            <p>{user?.role}</p>
          </div>

          <div>
            <Label>Status</Label>
            <p>{user?.status}</p>
          </div>
          {result && (
            <div>
              <Label>Position</Label>
              <p>{result.positions.join(", ")}</p>
            </div>
          )}
        </CardContent>

        <CardFooter className="justify-end">
          <Button variant="ghost" className={"border"} onClick={backAction}>
            Back
          </Button>
        </CardFooter>
      </Card>

      {/* Personal Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Personal Information</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {personalInfo &&
            Object.entries(personalInfo).map(([key, value]) => {
              /* filter unwanted keys */
              if (
                value == null ||
                [
                  "_id",
                  "__v",
                  "createdAt",
                  "updatedAt",
                  "email",
                  "dueTime",
                ].includes(key)
              )
                return null;

              /* uploaded files */
              if (FILE_FIELDS.includes(key)) {
                return (
                  <div key={key}>
                    <Label>{formatKey(key)}</Label>
                    {value ? (
                      <a
                        href={`${value}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 underline"
                      >
                        View {formatKey(key)}
                      </a>
                    ) : (
                      <p>N/A</p>
                    )}
                  </div>
                );
              }

              /* date of birth */
              if (key === "dob") {
                return (
                  <div key={key}>
                    <Label>Date of Birth</Label>
                    <p>{new Date(String(value)).toLocaleDateString()}</p>
                  </div>
                );
              }

              /* plain text */
              return (
                <div key={key}>
                  <Label>{formatKey(key)}</Label>
                  <p>{String(value)}</p>
                </div>
              );
            })}

          {/* resume PDF
          {requestData?.resume && (
            <div>
              <Label>Resume</Label>
              <a
                href={`${requestData.resume}`}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 underline"
              >
                View PDF
              </a>
            </div>
          )} */}
          {filter && (
            <div className="space-y-4">
              <div>
                <Label>GPA (by form/ by AI)</Label>
                <p>
                  {filter.gpaF} / {filter.gpaA}
                </p>
              </div>
              <div>
                <Label>Number of F</Label>
                <p>{filter.F}</p>
              </div>
              <div>
                <Label>Completeness</Label>
                <p>{filter.completeness}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Offer Details Card */}
      {offer && (
        <Card className="w-full space-y-4 ">
          <CardHeader>
            <CardTitle>Offer Details</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {offer.skillTests.map((test: SkillTestOffer) => (
              <Card key={test.name} className="border rounded mb-4">
                <CardHeader>
                  <CardTitle>{test.name}</CardTitle>
                </CardHeader>

                <CardContent className="space-y-3">
                  {/* rank + explanation */}
                  {(
                    ["rank", "explanation", "status"] as Array<
                      keyof SkillTestOffer
                    >
                  ).map((field) => (
                    <div key={field}>
                      <Label>{formatKey(field)}</Label>
                      <p className="space-y-3">{String(test[field]) + " "}</p>
                    </div>
                  ))}

                  {/* uploadedFiles list */}
                  <div>
                    <Label>Uploaded Files</Label>
                    {test.uploadedFiles?.length ? (
                      <ul className="list-disc ml-5">
                        {test.uploadedFiles.map((path: string, i: number) => (
                          <li key={i}>
                            <a
                              href={`${path}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-600 underline"
                            >
                              View File {i + 1}
                            </a>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p>No files uploaded</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
