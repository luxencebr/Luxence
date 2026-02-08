"use client";

import { useState } from "react";
import type { Producer } from "@/types/Producer";
import { APPEARANCE_VALUE_TYPE } from "@prisma/client";

import styles from "./ProductAppearance.module.css";
import { HiOutlinePencil } from "react-icons/hi2";
import Dropdown from "../ui/Dropdown/Dropdown";
import { dispatchProfileUpdateEvent } from "@/utils/profileUpdateEvent";

const ETHNICITY = [
  { id: 1, name: "oriental", label: "Oriental" },
  { id: 2, name: "branco", label: "Branco" },
  { id: 3, name: "moreno", label: "Morena" },
  { id: 4, name: "preto", label: "Preto" },
];

const HAIR_COLORS = [
  { id: 1, name: "branco", label: "Branco" },
  { id: 2, name: "castanho", label: "Castanho" },
  { id: 3, name: "colorido", label: "Colorido" },
  { id: 4, name: "loiro", label: "Loiro" },
  { id: 5, name: "preto", label: "Preto" },
  { id: 6, name: "ruivo", label: "Ruivo" },
];

const EYE_COLORS = [
  { id: 1, name: "azul", label: "Azul" },
  { id: 2, name: "castanho", label: "Castanho" },
  { id: 3, name: "mel", label: "Mel" },
  { id: 4, name: "preto", label: "Preto" },
  { id: 5, name: "verde", label: "Verde" },
];

const BODY_TYPE = [
  { id: 1, name: "madura", label: "Madura" },
  { id: 2, name: "magra", label: "Magra" },
  { id: 3, name: "mignon", label: "Mignon" },
  { id: 4, name: "ninfeta", label: "Ninfeta" },
  { id: 5, name: "plus_size", label: "Plus Size" },
];

const SIZES = [
  { id: 1, name: "pequeno", label: "Pequeno" },
  { id: 2, name: "médio", label: "Médio" },
  { id: 3, name: "grande", label: "Grande" },
];

const PUBIS = [
  { id: 1, name: "depilado", label: "Depilado" },
  { id: 2, name: "aparado", label: "Aparado" },
  { id: 3, name: "natural", label: "Natural" },
];

const OPTION_MAP: Record<
  string,
  { id: number; name: string; label: string }[]
> = {
  ethnicity: ETHNICITY,
  hair_color: HAIR_COLORS,
  eye_color: EYE_COLORS,
  body_type: BODY_TYPE,
  breast_size: SIZES,
  butt_size: SIZES,
  pubis: PUBIS, // Adicionado pubis ao mapa de opções
};

type AppearanceState = {
  id: number;
  label: string;
  valueType: APPEARANCE_VALUE_TYPE;
  value: boolean | number | string | null;
};

interface ProductAppearanceProps {
  producer: Producer;
  canEdit: boolean;
}

