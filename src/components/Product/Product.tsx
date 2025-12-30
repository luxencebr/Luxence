"use client";

import Link from "next/link";

import styles from "./Product.module.css";
import { GrLocation } from "react-icons/gr";
import { BiIdCard } from "react-icons/bi";
import { TbHomeCheck, TbHomeX } from "react-icons/tb";
import { FaHeart } from "react-icons/fa6";

import ValueDropdown from "../ValuesDropdown/ValuesDropdown";

import type { Producer } from "@/types/Producer";

interface ProductProps {
  producer: Producer;
  variant?: "row" | "highlight" | undefined;
}

function calculateAge(birthday: Date | string): number {
  const today = new Date();
  const birthDate = new Date(birthday);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age;
}

function Product({ producer, variant }: ProductProps) {
  const name = producer.name || "";
  const age = calculateAge(producer.birthday);
  const city = producer.user?.locality?.city || "";
  const neighborhood = producer.user?.locality?.neighborhood || "";
  const slogan = producer.profile?.slogan || "";
  const hasLocal = producer.profile?.hasLocal || false;
  const images = producer.profile?.images || [];
  const reviews = producer.profile?.reviews || [];

  const firstImage =
    typeof images[0] === "string"
      ? images[0]
      : (images[0] as any)?.url || "/abstract-profile.png";

  return (
    <li
      className={`${styles.product} 
        ${variant === "highlight" ? styles.highlight : ""} 
        ${variant === "row" ? styles.row : ""}`}
    >
      <Link href={`/product/${producer.id}`} className={styles.productLink}>
        <img
          className={styles.producerImage}
          src={firstImage || "/placeholder.svg"}
          alt={`Foto de ${name}`}
        />

        <div className={styles.itemInfo}>
          <div className={styles.infoHeader}>
            <h3 className={styles.producerName}>{name}</h3>
            <span
              className={`${styles.productLoc} ${
                variant === undefined ? styles.hidden : ""
              }`}
            >
              {city}
            </span>
            <span
              className={`${styles.productSlogan} ${
                variant !== undefined ? styles.hidden : ""
              }`}
            >
              {slogan}
            </span>
          </div>

          <div
            className={`${styles.infoContent} ${
              variant !== undefined ? styles.hidden : ""
            }`}
          >
            <span className={styles.rating}>
              <span>
                <FaHeart />
              </span>
              {reviews.length} Avaliações
            </span>

            {producer.profile?.prices && producer.profile.prices.length > 0 && (
              <ValueDropdown producer={producer} />
            )}

            <span className={styles.defaultInfo}>
              <span>
                <BiIdCard />
              </span>
              {age} anos
            </span>
            <span className={styles.defaultInfo}>
              {hasLocal ? (
                <>
                  <span>
                    <TbHomeCheck />
                  </span>
                  Possui local
                </>
              ) : (
                <>
                  <span>
                    <TbHomeX />
                  </span>
                  Não possui local
                </>
              )}
            </span>
            <span className={styles.defaultInfo}>
              <span>
                <GrLocation />
              </span>
              {city}
              {neighborhood ? `, ${neighborhood}` : ""}
            </span>
          </div>
        </div>
      </Link>
    </li>
  );
}

export default Product;
