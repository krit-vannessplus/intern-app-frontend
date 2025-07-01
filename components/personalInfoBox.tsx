"use client";

import React, { useEffect, useMemo, useState } from "react";
import { API_URL } from "@/utils/config";
import { useForm, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { PersonalInfo } from "@/utils/typeInterface";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import axios from "axios";
import { useRouter } from "next/navigation";

interface FileUpload {
  videoClip?: string;
  gradeReport?: string;
  homeRegistration?: string;
  idCard?: string;
  slidePresentation?: string;
}

interface personalInfoProps {
  email: string;
}
export function PersonalInfoBox({ email }: personalInfoProps) {
  const router = useRouter();
  const { control, register, handleSubmit, watch, reset } =
    useForm<PersonalInfo>();
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo | null>(null);
  const [dueTime, setDueTime] = useState<string | null>(null);
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const isPastDue = useMemo(() => {
    if (!dueDate) return false;
    return new Date() > dueDate;
  }, [dueDate]);

  const [files, setFiles] = useState<FileUpload | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : "";

  // Fetch existing personalInfo
  useEffect(() => {
    const fetchPersonalInfo = async () => {
      try {
        // Fetch personalInfo by email
        console.log("Fetching personal info for email:", email);
        const { data: personalInfoData } = await axios.get(
          `${API_URL}/api/personalInfos/getByEmail/${email}`
        );
        setPersonalInfo(personalInfoData.personalInfo);
      } catch (error) {
        console.error("Error fetching personal info:", error);
      }
    };
    fetchPersonalInfo();
  }, [router, refreshKey]);

  useEffect(() => {
    if (personalInfo) {
      console.log("personalInfo: ", personalInfo);
      reset({
        name: personalInfo.name || "",
        nickname: personalInfo.nickname || "",
        mobile: personalInfo.mobile || "",
        address: personalInfo.address || "",
        dob: personalInfo.dob ? personalInfo.dob.split("T")[0] : "",
        bloodType: personalInfo.bloodType || "",
        lineId: personalInfo.lineId || "",
        university: personalInfo.university || "",
        qualification: personalInfo.qualification || "",
        major: personalInfo.major || "",
        gpa: personalInfo.gpa || 0,
        reason: personalInfo.reason || "",
        otherReason: personalInfo.otherReason || "",
        strength: personalInfo.strength || "",
        weakness: personalInfo.weakness || "",
        opportunity: personalInfo.opportunity || "",
        threats: personalInfo.threats || "",
        recruitmentSource: personalInfo.recruitmentSource || "",
      });
      setFiles({
        videoClip: personalInfo.videoClip || "",
        gradeReport: personalInfo.gradeReport || "",
        homeRegistration: personalInfo.homeRegistration || "",
        idCard: personalInfo.idCard || "",
        slidePresentation: personalInfo.slidePresentation || "",
      });
      console.log("files: ", files);
      setDueTime(
        new Date(personalInfo.dueTime).toLocaleString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
      );
      // AFTER setDueTime(...)
      const dt = new Date(personalInfo.dueTime);
      setDueDate(dt); // ← new
      setDueTime(
        // ← you already have this
        dt.toLocaleString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
      );
    }
  }, [personalInfo, router]);

  const onSubmit = async (data: PersonalInfo) => {
    if (isPastDue) {
      console.warn("Deadline passed - blocking submission.");
      alert("Deadline has passed. Submission is closed.");
      return;
    }

    try {
      if (!token || !email) {
        console.error("No token or email. Pls login again.");
        return;
      }

      console.log("submited data: ", data);
      setSubmitting(true);
      const formData = new FormData();
      Object.keys(data).forEach((key) => {
        if (
          [
            "videoClip",
            "gradeReport",
            "homeRegistration",
            "idCard",
            "slidePresentation",
          ].includes(key)
        ) {
          const fileKey = key as keyof FileUpload;
          if (
            data[fileKey] &&
            typeof data[fileKey] !== "string" &&
            (data[fileKey] as FileList).length > 0
          ) {
            formData.append(key, (data[fileKey] as FileList)[0]);
          }
        } else {
          const dataKey = key as keyof PersonalInfo;
          formData.append(key, data[dataKey] as string);
        }
      });

      console.log("FormData to submit:", formData);

      // Use PATCH /submit/:email
      const response = await axios.patch(
        `${API_URL}/api/personalInfos/submit/${email}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Response from server:", response.data);
      setRefreshKey((prev) => prev + 1); // Trigger a re-render
      router.refresh(); // Refresh the page to reflect changes
    } catch (error) {
      console.error("Error submitting personal info:", error);
      alert("Failed to submit personal information. Please try again later.");
    }
    setSubmitting(false);
  };

  const handleDeleteFile = async (fileKey: keyof FileUpload) => {
    try {
      const res = await axios.delete(
        `${API_URL}/api/personalInfos/file/${email}/${fileKey}`
      );
      console.log("Response from delete file:", res.data);
      setFiles((prevFiles) => ({
        ...prevFiles,
        [fileKey]: "",
      }));
    } catch (error) {
      console.error(`Error deleting file ${fileKey}:`, error);
    }
  };

  return (
    <Card className="w-full max-w-lg">
      <CardHeader className="border-b">
        <CardTitle className="text-xl">Internship Application Form</CardTitle>
        <p className="text-sm text-muted-foreground">
          {`Due Time: ${dueTime || "Not set"}`}
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Personal Information Section */}
          <div className="space-y-4">
            <Label className="text-xl">Personal Information</Label>
            <div>
              <Label>Full Name</Label>
              <Input {...register("name")} placeholder="Full Name" />
            </div>
            <div>
              <Label>Nickname</Label>
              <Input {...register("nickname")} placeholder="Nickname" />
            </div>
            <div>
              <Label>Mobile Number</Label>
              <Input
                {...register("mobile")}
                type="tel"
                placeholder="Mobile Number"
              />
            </div>
            <div>
              <Label>Address</Label>
              <Input {...register("address")} placeholder="Address" />
            </div>
            <div>
              <Label>Date of Birth</Label>
              <Input {...register("dob")} type="date" />
            </div>
            <div>
              <Label>Blood Type</Label>
              <Controller
                name="bloodType"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || ""}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Blood Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="A">A</SelectItem>
                        <SelectItem value="B">B</SelectItem>
                        <SelectItem value="AB">AB</SelectItem>
                        <SelectItem value="O">O</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div>
              <Label>Line ID</Label>
              <Input {...register("lineId")} placeholder="Line ID" />
            </div>
          </div>

          {/* Education Section */}
          <div className="space-y-4">
            <Label className="text-xl">Education</Label>
            <div>
              <Label>University</Label>
              <Input
                {...register("university")}
                placeholder="University Name"
              />
            </div>
            <div>
              <Label>Qualification</Label>
              <Input
                {...register("qualification")}
                placeholder="Qualification"
              />
            </div>
            <div>
              <Label>Major</Label>
              <Input
                {...register("major")}
                placeholder="Field of Study / Major"
              />
            </div>
            <div>
              <Label>GPA</Label>
              <Input
                {...register("gpa")}
                type="number"
                step="0.01"
                placeholder="GPA"
              />
            </div>
          </div>

          {/* Additional Information Section */}
          <div className="space-y-4">
            <Label className="text-xl">Additional Information</Label>
            <div>
              <Label>Reason of Internship</Label>
              <Controller
                name="reason"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || ""}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Reason" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="personal_interest">
                          Personal Interest
                        </SelectItem>
                        <SelectItem value="academic_requirement">
                          Academic Requirement
                        </SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            {watch("reason") === "other" && (
              <Input
                {...register("otherReason")}
                placeholder="Specify reason"
              />
            )}
            <div>
              <Label>Your Strengths</Label>
              <Input {...register("strength")} placeholder="Your Strengths" />
            </div>
            <div>
              <Label>Your Weakness</Label>
              <Input {...register("weakness")} placeholder="Your Weaknesses" />
            </div>
            <div>
              <Label>Opportunities</Label>
              <Input {...register("opportunity")} placeholder="Opportunities" />
            </div>
            <div>
              <Label>Threats</Label>
              <Input {...register("threats")} placeholder="Threats" />
            </div>
            <div>
              <Label>Source of Recruitment Announcement</Label>
              <Input
                {...register("recruitmentSource")}
                placeholder="Source of Recruitment Announcement"
              />
            </div>
          </div>

          {/* File Upload Section */}
          <div className="space-y-4">
            <Label className="text-xl">File Uploads</Label>
            <div>
              <Label>Video Clip</Label>
              {files?.videoClip && (
                <div className="mb-2">
                  <a
                    href={`${files?.videoClip}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Video Clip
                  </a>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteFile("videoClip")}
                  >
                    ✕
                  </Button>
                </div>
              )}
              <Input {...register("videoClip")} type="file" accept="video/*" />
            </div>
            <div>
              <Label>Grade Report</Label>
              {files?.gradeReport && (
                <div className="mb-2">
                  <a
                    href={`${files?.gradeReport}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Grade Report
                  </a>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteFile("gradeReport")}
                  >
                    ✕
                  </Button>
                </div>
              )}
              <Input
                {...register("gradeReport")}
                type="file"
                accept=".pdf,.jpg,.png"
              />
            </div>
            <div>
              <Label>Copy of Home Registration</Label>
              {files?.homeRegistration && (
                <div className="mb-2">
                  <a
                    href={`${files?.homeRegistration}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Copy of Home Registration
                  </a>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteFile("homeRegistration")}
                  >
                    ✕
                  </Button>
                </div>
              )}
              <Input
                {...register("homeRegistration")}
                type="file"
                accept=".pdf,.jpg,.png"
              />
            </div>
            <div>
              <Label>Copy of ID Card</Label>
              {files?.idCard && (
                <div className="mb-2">
                  <a
                    href={`${files?.idCard}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Copy of ID Card
                  </a>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteFile("idCard")}
                  >
                    ✕
                  </Button>
                </div>
              )}
              <Input
                {...register("idCard")}
                type="file"
                accept=".pdf,.jpg,.png"
              />
            </div>
            <div>
              <Label>Slide Presentation</Label>
              {files?.slidePresentation && (
                <div className="mb-2">
                  <a
                    href={`${files?.slidePresentation}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Slide Presentation
                  </a>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteFile("slidePresentation")}
                  >
                    ✕
                  </Button>
                </div>
              )}
              <Input
                {...register("slidePresentation")}
                type="file"
                accept=".pdf"
              />
            </div>
          </div>

          <CardFooter className="flex-col gap-2 mt-4">
            {isPastDue && (
              <p className="text-center text-red-600">
                Deadline has passed. Submission is closed.
              </p>
            )}
            <Button
              type="submit"
              className="w-full"
              disabled={submitting || isPastDue}
            >
              {submitting ? "Submitting..." : "Submit"}
            </Button>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  );
}
