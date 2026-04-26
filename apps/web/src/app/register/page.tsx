import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { RegisterForm } from "./register-form";
import styles from "../login/login.module.css";

export default async function RegisterPage() {
  const session = await getSession();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <Link className={styles.backLink} href="/">
          Back to home
        </Link>
        <span className={styles.eyebrow}>Create account</span>
        <h1>Start your SM 365 workspace</h1>
        <p>
          Create a real user in the local database and land directly in the protected
          dashboard with a signed session.
        </p>

        <RegisterForm />

        <div className={styles.meta}>
          <Link href="/login">Already have an account?</Link>
          <Link href="/pricing">View plans</Link>
        </div>
      </section>
    </main>
  );
}
