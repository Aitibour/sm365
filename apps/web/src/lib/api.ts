import { createHmac } from "node:crypto";
import type { SessionUser } from "./auth";

type DashboardPayload = {
  heading: string;
  subheading: string;
  workspace: {
    name: string;
    plan: string;
    status: string;
  };
  integrations: Array<{
    name: string;
    status: string;
    note: string;
  }>;
  metrics: Array<{
    label: string;
    value: string;
  }>;
  milestones: string[];
};

type UsersPayload = {
  users: Array<{
    id: string;
    email: string;
    name: string;
    role: string;
  }>;
};

type InvitesPayload = {
  invites: Array<{
    id: string;
    email: string;
    role: string;
    token: string;
    status: string;
    invitedByEmail: string;
    createdAt: string;
  }>;
};

const fallbackDashboard: DashboardPayload = {
  heading: "Welcome back, SM 365 Admin.",
  subheading:
    "Your dashboard can render with fallback data when the API is offline, but it will prefer live session-aware payloads whenever the backend is available.",
  workspace: {
    name: "Admin's Workspace",
    plan: "Growth",
    status: "Active",
  },
  integrations: [
    {
      name: "Postiz",
      status: "Planned",
      note: "Will power scheduling, queues, and content publishing.",
    },
    {
      name: "Mautic",
      status: "Planned",
      note: "Will run lead capture, landing pages, and lifecycle campaigns.",
    },
    {
      name: "Twenty",
      status: "Planned",
      note: "Will track contacts, companies, and pipeline movement.",
    },
    {
      name: "Chatwoot",
      status: "Planned",
      note: "Will unify support and pre-sales conversations.",
    },
  ],
  metrics: [
    { label: "Connected engines", value: "4" },
    { label: "Workspace plan", value: "Growth" },
    { label: "API status", value: "Ready" },
    { label: "Session role", value: "owner" },
  ],
  milestones: [
    "Replace the demo user with database-backed accounts",
    "Add billing and subscription webhooks",
    "Sync lead and customer records across services",
    "Provision workspaces and service access automatically",
  ],
};

function getApiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL || "http://localhost:4000";
}

function getAuthSecret() {
  return process.env.AUTH_SECRET || "sm365-dev-secret";
}

function getOwnerHeaders(user?: SessionUser | null): Record<string, string> {
  if (!user || user.role !== "owner") {
    return {};
  }

  const signature = createHmac("sha256", getAuthSecret())
    .update(`${user.email}:${user.role}`)
    .digest("base64url");

  return {
    "x-sm365-actor-email": user.email,
    "x-sm365-actor-role": user.role,
    "x-sm365-actor-signature": signature,
  };
}

export async function getDashboardData(user?: SessionUser | null): Promise<DashboardPayload> {
  const baseUrl = getApiBaseUrl();
  const url = new URL(`${baseUrl}/dashboard`);

  if (user) {
    url.searchParams.set("email", user.email);
    url.searchParams.set("name", user.name);
    url.searchParams.set("role", user.role);
  }

  try {
    const response = await fetch(url.toString(), {
      next: { revalidate: 30 },
    });

    if (!response.ok) {
      return fallbackDashboard;
    }

    return (await response.json()) as DashboardPayload;
  } catch {
    return fallbackDashboard;
  }
}

export async function getUsersData(user?: SessionUser | null): Promise<UsersPayload> {
  if (!user || user.role !== "owner") {
    return { users: [] };
  }

  try {
    const response = await fetch(`${getApiBaseUrl()}/users`, {
      cache: "no-store",
      headers: getOwnerHeaders(user),
    });

    if (!response.ok) {
      return { users: [] };
    }

    return (await response.json()) as UsersPayload;
  } catch {
    return { users: [] };
  }
}

export async function getInvitesData(user?: SessionUser | null): Promise<InvitesPayload> {
  if (!user || user.role !== "owner") {
    return { invites: [] };
  }

  try {
    const response = await fetch(`${getApiBaseUrl()}/invites`, {
      cache: "no-store",
      headers: getOwnerHeaders(user),
    });

    if (!response.ok) {
      return { invites: [] };
    }

    return (await response.json()) as InvitesPayload;
  } catch {
    return { invites: [] };
  }
}

export function getSignedOwnerHeaders(user?: SessionUser | null): Record<string, string> {
  return getOwnerHeaders(user);
}
