"use server";

import { redirect } from "next/navigation";
import { createSession } from "@/lib/auth";

type AuthResponse = {
  user?: {
    email: string;
    name: string;
    role: string;
  };
};

export type RegisterFormState = {
  error?: string;
};

export async function registerAction(
  _prevState: RegisterFormState,
  formData: FormData,
): Promise<RegisterFormState> {
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "").trim();

  if (!name || !email || !password) {
    return {
      error: "Name, email, and password are required.",
    };
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL || "http://localhost:4000";

  try {
    const response = await fetch(`${baseUrl}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password }),
      cache: "no-store",
    });

    if (!response.ok) {
      return {
        error: "Unable to create your account. That email may already be in use.",
      };
    }

    const payload = (await response.json()) as AuthResponse;

    if (!payload.user) {
      return {
        error: "Account created, but sign-in could not be completed.",
      };
    }

    await createSession(payload.user);
  } catch {
    return {
      error: "The API is unavailable. Start the backend and try again.",
    };
  }

  redirect("/dashboard");
}
