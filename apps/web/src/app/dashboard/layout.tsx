import Link from "next/link";
import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { logoutAction } from "../login/actions";
import styles from "./dashboard.module.css";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <Link className={styles.logo} href="/">
          <span>SM</span>
          <strong>SM 365</strong>
        </Link>
        <nav className={styles.nav}>
          <Link className={styles.active} href="/dashboard">
            Overview
          </Link>
          {session.role === "owner" ? <Link href="/dashboard/users">Users</Link> : null}
          <Link href="/dashboard/settings">Settings</Link>
          <Link href="/pricing">Plans</Link>
          <Link href="/login">Sign in</Link>
        </nav>
        <div className={styles.sidebarCard}>
          <p>Free-stack engines</p>
          <strong>Postiz, Mautic, Twenty, Chatwoot</strong>
        </div>
        <div className={styles.userCard}>
          <span>{session.name}</span>
          <strong>{session.email}</strong>
          <form action={logoutAction}>
            <button className={styles.logoutButton} type="submit">
              Sign out
            </button>
          </form>
        </div>
      </aside>
      <main className={styles.content}>{children}</main>
    </div>
  );
}
