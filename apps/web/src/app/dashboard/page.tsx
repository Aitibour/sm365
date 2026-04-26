import { getSession } from "@/lib/auth";
import { getDashboardData } from '@/lib/api';
import styles from "./dashboard.module.css";

export default async function DashboardPage() {
  const session = await getSession();
  const dashboard = await getDashboardData(session);

  return (
    <>
      <section className={styles.hero}>
        <span className={styles.eyebrow}>Dashboard overview</span>
        <h1>{dashboard.heading}</h1>
        <p>{dashboard.subheading}</p>
        <p>
          {session?.role === "owner"
            ? "You have owner access, including user management and workspace administration."
            : "You have member access. Workspace administration remains reserved for owners."}
        </p>
      </section>

      <section className={styles.grid}>
        {dashboard.metrics.map((metric) => (
          <article className={styles.metric} key={metric.label}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
          </article>
        ))}
      </section>

      <section className={styles.panelGrid}>
        <article className={styles.panel}>
          <h2>Workspace snapshot</h2>
          <ul>
            <li>
              <strong>{dashboard.workspace.name}</strong>
              <span>Plan: {dashboard.workspace.plan}</span>
            </li>
            <li>
              <strong>Workspace status</strong>
              <span>{dashboard.workspace.status}</span>
            </li>
            {dashboard.integrations.map((item) => (
              <li key={item.name}>
                <strong>
                  {item.name} · {item.status}
                </strong>
                <span>{item.note}</span>
              </li>
            ))}
          </ul>
        </article>

        <article className={styles.panel}>
          <h2>Next milestones</h2>
          <ul>
            {dashboard.milestones.map((milestone) => (
              <li key={milestone}>
                <strong>{milestone}</strong>
              </li>
            ))}
          </ul>
        </article>
      </section>
    </>
  );
}
