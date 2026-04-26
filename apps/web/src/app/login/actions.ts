"use server";

import { redirect } from "next/navigation";
import { createSession, destroySession } from "@/lib/auth";

type LoginResponse = {
  user?: {
    email: string;
    name: string;
    role: string;
  };
};

export type LoginFormState = {
  error?: string;
};

export async function loginAction(
  _prevState: LoginFormState,
  formData: FormData,
): Promise<LoginFormState> {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "").trim();

  if (!email || !password) {
    return {
      error: "Email and password are required.",
    };
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL || "http://localhost:4000";

  try {
    const response = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
    });

    if (!response.ok) {
      return {
        error: "Invalid email or password.",
      };
    }

    const payload = (await response.json()) as LoginResponse;

    if (!payload.user) {
      return {
        error: "Unable to create a session right now.",
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

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}
