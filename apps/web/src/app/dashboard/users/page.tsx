import { getSession } from "@/lib/auth";
import { getInvitesData, getUsersData } from "@/lib/api";
import { redirect } from "next/navigation";
import { InviteForm } from "./invite-form";
import { RoleForm } from "./role-form";
import styles from "./users.module.css";

export default async function UsersPage() {
  const session = await getSession();

  if (!session || session.role !== "owner") {
    redirect("/dashboard");
  }

  const [{ users }, { invites }] = await Promise.all([
    getUsersData(session),
    getInvitesData(session),
  ]);

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <span className={styles.eyebrow}>User management</span>
        <h1>Registered users</h1>
        <p>
          This is the first internal view of real accounts stored in the local SM 365
          database. It gives you a foundation for admin controls, invitations, and team
          management later.
        </p>

        <div className={styles.inviteCard}>
          <strong>Invite a teammate</strong>
          <span>Create an invite record and share the pending invite details manually for now.</span>
          <InviteForm />
        </div>

        {users.length ? (
          <div className={styles.table}>
            {users.map((user) => (
              <article className={styles.row} key={user.id}>
                <div>
                  <strong>{user.name}</strong>
                  <span>{user.email}</span>
                </div>
                <div>
                  <strong>Workspace access</strong>
                  <RoleForm email={user.email} role={user.role} />
                </div>
                <div>
                  <strong>Status</strong>
                  <span>Active</span>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className={styles.empty}>No users found yet.</p>
        )}
      </section>

      <section className={styles.card}>
        <span className={styles.eyebrow}>Pending invites</span>
        <h2 className={styles.sectionTitle}>Team invites</h2>
        <p>These invites are pending and can later be connected to email delivery and acceptance flows.</p>

        {invites.length ? (
          <div className={styles.table}>
            {invites.map((invite) => (
              <article className={styles.row} key={invite.id}>
                <div>
                  <strong>{invite.email}</strong>
                  <span>Invited by {invite.invitedByEmail}</span>
                </div>
                <div>
                  <strong>Assigned role</strong>
                  <span>{invite.role}</span>
                </div>
                <div>
                  <strong>Invite token</strong>
                  <span className={styles.token}>{invite.token}</span>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className={styles.empty}>No pending invites yet.</p>
        )}
      </section>
    </main>
  );
}
