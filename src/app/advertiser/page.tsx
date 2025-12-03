"use client";
import { Suspense } from "react";
import AdvertiserRegistrationContent from "@/components/advertiser/advertiser-registration-content";

const TOTAL_STEPS = 3;

export default function AdvertiserRegistration() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <AdvertiserRegistrationContent />
    </Suspense>
  );
}
