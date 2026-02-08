"use client";
import { Suspense } from "react";
import AdvertiserRegistrationContent from "@/components/advertiser/advertiser-registration-content";

export default function AdvertiserRegistration() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <AdvertiserRegistrationContent />
    </Suspense>
  );
}
