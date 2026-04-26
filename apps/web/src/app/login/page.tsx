import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { LoginForm } from "./login-form";
import styles from "./login.module.css";

export default async function LoginPage() {
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
        <span className={styles.eyebrow}>Portal access</span>
        <h1>Sign in to SM 365</h1>
        <p>
          Use the demo credentials below to enter the workspace shell. This auth pass
          validates credentials through the API and stores a signed session cookie in
          the web app.
        </p>

        <div className={styles.credentials}>
          <strong>Demo credentials</strong>
          <span>Email: admin@sm365.local</span>
          <span>Password: sm365-demo</span>
        </div>

        <LoginForm />

        <div className={styles.meta}>
          <Link href="/register">Create an account</Link>
          <Link href="/pricing">View plans</Link>
          <Link href="/dashboard">Open dashboard</Link>
        </div>
      </section>
    </main>
  );
}
