"use client";

import { API_URL } from "@/utils/config"; // Ensure you have the correct API URL
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useForm, SubmitHandler } from "react-hook-form";
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
import { Position, Request, User } from "@/utils/typeInterface";

// --- RequestBox Component ---
export function RequestBox(user: User) {
  const [existingRequest, setExistingRequest] = useState<Request | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [positions, setPositions] = useState<Position[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // react-hook-form
  const { register, handleSubmit, reset } = useForm<Request>();

  // ------------------------------------
  // 1) Fetch positions ONCE
  // ------------------------------------
  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(
          `${API_URL}/api/positions/getAllPositions`
        );
        setPositions(data.positions as Position[]);
      } catch (err) {
        console.error("Error fetching positions:", err);
        setError("Error fetching available positions.");
      }
    })();
  }, []);

  // ------------------------------------
  // 2) *Every time* `user` changes, pull (or clear) the request
  // ------------------------------------
  useEffect(() => {
    if (user.status === "waiting") {
      setExistingRequest(null);
      return;
    }
    const fetchRequest = async () => {
      console.log("Fetching request for user:", user.email);
      try {
        const { data } = await axios.get(
          `${API_URL}/api/requests/getRequest/${user.email}`
        );

        if (data?.request) {
          setExistingRequest(data.request);

          // hydrate RHF
          reset({
            email: data.request.email,
            positions: data.request.positions,
          });
          setEditMode(false);
          console.log("Request data fetched:", data.request);
        }
      } catch (err) {
        console.error("Error fetching request:", err);
        setError("Error fetching your request data.");
      }
    };
    fetchRequest();
  }, [user, reset]); // <-- ONLY depends on user (and reset from RHF)

  // onSubmit handler for the form.
  const onSubmit: SubmitHandler<Request> = async (data) => {
    setError(null);
    setSubmitting(true);

    try {
      if (!user) {
        setError("User information is missing. Please log in again.");
        setSubmitting(false);
        return;
      }

      // Build FormData to support file upload.
      const formData = new FormData();
      formData.append("email", user.email);

      if (data.resume && data.resume.length > 0) {
        formData.append("resume", data.resume[0]);
      } else if (!existingRequest) {
        setError("Resume upload is required for a new application.");
        setSubmitting(false);
        return;
      }

      // Combine the positions array into a comma-separated string.
      const positionsStr = data.positions.join(",");
      formData.append("positions", positionsStr);

      // Determine endpoint and HTTP method based on whether a request exists.
      const token = localStorage.getItem("token");
      let endpoint = `${API_URL}/api/requests/create`;
      let method: "POST" | "PUT" = "POST";
      if (existingRequest) {
        endpoint = `${API_URL}/api/requests/update/${user.email}`;
        method = "PUT";
      }

      const response = await axios({
        method,
        url: endpoint,
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      if (user.status === "waiting") {
        // Update the user's status to "requesting" after submission.
        await axios.patch(`${API_URL}/api/users/status`, {
          email: user.email,
          status: "requesting",
        });
      }

      if (response.data && response.data.request) {
        setExistingRequest(response.data.request);
        setEditMode(false);
      }
    } catch (submitError) {
      console.error("Error submitting request:", submitError);
      setError("Error submitting your request. Please try again later.");
    }
    window.location.reload();
    setSubmitting(false);
  };

  // Handler for entering edit mode.
  const handleEditClick = () => {
    setEditMode(true);
    if (existingRequest) {
      reset({
        email: existingRequest.email,
        positions: existingRequest.positions,
      });
    }
  };

  // Render error message if one exists.
  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  // If a request exists and we're not in edit mode, show the dashboard view.
  if (existingRequest && !editMode) {
    // Compute the full URL for the resume.
    const resumeUrl = existingRequest.resume.startsWith("http")
      ? existingRequest.resume
      : `${existingRequest.resume}`;

    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Requesting... Your Application
          </CardTitle>
          Please wait while we&apos;re considering your application
        </CardHeader>
        <CardContent>
          <div>
            <strong>Email:</strong> {existingRequest.email}
          </div>
          <div>
            <strong>Positions:</strong>{" "}
            {Array.isArray(existingRequest.positions)
              ? existingRequest.positions.join(", ")
              : existingRequest.positions}
          </div>
          <div>
            <strong>Resume:</strong>{" "}
            <a
              href={resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              View Resume
            </a>
          </div>
        </CardContent>
        <CardFooter className="flex-col gap-2 mt-4">
          <Button type="button" onClick={handleEditClick} className="w-full">
            Edit Application
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // Otherwise, display the form to create/update the application.
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>
          {existingRequest ? "Edit Your Application" : "Internship Application"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit(onSubmit)}
          encType="multipart/form-data"
          className="space-y-4"
        >
          {/* Email (read-only; comes from user status) */}
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              defaultValue={user?.email ?? ""}
              {...register("email")}
              readOnly
            />
          </div>
          {/* Positions Checkboxes */}
          <div>
            <Label>Select Positions</Label>
            <div className="mt-2 grid gap-2">
              {positions.map(
                (position) =>
                  position.availability && (
                    <label
                      key={position.name}
                      className="flex items-center space-x-2"
                    >
                      <input
                        type="checkbox"
                        value={position.name}
                        {...register("positions")}
                        defaultChecked={
                          (existingRequest &&
                            Array.isArray(existingRequest.positions) &&
                            existingRequest.positions.includes(
                              position.name
                            )) ||
                          false
                        }
                      />
                      <span>{position.name}</span>
                    </label>
                  )
              )}
            </div>
          </div>
          {/* Resume File Upload */}
          <div>
            <Label htmlFor="resume">Upload Resume</Label>
            <Input
              id="resume"
              type="file"
              {...register("resume")}
              accept=".pdf, .doc, .docx"
            />
          </div>
          <CardFooter className="mt-4">
            <Button type="submit" disabled={submitting} className="w-full">
              {submitting
                ? "Submitting..."
                : existingRequest
                ? "Update Application"
                : "Submit Application"}
            </Button>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  );
}
