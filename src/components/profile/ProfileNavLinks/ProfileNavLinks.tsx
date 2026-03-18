"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./ProfileNavLinks.module.css";
import { User, CreditCard, Lock, Crown } from "lucide-react";

const navItems = [
  {
    href: "/profile/account",
    label: "Dados da Conta",
    icon: User,
  },
  {
    href: "/profile/security",
    label: "Privacidade e Segurança",
    icon: Lock,
  },
  {
    href: "/profile/payment",
    label: "Métodos de Pagamento",
    icon: CreditCard,
  },
  {
    href: "/profile/signature",
    label: "Assinatura",
    icon: Crown,
  },
];

export default function ProfileNavLinks() {
  const pathname = usePathname();

  return (
    <nav className={styles.nav}>
      {navItems.map((route) => {
        const isActive =
          pathname === route.href || pathname.startsWith(route.href + "/");

        return (
          <Link
            key={route.href}
            href={route.href}
            className={`${styles.link} ${isActive ? styles.active : ""}`}
          >
            {route.icon && <route.icon className={styles.icon} />}
            <span>{route.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
