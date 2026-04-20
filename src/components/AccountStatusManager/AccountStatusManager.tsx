"use client";

import { useAccountStatus } from "@/hooks/useAccountStatus";

export default function AccountStatusManager() {
  useAccountStatus();
  return null;
}