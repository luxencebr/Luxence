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
    { id: 3, name: "Controle de Comentários", type: "boolean" },

    //----------------------------

    { id: 4, name: "Atualizações de Perfil", type: "number" },
    { id: 5, name: "Demosntração de Voz", type: "boolean" },
    { id: 6, name: "Prioridade", type: "string" },

    //----------------------------

    { id: 7, name: "Perfil em destaque", type: "boolean" },
  ];

  const plans: Plan[] = [
    {
      id: 1,
      title: "Prata",
      price: "",
      description: "Ideal para quem está começando.",
      benefits: {
        1: 5, // Fotos
        2: 1, // Vídeos
        3: true, // Controle comentários
        4: 5, // Atualizações perfil
        5: false, // Voz
        6: "", // Prioridade
        7: false, // Destaque
      },
    },
    {
      id: 2,
      title: "Ouro",
      price: "",
      description: "Perfeito para quem quer crescer.",
      benefits: {
        1: 10,
        2: 2,
        3: true,
        4: 10,
        5: true,
        6: "Alta",
        7: false,
      },
    },
    {
      id: 3,
      title: "Diamante",
      price: "",
      description: "O melhor para quem quer se destacar.",
      benefits: {
        1: 20,
        2: 5,
        3: true,
        4: Infinity,
        5: true,
        6: "Máxima",
        7: true,
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
