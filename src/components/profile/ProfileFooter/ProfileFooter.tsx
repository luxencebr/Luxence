"use client";

import ProfileUserLink from "@/components/profile/ProfileUserLink/ProfileUserLink";
import styles from "./ProfileFooter.module.css";
import { useSiteLocale } from "@/lib/site-locale";
import { uiText } from "@/lib/ui-text";

export default function ProfileFooter() {
  const { locale } = useSiteLocale();
  return (
    <div className={styles.footer}>
      <div className={styles.content}>
        <h3 className={styles.title}>{uiText(locale, "Sessão Ativa")}</h3>
        <ProfileUserLink />
      </div>
    </div>
  );
}
