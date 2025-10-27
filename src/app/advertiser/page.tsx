import styles from "./page.module.css";
import { plans } from "@/data/plans";

export default function AdvertiserPage() {
  return (
    <div className={styles.advertiserPage}>
      <div className={styles.layout}>
        <h1>Anuncie Conosco!</h1>
        <div className={styles.signatures}>
          {plans.map((plan) => (
            <article key={plan.id} className={styles.signatureCard}>
              <h2>
                Plano {plan.title} <span>{plan.price}</span>
              </h2>
              <p className={styles.price}></p>
              <p className={styles.description}>{plan.description}</p>
              <h3>Benefícios</h3>
              <ul className={styles.benefits}>
                {plan.benefits.map((benefit, index) => (
                  <li key={index}>{benefit}</li>
                ))}
              </ul>
              <button>Seja {plan.title}</button>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
