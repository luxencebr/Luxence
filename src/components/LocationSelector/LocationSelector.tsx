"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./LocationSelector.module.css";
import { IoMdLocate } from "react-icons/io";

import Dropdown from "../ui/Dropdown/Dropdown";

interface UF {
  id: number;
  sigla: string;
  nome: string;
}

interface City {
  id: number;
  nome: string;
}

export default function LocationSelector() {
  const router = useRouter();
  const pathname = usePathname();
  const [ufs, setUfs] = useState<UF[]>([]);
  const [selectedUf, setSelectedUf] = useState<UF | null>(null);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);

  useEffect(() => {
    const savedUf = localStorage.getItem("selectedUf");
    if (savedUf) {
      setSelectedUf(JSON.parse(savedUf));
    }

    fetch(
      "https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome"
    )
      .then((res) => res.json())
      .then((data: UF[]) => setUfs(data))
      .catch((err) => console.error("Erro ao carregar estados:", err));
  }, []);

  const handleUfSelect = (uf: UF, closeMenu: () => void) => {
    setSelectedUf(uf);
    localStorage.setItem("selectedUf", JSON.stringify(uf));

    closeMenu();

    if (pathname?.startsWith("/catalog")) {
      router.push("/catalog");
    }
  };

  const locationLabel =
    selectedCity?.nome || selectedUf?.nome || "Sua Localização";

  return (
    <Dropdown
      trigger={
        <span className={styles.triggerContent}>
          <i>
            <IoMdLocate />
          </i>
          {locationLabel}
        </span>
      }
      containerClassName={styles.dropdown}
      triggerClassName={styles.trigger}
      menuClassName={styles.menu}
    >
      {(closeMenu) => {
        return ufs.map((uf) => (
          <button
            key={uf.id}
            onClick={() => handleUfSelect(uf, closeMenu)}
            className={styles.option}
          >
            {uf.nome}
          </button>
        ));
      }}
    </Dropdown>
  );
}
