"use client";

import { useState } from "react";

import styles from "./ProductAbout.module.css";
import { HiOutlinePencil } from "react-icons/hi";

import type { Producer } from "@/types/Producer";
import Dropdown from "@/components/ui/Dropdown/Dropdown";

import {
  Languages,
  User,
  Ruler,
  Eye,
  Palette,
  Trash,
  Plus,
  Book,
} from "lucide-react";

interface ProductAboutProps {
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

export default function ProductAbout({ producer, canEdit }: ProductAboutProps) {
  const [isEditing, setIsEditing] = useState(false);

  const [backup, setBackup] = useState<{
    bio: string;
    fixed: FixedLanguages;
    others: OtherLanguage[];
  } | null>(null);

  const handleEdit = () => {
    setBackup({
      bio,
      fixed: fixedLanguages,
      others: otherLanguages,
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (backup) {
      setBio(backup.bio);
      setFixedLanguages(backup.fixed);
      setOtherLanguages(backup.others);
    }
    setIsEditing(false);
  };

  const handleSave = async () => {
    const payload = {
      profileId: producer.profile.id, // <- agora enviamos o ID correto
      bio,
      languages: getAllLanguages(), // retorna array [{ name, level }]
    };

    try {
      const res = await fetch("/api/profile/about", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Erro ao salvar dados");
      }

      // tudo certo
      setBackup(null);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar.");
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

  const [bio, setBio] = useState(producer.profile.description || "");
  const [expanded, setExpanded] = useState(false);
  const MAX_LENGTH = 244;
  const previewText =
    bio && bio.length > MAX_LENGTH ? bio.slice(0, MAX_LENGTH) + "..." : bio;

  function renderParagraphs(text: string) {
    return text
      .split(/\n+/)
      .filter(Boolean)
      .map((p, i) => <p key={i}>{p}</p>);
  }

  return (
    <section className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Sobre Mim</h2>

        {canEdit ? (
          !isEditing ? (
            <button className={styles.editBtn} onClick={handleEdit}>
              Editar <HiOutlinePencil />
            </button>
          ) : (
            <div className={styles.editActions}>
              <button className={styles.saveBtn} onClick={handleSave}>
                Salvar
              </button>
              <button className={styles.cancelBtn} onClick={handleCancel}>
                Cancelar
              </button>
            </div>
          )
        ) : null}
      </div>

      <div className={styles.grid}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <Book className={styles.icon} />
            <h3 className={styles.cardTitle}>Biografia</h3>
          </div>

          {!isEditing ? (
            <div className={styles.bioContainer}>
              {bio ? (
                <>
                  {expanded ? (
                    <div className={styles.bio}>{renderParagraphs(bio)}</div>
                  ) : (
                    <div className={styles.bio}>
                      {renderParagraphs(previewText)}
                    </div>
                  )}

                  {bio.length > MAX_LENGTH && (
                    <button
                      className={styles.readMoreButton}
                      onClick={() => setExpanded(!expanded)}
                    >
                      {expanded ? "Ler menos" : "Ler mais"}
                    </button>
                  )}
                </>
              ) : (
                <>
                  {canEdit ? (
                    <p>Adicione uma biografia e aproxime-se de seu público!</p>
                  ) : (
                    <p style={{ opacity: "0.5" }}>Não há biografia</p>
                  )}
                </>
              )}
            </div>
          ) : (
            <textarea
              className={styles.textarea}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Conte um pouco sobre você..."
              rows={5}
            />
          )}
        </div>

        <div className={styles.card}>
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
                    <div key={`other-${index}`} className={styles.languageItem}>
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
                  <div className={styles.langOpts}>
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
                  <div className={styles.langOpts}>
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
                  <div className={styles.langOpts}>
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
                    <div className={styles.langOpts}>
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
                            onClick={() => updateOtherLanguageLevel(index, lvl)}
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
    </section>
  );
}
