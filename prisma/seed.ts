import { PrismaClient, APPEARANCE_VALUE_TYPE, SIGNATURE } from "@prisma/client";
const prisma = new PrismaClient();

const CONTACT_OPTIONS = [
  { id: 1, name: "whatsapp", label: "WhatsApp", icon: "whatsapp" },
  { id: 2, name: "telegram", label: "Telegram", icon: "telegram" },
  { id: 3, name: "instagram", label: "Instagram", icon: "instagram" },
];

const APPEARANCE_OPTIONS = [
  {
    id: 1,
    name: "ethnicity",
    label: "Etnia",
    valueType: APPEARANCE_VALUE_TYPE.OPTION,
  },
  {
    id: 2,
    name: "hair_color",
    label: "Cor do cabelo",
    valueType: APPEARANCE_VALUE_TYPE.OPTION,
  },
  {
    id: 3,
    name: "eye_color",
    label: "Cor dos olhos",
    valueType: APPEARANCE_VALUE_TYPE.OPTION,
  },
  {
    id: 4,
    name: "altura",
    label: "Altura",
    valueType: APPEARANCE_VALUE_TYPE.NUMBER,
  },
  {
    id: 5,
    name: "manequim",
    label: "Manequim",
    valueType: APPEARANCE_VALUE_TYPE.NUMBER,
  },
  {
    id: 6,
    name: "pe",
    label: "Número do pé",
    valueType: APPEARANCE_VALUE_TYPE.NUMBER,
  },
  {
    id: 7,
    name: "body_type",
    label: "Tipo de corpo",
    valueType: APPEARANCE_VALUE_TYPE.OPTION,
  },
  {
    id: 8,
    name: "breast_size",
    label: "Tamanho do peito",
    valueType: APPEARANCE_VALUE_TYPE.OPTION,
  },
  {
    id: 9,
    name: "butt_size",
    label: "Tamanho da bunda",
    valueType: APPEARANCE_VALUE_TYPE.OPTION,
  },
  {
    id: 10,
    name: "tatuagens",
    label: "Tatuagens",
    valueType: APPEARANCE_VALUE_TYPE.BOOLEAN,
  },
  {
    id: 11,
    name: "piercings",
    label: "Piercings",
    valueType: APPEARANCE_VALUE_TYPE.BOOLEAN,
  },
  {
    id: 12,
    name: "pubis",
    label: "Pubis",
    valueType: APPEARANCE_VALUE_TYPE.OPTION,
  },
  {
    id: 13,
    name: "silicone_busto",
    label: "Silicone no Busto",
    valueType: APPEARANCE_VALUE_TYPE.BOOLEAN,
  },
  {
    id: 14,
    name: "silicone_quadril",
    label: "Silicone no Quadril",
    valueType: APPEARANCE_VALUE_TYPE.BOOLEAN,
  },
  {
    id: 15,
    name: "dote",
    label: "Dote",
    valueType: APPEARANCE_VALUE_TYPE.NUMBER,
  },
];

const LOCATIONS_OPTIONS = [
  { id: 1, name: "a_domicilio", label: "À Domicílio" },
  { id: 2, name: "hoteis", label: "Hotéis" },
  { id: 3, name: "moteis", label: "Motéis" },
  { id: 4, name: "eventos", label: "Eventos" },
];

const AMENITIES_OPTIONS = [
  { id: 1, name: "ar_condicionado", label: "Ar Condicionado" },
  { id: 2, name: "cama_queen", label: "Cama Queen" },
  { id: 3, name: "cama_king", label: "Cama King" },
  { id: 4, name: "sofa", label: "Sofá" },
  { id: 5, name: "televisao", label: "Televisão" },
  { id: 6, name: "chuveiro", label: "Chuveiro" },
  { id: 7, name: "chuveiro_quente", label: "Chuveiro Quente" },
  { id: 8, name: "banheira", label: "Banheira" },
  { id: 9, name: "jacuzzi", label: "Jacuzzi" },
  { id: 10, name: "toalhas_limpas", label: "Toalhas Limpas" },
  { id: 11, name: "produtos_de_higiene", label: "Produtos de Higiene" },
  { id: 12, name: "wifi", label: "Wi-Fi" },
  { id: 13, name: "frigobar", label: "Frigobar" },
  { id: 14, name: "estacionamento", label: "Estacionamento" },
];

const AUDIENCE_OPTIONS = [
  { id: 1, name: "masculino", label: "Masculino" },
  { id: 2, name: "feminino", label: "Feminino" },
  { id: 3, name: "trans", label: "Trans" },
  { id: 4, name: "casais", label: "Casais" },
  { id: 5, name: "grupos", label: "Grupos" },
];

const SERVICE_OPTIONS = [
  { id: 1, name: "acompanhante", label: "Acompanhante" },
  { id: 2, name: "viagem", label: "Viagem" },
  { id: 3, name: "beijo_boca", label: "Beijo na boca" },
  { id: 4, name: "beijo_grego", label: "Beijo grego" },
  { id: 5, name: "sexo_oral", label: "Sexo Oral" },
  { id: 6, name: "masturbacao", label: "Masturbação" },
  { id: 7, name: "sexo_vaginal", label: "Sexo Vaginal" },
  { id: 9, name: "striptease", label: "Striptease" },
  { id: 10, name: "sexo_anal", label: "Sexo Anal" },
  { id: 11, name: "massagem", label: "Massagem" },
  { id: 12, name: "penetracao_dupla", label: "Penetração Dupla" },
  { id: 13, name: "penetracao_tripla", label: "Penetração Tripla" },
];

