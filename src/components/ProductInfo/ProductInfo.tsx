"use client";

import { useRef, useState, useEffect } from "react";
import styles from "./ProductInfo.module.css";
import { IoClose } from "react-icons/io5";

import { TbCoinFilled } from "react-icons/tb";
import { HiLocationMarker } from "react-icons/hi";
import { TbHomeCheck, TbHomeX } from "react-icons/tb";
import { FaHeart } from "react-icons/fa6";
import { IoIosArrowDown } from "react-icons/io";

import { FaWhatsapp, FaInstagram, FaTelegram } from "react-icons/fa6";
import { GoShieldCheck, GoShield, GoShieldX } from "react-icons/go";
import { HiOutlinePencil } from "react-icons/hi2";

import type { Producer } from "@/types/Producer";
import ScrollTo from "@/utils/ScrollTo";
import { formatUserName } from "@/utils/formatName";
import Popup from "../ui/Popup/Popup";

const formatWhatsAppNumber = (phone: string) => {
  const onlyNumbers = phone.replace(/\D/g, "");

  if (onlyNumbers.startsWith("55")) {
    return onlyNumbers;
  }

  return `55${onlyNumbers}`;
};

interface ProductInfoProps {
  producer: Producer;
  canEdit: boolean;
}

function ProductInfo({ producer, canEdit }: ProductInfoProps) {
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [atBottom, setAtBottom] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [editingContact, setEditingContact] = useState<
    "whatsapp" | "telegram" | "instagram" | null
  >(null);
  const [isOpen, setIsOpen] = useState(false);

  const [slogan, setSlogan] = useState(producer.profile.slogan || "");
  const [isEditingSlogan, setIsEditingSlogan] = useState(false);
  const [originalSlogan, setOriginalSlogan] = useState(slogan);
  const [isSavingSlogan, setIsSavingSlogan] = useState(false);
  const sloganInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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
    if (isEditingSlogan) {
      sloganInputRef.current?.focus();
    }
  }, [isEditingSlogan]);

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

  const reviews = producer.profile.reviews || [];
  const hasReviews = reviews.length > 0;

  const rating = hasReviews
    ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
    : 0;

  const price = producer.profile.prices?.[0];

  const whatsappMsg = encodeURIComponent(
    "Olá! Vi seu perfil na Luxence!\n\nFiquei interessado em seus serviços. Vamos conversar?"
  );

  const isContactActive = (type: "whatsapp" | "telegram" | "instagram") => {
    if (type === "whatsapp") return Boolean(producer.phone);
    if (type === "telegram") return Boolean(producer.profile.telegram);
    if (type === "instagram") return Boolean(producer.profile.instagram);
    return false;
  };

  return (
    <div className={styles.productInfos}>
      <div
        className={`${styles.layout} ${
          isMobile && isExpanded ? styles.expanded : ""
        }`}
        ref={contentRef}
      >
        <div className={styles.productHeader}>
          <div className={styles.productHighlight}>
            <h1 className={styles.productName}>
              {formatUserName(producer.user.name)}
            </h1>
            <div className={styles.slogan}>
              {isEditingSlogan ? (
                <div className={styles.sloganEdit}>
                  <div className={styles.sloganInputWrapper}>
                    <input
                      ref={sloganInputRef}
                      type="text"
                      value={slogan}
                      onChange={(e) => setSlogan(e.target.value)}
                      placeholder="Digite seu slogan..."
                      className={styles.sloganInput}
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

                    <div className={styles.sloganActions}>
                      {isSavingSlogan ? (
                        <div className={styles.loader} />
                      ) : (
                        <button
                          type="button"
                          onClick={handleCancelSlogan}
                          className={styles.cancelButton}
                        >
                          <IoClose />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : slogan ? (
                <p
                  className={styles.productSlogan}
                  onClick={canEdit ? handleEditSlogan : undefined}
                  style={canEdit ? { cursor: "pointer" } : undefined}
                >
                  {slogan}
                  {canEdit && (
                    <HiOutlinePencil className={styles.sloganEditIcon} />
                  )}
                </p>
              ) : (
                <p
                  className={styles.sloganPlaceholder}
                  onClick={canEdit ? handleEditSlogan : undefined}
                >
                  Adicione um Slogan <HiOutlinePencil />
                </p>
              )}
            </div>
          </div>
          {producer.verificationStatus === "GREEN" && (
            <div className={styles.verified} style={{ color: "green" }}>
              <GoShieldCheck />
            </div>
          )}
          {producer.verificationStatus === "YELLOW" && (
            <div className={styles.verified} style={{ color: "yellow" }}>
              <GoShield />
            </div>
          )}
          {producer.verificationStatus === "RED" && (
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
              {producer.profile.reviews.length > 0 ? (
                <p>
                  {producer.profile.reviews.length} -{" "}
                  {typeof rating === "number" && !isNaN(rating)
                    ? rating.toFixed(1)
                    : "N/D"}
                </p>
              ) : (
                <p>Ainda não há avaliações</p>
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
                    {price && `R$ ${price.value}`},00{" "}
                    <span>{price.option.label}</span>
                  </span>
                </p>
              ) : (
                <p>Informe seus valores</p>
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
              {producer.user.locality ? (
                <p>
                  <span className={styles.neighborhood}>
                    {producer.user.locality?.neighborhood}
                  </span>
                  {producer.user.locality?.city} -{" "}
                  {producer.user.locality?.state}
                  {producer.profile.local ? (
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

        <div className={styles.contactsOptions}>
          <div className={styles.contactsLayout}>
            {canEdit ? (
              <Popup
                trigger={<FaWhatsapp />}
                triggerClass={`${styles.contactButton} ${styles.whatsapp}`}
                popupClass={styles.popup}
                isOpen={editingContact === "whatsapp"}
                onOpenChange={(open) =>
                  setEditingContact(open ? "whatsapp" : null)
                }
              >
                <div>Whatsapp</div>
              </Popup>
            ) : (
              <a
                href={`https://wa.me/${formatWhatsAppNumber(
                  producer.phone
                )}?text=${whatsappMsg}`}
                className={`${styles.contactButton} ${styles.whatsapp} ${
                  isContactActive("whatsapp") ? styles.active : styles.disabled
                }`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaWhatsapp />
              </a>
            )}

            {canEdit ? (
              <Popup
                trigger={<FaTelegram />}
                triggerClass={`${styles.contactButton} ${styles.telegram} ${
                  isContactActive("telegram") ? styles.active : styles.disabled
                }`}
                popupClass={styles.popup}
                isOpen={editingContact === "telegram"}
                onOpenChange={(open) =>
                  setEditingContact(open ? "telegram" : null)
                }
              >
                <div>Telegram</div>
              </Popup>
            ) : (
              producer.profile.telegram && (
                <a
                  href="https://t.me/${producer.profile.telegram}"
                  className={`${styles.contactButton} ${styles.telegram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaTelegram />
                </a>
              )
            )}

            {canEdit ? (
              <Popup
                trigger={<FaInstagram />}
                triggerClass={`${styles.contactButton} ${styles.instagram} ${
                  isContactActive("instagram") ? styles.active : styles.disabled
                }`}
                popupClass={styles.popup}
                isOpen={editingContact === "instagram"}
                onOpenChange={(open) =>
                  setEditingContact(open ? "instagram" : null)
                }
              >
                <div>Instagram</div>
              </Popup>
            ) : (
              producer.profile.instagram && (
                <a
                  href={`https://www.instagram.com/${producer.profile.instagram}`}
                  className={`${styles.contactButton} ${styles.instagram} `}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaInstagram />
                </a>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductInfo;
