"use client";

import { useActionState } from "react";
import { registerAction, type RegisterFormState } from "./actions";
import styles from "../login/login.module.css";

const initialState: RegisterFormState = {};

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(registerAction, initialState);

  return (
    <form className={styles.form} action={formAction}>
      <label className={styles.field}>
        <span>Name</span>
        <input type="text" name="name" placeholder="Jane Founder" />
      </label>

      <label className={styles.field}>
        <span>Email</span>
        <input type="email" name="email" placeholder="you@company.com" />
      </label>

      <label className={styles.field}>
        <span>Password</span>
        <input type="password" name="password" placeholder="Create a password" />
      </label>

      {state.error ? <p className={styles.error}>{state.error}</p> : null}

      <button className={styles.button} type="submit" disabled={pending}>
        {pending ? "Creating account..." : "Create account"}
      </button>
    </form>
  );
}
