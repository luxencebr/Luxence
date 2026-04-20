export type Signature = "COPPER" | "SILVER" | "GOLD" | "DIAMOND";

export const SIGNATURE_LABELS = {
  COPPER: "Cobre",
  SILVER: "Prata",
  GOLD: "Ouro",
  DIAMOND: "Diamante",
} as const;

/**
 * @deprecated Use getUserSubscriptionInfo from subscription-helpers instead
 * This constant is kept for backward compatibility only
 */
export const SIGNATURE_LIMITS = {
  COPPER: 3,
  SILVER: 5,
  GOLD: 10,
  DIAMOND: 20,
} as const;

export function getSignatureLabel(signature: Signature): string {
  return SIGNATURE_LABELS[signature];
}

/**
 * @deprecated Use getUserSubscriptionInfo from subscription-helpers instead
 * This function is kept for backward compatibility only
 */
export async function getImageLimit(signature: Signature): Promise<number> {
  console.warn('getImageLimit is deprecated. Use getUserSubscriptionInfo from subscription-helpers instead.');
  
  // Valores padrão baseados nos planos atuais
  const limits = {
    COPPER: 3,
    SILVER: 5,
    GOLD: 10,
    DIAMOND: 20,
  };
  
  return limits[signature];
}

/**
 * @deprecated Use canUploadPhotos from subscription instead
 * This function is kept for backward compatibility only
 */
export async function canAddMoreImages(
  signature: Signature,
  currentCount: number,
): Promise<boolean> {
  console.warn('canAddMoreImages is deprecated. Use canUploadPhotos from subscription instead.');
  
  const limit = await getImageLimit(signature);
  return currentCount < limit;
}
