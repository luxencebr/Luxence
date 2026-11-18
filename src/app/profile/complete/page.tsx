"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSiteLocale } from "@/lib/site-locale";
import { uiText } from "@/lib/ui-text";
import styles from "./page.module.css";

type Option = { id: number; label: string; name: string };
type Initial = {
  producerId: number; name: string; age: number | null; images: number;
  contact: { contactId: number; value: string } | null;
  prices: { priceId: number; value: number }[];
  payments: { paymentId: number }[];
  languages: { name: string }[];
  location: { state: string; city: string };
  priceOptions: Option[]; paymentOptions: Option[]; contactOptions: Option[];
};

export default function CompleteProfilePage() {
  const router = useRouter();
  const { locale } = useSiteLocale();
  const t = (s: string) => uiText(locale, s);
  const [initial, setInitial] = useState<Initial | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");

  useEffect(() => {
    fetch("/api/profile/onboarding", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error(t("Não foi possível carregar seu perfil."));
        setInitial(await response.json());
      })
      .catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    if (!file) { setPreview(""); return; }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!initial) return;
    setSaving(true);
    setError("");
    const data = new FormData(event.currentTarget);
    if (file) data.set("image", file);
    try {
      const response = await fetch("/api/profile/onboarding", { method: "POST", body: data });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || t("Não foi possível concluir o perfil."));
      if (!result.isComplete) throw new Error(t("Ainda há dados pendentes no seu perfil."));
      router.push(`/product/${initial.producerId}`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : t("Não foi possível concluir o perfil."));
    } finally {
      setSaving(false);
    }
  }

  if (!initial) return <p className={styles.message}>{error || t("Carregando perfil...")}</p>;

  return <section className={styles.page}>
    <h1>{t("Concluir perfil")}</h1>
    <p className={styles.intro}>{t("Preencha os dados abaixo para publicar seu perfil no catálogo.")}</p>
    <form onSubmit={submit} className={styles.form}>
      <div className={styles.grid}>
        <label className={styles.wide}>{t("Foto do perfil")}{initial.images > 0 ? ` (${initial.images} ${t("já cadastrada(s)")})` : " *"}
          <input type="file" name="image" accept="image/jpeg,image/png,image/webp" required={initial.images === 0} onChange={(e) => setFile(e.target.files?.[0] || null)} />
          {preview && <img src={preview} alt={t("Prévia da imagem")} className={styles.preview} />}
        </label>
        <label>{t("Nome do perfil")}<input name="name" defaultValue={initial.name} required minLength={2} maxLength={80} /></label>
        <label>{t("Idade")}<input name="age" type="number" min="18" max="99" defaultValue={initial.age ?? ""} required /></label>
        <label>{t("Tipo de contato")}
          <select name="contactOptionId" defaultValue={initial.contact?.contactId ?? ""} required><option value="" disabled>{t("Selecione")}</option>{initial.contactOptions.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}</select>
        </label>
        <label>{t("Contato")}<input name="contact" defaultValue={initial.contact?.value ?? ""} minLength={6} maxLength={100} required /></label>
        <label>{t("Serviço")}
          <select name="priceOptionId" defaultValue={initial.prices[0]?.priceId ?? ""} required><option value="" disabled>{t("Selecione")}</option>{initial.priceOptions.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}</select>
        </label>
        <label>{t("Valor em reais")}<input name="price" type="number" min="0.01" step="0.01" defaultValue={initial.prices[0]?.value ?? ""} required /></label>
        <label>{t("Forma de pagamento")}
          <select name="paymentOptionId" defaultValue={initial.payments[0]?.paymentId ?? ""} required><option value="" disabled>{t("Selecione")}</option>{initial.paymentOptions.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}</select>
        </label>
        <label>{t("Idioma falado")}
          <select name="language" defaultValue={initial.languages[0]?.name ?? ""} required><option value="" disabled>{t("Selecione")}</option>{["Português", "Inglês", "Espanhol"].map(o => <option key={o}>{o}</option>)}</select>
        </label>
        <label>{t("Cidade")}<input name="city" defaultValue={initial.location.city} required maxLength={100} /></label>
        <label>{t("Estado (UF)")}<input name="state" defaultValue={initial.location.state} required minLength={2} maxLength={2} /></label>
      </div>
      <p className={styles.hint}>{t("O público atendido será preenchido com sua escolha no cadastro. Confira cidade e estado antes de continuar.")}</p>
      {error && <p role="alert" className={styles.error}>{error}</p>}
      <button disabled={saving} type="submit">{saving ? t("Salvando...") : t("Concluir perfil")}</button>
    </form>
  </section>;
}
