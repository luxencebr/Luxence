"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./Header.module.css";
import { IoIosClose, IoIosMenu } from "react-icons/io";

import LanguagesPopup from "@/components/LanguagesPopup/LanguagesPopup";
import LocationSelector from "@/components/LocationSelector/LocationSelector";

import SignUp from "@/components/Signup/Signup";
import LogIn from "@/components/LogIn/LogIn";

function Header() {
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
          <SignUp />
          <LogIn />
          <LanguagesPopup />
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
