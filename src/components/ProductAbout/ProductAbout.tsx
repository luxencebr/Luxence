"use client";

import { useState } from "react";

import styles from "./ProductAbout.module.css";
import { HiOutlinePencil } from "react-icons/hi";

import type { Producer } from "@/types/Producer";
import Dropdown from "../ui/Dropdown/Dropdown";

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

export default function ProductAbout({ producer, canEdit }: ProductAboutProps) {
  const [isEditing, setIsEditing] = useState(false);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSave = async () => {
    setIsEditing(false);
  };

  const initialLanguages = producer.profile.languages || [];

  const [languagesState, setLanguagesState] =
    useState<{ name: string; level: string }[]>(initialLanguages);

  const languages = [
    "Alemão",
    "Coreano",
    "Espanhol",
    "Inglês",
    "Italiano",
    "Japonês",
    "Francês",
    "Mandarim",
    "Português",
    "Russo",
  ];

  const languagesLevels = [
    "Não Falo",
    "Básico",
    "Avançado",
    "Fluente",
    "Nativo",
  ];

  const addLanguage = () => {
    const last = languagesState[languagesState.length - 1];

    if (last && !last.name && !last.level) {
      return;
    }

    setLanguagesState((prev) => [...prev, { name: "", level: "" }]);
  };

  const removeLanguage = (index: number) => {
    setLanguagesState((prev) => prev.filter((_, i) => i !== index));
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
              {expanded ? (
                <div className={styles.bio}>{renderParagraphs(bio)}</div>
              ) : (
                <div className={styles.bio}>
                  {renderParagraphs(previewText)}
                </div>
              )}

              {bio && bio.length > MAX_LENGTH && (
                <button
                  className={styles.readMoreButton}
                  onClick={() => setExpanded(!expanded)}
                >
                  {expanded ? "Ler menos" : "Ler mais"}
                </button>
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

          {/* LISTA DE IDIOMAS */}
          <div className={styles.languagesList}>
            {languagesState.length === 0 && (
              <p className={styles.emptyText}>Nenhum idioma adicionado.</p>
            )}

            {languagesState.map((lang, index) => (
              <div key={index} className={styles.languageItem}>
                {isEditing ? (
                  <>
                    <div className={styles.langOpts}>
                      <Dropdown
                        trigger={lang.name || "Idioma"}
                        triggerClassName={styles.trigger}
                        menuClassName={styles.menu}
                      >
                        {languages.map((l) => (
                          <button
                            key={l}
                            className={styles.option}
                            onClick={() =>
                              setLanguagesState((prev) =>
                                prev.map((item, i) =>
                                  i === index ? { ...item, name: l } : item
                                )
                              )
                            }
                          >
                            {l}
                          </button>
                        ))}
                      </Dropdown>

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
                              setLanguagesState((prev) =>
                                prev.map((item, i) =>
                                  i === index ? { ...item, level: lvl } : item
                                )
                              )
                            }
                          >
                            {lvl}
                          </button>
                        ))}
                      </Dropdown>
                    </div>

                    <button
                      className={`${styles.btn} ${styles.delete}`}
                      onClick={() => removeLanguage(index)}
                    >
                      <Trash size={16} />
                    </button>
                  </>
                ) : (
                  <>
                    <div className={styles.langDisplay}>
                      <span className={styles.language}>{lang.name}</span>
                      <span className={styles.level}>{lang.level}</span>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* ADICIONAR NOVO IDIOMA */}
          {isEditing && (
            <button className={styles.addBtn} onClick={addLanguage}>
              <Plus size={16} /> Adicionar
            </button>
          )}
        </div>

        <div className={`${styles.card} ${styles.cardWide}`}>
          <div className={styles.cardHeader}>
            <User className={styles.icon} />
            <h3 className={styles.cardTitle}>Características Físicas</h3>
          </div>
          <div className={styles.characteristicsGrid}>
            <div className={styles.characteristicItem}>
              <Ruler className={styles.smallIcon} />
              <div>
                <span className={styles.characteristicLabel}>Altura</span>
              </div>
            </div>
            <div className={styles.characteristicItem}>
              <User className={styles.smallIcon} />
              <div>
                <span className={styles.characteristicLabel}>Peso</span>
              </div>
            </div>
            <div className={styles.characteristicItem}>
              <Eye className={styles.smallIcon} />
              <div>
                <span className={styles.characteristicLabel}>Olhos</span>
              </div>
            </div>
            <div className={styles.characteristicItem}>
              <Palette className={styles.smallIcon} />
              <div>
                <span className={styles.characteristicLabel}>Cabelo</span>
              </div>
            </div>
            <div className={styles.characteristicItem}>
              <User className={styles.smallIcon} />
              <div>
                <span className={styles.characteristicLabel}>Biotipo</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
