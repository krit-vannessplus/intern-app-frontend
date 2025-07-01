"use client";

import { useEffect, useState, FormEvent, ChangeEvent } from "react";
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

interface Request {
  email: string;
  positions: string[];
  resume: string;
}

interface CreateOfferProps {
  email: string;
  back: () => void;
}

// Updated skill test interface based on your model
interface SkillTest {
  name: string;
  pdf: string;
  position: string;
}

const CreateOffer: React.FC<CreateOfferProps> = ({ email, back }) => {
  const [request, setRequest] = useState<Request | null>(null);
  const [loading, setLoading] = useState(true);
  const [skillTests, setSkillTests] = useState<SkillTest[]>([]);
  const [sending, setSending] = useState(false);

  // State for form: checked positions, chosen skill tests, and due time.
  const [selectedPositions, setSelectedPositions] = useState<{
    [position: string]: boolean;
  }>({});
  const [skillTestSelections, setSkillTestSelections] = useState<{
    [position: string]: string;
  }>({});
  const [dueTime, setDueTime] = useState<string>("");

  useEffect(() => {
    fetchRequestDetails(email);
  }, [email]);

  useEffect(() => {
    fetchSkillTests();
  }, []);

  const fetchRequestDetails = async (email: string) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/requests/getRequest/${email}`
      );
      setRequest(response.data.request);
      // Initialize checkboxes with false
      const initialPositions: { [position: string]: boolean } = {};
      response.data.request.positions.forEach((pos: string) => {
        initialPositions[pos] = false;
      });
      setSelectedPositions(initialPositions);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching request details:", error);
      setLoading(false);
    }
  };

  const fetchSkillTests = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/skillTests/getAllSkillTests`
      );
      setSkillTests(response.data.skillTests);
    } catch (error) {
      console.error("Error fetching skill tests:", error);
    }
  };

  const handleCheckboxChange = (
    e: ChangeEvent<HTMLInputElement>,
    position: string
  ) => {
    const checked = e.target.checked;
    setSelectedPositions((prev) => ({
      ...prev,
      [position]: checked,
    }));
    // Reset the dropdown selection if unchecked.
    if (!checked) {
      setSkillTestSelections((prev) => {
        const newSelections = { ...prev };
        delete newSelections[position];
        return newSelections;
      });
    }
  };

  const handleDropdownChange = (
    e: ChangeEvent<HTMLSelectElement>,
    position: string
  ) => {
    setSkillTestSelections((prev) => ({
      ...prev,
      [position]: e.target.value,
    }));
  };

  const handleDueTimeChange = (e: ChangeEvent<HTMLInputElement>) => {
    setDueTime(e.target.value);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSending(true);

    /* ──────────────── 1. Assemble data from the UI ──────────────── */
    const tests = Object.keys(selectedPositions)
      .filter((pos) => selectedPositions[pos]) // only checked rows
      .map((pos) => ({
        position: pos,
        skillTestName: skillTestSelections[pos] || null,
      }));

    const email = request?.email ?? null;
    const hasNull =
      !email ||
      !dueTime ||
      tests.length === 0 ||
      tests.some((t) => !t.skillTestName);

    /* ──────────────── 2. Validate all required fields ───────────── */
    if (hasNull) {
      alert(
        [
          !email && "• Missing candidate email",
          !dueTime && "• Missing due-time / deadline",
          tests.length === 0 && "• No position selected",
          tests.some((t) => !t.skillTestName) &&
            "• Some selected positions have no skill-test chosen",
        ]
          .filter(Boolean)
          .join("\n")
      );
      setSending(false);
      return; // stop the submission if anything is missing
    }

    /* ──────────────── 3. Build payloads ─────────────────────────── */
    const personalInfoPayload = { email, dueTime };
    const offerPayload = {
      email,
      dueTime,
      skillTests: tests.map(({ skillTestName }) => ({ name: skillTestName })),
    };

    /* ──────────────── 4. Fire requests in sequence ──────────────── */
    try {
      await axios.post(
        `${API_URL}/api/personalInfos/create`,
        personalInfoPayload,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      await axios.post(`${API_URL}/api/offers/create`, offerPayload, {
        headers: { "Content-Type": "application/json" },
      });

      await axios.patch(`${API_URL}/api/users/status`, {
        status: "offering",
        email,
      });

      await axios.put(`${API_URL}/api/requests/setOffered/${email}`);

      console.log("Offer flow completed successfully.");
      setSending(false);
      back(); // leave the page / modal
    } catch (err) {
      console.error("Offer creation failed:", err);
      alert("Something went wrong while creating the offer. Please try again.");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!request) {
    return <div>No request found.</div>;
  }

  return (
    <div className="max-w-xl mx-auto space-y-4 bg-white p-6 rounded-lg shadow-md">
      <Card>
        <CardHeader>
          <CardTitle>Offer for {request.email}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-2">
            <strong>Resume:</strong>{" "}
            <a
              href={`${request.resume}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              View Resume
            </a>
          </div>
          <form onSubmit={handleSubmit}>
            <strong>Positions:</strong>
            {request.positions.map((position) => (
              <div key={position} style={{ marginBottom: "1rem" }}>
                <label>
                  <input
                    type="checkbox"
                    checked={selectedPositions[position] || false}
                    onChange={(e) => handleCheckboxChange(e, position)}
                  />{" "}
                  {position}
                </label>
                {selectedPositions[position] && (
                  <div style={{ marginLeft: "1rem", marginTop: "0.5rem" }}>
                    <label>
                      Select Skill Test:{" "}
                      <select
                        value={skillTestSelections[position] || ""}
                        onChange={(e) => handleDropdownChange(e, position)}
                      >
                        <option value="">-- Select Skill Test --</option>
                        {skillTests
                          .filter((test) => test.position === position)
                          .map((test) => (
                            <option key={test.name} value={test.name}>
                              {test.name}
                            </option>
                          ))}
                      </select>
                    </label>
                  </div>
                )}
              </div>
            ))}
            <div style={{ marginTop: "1rem" }}>
              <label>
                Due Time:{" "}
                <input
                  type="datetime-local"
                  value={dueTime}
                  onChange={handleDueTimeChange}
                />
              </label>
            </div>
            <CardFooter>
              <div className="flex justify-between mt-4 gap-x-4">
                <Button variant="outline" onClick={back}>
                  Back
                </Button>
                <Button type="submit">
                  {sending ? "sending..." : "send offer"}
                </Button>
              </div>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateOffer;
