import { prisma } from "@/utils/prisma";
import { STATUS } from "@prisma/client";

export interface ProfileVerificationResult {
  status: STATUS;
  isComplete: boolean;
  missingFields: string[];
  completedFields: string[];
}

export interface ProfileVerificationChecks {
  hasName: boolean;
  hasImages: boolean;
  hasPrices: boolean;
  hasLanguages: boolean;
  hasAudience: boolean;
  hasContacts: boolean;
}

/**
 * Verifica se o perfil do produtor está completo e retorna o status apropriado
 * 
 * Critérios para status GREEN (aprovado):
 * 1. Nome preenchido
 * 2. Ao menos 1 imagem
 * 3. Ao menos 1 preço & Forma de pagamento
 * 4. Idiomas falados
 * 5. Público que atende
 * 6. Ao menos 1 contato
 */
export async function verifyProfileCompletion(
  producerId: number
): Promise<ProfileVerificationResult> {
  const producer = await prisma.producer.findUnique({
    where: { id: producerId },
    include: {
      profile: {
        include: {
          prices: true,
          payments: true,
          audience: true,
          contacts: true,
        },
      },
    },
  });

  if (!producer || !producer.profile) {
    return {
      status: STATUS.RED,
      isComplete: false,
      missingFields: ["Perfil não encontrado"],
      completedFields: [],
    };
  }

  const checks: ProfileVerificationChecks = {
    hasName: !!producer.name && producer.name.trim().length > 0,
    hasImages: Array.isArray(producer.profile.images) && producer.profile.images.length > 0,
    hasPrices: producer.profile.prices.length > 0 && producer.profile.payments.length > 0,
    hasLanguages: Array.isArray(producer.profile.languages) && producer.profile.languages.length > 0,
    hasAudience: producer.profile.audience.length > 0,
    hasContacts: producer.profile.contacts.some(contact => 
      contact.value && contact.value.trim().length > 0
    ),
  };

  const missingFields: string[] = [];
  const completedFields: string[] = [];

  if (checks.hasName) {
    completedFields.push("Nome");
  } else {
    missingFields.push("Nome");
  }

  if (checks.hasImages) {
    completedFields.push("Ao menos 1 imagem");
  } else {
    missingFields.push("Ao menos 1 imagem");
  }

  if (checks.hasPrices) {
    completedFields.push("Ao menos 1 preço e forma de pagamento");
  } else {
    missingFields.push("Ao menos 1 preço e forma de pagamento");
  }

  if (checks.hasLanguages) {
    completedFields.push("Idiomas falados");
  } else {
    missingFields.push("Idiomas falados");
  }

  if (checks.hasAudience) {
    completedFields.push("Público que atende");
  } else {
    missingFields.push("Público que atende");
  }

  if (checks.hasContacts) {
    completedFields.push("Ao menos 1 contato");
  } else {
    missingFields.push("Ao menos 1 contato");
  }

  const isComplete = missingFields.length === 0;
  const status = isComplete ? STATUS.GREEN : STATUS.YELLOW;

  return {
    status,
    isComplete,
    missingFields,
    completedFields,
  };
}

/**
 * Atualiza o status de verificação do produtor no banco de dados
 */
export async function updateProducerVerificationStatus(
  producerId: number
): Promise<ProfileVerificationResult> {
  const verification = await verifyProfileCompletion(producerId);

  await prisma.producer.update({
    where: { id: producerId },
    data: {
      verificationStatus: verification.status,
    },
  });

  return verification;
}
