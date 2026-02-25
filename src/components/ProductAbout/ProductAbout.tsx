"use client";

import { useState, useRef, useEffect } from "react";

import styles from "./ProductAbout.module.css";
import { HiOutlinePencil } from "react-icons/hi";
import { Sparkles } from "lucide-react";

import type { Producer, ProducerAppearance } from "@/types/Producer";
import { dispatchProfileUpdateEvent } from "@/utils/profileUpdateEvent";

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

/**
 * Gera sugestões de biografia baseadas na aparência e nome do perfil
 * 
 * IMPORTANTE: Esta função usa o NOME DO PERFIL (producer.profile.name ou producer.name), 
 * NUNCA o nome real do usuário (user.name).
 * O nome do perfil é público, o nome real deve ser mantido em segredo.
 * 
 * @param appearance - Dados de aparência do perfil
 * @param name - Nome do PERFIL (público), não o nome real do usuário
 */
function generateBioSuggestions(
  appearance: ProducerAppearance[],
  name: string,
): string[] {
  const getAppearanceValue = (optionName: string) => {
    const item = appearance.find((a) => a.option.name === optionName);
    if (!item) return null;
    if (item.valueString) return item.valueString;
    if (item.valueNumber) return item.valueNumber;
    if (item.valueBoolean !== null) return item.valueBoolean;
    return null;
  };

  const ethnicity = getAppearanceValue("ethnicity") as string | null;
  const hairColor = getAppearanceValue("hair_color") as string | null;
  const eyeColor = getAppearanceValue("eye_color") as string | null;
  const height = getAppearanceValue("altura") as number | null;
  const bodyType = getAppearanceValue("body_type") as string | null;
  const hasTattoos = getAppearanceValue("tatuagens") as boolean | null;
  const hasPiercings = getAppearanceValue("piercings") as boolean | null;

  const heightFormatted = height ? `${(height / 100).toFixed(2)}m` : null;

  const ethnicityDesc = ethnicity ? ethnicity.toLowerCase() : null;
  const hairDesc = hairColor ? `cabelos ${hairColor.toLowerCase()}` : null;
  const eyeDesc = eyeColor ? `olhos ${eyeColor.toLowerCase()}` : null;
  const bodyDesc = bodyType ? `corpo ${bodyType.toLowerCase()}` : null;

  const extras: string[] = [];
  if (hasTattoos) extras.push("tatuagens");
  if (hasPiercings) extras.push("piercings");

  const extrasText =
    extras.length > 0
      ? `✨ Com ${extras.join(" e ")} que revelam atitude e personalidade.`
      : "";

  const suggestions: string[] = [];

  // 1. Elegante & sofisticada
  suggestions.push(
    `✨ ${name}, ${heightFormatted || "presença marcante"}, ${
      bodyDesc || "silhueta elegante"
    }. ${hairDesc || "Cabelos envolventes"} e ${
      eyeDesc || "olhar encantador"
    }. Uma companhia refinada para quem valoriza momentos especiais e conexões verdadeiras.${extrasText}`,
  );

  // 2. Sensual & confiante
  suggestions.push(
    `🔥 Prazer, sou ${name}. ${
      heightFormatted
        ? `${heightFormatted} de pura intensidade`
        : "Confiança em cada detalhe"
    }. ${bodyDesc || "Corpo que chama atenção"}, ${
      eyeDesc || "olhar provocante"
    } e uma energia que conquista sem esforço.${extrasText}`,
  );

  // 3. Misteriosa & envolvente
  suggestions.push(
    `🌙 ${name}. ${
      eyeDesc
        ? eyeDesc.charAt(0).toUpperCase() + eyeDesc.slice(1)
        : "Olhar hipnotizante"
    }, ${
      hairDesc || "cabelos que despertam curiosidade"
    } e uma presença impossível de ignorar. Descubra aos poucos…${extrasText}`,
  );

  // 4. Próxima & acolhedora
  suggestions.push(
    `💬 Oi, eu sou ${name}. Gosto de boas conversas, risadas sinceras e momentos leves. ${
      hairDesc || "Meu sorriso e minha energia"
    } tornam cada encontro especial. Vamos nos conhecer melhor? 💖`,
  );

  // 5. Experiência premium
  suggestions.push(
    `💎 ${name} — uma experiência que vai além da expectativa. ${
      heightFormatted || "Presença elegante"
    }, ${
      bodyDesc || "estilo marcante"
    } e atenção aos detalhes. Ideal para quem busca exclusividade e sofisticação.${extrasText}`,
  );

  // 6. Intensa & marcante
  suggestions.push(
    `🖤 Intensa, confiante e memorável. Sou ${name}, ${
      bodyDesc || "corpo cheio de atitude"
    }, ${
      eyeDesc || "olhar firme"
    } e uma personalidade que deixa marcas. Nem todo encontro é comum.${extrasText}`,
  );

  // 7. Leve & charmosa
  suggestions.push(
    `🌸 ${name} aqui! Delicada na medida certa, com ${
      hairDesc || "cabelos cheios de charme"
    } e uma vibe envolvente. Ideal para momentos leves, agradáveis e cheios de sintonia. ✨`,
  );

  // 8. Ousada & provocante
  suggestions.push(
    `🔥 Sou ${name}. ${heightFormatted || "Presença dominante"}, ${
      bodyDesc || "corpo provocante"
    } e uma personalidade que não passa despercebida. Se você gosta de intensidade, talvez eu seja o seu tipo.${extrasText}`,
  );

  return suggestions;
}

