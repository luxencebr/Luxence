"use client";

import { useState } from "react";
import type { Producer } from "@/types/Producer";

import styles from "./ProductAudience.module.css";
import { Group, Languages, Plus, Trash } from "lucide-react";
import Dropdown from "../ui/Dropdown/Dropdown";
import { HiOutlinePencil } from "react-icons/hi2";
import { BsPeople } from "react-icons/bs";
import { FaCheck, FaMinus, FaXmark } from "react-icons/fa6";
import { dispatchProfileUpdateEvent } from "@/utils/profileUpdateEvent";

interface ProductAudienceProps {
  producer: Producer;
  canEdit: boolean;
}

interface FixedLanguages {
  portugues: string;
  ingles: string;
  espanhol: string;
}

interface OtherLanguage {
  name: string;
  level: string;
}

function ProductAudience({ producer, canEdit }: ProductAudienceProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [backup, setBackup] = useState<{
    fixed: FixedLanguages;
    others: OtherLanguage[];
  } | null>(null);

  const AUDIENCE_OPTIONS = [
    { id: 1, name: "men", label: "Homens" },
    { id: 2, name: "women", label: "Mulheres" },
    { id: 3, name: "trans", label: "Trans" },
    { id: 4, name: "couple", label: "Casal" },
    { id: 5, name: "group", label: "Grupo" },
  ];

  const initialStates = AUDIENCE_OPTIONS.map((opt) => {
    const found = producer.profile.audience?.find(
      (a) => a.option.id === opt.id
    );

    return {
      id: opt.id,
      label: opt.label,
      status: found?.status || "neutral",
    };
  });

  const [audience, setAudience] = useState(initialStates);
  const [originalAudience, setOriginalAudience] = useState(initialStates);

  const handleEdit = () => {
    setBackup({
      fixed: fixedLanguages,
      others: otherLanguages,
    });

    setOriginalAudience(audience); // 🆕
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (backup) {
      setFixedLanguages(backup.fixed);
      setOtherLanguages(backup.others);
    }

    setAudience(originalAudience); // 🆕
    setIsEditing(false);
  };

  const handleSave = async () => {
    // Validação: pelo menos um público deve estar com status "yes"
    const hasAtLeastOneYes = audience.some((a) => a.status === "yes");
    
    if (!hasAtLeastOneYes) {
      alert("Você precisa selecionar pelo menos um tipo de público que atende.");
      return;
    }

    setIsSaving(true);

    const payload = {
      profileId: producer.profile.id,
      languages: getAllLanguages(),
      audience: audience.map((a) => ({
        audienceId: a.id,
        status: a.status,
      })),
    };

    try {
      const res = await fetch("/api/profile/audience", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Erro ao salvar dados");
      }

      setBackup(null);
      setIsEditing(false);
      
      // Dispara evento de atualização
      dispatchProfileUpdateEvent();
    } catch (err) {
      console.error("Erro ao salvar:", err);
      alert("Ocorreu um erro ao salvar as informações.");
    } finally {
      setIsSaving(false);
    }
  };

  const [fixedLanguages, setFixedLanguages] = useState<FixedLanguages>({
    portugues:
      producer.profile.languages?.find((l) => l.name === "Português")?.level ||
      "",
    ingles:
      producer.profile.languages?.find((l) => l.name === "Inglês")?.level || "",
    espanhol:
      producer.profile.languages?.find((l) => l.name === "Espanhol")?.level ||
      "",
  });

  const [otherLanguages, setOtherLanguages] = useState<OtherLanguage[]>(
    producer.profile.languages?.filter(
      (l) => !["Português", "Inglês", "Espanhol"].includes(l.name)
    ) || []
  );

  const languagesLevels = ["Básico", "Avançado", "Fluente", "Nativo"];

  const addOtherLanguage = () => {
    const last = otherLanguages[otherLanguages.length - 1];
    if (last && !last.name && !last.level) {
      return;
    }
    setOtherLanguages((prev) => [...prev, { name: "", level: "" }]);
  };

  const removeOtherLanguage = (index: number) => {
    setOtherLanguages((prev) => prev.filter((_, i) => i !== index));
  };

  const updateOtherLanguageName = (index: number, name: string) => {
    setOtherLanguages((prev) =>
      prev.map((item, i) => (i === index ? { ...item, name } : item))
    );
  };

  const updateOtherLanguageLevel = (index: number, level: string) => {
    setOtherLanguages((prev) =>
      prev.map((item, i) => (i === index ? { ...item, level } : item))
    );
  };

  const getAllLanguages = () => {
    const all: { name: string; level: string }[] = [];
    if (fixedLanguages.portugues)
      all.push({ name: "Português", level: fixedLanguages.portugues });
    if (fixedLanguages.ingles)
      all.push({ name: "Inglês", level: fixedLanguages.ingles });
    if (fixedLanguages.espanhol)
      all.push({ name: "Espanhol", level: fixedLanguages.espanhol });
    otherLanguages.forEach((l) => {
      if (l.name && l.level) all.push(l);
    });
    return all;
  };

  return (
    <section id="audience" className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Audiência</h2>

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
        <div className={styles.grid}>
          <div className={styles.card} data-field="producer-audience">
            <div className={styles.cardHeader}>
              <BsPeople className={styles.icon} />
              <h3 className={styles.cardTitle}>Público</h3>
            </div>

            {/* VISUALIZAÇÃO */}
            {!isEditing && (
              <ul className={styles.audienceList}>
                {audience.map((a) => (
                  <li className={styles.audienceItem} key={a.id}>
                    <div className={styles.audienceDisplay}>
                      <span>{a.label}</span>

                      {a.status === "yes" && (
                        <i className={`${styles.green} ${styles.status}`}>
                          <FaCheck />
                        </i>
                      )}

                      {a.status === "no" && (
                        <i className={`${styles.red} ${styles.status}`}>
                          <FaXmark />
                        </i>
                      )}

                      {a.status === "neutral" && (
                        <i className={`${styles.neutral} ${styles.status}`}>
                          <FaMinus />
                        </i>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {/* EDIÇÃO */}
            {isEditing && (
              <div className={styles.audienceList}>
                {audience.map((a) => (
                  <div key={a.id} className={styles.audienceItem}>
                    <div className={styles.audienceDisplay}>
                      <span className={styles.label}>{a.label}</span>

                      <div className={styles.radioGroup}>
                        <label className={styles.radioOption}>
                          <input
                            type="radio"
                            name={`audience-${a.id}`}
                            value="yes"
                            checked={a.status === "yes"}
                            onChange={() =>
                              setAudience(
                                audience.map((au) =>
                                  au.id === a.id ? { ...au, status: "yes" } : au
                                )
                              )
                            }
                          />
                          <FaCheck className={styles.green} />
                        </label>

                        <label className={styles.radioOption}>
                          <input
                            type="radio"
                            name={`audience-${a.id}`}
                            value="neutral"
                            checked={a.status === "neutral"}
                            onChange={() =>
                              setAudience(
                                audience.map((au) =>
                                  au.id === a.id
                                    ? { ...au, status: "neutral" }
                                    : au
                                )
                              )
                            }
                          />
                          <FaMinus className={styles.neutral} />
                        </label>

                        <label className={styles.radioOption}>
                          <input
                            type="radio"
                            name={`audience-${a.id}`}
                            value="no"
                            checked={a.status === "no"}
                            onChange={() =>
                              setAudience(
                                audience.map((au) =>
                                  au.id === a.id ? { ...au, status: "no" } : au
                                )
                              )
                            }
                          />
                          <FaXmark className={styles.red} />
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={styles.card} data-field="producer-languages">
            <div className={styles.cardHeader}>
              <Languages className={styles.icon} />
              <h3 className={styles.cardTitle}>Idiomas</h3>
            </div>

            {!isEditing ? (
              <div className={styles.languagesList}>
                {/* LISTAGEM QUANDO NÃO ESTÁ EDITANDO */}
                <div className={styles.languagesList}>
                  {/* Idiomas fixos */}
                  {[
                    { label: "Português", value: fixedLanguages.portugues },
                    { label: "Inglês", value: fixedLanguages.ingles },
                    { label: "Espanhol", value: fixedLanguages.espanhol },
                  ].map((lang, index) => (
                    <div
                      key={index}
                      className={`${styles.languageItem} ${
                        !lang.value ? styles.notSpeaking : ""
                      }`}
                    >
                      {" "}
                      <div className={styles.langDisplay}>
                        <span className={styles.language}>{lang.label}</span>
                        <span className={styles.level}>
                          {lang.value || "Não falo"}
                        </span>
                      </div>
                    </div>
                  ))}

                  {/* Outros idiomas */}
                  {otherLanguages.length > 0 &&
                    otherLanguages.map((lang, index) => (
                      <div
                        key={`other-${index}`}
                        className={styles.languageItem}
                      >
                        <div className={styles.langDisplay}>
                          <span className={styles.language}>{lang.name}</span>
                          <span className={styles.level}>{lang.level}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ) : (
              <>
                <div className={styles.languagesList}>
                  {/* Português */}
                  <div className={styles.languageItem}>
                    <div className={styles.langDisplay}>
                      <span
                        className={`${styles.fixedLangName} ${
                          !fixedLanguages.portugues ? styles.notSpeaking : ""
                        }`}
                      >
                        Português
                      </span>
                      <span>
                        <Dropdown
                          trigger={fixedLanguages.portugues || "Não Falo"}
                          triggerClassName={`${styles.trigger} ${
                            !fixedLanguages.portugues ? styles.notSpeaking : ""
                          }`}
                          menuClassName={styles.menu}
                        >
                          {languagesLevels.map((lvl) => (
                            <button
                              key={lvl}
                              className={styles.option}
                              onClick={() =>
                                setFixedLanguages((prev) => ({
                                  ...prev,
                                  portugues: lvl,
                                }))
                              }
                            >
                              {lvl}
                            </button>
                          ))}
                        </Dropdown>
                      </span>
                    </div>
                  </div>

                  {/* Inglês */}
                  <div className={styles.languageItem}>
                    <div className={styles.langDisplay}>
                      <span
                        className={`${styles.fixedLangName} ${
                          !fixedLanguages.portugues ? styles.notSpeaking : ""
                        }`}
                      >
                        Inglês
                      </span>
                      <span>
                        <Dropdown
                          trigger={fixedLanguages.ingles || "Não Falo"}
                          triggerClassName={`${styles.trigger} ${
                            !fixedLanguages.ingles ? styles.notSpeaking : ""
                          }`}
                          menuClassName={styles.menu}
                        >
                          {languagesLevels.map((lvl) => (
                            <button
                              key={lvl}
                              className={styles.option}
                              onClick={() =>
                                setFixedLanguages((prev) => ({
                                  ...prev,
                                  ingles: lvl,
                                }))
                              }
                            >
                              {lvl}
                            </button>
                          ))}
                        </Dropdown>
                      </span>
                    </div>
                  </div>

                  {/* Espanhol */}
                  <div className={styles.languageItem}>
                    <div className={styles.langDisplay}>
                      <span
                        className={`${styles.fixedLangName} ${
                          !fixedLanguages.portugues ? styles.notSpeaking : ""
                        }`}
                      >
                        Espanhol
                      </span>
                      <span>
                        <Dropdown
                          trigger={fixedLanguages.espanhol || "Não Falo"}
                          triggerClassName={`${styles.trigger} ${
                            !fixedLanguages.espanhol ? styles.notSpeaking : ""
                          }`}
                          menuClassName={styles.menu}
                        >
                          {languagesLevels.map((lvl) => (
                            <button
                              key={lvl}
                              className={styles.option}
                              onClick={() =>
                                setFixedLanguages((prev) => ({
                                  ...prev,
                                  espanhol: lvl,
                                }))
                              }
                            >
                              {lvl}
                            </button>
                          ))}
                        </Dropdown>
                      </span>
                    </div>
                  </div>

                  {otherLanguages.map((lang, index) => (
                    <div key={index} className={styles.languageItem}>
                      <div className={styles.langDisplay}>
                        <input
                          type="text"
                          className={styles.langInput}
                          placeholder="Outro idioma"
                          value={lang.name}
                          onChange={(e) =>
                            updateOtherLanguageName(index, e.target.value)
                          }
                        />
                        <Dropdown
                          trigger={lang.level || "Nível"}
                          triggerClassName={styles.trigger}
                          menuClassName={styles.menu}
                        >
                          {languagesLevels.map((lvl) => (
                            <button
                              key={lvl}
                              className={styles.option}
                              onClick={() =>
                                updateOtherLanguageLevel(index, lvl)
                              }
                            >
                              {lvl}
                            </button>
                          ))}
                        </Dropdown>
                      </div>
                      <button
                        className={`${styles.btn} ${styles.delete}`}
                        onClick={() => removeOtherLanguage(index)}
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* ADICIONAR OUTRO IDIOMA */}
                <button className={styles.addBtn} onClick={addOtherLanguage}>
                  <Plus size={16} /> Adicionar outro idioma
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

export default ProductAudience;
