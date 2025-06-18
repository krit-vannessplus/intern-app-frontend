"use client";

import React, { useEffect, useState } from "react";
import { API_URL } from "@/utils/config";
import { useForm, Controller } from "react-hook-form";
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
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import axios from "axios";

interface PersonalInfoBoxProps {
  action: () => void;
}

interface FileUpload {
  videoClip?: string;
  gradeReport?: string;
  homeRegistration?: string;
  idCard?: string;
  slidePresentation?: string;
}

export function PersonalInfoBox({ action }: PersonalInfoBoxProps) {
  const { control, register, handleSubmit, watch, reset } = useForm();
  const [email, setEmail] = useState<string | null>(null);
  const [dueTime, setDueTime] = useState<string | null>(null);
  const [files, setFiles] = useState<FileUpload | null>(null);
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : "";

  // Fetch user email + existing personalInfo
  useEffect(() => {
    const fetchPersonalInfo = async () => {
      try {
        if (!token) return;

        // 1️⃣ Get user email
        const { data: userStatus } = await axios.get(
          `${API_URL}/api/users/user`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const userEmail = userStatus.email;
        setEmail(userEmail);

        // 2️⃣ Fetch personalInfo by email
        console.log(userEmail);
        const { data: personalInfoData } = await axios.get(
          `${API_URL}/api/personalInfos/getByEmail/${userEmail}`
        );

        // 3️⃣ Pre-fill form with existing data
        if (personalInfoData.personalInfo) {
          const info = personalInfoData.personalInfo;
          console.log("info: ", info);
          reset({
            name: info.name || "",
            nickname: info.nickname || "",
            mobile: info.mobile || "",
            address: info.address || "",
            dob: info.dob ? info.dob.split("T")[0] : "",
            bloodType: info.bloodType || "",
            lineId: info.lineId || "",
            university: info.university || "",
            qualification: info.qualification || "",
            major: info.major || "",
            gpa: info.gpa || "",
            reason: info.reason || "",
            otherReason: info.otherReason || "",
            strength: info.strength || "",
            weakness: info.weakness || "",
            opportunity: info.opportunity || "",
            threats: info.threats || "",
            recruitmentSource: info.recruitmentSource || "",
          });
          setFiles({
            videoClip: info.videoClip || "",
            gradeReport: info.gradeReport || "",
            homeRegistration: info.homeRegistration || "",
            idCard: info.idCard || "",
            slidePresentation: info.slidePresentation || "",
          });
          console.log(files);
          setDueTime(
            new Date(info.dueTime).toLocaleString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })
          );
        }
      } catch (error) {
        console.error("Error fetching personal info:", error);
      }
    };

    fetchPersonalInfo();
  }, [reset, token]);

  const onSubmit = async (data: any) => {
    try {
      if (!token || !email) {
        console.error("No token or email.");
        return;
      }

      console.log("submited data: ", data);
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
          if (data[key] && data[key].length > 0) {
            formData.append(key, data[key][0]);
          }
        } else {
          formData.append(key, data[key]);
        }
      });

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
      action(); // Proceed to next step if needed
    } catch (error) {
      console.error("Error submitting personal info:", error);
    }
  };

  const handleDeleteFile = (fileKey: keyof FileUpload) => {
    try {
      axios.delete(`${API_URL}/api/personalInfos/file/${email}/${fileKey}`);
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
                    {files?.videoClip}
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
                    {files?.gradeReport}
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
                    {files?.homeRegistration}
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
                    {files?.idCard}
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
                    {files?.slidePresentation}
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
            <Button type="submit" className="w-full">
              Submit, next to skill test
            </Button>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  );
}
