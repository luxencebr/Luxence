"use client";

import { ReactNode } from "react";

import styles from "./page.module.css";
import { SiMaildotru, SiWhatsapp } from "react-icons/si";
import { useSiteLocale } from "@/lib/site-locale";
import { uiText } from "@/lib/ui-text";

interface ContactCardProps {
  icon: ReactNode;
  title: string;
  description?: string;
  href: string;
}

function ContactCard({ icon, title, description, href }: ContactCardProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.card}
    >
      <div className={styles.icon}>{icon}</div>

      <div className={styles.text}>
        <strong>{title}</strong>
        {description && <span>{description}</span>}
      </div>
    </a>
  );
}

export default function Page() {
  const { locale } = useSiteLocale();
  const t = (value: string) => uiText(locale, value);
  return (
    <div className={styles.suportPage}>
      <div className={styles.layout}>
        <div className={styles.header}>
          <h1 className={styles.title}>{t("Precisando de Ajuda?")}</h1>
          <h2 className={styles.subTitle}>
            {t("Fale conosco por um dos canais abaixo...")}
          </h2>
        </div>

        <div className={styles.content}>
          <ContactCard
            icon={<SiMaildotru />}
            title="E-mail"
            description={t("Resposta personalizada em até 24h")}
            href="https://mail.google.com/mail/?view=cm&fs=1&to=suporte@luxence.com.br&su=Suporte%20Luxence&body=Olá,%20preciso%20de%20ajuda%20com..."
          />
          <ContactCard
            icon={<SiWhatsapp />}
            title="Whatsapp"
            description={t("Resposta automática imediatamente")}
            href="https://wa.me/5521967957268?text=*Suporte%20Luxence*%0A%0AOlá,%20preciso%20de%20ajuda%20com..."
          />
        </div>
      </div>
    </div>
  );
}
