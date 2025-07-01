"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "@/utils/config";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Offer,
  PersonalInfo,
  Request,
  SkillTestOffer,
} from "@/utils/typeInterface";

// which personal‐info keys point at uploaded files
const FILE_FIELDS = [
  "videoClip",
  "gradeReport",
  "homeRegistration",
  "idCard",
  "slidePresentation",
];

function formatKey(key: string) {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase());
}

interface ConsideringBoxProps {
  email: string;
}

export default function ConsideringBox({ email }: ConsideringBoxProps) {
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo | null>(null);
  const [offer, setOffer] = useState<Offer | null>(null);
  const [requestData, setRequestData] = useState<Request | null>(null); // holds resume request data

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 2) fetch personal info using the user email
        const { data: piData } = await axios.get(
          `${API_URL}/api/personalInfos/getByEmail/${encodeURIComponent(email)}`
        );
        setPersonalInfo(piData.personalInfo || piData);

        // 3) fetch offer details using the same email
        const { data: offerData } = await axios.get(
          `${API_URL}/api/offers/getByEmail/${encodeURIComponent(email)}`
        );
        setOffer(offerData.offer || offerData);

        // 4) fetch the resume request that holds the resume URL
        const { data: reqData } = await axios.get(
          `${API_URL}/api/requests/getRequest/${encodeURIComponent(email)}`
        );
        setRequestData(reqData.request);
      } catch (err) {
        console.error("Error during fetch:", err);
      }
    };
    fetchData();
  }, []);

  if (!personalInfo || !offer || !requestData) {
    return <p>Loading…</p>;
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>We&apos;re Considering Offer for {email}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {
              "After finish considering, we'll contact you. You can view the personal information and offer details below."
            }
          </p>
        </CardHeader>
      </Card>
      {/* —————————————————————— */}
      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(personalInfo).map(([key, value]) => {
            // skip internal fields, email, and dueTime entirely
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
            ) {
              return null;
            }

            // any personal‐info file‐upload field?
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

            // format date of birth nicely
            if (key === "dob") {
              return (
                <div key={key}>
                  <Label>Date of Birth</Label>
                  <p>{new Date(String(value)).toLocaleDateString()}</p>
                </div>
              );
            }

            // everything else is a simple text field
            return (
              <div key={key}>
                <Label>{formatKey(key)}</Label>
                <p>{String(value)}</p>
              </div>
            );
          })}
          {/* Display the resume PDF link if available */}
          {requestData && requestData.resume && (
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
          )}
        </CardContent>
      </Card>

      {/* —————————————————————— */}
      {/* Offer Details (no dueTime at top) */}
      <Card>
        <CardHeader>
          <CardTitle>Offer Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {offer.skillTests.map((test: SkillTestOffer) => (
            <Card key={test.name} className="mb-4 border rounded">
              <CardHeader>
                <CardTitle>{test.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* only showing rank + explanation */}
                <div>
                  <Label>{formatKey("rank")}</Label>
                  <p>{test.rank}</p>
                </div>
                <div>
                  <Label>{formatKey("explanation")}</Label>
                  <p>{test.explanation}</p>
                </div>

                {/* list every uploaded file as a link */}
                <div>
                  <Label>Uploaded Files</Label>
                  {test.uploadedFiles?.length > 0 ? (
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
    </div>
  );
}
