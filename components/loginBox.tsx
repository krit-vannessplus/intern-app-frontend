"use client";

import { API_URL } from "@/utils/config"; // Ensure you have the correct API URL
import { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation"; // Import useRouter for navigation

export function LoginBox() {
  const router = useRouter(); // Initialize router for redirect
  const [errorMessage, setErrorMessage] = useState(""); // State for handling errors
  const [loading, setLoading] = useState(false); // State for loading status

  interface Data {
    email: string;
    password: string;
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Data>();

  const onSubmit = async (data: Data) => {
    setLoading(true); // Set loading state to true when form is submitted
    console.log("Login data:", data); // Log the submitted data for debugging
    try {
      const response = await axios.post(
        `${API_URL}/api/users/login`, // Replace with your API URL
        {
          email: data.email,
          password: data.password,
        }
      );

      const { token, role } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      setLoading(false); // Reset loading state after successful login

      // Redirect based on role
      if (role === "admin") {
        router.push("/hr");
      } else {
        router.push("/candidate");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setErrorMessage(error.response?.data?.message || "Login failed");
      } else {
        setErrorMessage("Login failed");
      }
      setLoading(false); // Reset loading state on error
    }
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Login to Your Account</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              {...register("email", { required: "Email is required" })}
            />
            {errors.email?.message && (
              <p className="text-red-500 text-sm">
                {String(errors.email?.message)}
              </p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              {...register("password", { required: "Password is required" })}
            />
            {errors.password?.message && (
              <p className="text-red-500 text-sm">
                {String(errors.password?.message)}
              </p>
            )}
          </div>
          {errorMessage && (
            <p className="text-red-500 text-sm text-center">{errorMessage}</p>
          )}
          <CardFooter className="flex-col gap-2 mt-4">
            <Button type="submit" className="w-full">
              {loading ? "Logging in..." : "Login"}
            </Button>
            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="underline underline-offset-4">
                Register
              </Link>
            </div>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  );
}
