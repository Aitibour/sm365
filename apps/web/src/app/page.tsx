import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <nav className={styles.nav}>
          <div className={styles.brand}>
            <span className={styles.brandMark}>SM</span>
            <span>SM 365</span>
          </div>
          <div className={styles.navLinks}>
            <a href="#features">Features</a>
            <a href="/pricing">Pricing</a>
            <a href="#stack">Free Stack</a>
            <a href="#launch">Launch Plan</a>
          </div>
          <a className={styles.navCta} href="/login">
            Sign in
          </a>
        </nav>

        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <span className={styles.eyebrow}>Social management + marketing funnel</span>
            <h1>Run content, leads, and customer growth in one place.</h1>
            <p>
              SM 365 is the branded shell for a free-stack SaaS that combines social
              publishing, funnel automation, CRM, and live conversations without locking
              the business into expensive closed platforms.
            </p>
            <div className={styles.heroActions}>
              <a className={styles.primaryButton} href="/dashboard">
                Open dashboard
              </a>
              <a className={styles.secondaryButton} href="/pricing">
                Explore the stack
              </a>
            </div>
            <dl className={styles.stats}>
              <div>
                <dt>Core engines</dt>
                <dd>4</dd>
              </div>
              <div>
                <dt>Primary flow</dt>
                <dd>Lead to post</dd>
              </div>
              <div>
                <dt>License goal</dt>
                <dd>Free-first</dd>
              </div>
            </dl>
          </div>

          <aside className={styles.heroPanel} aria-label="SM 365 preview">
            <div className={styles.panelWindow}>
              <div className={styles.panelHeader}>
                <div className={styles.panelDots} aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </div>
                <span className={styles.panelTitle}>Publishing cockpit</span>
              </div>
              <div className={styles.calendar}>
                <article className={styles.calendarCard}>
                  <div className={styles.calendarMeta}>
                    <span>Tuesday 09:00</span>
                    <span>Queued</span>
                  </div>
                  <h2>Founder story campaign</h2>
                  <p>
                    Generate a long-form narrative once, then reshape it into platform-ready
                    posts, CTAs, and funnel entry points.
                  </p>
                  <div className={styles.platformRow}>
                    <span>Instagram</span>
                    <span>LinkedIn</span>
                    <span>X</span>
                    <span>TikTok</span>
                  </div>
                </article>
                <article className={styles.calendarCard}>
                  <div className={styles.calendarMeta}>
                    <span>Thursday 14:30</span>
                    <span>Lead magnet</span>
                  </div>
                  <h2>Automated nurture handoff</h2>
                  <p>
                    New leads move from landing page to email sequence, CRM pipeline, and
                    support inbox without manual handoffs.
                  </p>
                </article>
              </div>
            </div>

            <div className={styles.signalGrid}>
              <div className={styles.signalCard}>
                <strong>Postiz</strong>
                <span>Scheduling and social publishing</span>
              </div>
              <div className={styles.signalCard}>
                <strong>Mautic</strong>
                <span>Funnels, forms, and lifecycle campaigns</span>
              </div>
              <div className={styles.signalCard}>
                <strong>Twenty</strong>
                <span>CRM pipeline and account tracking</span>
              </div>
              <div className={styles.signalCard}>
                <strong>Chatwoot</strong>
                <span>Shared inbox and support conversations</span>
              </div>
            </div>
          </aside>
        </section>

        <section className={styles.sectionGrid}>
          <section className={styles.proofCard} id="features">
            <h2>What the first version should do</h2>
            <ul className={styles.proofList}>
              <li>
                <strong>Unify content and funnel workflows</strong>
                <span>
                  A creator or team should move from idea, to scheduled post, to captured
                  lead, to CRM follow-up inside one branded experience.
                </span>
              </li>
              <li>
                <strong>Keep each engine separate behind one portal</strong>
                <span>
                  The web app owns branding, auth, and navigation while the underlying
                  services handle their specialties.
                </span>
              </li>
              <li>
                <strong>Start with launch-ready pages, not a blank dashboard</strong>
                <span>
                  This app now gives the project a real product-facing front page we can
                  expand into onboarding, pricing, and workspace flows.
                </span>
              </li>
            </ul>
          </section>

          <section className={styles.stackCard} id="stack">
            <h2>The free stack behind SM 365</h2>
            <ul className={styles.stackList}>
              <li>
                <strong>Postiz</strong>
                <span>Social scheduling, queues, and publishing workflows.</span>
              </li>
              <li>
                <strong>Mautic</strong>
                <span>Campaigns, forms, landing pages, and email nurturing.</span>
              </li>
              <li>
                <strong>Twenty</strong>
                <span>CRM objects, account history, and sales pipeline views.</span>
              </li>
              <li>
                <strong>Chatwoot</strong>
                <span>Live chat, support conversations, and shared inbox routing.</span>
              </li>
            </ul>
          </section>
        </section>

        <footer className={styles.footer} id="launch">
          <span>Next build step: wire auth, billing, and product integrations.</span>
          <span>Project: SM 365</span>
        </footer>
      </div>
    </main>
  );
}
