"use client";

import Link from "next/link";
import { User, Lock, CreditCard, ChevronRight, Crown } from "lucide-react";
import styles from "./ProfileHub.module.css";

const navItems = [
  {
    href: "/profile/account",
    label: "Dados da Conta",
    description: "Gerencie suas informações pessoais",
    icon: User,
  },
  {
    href: "/profile/security",
    label: "Privacidade e Segurança",
    description: "Controle de senha e privacidade",
    icon: Lock,
  },
  {
    href: "/profile/payment",
    label: "Métodos de Pagamento",
    description: "Gerencie seus meios de pagamento",
    icon: CreditCard,
  },
  {
    href: "/profile/signature",
    label: "Assinatura",
    description: "Gerencie seu plano",
    icon: Crown,
  },
];

export default function ProfileHub() {
  return (
    <div className={styles.container}>
      <div className={styles.cards}>
        {navItems.map((item) => (
          <Link key={item.href} href={item.href} className={styles.card}>
            <div className={styles.cardIcon}>
              <item.icon size={24} />
            </div>
            <div className={styles.cardContent}>
              <h3 className={styles.cardTitle}>{item.label}</h3>
              <p className={styles.cardDescription}>{item.description}</p>
            </div>
            <ChevronRight className={styles.chevron} size={20} />
          </Link>
        ))}
      </div>
    </div>
  );
}
