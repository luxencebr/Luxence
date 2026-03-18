"use client";

import type React from "react";

import { SessionProvider } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import StartPopup from "@/components/StartPopup/StartPopup";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import { ScrollTop } from "@/utils/ScrollTop";

const AGE_CONFIRMED_KEY = "luxence_age_confirmed";

export default function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [hasConfirmedAge, setHasConfirmedAge] = useState<boolean | null>(null);

  useEffect(() => {
    const ageConfirmed = localStorage.getItem(AGE_CONFIRMED_KEY);
    setHasConfirmedAge(ageConfirmed === "true");
  }, []);

  const handleConfirmAge = () => {
    localStorage.setItem(AGE_CONFIRMED_KEY, "true");
    setHasConfirmedAge(true);
  };

  const handleExitSite = () => {
    window.location.href = "https://www.google.com";
  };

  const noLayout =
    pathname?.startsWith("/signup") ||
    pathname?.startsWith("/signin") ||
    pathname === "/catalog" ||
    pathname === "/advertiser" ||
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/profile");

  if (noLayout) {
    return <SessionProvider>{children}</SessionProvider>;
  }

  if (hasConfirmedAge === null) {
    return null;
  }

  return (
    <SessionProvider>
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
    </SessionProvider>
  );
}
