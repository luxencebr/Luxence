export type Signature = "COPPER" | "SILVER" | "GOLD" | "DIAMOND";

export const SIGNATURE_LIMITS = {
  COPPER: 5,
  SILVER: 10,
  GOLD: 15,
  DIAMOND: 20,
} as const;

export const SIGNATURE_LABELS = {
  COPPER: "Cobre",
  SILVER: "Prata",
  GOLD: "Ouro",
  DIAMOND: "Diamante",
} as const;

export function getImageLimit(signature: Signature): number {
  return SIGNATURE_LIMITS[signature];
}

export function canAddMoreImages(
  signature: Signature,
  currentCount: number,
): boolean {
  return currentCount < SIGNATURE_LIMITS[signature];
}

export function getSignatureLabel(signature: Signature): string {
  return SIGNATURE_LABELS[signature];
}
