"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CatalogRedirect() {
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
        src="/ExenceLogo.svg"
        alt=""
        style={{
          height: "128px",
          aspectRatio: "1 / 1",
        }}
      />
      <p>
        Redirecionando para o<br />
        catálogo da sua região...
      </p>
    </div>
  );
}
