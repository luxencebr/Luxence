"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProfileHub from "@/components/profile/ProfileHub/ProfileHub";

export default function ProfilePage() {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      
      // Redirecionar apenas no desktop
      if (!mobile) {
        router.push("/profile/account");
      }
    };

    // Verificação inicial
    checkMobile();

    // Debounce para resize
    let timeoutId: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(checkMobile, 150);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", handleResize);
    };
  }, [router]);

  // Aguardar verificação inicial
  if (isMobile === null) {
    return null;
  }

  // Desktop: será redirecionado
  if (!isMobile) {
    return null;
  }

  // Mobile: mostrar hub
  return <ProfileHub />;
}
