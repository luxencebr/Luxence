"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import { FaCheck, FaXmark } from "react-icons/fa6";

interface BenefitBase {
  id: number;
  name: string;
  type: "number" | "string" | "boolean";
}

interface Plan {
  id: number;
  signature: "SILVER" | "GOLD" | "DIAMOND";
  title: string;
  price: string;
  description: string;
  benefits: Record<number, number | string | boolean>;
}

export default function Plans() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loadingPlan, setLoadingPlan] = useState<"SILVER" | "GOLD" | "DIAMOND" | null>(null);

  const benefitList: BenefitBase[] = [
    { id: 1, name: "Fotos no Perfil", type: "number" },
    { id: 2, name: "Vídeos no Perfil", type: "number" },
    { id: 3, name: "Controle de Comentários", type: "boolean" },
    { id: 4, name: "Atualizações de Perfil", type: "number" },
    { id: 5, name: "Demonstração de Voz", type: "boolean" },
    { id: 6, name: "Prioridade", type: "string" },
    { id: 7, name: "Perfil em destaque", type: "boolean" },
  ];

  const plans: Plan[] = [
    {
      id: 1,
      signature: "SILVER",
      title: "Prata",
      price: "R$ 29,90/mês",
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
      signature: "GOLD",
      title: "Ouro",
      price: "R$ 49,90/mês",
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
      signature: "DIAMOND",
      title: "Diamante",
      price: "R$ 79,90/mês",
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

  const handleSelectPlan = async (planSignature: "SILVER" | "GOLD" | "DIAMOND") => {
    if (!session?.user) {
      // Redirecionar para login se não estiver autenticado
      router.push('/auth/signin');
      return;
    }

    try {
      setLoadingPlan(planSignature);
      
      const response = await fetch('/api/payments/pix', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planSignature,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        // Mostrar erro específico para dados faltantes
        if (result.error && (
          result.error.includes('telefone') || 
          result.error.includes('documento') ||
          result.error.includes('CPF') ||
          result.error.includes('CNPJ')
        )) {
          router.push('/advertiser'); // Redirecionar para completar cadastro
          return;
        }
        
        throw new Error(result.error || 'Erro ao criar cobrança');
      }

      if (result.success && result.payment) {
        // Redirecionar para a página de pagamento da AbacatePay
        window.open(result.payment.paymentUrl, '_blank');
      } else {
        throw new Error('Resposta inválida do servidor');
      }
    } catch (error) {
      console.error('Erro ao processar plano:', error);
    } finally {
      setLoadingPlan(null);
    }
  };

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

              <button 
                onClick={() => handleSelectPlan(plan.signature)}
                disabled={loadingPlan !== null}
              >
                {loadingPlan === plan.signature ? 'Processando...' : `Seja ${plan.title}`}
              </button>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
