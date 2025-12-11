"use client";

import styles from "./page.module.css";
import { FaCheck, FaXmark } from "react-icons/fa6";

interface BenefitBase {
  id: number;
  name: string;
  type: "number" | "string" | "boolean";
}

interface Plan {
  id: number;
  title: string;
  price: string;
  description: string;

  // chave = benefit id, valor = number | boolean
  benefits: Record<number, number | string | boolean>;
}

export default function Plans() {
  const benefitList: BenefitBase[] = [
    { id: 1, name: "Fotos no Perfil", type: "number" },
    { id: 2, name: "Vídeos no Perfil", type: "number" },
    { id: 3, name: "Shorts no Perfil", type: "number" },
    { id: 4, name: "Controle de Comentários", type: "boolean" },

    //----------------------------

    { id: 5, name: "Atualizações de Mídia", type: "number" },
    { id: 6, name: "Atualizações de Perfil", type: "number" },
    { id: 7, name: "Respostas", type: "number" },
    { id: 8, name: "Demosntração de Voz", type: "boolean" },
    { id: 9, name: "Prioridade", type: "string" },

    //----------------------------

    { id: 10, name: "Perfil em destaque", type: "boolean" },
  ];

  const plans: Plan[] = [
    {
      id: 1,
      title: "Prata",
      price: "R$ 99,90/mês",
      description: "Ideal para quem está começando.",
      benefits: {
        1: 10,
        2: 2,
        3: 2,
        4: true,
        5: 2,
        6: 2,
        7: 6,
        8: false,
        9: "",
        10: false,
      },
    },
    {
      id: 2,
      title: "Ouro",
      price: "R$ 149,90/mês",
      description: "Perfeito para quem quer crescer.",
      benefits: {
        1: 30,
        2: 4,
        3: 10,
        4: true,
        5: 6,
        6: 10,
        7: 10,
        8: true,
        9: "Alta",
        10: false,
      },
    },
    {
      id: 3,
      title: "Diamante",
      price: "R$ 199,90/mês",
      description: "O melhor para quem quer se destacar.",
      benefits: {
        1: 50,
        2: 10,
        3: Infinity, // Shorts ilimitados
        4: true,
        5: 10,
        6: Infinity,
        7: Infinity,
        8: true,
        9: "Máxima",
        10: true,
      },
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
              <ul className={styles.benefits}>
                {benefitList.map((b) => {
                  const value = plan.benefits[b.id];

                  return (
                    <li
                      key={b.id}
                      className={`${styles.benefit} ${!value && styles.deny}`}
                    >
                      {b.type === "number" && value === Infinity ? (
                        <FaCheck />
                      ) : b.type === "number" && value === 0 ? (
                        <FaXmark />
                      ) : b.type === "number" ? (
                        value
                      ) : b.type === "string" ? (
                        (value && (
                          <>
                            <FaCheck /> {value}
                          </>
                        )) || <FaXmark />
                      ) : value ? (
                        <FaCheck />
                      ) : (
                        <FaXmark />
                      )}{" "}
                      {b.name}
                      {b.type === "number" && value === Infinity
                        ? " Ilimitados"
                        : null}
                    </li>
                  );
                })}
              </ul>

              <button>Seja {plan.title}</button>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
