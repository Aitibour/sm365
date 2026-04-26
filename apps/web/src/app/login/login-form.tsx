"use client";

import { useActionState } from "react";
import { loginAction, type LoginFormState } from "./actions";
import styles from "./login.module.css";

const initialState: LoginFormState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <form className={styles.form} action={formAction}>
      <label className={styles.field}>
        <span>Email</span>
        <input type="email" name="email" placeholder="admin@sm365.local" />
      </label>

      <label className={styles.field}>
        <span>Password</span>
        <input type="password" name="password" placeholder="sm365-demo" />
      </label>

      {state.error ? <p className={styles.error}>{state.error}</p> : null}

      <button className={styles.button} type="submit" disabled={pending}>
        {pending ? "Signing in..." : "Continue to dashboard"}
      </button>
    </form>
  );
}
