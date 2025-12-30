import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const CONTACT_OPTIONS = [
  { id: 1, name: "whatsapp", label: "WhatsApp", icon: "whatsapp" },
  { id: 2, name: "telegram", label: "Telegram", icon: "telegram" },
  { id: 3, name: "instagram", label: "Instagram", icon: "instagram" },
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
  { id: 11, name: "separador", label: "---" },
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

async function main() {
  console.log("🌱 Iniciando seed...");

  await prisma.contactOption.createMany({
    data: CONTACT_OPTIONS,
    skipDuplicates: true,
  });
  console.log("🌱 contactOption OK");

  await prisma.locationOption.createMany({
    data: LOCATIONS_OPTIONS,
    skipDuplicates: true,
  });
  console.log("🌱 locationOption OK");

  await prisma.amenityOption.createMany({
    data: AMENITIES_OPTIONS,
    skipDuplicates: true,
  });
  console.log("🌱 amenityOption OK");

  await prisma.fetishOption.createMany({
    data: FETICHES_OPTIONS,
    skipDuplicates: true,
  });
  console.log("🌱 fetishOption OK");

  await prisma.serviceOption.createMany({
    data: SERVICE_OPTIONS,
    skipDuplicates: true,
  });
  console.log("🌱 serviceOption OK");

  await prisma.priceOption.createMany({
    data: PRICE_OPTIONS,
    skipDuplicates: true,
  });
  console.log("🌱 priceOption OK");

  await prisma.paymentOption.createMany({
    data: PAYMENT_OPTIONS,
    skipDuplicates: true,
  });
  console.log("🌱 paymentOption OK");

  console.log("🌱 Seed finalizado com sucesso!");
}

main()
  .then(() => prisma.$disconnect())
  .catch((err) => {
    console.error(err);
    prisma.$disconnect();
    process.exit(1);
  });
