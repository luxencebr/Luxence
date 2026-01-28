"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { LogOut } from "lucide-react";
import styles from "./UserLink.module.css";

interface UserLinkProps {
  name: string;
  role: string;
  imageUrl?: string | null;
  href?: string;
}

export default function UserLink({
  name,
  role,
  imageUrl,
  href = "/admin/profile",
}: UserLinkProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className={styles.container}>
      <Link href={href} className={styles.user}>
        <div className={styles.avatar}>
          {imageUrl ? (
            <Image src={imageUrl} alt={name} width={40} height={40} />
          ) : (
            <span className={styles.fallback}>
              {name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        <div className={styles.info}>
          <strong className={styles.name}>{name}</strong>
          <span className={styles.role}>{role}</span>
        </div>
      </Link>

      <button
        type="button"
        className={styles.logout}
        onClick={() => setOpen((v) => !v)}
        aria-label="Sair do perfil"
      >
        <LogOut className={styles.icon} />
      </button>
    </div>
  );
}
