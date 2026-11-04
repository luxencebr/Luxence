"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSiteLocale } from "@/lib/site-locale";
import { uiText } from "@/lib/ui-text";

export default function CatalogRedirect() {
  const { locale } = useSiteLocale();
  const router = useRouter();

  useEffect(() => {
    const storedUf = localStorage.getItem("selectedUf");

    if (storedUf) {
      const uf = JSON.parse(storedUf);
      router.replace(`/catalog/${uf.sigla.toLowerCase()}`);
    } else {
      router.replace("/catalog/rj");
    }
  }, [router]);

  return (
    <div
      style={{
        height: "100vh",
        color: "var(--contrast-color)",
        display: "flex",
        flexFlow: "column nowrap",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
      }}
    >
      <img
        src="/LuxenceLogo.png"
        alt=""
        style={{
          height: "128px",
          aspectRatio: "1 / 1",
          objectFit: "cover",
        }}
      />
      <p>{uiText(locale, "Redirecionando para o catálogo da sua região...")}</p>
    </div>
  );
}
