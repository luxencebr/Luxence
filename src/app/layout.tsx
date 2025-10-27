"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import "../styles/globals.css";
import "../styles/variables.css";
import "../styles/Fonts.css";

import StartPopup from "@/components/StartPopup/StartPopup";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import { ScrollTop } from "@/utils/ScrollTop";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [hasConfirmedAge, setHasConfirmedAge] = useState(false);

  useEffect(() => {
    const ageConfirmed = sessionStorage.getItem("ageConfirmed");
    if (ageConfirmed === "true") {
      setHasConfirmedAge(true);
    }
  }, []);

  const handleConfirmAge = () => setHasConfirmedAge(true);
  const handleExitSite = () => {
    window.location.href = "https://www.google.com";
  };

  const noLayout =
    pathname?.startsWith("/signup") ||
    pathname?.startsWith("/signin") ||
    pathname === "/catalog" ||
    pathname === "/advertiser";

  if (noLayout) {
    return (
      <html lang="pt-BR">
        <body>{children}</body>
      </html>
    );
  }

  return (
    <html lang="pt-BR">
      <body>
        <Header />
        <ScrollTop />
        {children}
        <Footer />

        {!hasConfirmedAge && (
          <StartPopup
            onConfirmAge={handleConfirmAge}
            onExitSite={handleExitSite}
          />
        )}
      </body>
    </html>
  );
}
