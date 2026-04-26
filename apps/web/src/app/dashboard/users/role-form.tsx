"use client";

import { useActionState } from "react";
import { updateUserRoleAction, type UserRoleFormState } from "./actions";
import styles from "./users.module.css";

const initialState: UserRoleFormState = {};

export function RoleForm({
  email,
  role,
}: {
  email: string;
  role: string;
}) {
  const [state, formAction, pending] = useActionState(updateUserRoleAction, initialState);

  return (
    <form className={styles.roleForm} action={formAction}>
      <input type="hidden" name="email" value={email} />
      <select className={styles.select} name="role" defaultValue={role}>
        <option value="member">member</option>
        <option value="owner">owner</option>
      </select>
      <button className={styles.button} type="submit" disabled={pending}>
        {pending ? "Saving..." : "Save"}
      </button>
      {state.error ? <p className={styles.error}>{state.error}</p> : null}
    </form>
  );
}
