"use client";

import { useState } from "react";
import styles from "./ProductFetiches.module.css";
import { FaCheck, FaXmark, FaMinus } from "react-icons/fa6";
import { HiOutlinePencil } from "react-icons/hi2";

import type { Producer } from "@/types/Producer";
import { dispatchProfileUpdateEvent } from "@/utils/profileUpdateEvent";

interface ProductFetichesProps {
  producer: Producer;
  canEdit: boolean;
}

function ProductFetiches({ producer, canEdit }: ProductFetichesProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const SERVICE_OPTIONS = [
    { id: 1, name: "acessorios", label: "Acessórios" },
    { id: 2, name: "fantasias", label: "Fantasias" },
    { id: 3, name: "podolatria", label: "Podolatria" },
    { id: 4, name: "quirofilia", label: "Quirofilia" },
    { id: 5, name: "facefuck", label: "Facefuck" },
    { id: 6, name: "voyer", label: "Voyer" },
    { id: 7, name: "bondage", label: "Bondage" },
    { id: 9, name: "dominação", label: "Dominação" },
    { id: 10, name: "submissão", label: "Submissão" },
    { id: 11, name: "sadomasoquismo", label: "Sadomasoquismo" },
    { id: 12, name: "golden_shower", label: "Golden-Shower" },
    { id: 13, name: "brown_shower", label: "Brown-Shower" },
  ];

  const initialStates = SERVICE_OPTIONS.map((opt) => {
    const found = producer.profile.fetiches?.find(
      (s) => s.option.id === opt.id
    );

    return {
      id: opt.id,
      label: opt.label,
      status: found?.status || "neutral",
    };
  });

  const [fetiches, setFetiches] = useState(initialStates);
  const [originalFetiches, setOriginalFetiches] = useState(initialStates);

  const handleEdit = () => {
    setOriginalFetiches(fetiches);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setFetiches(originalFetiches);
    setIsEditing(false);
  };

  async function handleSave() {
    if (isSaving) return; // evita requisições duplicadas

    setIsSaving(true);

    try {
      const toSave = fetiches.map((s) => ({
        serviceId: s.id,
        status: s.status,
      }));

      const res = await fetch("/api/profile/fetiches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId: producer.profile.id,
          fetiches: toSave,
        }),
      });

      if (!res.ok) {
        console.error("Erro ao salvar serviços");
        return;
      }

      // Se tudo OK, sai do modo edição
      setIsEditing(false);
      
      // Dispara evento de atualização
      dispatchProfileUpdateEvent();
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
          <h2>Fetiches</h2>

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
                {fetiches.map((s) => (
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
                {fetiches.map((s) => (
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
                            setFetiches(
                              fetiches.map((sv) =>
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
                            setFetiches(
                              fetiches.map((sv) =>
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
                            setFetiches(
                              fetiches.map((sv) =>
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

export default ProductFetiches;
