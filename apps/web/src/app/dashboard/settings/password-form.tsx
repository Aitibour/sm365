"use client";

import { useActionState } from "react";
import { changePasswordAction, type PasswordFormState } from "./actions";
import styles from "./settings.module.css";

const initialState: PasswordFormState = {};

export function PasswordForm() {
  const [state, formAction, pending] = useActionState(changePasswordAction, initialState);

  return (
    <form className={styles.form} action={formAction}>
      <label className={styles.field}>
        <span>Current password</span>
        <input type="password" name="currentPassword" placeholder="Current password" />
      </label>

      <label className={styles.field}>
        <span>New password</span>
        <input type="password" name="newPassword" placeholder="New password" />
      </label>

      {state.error ? <p className={styles.error}>{state.error}</p> : null}
      {state.success ? <p className={styles.success}>{state.success}</p> : null}

      <button className={styles.button} type="submit" disabled={pending}>
        {pending ? "Saving..." : "Update password"}
      </button>
    </form>
  );
}
