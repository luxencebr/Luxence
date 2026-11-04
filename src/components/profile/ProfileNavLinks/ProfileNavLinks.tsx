"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./ProfileNavLinks.module.css";
import { User, CreditCard, Lock, Crown } from "lucide-react";
import { useSiteLocale } from "@/lib/site-locale";
import { uiText } from "@/lib/ui-text";

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
  // {
  //   href: "/profile/signature",
  //   label: "Assinatura",
  //   icon: Crown,
  // },
];

export default function ProfileNavLinks() {
  const { locale } = useSiteLocale();
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
            <span>{uiText(locale, route.label)}</span>
          </Link>
        );
      })}
    </nav>
  );
}
