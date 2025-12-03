"use client";

import styles from "./page.module.css";

export default function Plans() {
  const plans = [
    {
      id: 1,
      title: "Básico",
      price: "",
      description: "Ideal para pequenos negócios que estão começando.",
      benefits: [
        "Exposição em nosso site por 1 mês",
        "Anúncio em redes sociais",
        "Suporte por e-mail",
      ],
    },
    {
      id: 2,
      title: "Essencial",
      price: "R$ 49,90/mês",
      description: "Perfeito para negócios em crescimento.",
      benefits: [
        "Exposição em nosso site por 3 meses",
        "Anúncio em redes sociais",
        "Suporte por e-mail e telefone",
        "Análise de desempenho do anúncio",
      ],
    },
    {
      id: 3,
      title: "Profissional",
      price: "R$ 99,90/mês",
      description: "Perfeito para negócios em crescimento.",
      benefits: [
        "Exposição em nosso site por 3 meses",
        "Anúncio em redes sociais",
        "Suporte por e-mail e telefone",
        "Análise de desempenho do anúncio",
      ],
    },
    {
      id: 4,
      title: "Luxence",
      price: "R$ 199,90/mês",
      description: "Perfeito para negócios em crescimento.",
      benefits: [
        "Exposição em nosso site por 3 meses",
        "Anúncio em redes sociais",
        "Suporte por e-mail e telefone",
        "Análise de desempenho do anúncio",
      ],
    },
  ];

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
