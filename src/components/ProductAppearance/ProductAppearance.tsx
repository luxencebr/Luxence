import { useState } from "react";
import { Producer } from "@/types/Producer";
import { APPEARANCE_VALUE_TYPE } from "@prisma/client";

import styles from "./ProductAppearance.module.css";
import { HiOutlinePencil } from "react-icons/hi2";
import Dropdown from "../ui/Dropdown/Dropdown";

const ETHNICITY = [
  { id: 1, name: "asiatico", label: "Asiático" },
  { id: 2, name: "branco", label: "Branco" },
  { id: 3, name: "pardo", label: "Pardo" },
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
  { id: 1, name: "slim", label: "Slim" },
  { id: 2, name: "midi", label: "Midi" },
  { id: 3, name: "athletic", label: "Athletic" },
  { id: 4, name: "plus", label: "Plus" },
];

const SIZES = [
  { id: 1, name: "pequeno", label: "Pequeno" },
  { id: 2, name: "médio", label: "Médio" },
  { id: 3, name: "grande", label: "Grande" },
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
      name: "silicone",
      label: "Silicone",
      valueType: APPEARANCE_VALUE_TYPE.BOOLEAN,
    },
  ];

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
    if (isSaving) return; // evita duplicidade

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

      // sucesso → sai do modo edição
      setIsEditing(false);
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

      <div className={styles.content}>
        <ul className={styles.list}>
          {appearance.map((a) => (
            <li key={a.id} className={styles.item}>
              <span className={styles.label}>{a.label}</span>

              {!isEditing ? (
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
              ) : (
                <span className={styles.value}>
                  {a.valueType === APPEARANCE_VALUE_TYPE.BOOLEAN && (
                    <>
                      <label className={styles.radioOpt}>
                        <input
                          type="radio"
                          name={`bool-${a.id}`}
                          checked={a.value === true}
                          onChange={() => updateAppearanceValue(a.id, true)}
                        />
                        Sim
                      </label>

                      <label className={styles.radioOpt}>
                        <input
                          type="radio"
                          name={`bool-${a.id}`}
                          checked={a.value === false}
                          onChange={() => updateAppearanceValue(a.id, false)}
                        />
                        Não
                      </label>

                      <label className={styles.radioOpt}>
                        <input
                          type="radio"
                          name={`bool-${a.id}`}
                          checked={a.value === null}
                          onChange={() => updateAppearanceValue(a.id, null)}
                        />
                        N/A
                      </label>
                    </>
                  )}

                  {a.valueType === APPEARANCE_VALUE_TYPE.NUMBER && (
                    <input
                      type="number"
                      className={styles.number}
                      onChange={(e) =>
                        updateAppearanceValue(a.id, Number(e.target.value))
                      }
                    />
                  )}

                  {a.valueType === APPEARANCE_VALUE_TYPE.OPTION && (
                    <Dropdown
                      trigger={
                        a.value
                          ? OPTION_MAP[
                              APPEARANCE_OPTIONS.find((opt) => opt.id === a.id)
                                ?.name ?? ""
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
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
