"use client";

import { useRef, useState, useEffect } from "react";
import styles from "./ProductInfo.module.css";

import { IoEyeOutline } from "react-icons/io5";
import { TbCoinFilled } from "react-icons/tb";
import { HiLocationMarker } from "react-icons/hi";
import { TbHomeCheck, TbHomeX } from "react-icons/tb";
import { FaHeart } from "react-icons/fa6";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";

import { FaWhatsapp, FaInstagram, FaTelegram } from "react-icons/fa6";

import type { Producer } from "../../types/Producer";
import ScrollTo from "@/utils/ScrollTo";

interface ProductInfosProps {
  producer: Producer;
}

function ProductInfo({ producer }: ProductInfosProps) {
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [atBottom, setAtBottom] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

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

  const handleSeeMore = () => {
    if (isMobile) {
      if (!isExpanded) {
        setIsExpanded(true);
        setTimeout(() => {
          ScrollTo("anchor", { center: true });
        }, 50);
      } else {
        setIsExpanded(false);
      }
    } else {
      const el = contentRef.current;
      if (!el) return;

      if (atBottom) {
        el.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        el.scrollTo({ top: el.clientHeight - 44, behavior: "smooth" });
      }
    }
  };

  const reviews = producer.reviews || [];
  const hasReviews = reviews.length > 0;

  const rating = hasReviews
    ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
    : 0;

  return (
    <div className={styles.productInfos}>
      <div className={styles.contactsOptions}>
        <div className={styles.contactsLayout}>
          {producer.contact.phone && (
            <a
              href={`https://wa.me/${producer.contact.phone}`}
              className={`${styles.contactButton} ${styles.whatsapp}`}
            >
              <FaWhatsapp />
            </a>
          )}
          {producer.contact.telegram && (
            <a
              href={`https://t.me/${producer.contact.telegram}`}
              className={`${styles.contactButton} ${styles.telegram}`}
            >
              <FaTelegram />{" "}
            </a>
          )}
          {producer.contact.instagram && (
            <a
              href={`https://www.instagram.com/${producer.contact.instagram}`}
              className={`${styles.contactButton} ${styles.instagram}`}
            >
              <FaInstagram />
            </a>
          )}
        </div>
      </div>

      <div
        className={`${styles.layout} ${
          isMobile && isExpanded ? styles.expanded : ""
        }`}
        ref={contentRef}
      >
        <div className={styles.content}>
          <div className={styles.productHeader}>
            <div className={styles.productHighlight}>
              <h1 className={styles.productName}>{producer.profile.name}</h1>
              <p className={styles.productSlogan}>{producer.profile.slogan}</p>
            </div>
            <button
              onClick={() => ScrollTo("reviews", { center: true })}
              className={styles.productReviews}
            >
              <span>
                <FaHeart />
                {typeof rating === "number" && !isNaN(rating)
                  ? rating.toFixed(1)
                  : "N/D"}
              </span>
              {producer.reviews?.length} Avaliações
            </button>
          </div>

          <div className={styles.expandableContent}>
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
                A partir de:
                <span>
                  {producer.prices?.[0]
                    ? `R$ ${producer.prices[0].price} - ${producer.prices[0].duration}`
                    : "Consultar"}
                </span>
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
                <h3 className={styles.neighborhood}>
                  {producer.locality.neighborhood}
                </h3>
                <span className={styles.localExtra}>
                  {producer.locality.city} - {producer.locality.state}
                </span>
                <span className={styles.hasLocal}>
                  {producer.locality.hasLocal ? (
                    <>
                      <span>
                        <TbHomeCheck />
                      </span>
                      com local
                    </>
                  ) : (
                    <>
                      <span>
                        <TbHomeX />
                      </span>
                      sem local
                    </>
                  )}
                </span>
              </div>
            </button>
          </div>

          <button className={styles.seeMoreButton} onClick={handleSeeMore}>
            {isMobile ? (
              isExpanded ? (
                <>
                  <IoIosArrowUp /> Ver menos
                </>
              ) : (
                <>
                  <IoIosArrowDown /> Ver mais
                </>
              )
            ) : atBottom ? (
              <>
                <IoIosArrowUp /> Voltar ao topo
              </>
            ) : (
              <>
                <IoIosArrowDown /> Veja mais
              </>
            )}
          </button>
        </div>

        <div
          id="anchor"
          className={`${styles.productSpecifies} ${
            isMobile && !isExpanded ? styles.hidden : ""
          }`}
        >
          <h2>Especificações</h2>
          <ul className={styles.specifiesList}>
            {Object.entries(producer.appearance).map(([key, value]) => (
              <li key={key} className={styles.specify}>
                <strong>{key}:</strong> {value}
              </li>
            ))}
          </ul>
          <div className={styles.extraContent}>
            <a href=""></a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductInfo;