const FETICHES_OPTIONS = [
  { id: 1, name: "acessorios", label: "Acessórios" },
  { id: 2, name: "fantasias", label: "Fantasias" },
  { id: 3, name: "podolatria", label: "Podolatria" },
  { id: 4, name: "quirofilia", label: "Quirofilia" },
  { id: 5, name: "facefuck", label: "Facefuck" },
  { id: 6, name: "voyer", label: "Voyer" },
  { id: 7, name: "bondage", label: "Bondage" },
  { id: 9, name: "dominação", label: "Dominação" },
  { id: 10, name: "submissão", label: "Submissão" },
  { id: 11, name: "sadomasoquismo", label: "Sadomasoquismo" },
  { id: 12, name: "golden_shower", label: "Golden-Shower" },
  { id: 13, name: "brown_shower", label: "Brown-Shower" },
];

const PRICE_OPTIONS = [
  { id: 0, name: "15_min", label: "15 Minutos" },
  { id: 1, name: "30_min", label: "30 Minutos" },
  { id: 2, name: "1_hora", label: "1 Hora" },
  { id: 3, name: "2_horas", label: "2 Horas" },
  { id: 4, name: "4_horas", label: "4 Horas" },
  { id: 5, name: "pernoite", label: "Pernoite" },
  { id: 6, name: "diaria", label: "Diária" },
  { id: 7, name: "personalizado", label: "Personalizado" },
];

const PAYMENT_OPTIONS = [
  { id: 0, name: "dinheiro", label: "Dinheiro" },
  { id: 1, name: "pix", label: "Pix" },
  { id: 2, name: "credito", label: "Crédito" },
  { id: 3, name: "debito", label: "Débito" },
];

const SUBSCRIPTION_PLANS = [
  {
    signature: 'COPPER' as SIGNATURE,
    name: 'Cobre',
    description: 'Plano gratuito para começar',
    price: 0,
    maxPhotos: 3,
    maxVideos: 0,
    maxProfileUpdates: 2,
    hasCommentControl: false,
    hasVoiceDemo: false,
    priority: '',
    hasFeaturedProfile: false,
  },
  {
    signature: 'SILVER' as SIGNATURE,
    name: 'Prata',
    description: 'Ideal para quem está começando',
    price: 29.90,
    maxPhotos: 5,
    maxVideos: 1,
    maxProfileUpdates: 5,
    hasCommentControl: true,
    hasVoiceDemo: false,
    priority: '',
    hasFeaturedProfile: false,
  },
  {
    signature: 'GOLD' as SIGNATURE,
    name: 'Ouro',
    description: 'Perfeito para quem quer crescer',
    price: 49.90,
    maxPhotos: 10,
    maxVideos: 2,
    maxProfileUpdates: 10,
    hasCommentControl: true,
    hasVoiceDemo: true,
    priority: 'Alta',
    hasFeaturedProfile: false,
  },
  {
    signature: 'DIAMOND' as SIGNATURE,
    name: 'Diamante',
    description: 'O melhor para quem quer se destacar',
    price: 79.90,
    maxPhotos: 20,
    maxVideos: 5,
    maxProfileUpdates: -1, // Ilimitado
    hasCommentControl: true,
    hasVoiceDemo: true,
    priority: 'Máxima',
    hasFeaturedProfile: true,
  },
];

async function upsertManyByName<T extends { id: number; name: string }>(
  model: {
    upsert: (args: {
      where: { name: string };
      update: Omit<T, "id">;
      create: T;
    }) => Promise<any>;
  },
  data: T[],
  label: string
) {
  console.log(`🌱 ${label}...`);

  for (const item of data) {
    const { id, ...rest } = item;

    await model.upsert({
      where: { name: item.name },
      update: rest,
      create: item,
    });
  }

  console.log(`🌱 ${label} OK`);
}

async function upsertMany<T extends { id: number }>(
  model: {
    upsert: (args: {
      where: { id: number };
      update: T;
      create: T;
    }) => Promise<any>;
  },
  data: T[],
  label: string
) {
  console.log(`🌱 ${label}...`);

  for (const item of data) {
    await model.upsert({
      where: { id: item.id },
      update: item,
      create: item,
    });
  }

  console.log(`🌱 ${label} OK`);
}

async function upsertSubscriptionPlans() {
  console.log('🌱 subscriptionPlans...');

  for (const plan of SUBSCRIPTION_PLANS) {
    await prisma.subscriptionPlan.upsert({
      where: { signature: plan.signature },
      update: plan,
      create: plan,
    });
  }

  console.log('🌱 subscriptionPlans OK');
}

async function main() {
  console.log("🌱 Iniciando seed...");

  await upsertManyByName(
    prisma.contactOption,
    CONTACT_OPTIONS,
    "contactOption"
  );
  await upsertManyByName(
    prisma.appearanceOption,
    APPEARANCE_OPTIONS,
    "appearanceOption"
  );
  await upsertManyByName(
    prisma.locationOption,
    LOCATIONS_OPTIONS,
    "locationOption"
  );
  await upsertManyByName(
    prisma.amenityOption,
    AMENITIES_OPTIONS,
    "amenityOption"
  );
  await upsertManyByName(prisma.fetishOption, FETICHES_OPTIONS, "fetishOption");
  await upsertManyByName(
    prisma.serviceOption,
    SERVICE_OPTIONS,
    "serviceOption"
  );
  await upsertManyByName(
    prisma.audienceOption,
    AUDIENCE_OPTIONS,
    "audienceOption"
  );
  await upsertManyByName(prisma.priceOption, PRICE_OPTIONS, "priceOption");
  await upsertManyByName(
    prisma.paymentOption,
    PAYMENT_OPTIONS,
    "paymentOption"
  );

  // Seed dos planos de assinatura
  await upsertSubscriptionPlans();

  console.log("🌱 Seed finalizado com sucesso!");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
