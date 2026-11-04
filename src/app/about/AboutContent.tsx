"use client";

import Link from "next/link";
import styles from "./page.module.css";
import { useSiteLocale } from "@/lib/site-locale";
import { siteCopy } from "@/lib/site-copy";

export default function AboutContent() {
  const { locale } = useSiteLocale();
  const t = siteCopy[locale].about;
  return <main className={styles.container}>
    <section className={styles.intro}><h1>{t[0]}</h1><p>{t[1]}</p></section>
    <section className={styles.section}><h2>{t[2]}</h2><p>{t[3]}</p><Link href="/catalog">{t[4]}</Link></section>
    <section className={styles.section}><h2>{t[5]}</h2><p>{t[6]}</p><Link href="/blog">{t[7]}</Link></section>
    <section className={styles.section}><h2>{t[8]}</h2><p>{t[9]}</p><Link href="/suport">{t[10]}</Link></section>
  </main>;
}
