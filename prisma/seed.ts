import { PrismaClient, APPEARANCE_VALUE_TYPE } from "@prisma/client";
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
    name: "breast_size",
    label: "Tamanho do peito",
    valueType: APPEARANCE_VALUE_TYPE.OPTION,
  },
  {
    id: 7,
    name: "butt_size",
    label: "Tamanho da bunda",
    valueType: APPEARANCE_VALUE_TYPE.OPTION,
  },
  {
    id: 8,
    name: "pe",
    label: "Número do pé",
    valueType: APPEARANCE_VALUE_TYPE.NUMBER,
  },
  {
    id: 9,
    name: "tatuagens",
    label: "Tatuagens",
    valueType: APPEARANCE_VALUE_TYPE.BOOLEAN,
  },
  {
    id: 10,
    name: "piercings",
    label: "Piercings",
    valueType: APPEARANCE_VALUE_TYPE.BOOLEAN,
  },
  {
    id: 11,
    name: "silicone",
    label: "Silicone",
    valueType: APPEARANCE_VALUE_TYPE.BOOLEAN,
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
  { id: 12, name: "preservativos", label: "Preservativos" },
  { id: 13, name: "wifi", label: "Wi-Fi" },
  { id: 14, name: "frigobar", label: "Frigobar" },
  { id: 15, name: "estacionamento", label: "Estacionamento" },
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

async function main() {
  console.log("🌱 Iniciando seed...");

  await upsertMany(prisma.contactOption, CONTACT_OPTIONS, "contactOption");
  await upsertMany(
    prisma.appearanceOption,
    APPEARANCE_OPTIONS,
    "appearanceOption"
  );
  await upsertMany(prisma.locationOption, LOCATIONS_OPTIONS, "locationOption");
  await upsertMany(prisma.amenityOption, AMENITIES_OPTIONS, "amenityOption");
  await upsertMany(prisma.fetishOption, FETICHES_OPTIONS, "fetishOption");
  await upsertMany(prisma.serviceOption, SERVICE_OPTIONS, "serviceOption");
  await upsertMany(prisma.priceOption, PRICE_OPTIONS, "priceOption");
  await upsertMany(prisma.paymentOption, PAYMENT_OPTIONS, "paymentOption");

  console.log("🌱 Seed finalizado com sucesso!");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
