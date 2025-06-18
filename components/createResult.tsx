"use client";

import { useState, useEffect, ChangeEvent } from "react";
import axios from "axios";
import { API_URL } from "@/utils/config";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface CreateResultProps {
  email: string;
  backAction: () => void;
}

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

export default function CreateResult({
  email: propEmail,
  backAction,
}: CreateResultProps) {
  const [userEmail, setUserEmail] = useState<string | null>(propEmail);
  const [personalInfo, setPersonalInfo] = useState<any>(null);
  const [offer, setOffer] = useState<any>(null);
  const [requestData, setRequestData] = useState<any>(null); // holds resume request data
  const [selectedPositions, setSelectedPositions] = useState<string[]>([]);
  const [decisionLoading, setDecisionLoading] = useState<boolean>(false);
  const [positions, setPositions] = useState<string[]>([]);

  // JWT for Authorization header
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : "";

  useEffect(() => {
    const fetchData = async () => {
      try {
        /*// When no email is provided from props, fetch current user email.
        if (!userEmail) {
          const {
            data: { email: fetchedEmail },
          } = await axios.get(`${API_URL}/api/users/user`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!fetchedEmail) return;
          setUserEmail(fetchedEmail);
        }*/

        // fetch personal info using the email
        const { data: piData } = await axios.get(
          `${API_URL}/api/personalInfos/getByEmail/${encodeURIComponent(
            userEmail as string
          )}`
        );
        setPersonalInfo(piData.personalInfo || piData);

        // fetch offer details using the same email
        const { data: offerData } = await axios.get(
          `${API_URL}/api/offers/getByEmail/${encodeURIComponent(
            userEmail as string
          )}`
        );
        setOffer(offerData.offer || offerData);

        // fetch the resume request that holds the resume URL
        const { data: reqData } = await axios.get(
          `${API_URL}/api/requests/getRequest/${encodeURIComponent(
            userEmail as string
          )}`
        );
        setRequestData(reqData.request);
      } catch (err) {
        console.error("Error during fetch:", err);
      }
    };

    if (token) {
      fetchData();
    }
  }, []);

  useEffect(() => {
    const fetchPositions = async () => {
      //fetch positions from the offer
      if (offer) {
        const testNameList = offer.skillTests.map((test: any) => test.name);
        const positionsList: string[] = [];
        for (const name of testNameList) {
          try {
            const res = await axios.get(
              `${API_URL}/api/skillTests/getByName/${encodeURIComponent(name)}`
            );
            positionsList.push(res.data.position);
          } catch (error) {
            console.error(`Failed to fetch position for ${name}:`, error);
          }
        }
        setPositions(positionsList);
      }
    };
    fetchPositions();
  }, [offer]);

  // Handle check box toggle for a given position (test name)
  const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setSelectedPositions((prev) => {
      if (checked) return [...prev, value];
      return prev.filter((pos) => pos !== value);
    });
  };

  //update user status after create result and set filter done
  const updateUserStatus = async (status: string) => {
    try {
      axios.patch(`${API_URL}/api/users/status`, {
        email: userEmail,
        status: status,
      });
    } catch (error) {
      console.error("Error updating user status:", error);
    }
    // Set the filter done for the user
    try {
      axios.put(
        `${API_URL}/api/filters/setDone/${encodeURIComponent(
          userEmail as string
        )}`
      );
    } catch (error) {
      console.error("Error updating user filter status:", error);
    }
  };

  // Handler to send decision:
  // decision should be "accept" or "reject"
  const handleDecision = async (decision: "accept" | "reject") => {
    if (!userEmail) return;
    setDecisionLoading(true);
    if (decision === "accept" && selectedPositions.length === 0) {
      alert("Please select at least one position to accept.");
    } else if (decision === "reject") {
      //reject
      try {
        await axios.post(`${API_URL}/api/results/create`, {
          email: userEmail,
          result: "rejected",
        });
        alert("Decision 'reject' sent successfully.");
        updateUserStatus("rejected");
        backAction();
      } catch (err) {
        console.error("Error sending reject decision:", err);
        alert("There was an error sending your decision. Please try again.");
      }
    } else if (decision === "accept" && selectedPositions.length > 0) {
      // accept
      try {
        await axios.post(`${API_URL}/api/results/create`, {
          email: userEmail,
          result: "accepted",
          positions,
        });
        alert("Decision 'accept' sent successfully.");
        updateUserStatus("accepted");
        backAction();
      } catch (err) {
        console.error("Error sending accept decision:", err);
        alert("There was an error sending your decision. Please try again.");
      }
    }
    setDecisionLoading(false);
  };

  if (!personalInfo || !offer) {
    return <p>Loading…</p>;
  }

  return (
    <div className="max-w-xl mx-auto space-y-4 bg-white p-6 rounded-lg shadow-md">
      {/* Decision Card */}
      <Card>
        <CardHeader>
          <CardTitle>Decision for Offer: {userEmail}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Select position(s) to accept for this candidate.
          </p>
          {positions && positions.length > 0 ? (
            <div className="space-y-2">
              {positions.map((pos: string) => (
                <div key={pos} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    value={pos}
                    id={`checkbox-${pos}`}
                    checked={selectedPositions.includes(pos)}
                    onChange={handleCheckboxChange}
                    className="rounded border-gray-300 text-blue-600"
                  />
                  <Label htmlFor={`checkbox-${pos}`}>{pos}</Label>
                </div>
              ))}
            </div>
          ) : (
            <p>No positions available.</p>
          )}
        </CardContent>
        <CardFooter className="flex justify-end space-x-4">
          <Button
            variant="ghost"
            onClick={backAction}
            disabled={decisionLoading}
          >
            Back
          </Button>
          <Button
            variant="destructive"
            onClick={() => handleDecision("reject")}
            disabled={decisionLoading}
          >
            Reject
          </Button>
          <Button
            variant="default"
            onClick={() => handleDecision("accept")}
            disabled={decisionLoading}
          >
            Accept
          </Button>
        </CardFooter>
      </Card>

      {/* Personal Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Personal Information</CardTitle>
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

            // any personal-info file-upload field?
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

      {/* Offer Details Card */}
      <Card>
        <CardHeader>
          <CardTitle>Offer Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {offer.skillTests.map((test: any) => (
            <Card key={test.name} className="mb-4 border rounded">
              <CardHeader>
                <CardTitle>{test.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* only showing rank + explanation */}
                {["rank", "explanation"].map((field) => (
                  <div key={field}>
                    <Label>{formatKey(field)}</Label>
                    <p>{test[field]}</p>
                  </div>
                ))}

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
