"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./Header.module.css";
import { IoIosClose, IoIosMenu } from "react-icons/io";
import { IoPerson } from "react-icons/io5";

import LanguagesPopup from "@/components/LanguagesPopup/LanguagesPopup";
import LocationSelector from "@/components/LocationSelector/LocationSelector";
import Dropdown from "@/components/ui/Dropdown/Dropdown";

import SignUp from "@/components/Signup/Signup";
import LogIn from "@/components/LogIn/LogIn";

function Header() {
  const { data: session } = useSession();

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (isMenuOpen) setIsMenuOpen(false);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isMenuOpen]);

  return (
    <header className={styles.header}>
      <div className={styles.layout}>
        <div className={styles.left}>
          <Link href="/">
            <img src="/ExenceLogo.svg" alt="Logo" className={styles.logo} />
          </Link>

          <LocationSelector />

          <Link href="/home" className={styles.news}>
            Novidades
          </Link>
        </div>
        <div className={styles.headerButtons}>
          {session ? (
            <>
              <LanguagesPopup />
              <Dropdown
                trigger={
                  <>
                    <span>
                      <IoPerson />
                    </span>
                    {(() => {
                      if (!session.user?.name) return "Usuário";

                      const parts = session.user.name.trim().split(/\s+/);
                      if (parts.length === 1) return parts[0];

                      const first = parts[0];
                      const last = parts[parts.length - 1];
                      return `${first} ${last}`;
                    })()}
                  </>
                }
                containerClassName={styles.dropdown}
                triggerClassName={styles.trigger}
                menuClassName={styles.menu}
              >
                <Link href={"/profile"} className={styles.menuItem}>
                  Ver Perfil
                </Link>
                <button onClick={() => signOut()} className={styles.menuItem}>
                  Sair
                </button>
              </Dropdown>
            </>
          ) : (
            <>
              <SignUp />
              <LogIn />
              <LanguagesPopup />
            </>
          )}
        </div>

        <div className={styles.mobileRight}>
          <LanguagesPopup />
          <button
            className={styles.hamburgerButton}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Menu"
          >
            {isMenuOpen ? <IoIosClose /> : <IoIosMenu />}
          </button>
        </div>

        <div
          className={`${styles.mobileMenu} ${
            isMenuOpen ? styles.mobileMenuOpen : ""
          }`}
        >
          <div className={styles.mobileMenuContent}>
            <Link
              href="/home"
              className={styles.mobileNews}
              onClick={() => setIsMenuOpen(false)}
            >
              Novidades
            </Link>

            <div className={styles.mobileAuthButtons}>
              <SignUp />
              <LogIn />
            </div>
          </div>
        </div>

        {isMenuOpen && (
          <div
            className={styles.overlay}
            onClick={() => setIsMenuOpen(false)}
          />
        )}
      </div>
    </header>
  );
}

export default Header;
