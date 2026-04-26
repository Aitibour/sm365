"use client";

import { useActionState } from "react";
import { createInviteAction, type InviteFormState } from "./actions";
import styles from "./users.module.css";

const initialState: InviteFormState = {};

export function InviteForm() {
  const [state, formAction, pending] = useActionState(createInviteAction, initialState);

  return (
    <form className={styles.inviteForm} action={formAction}>
      <label className={styles.field}>
        <span>Email</span>
        <input type="email" name="email" placeholder="teammate@company.com" />
      </label>
      <label className={styles.field}>
        <span>Role</span>
        <select className={styles.select} name="role" defaultValue="member">
          <option value="member">member</option>
          <option value="owner">owner</option>
        </select>
      </label>
      <button className={styles.button} type="submit" disabled={pending}>
        {pending ? "Sending..." : "Create invite"}
      </button>
      {state.error ? <p className={styles.error}>{state.error}</p> : null}
      {state.success ? <p className={styles.success}>{state.success}</p> : null}
    </form>
  );
}
