"use client";

import { useState } from "react";
import styles from "./ProductServices.module.css";
import { FaCheck, FaXmark, FaMinus } from "react-icons/fa6";
import { HiOutlinePencil } from "react-icons/hi2";

import type { Producer } from "@/types/Producer";

interface ProductServicesProps {
  producer: Producer;
  canEdit: boolean;
}

function ProductServices({ producer, canEdit }: ProductServicesProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const SERVICE_OPTIONS = [
    { id: 1, name: "acompanhante", label: "Acompanhante" },
    { id: 2, name: "viagem", label: "Viagem" },
    { id: 3, name: "beijo_boca", label: "Beijo na boca" },
    { id: 4, name: "beijo_grego", label: "Beijo grego" },
    { id: 5, name: "sexo_oral", label: "Sexo Oral" },
    { id: 6, name: "masturbacao", label: "Masturbação" },
    { id: 7, name: "sexo_vaginal", label: "Sexo Vaginal" },
    { id: 9, name: "striptease", label: "Striptease" },
    { id: 10, name: "sexo_anal", label: "Sexo Anal" },
    { id: 11, name: "separador", label: "---" },
    { id: 12, name: "penetracao_dupla", label: "Penetração Dupla" },
    { id: 13, name: "penetracao_tripla", label: "Penetração Tripla" },
  ];

  const initialStates = SERVICE_OPTIONS.map((opt) => {
    const found = producer.profile.services?.find(
      (s) => s.option.id === opt.id
    );

    return {
      id: opt.id,
      label: opt.label,
      status: found?.status || "neutral",
    };
  });

  const [services, setServices] = useState(initialStates);
  const [originalServices, setOriginalServices] = useState(initialStates);

  const handleEdit = () => {
    setOriginalServices(services);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setServices(originalServices);
    setIsEditing(false);
  };

  async function handleSave() {
    if (isSaving) return; // evita requisições duplicadas

    setIsSaving(true);

    try {
      const toSave = services.map((s) => ({
        serviceId: s.id,
        status: s.status,
      }));

      const res = await fetch("/api/profile/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId: producer.profile.id,
          services: toSave,
        }),
      });

      if (!res.ok) {
        console.error("Erro ao salvar serviços");
        return;
      }

      // Se tudo OK, sai do modo edição
      setIsEditing(false);
    } catch (err) {
      console.error("Erro inesperado:", err);
    } finally {
      // sempre encerra o loading
      setIsSaving(false);
    }
  }

  return (
    <section className={styles.productServices}>
      <div className={styles.layout}>
        <div className={styles.header}>
          <h2>Serviços</h2>

          {canEdit ? (
            !isEditing ? (
              <button className={styles.editBtn} onClick={handleEdit}>
                Editar <HiOutlinePencil />
              </button>
            ) : (
              <div className={styles.editActions}>
                <button
                  className={styles.saveBtn}
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? "Salvando..." : "Salvar"}
                </button>

                <button
                  className={styles.cancelBtn}
                  onClick={handleCancel}
                  disabled={isSaving}
                >
                  Cancelar
                </button>
              </div>
            )
          ) : null}
        </div>

        {isSaving ? (
          <div className={styles.saving}>
            <span className={styles.spinner}></span>
          </div>
        ) : (
          <>
            {!isEditing && (
              <ul className={styles.servicesList}>
                {services.map((s) => (
                  <li key={s.id}>
                    {s.label}

                    {s.status === "yes" && (
                      <span className={`${styles.green} ${styles.status}`}>
                        <FaCheck />
                      </span>
                    )}

                    {s.status === "no" && (
                      <span className={`${styles.red} ${styles.status}`}>
                        <FaXmark />
                      </span>
                    )}

                    {s.status === "neutral" && (
                      <span className={`${styles.neutral} ${styles.status}`}>
                        <FaMinus />
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}

            {isEditing && (
              <div className={styles.servicesList}>
                {services.map((s) => (
                  <div key={s.id} className={styles.serviceItem}>
                    <span className={styles.label}>{s.label}</span>

                    <div className={styles.radioGroup}>
                      <label className={styles.radioOption}>
                        <input
                          type="radio"
                          name={`service-${s.id}`}
                          value="yes"
                          checked={s.status === "yes"}
                          onChange={() =>
                            setServices(
                              services.map((sv) =>
                                sv.id === s.id ? { ...sv, status: "yes" } : sv
                              )
                            )
                          }
                        />
                        <FaCheck className={styles.green} />
                      </label>

                      <label className={styles.radioOption}>
                        <input
                          type="radio"
                          name={`service-${s.id}`}
                          value="neutral"
                          checked={s.status === "neutral"}
                          onChange={() =>
                            setServices(
                              services.map((sv) =>
                                sv.id === s.id
                                  ? { ...sv, status: "neutral" }
                                  : sv
                              )
                            )
                          }
                        />
                        <FaMinus className={styles.neutral} />
                      </label>

                      <label className={styles.radioOption}>
                        <input
                          type="radio"
                          name={`service-${s.id}`}
                          value="no"
                          checked={s.status === "no"}
                          onChange={() =>
                            setServices(
                              services.map((sv) =>
                                sv.id === s.id ? { ...sv, status: "no" } : sv
                              )
                            )
                          }
                        />
                        <FaXmark className={styles.red} />
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

export default ProductServices;
