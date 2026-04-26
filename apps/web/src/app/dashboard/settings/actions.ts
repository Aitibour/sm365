"use server";

import { getSession } from "@/lib/auth";

export type PasswordFormState = {
  error?: string;
  success?: string;
};

export async function changePasswordAction(
  _prevState: PasswordFormState,
  formData: FormData,
): Promise<PasswordFormState> {
  const session = await getSession();

  if (!session) {
    return {
      error: "You must be signed in to change your password.",
    };
  }

  const currentPassword = String(formData.get("currentPassword") || "").trim();
  const newPassword = String(formData.get("newPassword") || "").trim();

  if (!currentPassword || !newPassword) {
    return {
      error: "Current and new passwords are required.",
    };
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL || "http://localhost:4000";

  try {
    const response = await fetch(`${baseUrl}/auth/change-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: session.email,
        currentPassword,
        newPassword,
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      return {
        error: "Unable to update the password. Check your current password and try again.",
      };
    }

    return {
      success: "Password updated successfully.",
    };
  } catch {
    return {
      error: "The API is unavailable. Start the backend and try again.",
    };
  }
}
