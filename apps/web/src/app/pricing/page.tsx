import Link from "next/link";
import styles from "./pricing.module.css";

const plans = [
  {
    name: "Starter",
    price: "$0",
    description: "For validating the workflow and launching a branded proof of concept.",
    features: [
      "1 workspace shell",
      "Landing pages and pricing flow",
      "Basic CRM and funnel mapping",
      "Starter dashboard experience",
    ],
  },
  {
    name: "Growth",
    price: "$49",
    description: "For small teams ready to connect social publishing with lead capture.",
    features: [
      "Multi-channel content operations",
      "Campaign and pipeline handoff",
      "Shared inbox routing",
      "Priority onboarding flow",
    ],
    featured: true,
  },
  {
    name: "Scale",
    price: "$149",
    description: "For agencies or operators managing multiple brands and deeper automation.",
    features: [
      "Multiple workspace support",
      "Advanced workflow orchestration",
      "Role-aware dashboard views",
      "Custom integration roadmap",
    ],
  },
];

export default function PricingPage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <Link className={styles.backLink} href="/">
          Back to home
        </Link>
        <span className={styles.eyebrow}>Pricing strategy</span>
        <h1>Keep the stack free-first and charge for the product experience.</h1>
        <p>
          SM 365 is designed to use free building blocks behind a single branded
          customer portal. The pricing model should reflect setup, workflow polish,
          and support rather than raw infrastructure markups.
        </p>
      </section>

      <section className={styles.grid}>
        {plans.map((plan) => (
          <article
            key={plan.name}
            className={plan.featured ? styles.featuredCard : styles.card}
          >
            <div>
              <h2>{plan.name}</h2>
              <p className={styles.price}>
                {plan.price}
                <span>/mo</span>
              </p>
              <p className={styles.description}>{plan.description}</p>
            </div>
            <ul className={styles.featureList}>
              {plan.features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
            <Link
              className={plan.featured ? styles.featuredButton : styles.button}
              href="/login"
            >
              Choose {plan.name}
            </Link>
          </article>
        ))}
      </section>
    </main>
  );
}
