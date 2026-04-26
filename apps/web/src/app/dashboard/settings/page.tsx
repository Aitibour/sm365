import { getSession } from "@/lib/auth";
import { PasswordForm } from "./password-form";
import styles from "./settings.module.css";

export default async function SettingsPage() {
  const session = await getSession();

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <span className={styles.eyebrow}>Settings</span>
        <h1>Account security</h1>
        <p>
          Update the password for the current signed-in user. This now writes back to the
          local SQLite database that powers authentication for SM 365.
        </p>

        <div className={styles.meta}>
          <strong>{session?.name}</strong>
          <span>{session?.email}</span>
          <span>Role: {session?.role}</span>
        </div>

        <PasswordForm />
      </section>
    </main>
  );
}
