"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { getSignedOwnerHeaders } from "@/lib/api";

export type UserRoleFormState = {
  error?: string;
};

export type InviteFormState = {
  error?: string;
  success?: string;
};

export async function updateUserRoleAction(
  _prevState: UserRoleFormState,
  formData: FormData,
): Promise<UserRoleFormState> {
  const session = await getSession();

  if (!session || session.role !== "owner") {
    return {
      error: "Only workspace owners can update user roles.",
    };
  }

  const email = String(formData.get("email") || "").trim();
  const role = String(formData.get("role") || "").trim();

  if (!email || !role) {
    return {
      error: "Email and role are required.",
    };
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL || "http://localhost:4000";

  try {
    const response = await fetch(`${baseUrl}/users/role`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getSignedOwnerHeaders(session),
      },
      body: JSON.stringify({ email, role }),
      cache: "no-store",
    });

    if (!response.ok) {
      return {
        error: "Unable to update this user role.",
      };
    }
  } catch {
    return {
      error: "The API is unavailable. Start the backend and try again.",
    };
  }

  revalidatePath("/dashboard/users");
  return {};
}

export async function createInviteAction(
  _prevState: InviteFormState,
  formData: FormData,
): Promise<InviteFormState> {
  const session = await getSession();

  if (!session || session.role !== "owner") {
    return {
      error: "Only workspace owners can send invites.",
    };
  }

  const email = String(formData.get("email") || "").trim();
  const role = String(formData.get("role") || "").trim();

  if (!email || !role) {
    return {
      error: "Email and role are required.",
    };
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL || "http://localhost:4000";

  try {
    const response = await fetch(`${baseUrl}/invites`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getSignedOwnerHeaders(session),
      },
      body: JSON.stringify({ email, role }),
      cache: "no-store",
    });

    if (!response.ok) {
      return {
        error: "Unable to create this invite.",
      };
    }
  } catch {
    return {
      error: "The API is unavailable. Start the backend and try again.",
    };
  }

  revalidatePath("/dashboard/users");
  return {
    success: "Invite created successfully.",
  };
}
