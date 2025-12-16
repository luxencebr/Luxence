"use client";

import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./Header.module.css";
import { IoIosClose, IoIosMenu } from "react-icons/io";
import { IoPerson } from "react-icons/io5";

import LanguagesPopup from "@/components/LanguagesPopup/LanguagesPopup";
import Dropdown from "@/components/ui/Dropdown/Dropdown";

import SignUp from "@/components/Signup/Signup";
import LogIn from "@/components/LogIn/LogIn";

function Header() {
  const { data: session } = useSession();
  console.log(session);

  const pathname = usePathname();

  const isActive = (route: string) =>
    pathname === route || pathname.startsWith(route + "/");

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
        <nav className={styles.left}>
          <Link href="/">
            <img src="/ExenceLogo.svg" alt="Logo" className={styles.logo} />
          </Link>

          <Link
            href="/home"
            className={`${styles.navBtn} ${
              isActive("/home") ? styles.active : ""
            }`}
          >
            Início
          </Link>

          <Link
            href="/catalog"
            className={`${styles.navBtn} ${
              isActive("/catalog") ? styles.active : ""
            }`}
          >
            Catálogo
          </Link>

          <Link
            href="/about"
            className={`${styles.navBtn} ${
              isActive("/about") ? styles.active : ""
            }`}
          >
            Sobre
          </Link>
        </nav>
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
                <Link
                  href={`/product/${session?.user?.id}`}
                  className={styles.menuItem}
                >
                  Ver Perfil
                </Link>
                {session.user.signature !== "COPPER" ? (
                  <Link href={""} className={styles.menuItem}>
                    Minha Assinatura
                  </Link>
                ) : (
                  <Link href={"advertiser/plans"} className={styles.menuItem}>
                    Assine Já!
                  </Link>
                )}
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