export default function ProductAppearance({
  producer,
  canEdit,
}: ProductAppearanceProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const APPEARANCE_OPTIONS = [
    {
      id: 1,
      name: "ethnicity",
      label: "Etnia",
      valueType: APPEARANCE_VALUE_TYPE.OPTION,
    },
    {
      id: 2,
      name: "hair_color",
      label: "Cor do Cabelo",
      valueType: APPEARANCE_VALUE_TYPE.OPTION,
    },
    {
      id: 3,
      name: "eye_color",
      label: "Cor dos Olhos",
      valueType: APPEARANCE_VALUE_TYPE.OPTION,
    },
    {
      id: 4,
      name: "altura",
      label: "Altura (cm)",
      valueType: APPEARANCE_VALUE_TYPE.NUMBER,
    },
    {
      id: 5,
      name: "manequim",
      label: "Manequim",
      valueType: APPEARANCE_VALUE_TYPE.NUMBER,
    },
    {
      id: 6,
      name: "pe",
      label: "Número do Pé",
      valueType: APPEARANCE_VALUE_TYPE.NUMBER,
    },
    {
      id: 7,
      name: "body_type",
      label: "Tipo de Corpo",
      valueType: APPEARANCE_VALUE_TYPE.OPTION,
    },
    {
      id: 8,
      name: "breast_size",
      label: "Tamanho do Busto",
      valueType: APPEARANCE_VALUE_TYPE.OPTION,
    },
    {
      id: 9,
      name: "butt_size",
      label: "Tamanho do Quadril",
      valueType: APPEARANCE_VALUE_TYPE.OPTION,
    },
    {
      id: 10,
      name: "tatuagens",
      label: "Tatuagens",
      valueType: APPEARANCE_VALUE_TYPE.BOOLEAN,
    },
    {
      id: 11,
      name: "piercings",
      label: "Piercings",
      valueType: APPEARANCE_VALUE_TYPE.BOOLEAN,
    },
    {
      id: 12,
      name: "pubis",
      label: "Pubis",
      valueType: APPEARANCE_VALUE_TYPE.OPTION,
    },
    {
      id: 13,
      name: "silicone_busto",
      label: "Silicone no Busto",
      valueType: APPEARANCE_VALUE_TYPE.BOOLEAN,
    },
    {
      id: 14,
      name: "silicone_quadril",
      label: "Silicone no Quadril",
      valueType: APPEARANCE_VALUE_TYPE.BOOLEAN,
    },
  ];

  // IDs que não serão renderizados separadamente (serão exibidos junto com outro campo)
  const HIDDEN_IDS = [13, 14]; // silicone_busto e silicone_quadril

  const initialStates: AppearanceState[] = APPEARANCE_OPTIONS.map((opt) => {
    const found = producer.profile.appearance?.find(
      (a) => a.option.id === opt.id
    );

    let value: AppearanceState["value"] = null;

    if (found) {
      if (opt.valueType === APPEARANCE_VALUE_TYPE.BOOLEAN)
        value = found.valueBoolean ?? null;

      if (opt.valueType === APPEARANCE_VALUE_TYPE.NUMBER)
        value = found.valueNumber ?? null;

      if (opt.valueType === APPEARANCE_VALUE_TYPE.OPTION)
        value = found.valueString ?? null;
    }

    return {
      id: opt.id,
      label: opt.label,
      valueType: opt.valueType,
      value,
    };
  });

  const [appearance, setAppearance] = useState(initialStates);
  const [originalAppearance, setOriginalAppearance] = useState(initialStates);

  const handleEdit = () => {
    setOriginalAppearance(appearance);
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (isSaving) return;

    setIsSaving(true);

    try {
      const toSave = appearance
        .filter((a) => a.value !== null)
        .map((a) => ({
          appearanceId: a.id,
          valueBoolean:
            a.valueType === APPEARANCE_VALUE_TYPE.BOOLEAN
              ? (a.value as boolean)
              : null,
          valueNumber:
            a.valueType === APPEARANCE_VALUE_TYPE.NUMBER
              ? (a.value as number)
              : null,
          valueString:
            a.valueType === APPEARANCE_VALUE_TYPE.OPTION
              ? (a.value as string)
              : null,
        }));

      const res = await fetch("/api/profile/appearance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId: producer.profile.id,
          appearance: toSave,
        }),
      });

      if (!res.ok) {
        console.error("Erro ao salvar aparência");
        return;
      }

      setIsEditing(false);
      
      // Dispara evento de atualização
      dispatchProfileUpdateEvent();
    } catch (err) {
      console.error("Erro inesperado ao salvar aparência:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setAppearance(originalAppearance);
    setIsEditing(false);
  };

  const updateAppearanceValue = (
    id: number,
    value: string | number | boolean | null
  ) => {
    setAppearance((prev) =>
      prev.map((item) => (item.id === id ? { ...item, value } : item))
    );
  };

  const getSiliconeValue = (fieldId: number) => {
    // fieldId 8 = breast_size -> silicone_busto (13)
    // fieldId 9 = butt_size -> silicone_quadril (14)
    const siliconeId = fieldId === 8 ? 13 : fieldId === 9 ? 14 : null;
    if (!siliconeId) return null;
    return appearance.find((a) => a.id === siliconeId);
  };

  const renderSiliconeCheckbox = (fieldId: number) => {
    const silicone = getSiliconeValue(fieldId);
    if (!silicone) return null;

    const label = fieldId === 8 ? "Silicone no Busto" : "Silicone no Quadril";

    if (!isEditing) {
      if (silicone.value === null) return null;
      return (
        <div className={styles.itemContent}>
          <span className={styles.label}>{label}</span>
          <span className={styles.value}>
            {silicone.value === true ? `Com Silicone` : `Sem Silicone`}
          </span>
        </div>
      );
    }

    return (
      <div className={styles.siliconeOptions}>
        <span className={styles.siliconeLabel}>{label}</span>
        <div className={styles.siliconeRadioGroup}>
          <label className={styles.siliconeRadioOpt}>
            <input
              type="radio"
              name={`silicone-${silicone.id}`}
              checked={silicone.value === true}
              onChange={() => updateAppearanceValue(silicone.id, true)}
            />
            Sim
          </label>

          <label className={styles.siliconeRadioOpt}>
            <input
              type="radio"
              name={`silicone-${silicone.id}`}
              checked={silicone.value === false}
              onChange={() => updateAppearanceValue(silicone.id, false)}
            />
            Não
          </label>
        </div>
      </div>
    );
  };

  return (
    <section className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Aparência</h2>

        {canEdit &&
          (!isEditing ? (
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
          ))}
      </div>

      {isSaving ? (
        <div className={styles.saving}>
          <span className={styles.spinner}></span>
        </div>
      ) : (
        <div className={styles.content}>
          <ul className={styles.list}>
            {appearance
              .filter((a) => !HIDDEN_IDS.includes(a.id))
              .map((a) => (
                <li key={a.id} className={styles.item}>
                  <div className={styles.itemContent}>
                    <span className={styles.label}>{a.label}</span>

                    {!isEditing ? (
                      <>
                        <span className={styles.value}>
                          {a.valueType === APPEARANCE_VALUE_TYPE.BOOLEAN &&
                            (a.value === true
                              ? "Sim"
                              : a.value === false
                              ? "Não"
                              : canEdit
                              ? "Informe e atraia mais cliques!"
                              : "Não informado")}
                          {a.valueType === APPEARANCE_VALUE_TYPE.NUMBER &&
                            (a.value !== null
                              ? a.value
                              : canEdit
                              ? "Informe e atraia mais cliques!"
                              : "Não informado")}
                          {a.valueType === APPEARANCE_VALUE_TYPE.OPTION &&
                            (() => {
                              if (!a.value) {
                                return canEdit
                                  ? "Informe e atraia mais cliques!"
                                  : "Não informado";
                              }

                              const optionName = APPEARANCE_OPTIONS.find(
                                (opt) => opt.id === a.id
                              )?.name;

                              const label = OPTION_MAP[optionName ?? ""]?.find(
                                (opt) => opt.name === a.value
                              )?.label;

                              return label ?? "—";
                            })()}
                        </span>
                      </>
                    ) : (
                      <>
                        {a.valueType === APPEARANCE_VALUE_TYPE.BOOLEAN && (
                          <div className={styles.flex}>
                            <label className={styles.radioOpt}>
                              <input
                                type="radio"
                                name={`bool-${a.id}`}
                                checked={a.value === true}
                                onChange={() =>
                                  updateAppearanceValue(a.id, true)
                                }
                              />
                              Sim
                            </label>

                            <label className={styles.radioOpt}>
                              <input
                                type="radio"
                                name={`bool-${a.id}`}
                                checked={a.value === false}
                                onChange={() =>
                                  updateAppearanceValue(a.id, false)
                                }
                              />
                              Não
                            </label>

                            <label className={styles.radioOpt}>
                              <input
                                type="radio"
                                name={`bool-${a.id}`}
                                checked={a.value === null}
                                onChange={() =>
                                  updateAppearanceValue(a.id, null)
                                }
                              />
                              N/A
                            </label>
                          </div>
                        )}

                        {a.valueType === APPEARANCE_VALUE_TYPE.NUMBER && (
                          <input
                            type="number"
                            className={styles.number}
                            value={typeof a.value === "number" ? a.value : ""}
                            onChange={(e) =>
                              updateAppearanceValue(
                                a.id,
                                e.target.value === ""
                                  ? null
                                  : Number(e.target.value)
                              )
                            }
                          />
                        )}

                        {a.valueType === APPEARANCE_VALUE_TYPE.OPTION && (
                          <Dropdown
                            trigger={
                              a.value
                                ? OPTION_MAP[
                                    APPEARANCE_OPTIONS.find(
                                      (opt) => opt.id === a.id
                                    )?.name ?? ""
                                  ]?.find((opt) => opt.name === a.value)?.label
                                : "Selecionar"
                            }
                            triggerClassName={styles.trigger}
                            menuClassName={styles.menu}
                          >
                            {OPTION_MAP[
                              APPEARANCE_OPTIONS.find((opt) => opt.id === a.id)
                                ?.name ?? ""
                            ]?.map((option) => (
                              <button
                                key={option.id}
                                type="button"
                                className={styles.dropdownItem}
                                onClick={() =>
                                  updateAppearanceValue(a.id, option.name)
                                }
                              >
                                {option.label}
                              </button>
                            ))}

                            <button
                              type="button"
                              className={styles.dropdownItem}
                              onClick={() => updateAppearanceValue(a.id, null)}
                            >
                              Não informar
                            </button>
                          </Dropdown>
                        )}
                      </>
                    )}
                  </div>
                  {(a.id === 8 || a.id === 9) &&
                    a.value !== null &&
                    renderSiliconeCheckbox(a.id)}
                </li>
              ))}
          </ul>
        </div>
      )}
    </section>
  );
}
