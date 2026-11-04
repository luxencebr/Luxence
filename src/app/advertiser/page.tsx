"use client";
import { Suspense } from "react";
import AdvertiserRegistrationContent from "@/components/advertiser/advertiser-registration-content";
import { useSiteLocale } from "@/lib/site-locale";
import { uiText } from "@/lib/ui-text";

export default function AdvertiserRegistration() {
  const { locale } = useSiteLocale();
  return (
    <Suspense fallback={<div>{uiText(locale, "Carregando...")}</div>}>
      <AdvertiserRegistrationContent />
    </Suspense>
  );
}
