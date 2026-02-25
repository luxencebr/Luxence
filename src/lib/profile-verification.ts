import { prisma } from "@/utils/prisma";
import { STATUS } from "@prisma/client";

export interface ProfileVerificationResult {
  status: STATUS;
  isComplete: boolean;
  missingFields: string[];
  completedFields: string[];
}

export interface ProfileVerificationChecks {
  hasProfileName: boolean;
  hasProfileAge: boolean;
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
 * 1. Nome do perfil preenchido
 * 2. Idade do perfil preenchida
 * 3. Ao menos 1 imagem
 * 4. Ao menos 1 preço & Forma de pagamento
 * 5. Idiomas falados
 * 6. Público que atende
 * 7. Ao menos 1 contato
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
    hasProfileName: !!producer.profile.name && producer.profile.name.trim().length > 0,
    hasProfileAge: !!producer.profile.age && producer.profile.age >= 18 && producer.profile.age <= 99,
    hasImages: Array.isArray(producer.profile.images) && producer.profile.images.length > 0,
    hasPrices: producer.profile.prices.length > 0 && producer.profile.payments.length > 0,
    hasLanguages: Array.isArray(producer.profile.languages) && producer.profile.languages.length > 0,
    hasAudience: producer.profile.audience.some(a => a.status === "yes"),
    hasContacts: producer.profile.contacts.some(contact => 
      contact.value && contact.value.trim().length > 0
    ),
  };

  const missingFields: string[] = [];
  const completedFields: string[] = [];

  if (checks.hasProfileName) {
    completedFields.push("Nome do perfil");
  } else {
    missingFields.push("Nome do perfil");
  }

  if (checks.hasProfileAge) {
    completedFields.push("Idade do perfil");
  } else {
    missingFields.push("Idade do perfil");
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