export default function ProductAbout({ producer, canEdit }: ProductAboutProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [backup, setBackup] = useState<{
    bio: string;
    fixed: FixedLanguages;
    others: OtherLanguage[];
  } | null>(null);

  const lastSuggestionIndexRef = useRef<number>(-1);

  // Usa o nome do perfil (producer.profile.name ou producer.name), NUNCA o nome real do usuário
  const [profileName, setProfileName] = useState(producer.profile.name || producer.name);

  // Atualiza o nome do perfil quando o producer mudar
  useEffect(() => {
    setProfileName(producer.profile.name || producer.name);
  }, [producer.profile.name, producer.name]);

  const bioSuggestions = generateBioSuggestions(
    producer.profile.appearance || [],
    profileName, // Usa o nome do perfil, não o nome real
  );

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
    lastSuggestionIndexRef.current = -1;
  };

  const handleSave = async () => {
    setIsSaving(true);

    const payload = {
      profileId: producer.profile.id,
      bio,
      languages: getAllLanguages(),
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

      setBackup(null);
      setIsEditing(false);
      lastSuggestionIndexRef.current = -1;
      
      // Dispara evento de atualização
      dispatchProfileUpdateEvent();
    } catch (err) {
      console.error("Erro ao salvar:", err);
      alert("Ocorreu um erro ao salvar as informações. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCycleSuggestion = () => {
    const nextIndex =
      (lastSuggestionIndexRef.current + 1) % bioSuggestions.length;
    lastSuggestionIndexRef.current = nextIndex;
    setBio(bioSuggestions[nextIndex]);
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
      (l) => !["Português", "Inglês", "Espanhol"].includes(l.name),
    ) || [],
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
      prev.map((item, i) => (i === index ? { ...item, name } : item)),
    );
  };

  const updateOtherLanguageLevel = (index: number, level: string) => {
    setOtherLanguages((prev) =>
      prev.map((item, i) => (i === index ? { ...item, level } : item)),
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
  const MAX_LENGTH = 480;
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
      ) : !isEditing ? (
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
                <div className={styles.bio}>
                  <p style={{ opacity: "0.75" }}>
                    Adicione uma biografia e aproxime-se de seu público!
                  </p>
                </div>
              ) : (
                <p style={{ opacity: "0.75" }}>Não há biografia</p>
              )}
            </>
          )}
        </div>
      ) : (
        <div className={styles.editArea}>
          <textarea
            className={styles.textarea}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Conte um pouco sobre você..."
            rows={5}
          />

          <button
            type="button"
            className={styles.suggestionsToggle}
            onClick={handleCycleSuggestion}
          >
            <Sparkles size={16} />
            Sugerir biografia
          </button>
        </div>
      )}
    </section>
  );
}
