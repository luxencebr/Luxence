"use client";

import type React from "react";

import { useRef, useState, useEffect } from "react";
import styles from "./ProductInfo.module.css";
import { IoCheckmark, IoClose } from "react-icons/io5";

import { TbCoinFilled } from "react-icons/tb";
import { HiLocationMarker } from "react-icons/hi";
import { TbHomeCheck, TbHomeX } from "react-icons/tb";
import { FaHeart } from "react-icons/fa6";
import { IoIosArrowDown } from "react-icons/io";
import { FaEye } from "react-icons/fa";

import { FaWhatsapp, FaInstagram, FaTelegram } from "react-icons/fa6";
import { GoShieldCheck, GoShield, GoShieldX } from "react-icons/go";
import { HiOutlinePencil } from "react-icons/hi2";

import type { Producer } from "@/types/Producer";
import ScrollTo from "@/utils/ScrollTo";
import Popup from "../ui/Popup/Popup";
import { dispatchProfileUpdateEvent } from "@/utils/profileUpdateEvent";

const formatWhatsAppNumber = (phone: string) => {
  const onlyNumbers = phone.replace(/\D/g, "");

  if (onlyNumbers.startsWith("55")) {
    return onlyNumbers;
  }

  return `55${onlyNumbers}`;
};

const DEFAULT_SLOGANS = [
  "Momentos únicos com discrição e sofisticação. 💕",
  "Seu desejo, no tempo certo e com muita intensidade. 🌪️",
  "Uma experiência para sair da rotina. 🔥",
  "Sedução que começa no olhar. 🔥",
  "Companhia para momentos especiais. 💝",
  "Qualidade, respeito e prazer. ✨",
  "Mais que companhia, uma experiência envolvente.",
  "Discrição e prazer. 💕",
  "Sofisticação em cada detalhe. ✨",
  "Experiência inesquecível.",
  "Prazer sem pressa, do jeito que você imagina.",
  "Safadeza na medida certa pra te tirar do controle. 🫦",
  "Não sou promessa, sou experiência. 💥",
  "Seu segredo mais gostoso. 🫦",
  "Intensa, quente e inesquecível. 🔥",
  "Realizo fantasias sem julgamentos. 😈",
  "Onde o desejo fala mais alto. 🔥",
  "Vício bom. 🫦",
  "Sem limites. ❤️‍🔥",
];

interface ProductInfoProps {
  producer: Producer;
  canEdit: boolean;
}

function ProductInfo({ producer, canEdit }: ProductInfoProps) {
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [atBottom, setAtBottom] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const [name, setName] = useState(producer.profile.name || producer.name);
  const [originalName, setOriginalName] = useState(producer.profile.name || producer.name);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isSavingName, setIsSavingName] = useState(false);
  const nameInputRef = useRef<HTMLInputElement | null>(null);

  const [age, setAge] = useState(producer.profile.age?.toString() || "");
  const [originalAge, setOriginalAge] = useState(producer.profile.age?.toString() || "");
  const [isEditingAge, setIsEditingAge] = useState(false);
  const [isSavingAge, setIsSavingAge] = useState(false);
  const [ageError, setAgeError] = useState<string | null>(null);
  const ageInputRef = useRef<HTMLInputElement | null>(null);

  type ContactKey = "whatsapp" | "telegram" | "instagram";
  const [editingContact, setEditingContact] = useState<
    keyof typeof CONTACT_CONFIG | null
  >(null);
  const [contactValue, setContactValue] = useState("");
  const [contacts, setContacts] = useState(producer.profile.contacts || []);
  const [isSaving, setIsSaving] = useState(false);

  const [slogan, setSlogan] = useState(producer.profile.slogan || "");
  const [isEditingSlogan, setIsEditingSlogan] = useState(false);
  const [originalSlogan, setOriginalSlogan] = useState(slogan);
  const [isSavingSlogan, setIsSavingSlogan] = useState(false);
  const sloganInputRef = useRef<HTMLInputElement | null>(null);
  const [fallbackSlogan] = useState(() => {
    const index = Math.floor(Math.random() * DEFAULT_SLOGANS.length);
    return DEFAULT_SLOGANS[index];
  });
  const hasCustomSlogan = Boolean(producer.profile.slogan);
  const displayedSlogan = hasCustomSlogan ? slogan : fallbackSlogan;

  // Estado local para dados que podem ser atualizados
  const [localProducer, setLocalProducer] = useState(producer);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    // Atualiza dados locais quando o producer prop mudar
    setLocalProducer(producer);
    setName(producer.profile.name || producer.name);
    setOriginalName(producer.profile.name || producer.name);
    setAge(producer.profile.age?.toString() || "");
    setOriginalAge(producer.profile.age?.toString() || "");
    setContacts(producer.profile.contacts || []);
  }, [producer]);

  useEffect(() => {
    const el = contentRef.current;
    if (!el || isMobile) return;

    const handleScroll = () => {
      const halfway = el.clientHeight / 2;
      setAtBottom(el.scrollTop > halfway);
    };

    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, [isMobile]);

  useEffect(() => {
    if (isEditingName) {
      nameInputRef.current?.focus();
    }
  }, [isEditingName]);

  useEffect(() => {
    if (isEditingAge) {
      ageInputRef.current?.focus();
    }
  }, [isEditingAge]);

  useEffect(() => {
    if (isEditingSlogan) {
      sloganInputRef.current?.focus();
    }
  }, [isEditingSlogan]);

  const handleEditName = () => {
    setOriginalName(name);
    setIsEditingName(true);
  };

  const handleCancelName = () => {
    setName(originalName);
    setIsEditingName(false);
  };

  const handleSaveName = async () => {
    try {
      setIsSavingName(true);

      const res = await fetch("/api/profile/showcase/name", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId: producer.profile.id,
          name,
        }),
      });

      if (!res.ok) throw new Error();

      setOriginalName(name);
      setIsEditingName(false);
      
      // Dispara evento de atualização
      dispatchProfileUpdateEvent();
    } catch {
      setName(originalName);
    } finally {
      setIsSavingName(false);
    }
  };

  const handleEditAge = () => {
    setOriginalAge(age);
    setAgeError(null);
    setIsEditingAge(true);
  };

  const handleCancelAge = () => {
    setAge(originalAge);
    setAgeError(null);
    setIsEditingAge(false);
  };

  const handleSaveAge = async () => {
    try {
      // Valida antes de salvar
      if (age) {
        const numValue = parseInt(age);
        if (isNaN(numValue)) {
          setAgeError("Digite um número válido");
          return;
        }
        if (numValue < 18) {
          setAgeError("Idade mínima: 18 anos");
          return;
        }
        if (numValue > 99) {
          setAgeError("Idade máxima: 99 anos");
          return;
        }
      }

      setAgeError(null);
      setIsSavingAge(true);

      const res = await fetch("/api/profile/showcase/age", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId: producer.profile.id,
          age: age ? parseInt(age) : null,
        }),
      });

      if (!res.ok) throw new Error();

      setOriginalAge(age);
      setIsEditingAge(false);
      
      // Dispara evento de atualização
      dispatchProfileUpdateEvent();
    } catch {
      setAge(originalAge);
      setAgeError("Erro ao salvar. Tente novamente.");
    } finally {
      setIsSavingAge(false);
    }
  };

  const handleEditSlogan = () => {
    setOriginalSlogan(slogan);
    setIsEditingSlogan(true);
  };

  const handleCancelSlogan = () => {
    setSlogan(originalSlogan);
    setIsEditingSlogan(false);
  };

  const handleSaveSlogan = async () => {
    try {
      setIsSavingSlogan(true);

      const response = await fetch("/api/profile/showcase/slogan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId: producer.profile.id,
          slogan,
        }),
      });

      if (response.ok) {
        setOriginalSlogan(slogan);
        setIsEditingSlogan(false);
        
        // Dispara evento de atualização
        dispatchProfileUpdateEvent();
      } else {
        console.error("Erro ao salvar slogan");
        setSlogan(originalSlogan);
      }
    } catch (error) {
      console.error("Erro ao salvar slogan:", error);
      setSlogan(originalSlogan);
    } finally {
      setIsSavingSlogan(false);
    }
  };

  async function updateContact({
    contactId,
    value,
  }: {
    contactId: number;
    value: string;
  }) {
    const res = await fetch("/api/profile/showcase/contact", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contactId, value }),
    });

    if (!res.ok) {
      throw new Error("Erro ao salvar contato");
    }
    
    // Dispara evento de atualização
    dispatchProfileUpdateEvent();
  }

  const reviews = localProducer.profile.reviews || [];
  const approvedReviews = reviews.filter((review) => review.isApproved);
  const hasReviews = approvedReviews.length > 0;

  const rating = hasReviews
    ? approvedReviews.reduce((acc, review) => acc + review.rating, 0) /
      approvedReviews.length
    : 0;

  const price = localProducer.profile.prices?.[0];

  const whatsappMsg = encodeURIComponent(
    "Olá! Vi seu perfil na Luxence!\n\nFiquei interessado em seus serviços. Vamos conversar?",
  );

  const CONTACT_CONFIG: Record<
    ContactKey,
    {
      icon: React.ElementType;
      className: string;
      getHref: (...args: any[]) => string;
    }
  > = {
    whatsapp: {
      icon: FaWhatsapp,
      className: styles.whatsapp,
      getHref: (value: string) =>
        `https://wa.me/${formatWhatsAppNumber(value)}?text=${whatsappMsg}`,
    },
    telegram: {
      icon: FaTelegram,
      className: styles.telegram,
      getHref: (value: string) => `https://t.me/${value}`,
    },
    instagram: {
      icon: FaInstagram,
      className: styles.instagram,
      getHref: (value: string) => `https://www.instagram.com/${value}`,
    },
  } as const;

  return (
    <div className={styles.productInfos}>
      <div className={styles.layout} ref={contentRef}>
        <div className={styles.productHeader}>
          <div className={styles.productHighlight}>
            <div className={styles.nameAndViews}>
              <p className={styles.nameAgeContainer}>
                <span className={`${styles.editable} ${styles.nameSpan}`} data-field="producer-name">
                  {isEditingName ? (
                    <span className={styles.editableEdit}>
                      <input
                        ref={nameInputRef}
                        className={styles.editableInput}
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={isSavingName}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            !isSavingName && handleSaveName();
                          }
                          if (e.key === "Escape") {
                            e.preventDefault();
                            handleCancelName();
                          }
                        }}
                      />

                      {isSavingName ? (
                        <div className={styles.loader} />
                      ) : (
                        <span className={styles.editActions}>
                          <button
                            type="button"
                            className={styles.editableSave}
                            onClick={handleSaveName}
                            disabled={isSavingName}
                            title="Salvar"
                          >
                            <IoCheckmark />
                          </button>

                          <button
                            type="button"
                            className={styles.editableCancel}
                            onClick={handleCancelName}
                            title="Cancelar"
                          >
                            <IoClose />
                          </button>
                        </span>
                      )}
                    </span>
                  ) : (
                    <span
                      className={styles.editableValue}
                      onClick={canEdit ? handleEditName : undefined}
                    >
                      {name || "Adicionar Nome"}
                      {canEdit && <HiOutlinePencil className={styles.editIcon} />}
                    </span>
                  )}
                </span>
                {(age || canEdit) && (
                  <>
                    <span className={styles.separator}>, </span>
                    <span className={`${styles.editable} ${styles.ageSpan}`} data-field="producer-age">
                      {isEditingAge ? (
                        <span className={styles.editableEdit}>
                          <div className={styles.ageInputWrapper}>
                            <input
                              ref={ageInputRef}
                              className={`${styles.editableInput} ${ageError ? styles.inputError : ''}`}
                              type="number"
                              value={age}
                              onChange={(e) => {
                                const value = e.target.value;
                                // Limita a 2 caracteres
                                if (value.length <= 2) {
                                  setAge(value);
                                  setAgeError(null);
                                }
                              }}
                              disabled={isSavingAge}
                              placeholder="18"
                              min="18"
                              max="99"
                              maxLength={2}
                              onBlur={(e) => {
                                // Valida ao sair do campo
                                const numValue = parseInt(e.target.value);
                                if (e.target.value) {
                                  if (isNaN(numValue)) {
                                    setAgeError("Número inválido");
                                  } else if (numValue < 18) {
                                    setAgeError("Mínimo: 18 anos");
                                  } else if (numValue > 99) {
                                    setAgeError("Máximo: 99 anos");
                                  }
                                }
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  !isSavingAge && handleSaveAge();
                                }
                                if (e.key === "Escape") {
                                  e.preventDefault();
                                  handleCancelAge();
                                }
                              }}
                            />
                            {ageError && (
                              <span className={styles.errorMessage}>{ageError}</span>
                            )}
                          </div>

                          {isSavingAge ? (
                            <div className={styles.loader} />
                          ) : (
                            <span className={styles.editActions}>
                              <button
                                type="button"
                                className={styles.editableSave}
                                onClick={handleSaveAge}
                                disabled={isSavingAge}
                                title="Salvar"
                              >
                                <IoCheckmark />
                              </button>

                              <button
                                type="button"
                                className={styles.editableCancel}
                                onClick={handleCancelAge}
                                title="Cancelar"
                              >
                                <IoClose />
                              </button>
                            </span>
                          )}
                        </span>
                      ) : (
                        <span
                          className={styles.editableValue}
                          onClick={canEdit ? handleEditAge : undefined}
                        >
                          {age || (canEdit ? "Adicionar Idade" : "")}
                          {canEdit && <HiOutlinePencil className={styles.editIcon} />}
                        </span>
                      )}
                    </span>
                  </>
                )}
              </p>
              
              <div className={styles.weeklyViews}>
                <FaEye />
                <strong>{localProducer.profile.views}</strong>
                <span className={styles.label}>visualizações</span>
              </div>
            </div>

            <div
              className={`${styles.editable} ${styles.slogan} ${!hasCustomSlogan ? styles.isSuggestion : ""}`}
            >
              {isEditingSlogan ? (
                <div className={styles.editableEdit}>
                  <input
                    ref={sloganInputRef}
                    className={styles.editableInput}
                    type="text"
                    value={slogan}
                    onChange={(e) => setSlogan(e.target.value)}
                    placeholder="Digite seu slogan..."
                    disabled={isSavingSlogan}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        !isSavingSlogan && handleSaveSlogan();
                      }
                      if (e.key === "Escape") {
                        e.preventDefault();
                        handleCancelSlogan();
                      }
                    }}
                  />

                  {isSavingSlogan ? (
                    <div className={styles.loader} />
                  ) : (
                    <div className={styles.editActions}>
                      <button
                        type="button"
                        className={styles.editableSave}
                        onClick={handleSaveSlogan}
                        disabled={isSavingSlogan}
                        title="Salvar"
                      >
                        <IoCheckmark />
                      </button>

                      <button
                        type="button"
                        className={styles.editableCancel}
                        onClick={handleCancelSlogan}
                        title="Cancelar"
                      >
                        <IoClose />
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <p
                  className={styles.editableValue}
                  onClick={canEdit ? handleEditSlogan : undefined}
                  title={
                    !hasCustomSlogan && canEdit
                      ? "Slogan sugerido — clique para personalizar"
                      : undefined
                  }
                >
                  {displayedSlogan}
                  {canEdit && <HiOutlinePencil className={styles.editIcon} />}
                </p>
              )}
            </div>
          </div>

          {localProducer.verificationStatus === "GREEN" && (
            <div className={styles.verified} style={{ color: "green" }}>
              <GoShieldCheck />
            </div>
          )}
          {localProducer.verificationStatus === "YELLOW" && (
            <div className={styles.verified} style={{ color: "yellow" }}>
              <GoShield />
            </div>
          )}
          {localProducer.verificationStatus === "RED" && (
            <div className={styles.verified} style={{ color: "red" }}>
              <GoShieldX />
            </div>
          )}
        </div>

        <div className={styles.content}>
          <button
            className={`${styles.infoCard} ${styles.wide}`}
            onClick={() => ScrollTo("reviews", { center: true })}
          >
            <div className={styles.cardHeader}>
              <h2>
                <span>
                  <FaHeart />
                </span>
                Avaliações
              </h2>
              <IoIosArrowDown />
            </div>
            <div className={styles.cardContent}>
              {hasReviews ? (
                <>
                  <div className={styles.ratingLabel}>
                    <span className={styles.ratingNumber}>
                      {rating.toFixed(1)}
                    </span>
                    <p className={styles.reviewCount}>
                      {approvedReviews.length}{" "}
                      {approvedReviews.length === 1
                        ? "avaliação"
                        : "avaliações"}
                    </p>
                  </div>
                  <div className={styles.ratingDisplay}>
                    <span className={styles.ratingStars}>
                      {Array.from({ length: Math.round(rating) }).map(
                        (_, i) => (
                          <FaHeart key={i} />
                        ),
                      )}
                    </span>
                  </div>
                </>
              ) : (
                <p className={styles.noData}>Ainda não há avaliações</p>
              )}
            </div>
          </button>

          <button
            className={styles.infoCard}
            onClick={() => ScrollTo("values", { center: true })}
          >
            <div className={styles.cardHeader}>
              <h2>
                <span>
                  <TbCoinFilled />
                </span>
                Valores
              </h2>
              <IoIosArrowDown />
            </div>
            <div className={styles.cardContent}>
              {price ? (
                <p>
                  A partir de:
                  <span>
                    {price.value > 0
                      ? `R$ ${price.value.toFixed(2).replace(".", ",")}`
                      : "A combinar"}{" "}
                    <span>{price.option.label}</span>
                  </span>
                </p>
              ) : canEdit ? (
                <p>Informe seus valores!</p>
              ) : (
                <p>Ainda não há valores...</p>
              )}
            </div>
          </button>

          <button
            className={styles.infoCard}
            onClick={() => ScrollTo("location", { center: true })}
          >
            <div className={styles.cardHeader}>
              <h2>
                <span>
                  <HiLocationMarker />
                </span>
                Localização
              </h2>
              <IoIosArrowDown />
            </div>
            <div className={styles.cardContent}>
              {localProducer.user.locality ? (
                <p>
                  <span className={styles.neighborhood}>
                    {localProducer.user.locality?.neighborhood}
                  </span>
                  {localProducer.user.locality?.city} -{" "}
                  {localProducer.user.locality?.state}
                  {localProducer.profile.local ? (
                    <i>
                      <TbHomeCheck /> com local
                    </i>
                  ) : (
                    <i>
                      <TbHomeX /> sem local
                    </i>
                  )}
                </p>
              ) : (
                <p>Informe sua localização</p>
              )}
            </div>
          </button>
        </div>

        <div className={styles.contactsLayout} data-field="producer-contacts">
          {contacts.map((contact, index) => {
            const key = contact.option.name as keyof typeof CONTACT_CONFIG;
            const config = CONTACT_CONFIG[key];

            if (!config) return null;

            const Icon = config.icon;
            const isActive = contact.value;

            // ===== EDIT MODE =====
            if (canEdit) {
              return (
                <Popup
                  key={contact.id}
                  trigger={<Icon />}
                  triggerClass={`${styles.contactButton} ${config.className} ${
                    isActive ? styles.active : styles.disabled
                  }`}
                  triggerDataField={`producer-contact-${key}`}
                  triggerDataIndex={index}
                  popupClass={styles.popup}
                  isOpen={editingContact === key}
                  onOpenChange={(open) => {
                    if (open) {
                      setEditingContact(key);
                      setContactValue(contact.value ?? "");
                    } else {
                      setEditingContact(null);
                      setContactValue("");
                    }
                  }}
                >
                  <div className={styles.popupContent}>
                    <div className={styles.contactHeader}>
                      {contact.option.label}
                      <button
                        className={styles.closeBtn}
                        onClick={() => {
                          setEditingContact(null);
                        }}
                      >
                        <IoClose />
                      </button>
                    </div>

                    <input
                      type="text"
                      value={contactValue}
                      onChange={(e) => setContactValue(e.target.value)}
                      placeholder={`Digite seu ${contact.option.label.toLowerCase()}`}
                      className={styles.input}
                      autoFocus
                    />

                    <div className={styles.actions}>
                      <button
                        type="button"
                        className={styles.cancel}
                        onClick={() => {
                          setEditingContact(null);
                          setContactValue("");
                        }}
                      >
                        Cancelar
                      </button>

                      {(contact.value || contactValue.trim()) && (
                        <button
                          type="button"
                          className={styles.save}
                          disabled={isSaving}
                          onClick={async () => {
                            try {
                              setIsSaving(true);
                              await updateContact({
                                contactId: contact.id,
                                value: contactValue.trim(),
                              });
                              setContacts((prev) =>
                                prev.map((c) =>
                                  c.id === contact.id
                                    ? { ...c, value: contactValue.trim() }
                                    : c,
                                ),
                              );
                              setEditingContact(null);
                              setEditingContact(null);
                            } finally {
                              setIsSaving(false);
                            }
                          }}
                        >
                          {contact.value && !contactValue.trim()
                            ? "Remover"
                            : "Salvar"}
                        </button>
                      )}
                    </div>
                  </div>
                </Popup>
              );
            }

            // ===== VIEW MODE =====
            if (!isActive) return null;

            return (
              <a
                key={contact.id}
                href={config.getHref(contact.value)}
                className={`${styles.contactButton} ${config.className}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Icon />
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default ProductInfo;
