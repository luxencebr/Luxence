import { auth } from "@/auth";
import { deleteProfileImageUrl, uploadProfileImage } from "@/lib/profile-media";
import { updateProducerVerificationStatus } from "@/lib/profile-verification";
import { prisma } from "@/utils/prisma";
import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";

const audienceNames: Record<string, string> = {
  MALE: "masculino",
  FEMALE: "feminino",
  TRANS: "trans",
};

async function ownedProducer() {
  const session = await auth();
  const userId = Number(session?.user?.id);
  if (!Number.isInteger(userId) || userId <= 0) return null;
  return prisma.producer.findFirst({
    where: { userId, user: { isDeleted: false } },
    include: {
      user: { include: { locality: true, preferences: true } },
      profile: { include: { contacts: true, prices: true, payments: true } },
    },
  });
}

export async function GET(request: Request) {
  const producer = await ownedProducer();
  if (!producer?.profile) return NextResponse.json({ error: "Perfil não encontrado" }, { status: 404 });

  const [priceOptions, paymentOptions, contactOptions] = await Promise.all([
    prisma.priceOption.findMany({ orderBy: { id: "asc" }, select: { id: true, name: true, label: true } }),
    prisma.paymentOption.findMany({ orderBy: { id: "asc" }, select: { id: true, name: true, label: true } }),
    prisma.contactOption.findMany({ orderBy: { id: "asc" }, select: { id: true, name: true, label: true } }),
  ]);

  const region = request.headers.get("cf-region-code")?.toUpperCase();
  const cityHeader = request.headers.get("cf-ipcity");
  const locationFromIp = region && /^[A-Z]{2}$/.test(region) && cityHeader && cityHeader.length < 100;
  const location = locationFromIp
    ? { state: region, city: cityHeader }
    : { state: producer.user.locality?.state || "RJ", city: producer.user.locality?.city || "Rio de Janeiro" };

  return NextResponse.json({
    producerId: producer.id,
    profileId: producer.profile.id,
    name: producer.profile.name || "",
    age: producer.profile.age,
    images: Array.isArray(producer.profile.images) ? producer.profile.images.length : 0,
    contact: producer.profile.contacts.find((item) => item.value.trim()) || null,
    prices: producer.profile.prices,
    payments: producer.profile.payments,
    languages: producer.profile.languages,
    location,
    locationSource: locationFromIp ? "ip" : "default",
    priceOptions,
    paymentOptions,
    contactOptions,
  });
}

export async function POST(request: Request) {
  const producer = await ownedProducer();
  if (!producer?.profile) return NextResponse.json({ error: "Perfil não encontrado" }, { status: 404 });

  let newImage: Awaited<ReturnType<typeof uploadProfileImage>> | null = null;
  let saved = false;
  try {
    const data = await request.formData();
    const name = String(data.get("name") || "").trim();
    const age = Number(data.get("age"));
    const contact = String(data.get("contact") || "").trim();
    const contactOptionId = Number(data.get("contactOptionId"));
    const priceOptionId = Number(data.get("priceOptionId"));
    const price = Number(String(data.get("price") || "").replace(",", "."));
    const paymentOptionId = Number(data.get("paymentOptionId"));
    const language = String(data.get("language") || "").trim();
    const state = String(data.get("state") || "").trim().toUpperCase();
    const city = String(data.get("city") || "").trim();
    const file = data.get("image");
    const existingImages = Array.isArray(producer.profile.images) ? producer.profile.images : [];

    if (!/^[a-zA-ZÀ-ÿ\s]{2,80}$/.test(name) || !Number.isInteger(age) || age < 18 || age > 99 ||
        contact.length < 6 || contact.length > 100 || !Number.isInteger(contactOptionId) ||
        !Number.isInteger(priceOptionId) || !Number.isFinite(price) || price <= 0 ||
        !Number.isInteger(paymentOptionId) || !["Português", "Inglês", "Espanhol"].includes(language) ||
        !/^[A-Z]{2}$/.test(state) || !city || city.length > 100 ||
        (existingImages.length === 0 && (!(file instanceof File) || file.size === 0))) {
      return NextResponse.json({ error: "Preencha todos os dados obrigatórios, incluindo uma foto e um valor válido." }, { status: 400 });
    }

    const audience = [...new Set(producer.user.preferences
      .map((item) => audienceNames[item.gender])
      .filter((item): item is string => Boolean(item)))];
    if (audience.length === 0) {
      return NextResponse.json({ error: "Selecione ao menos um público atendido no cadastro." }, { status: 400 });
    }

    const [contactOption, priceOption, paymentOption, audienceOptions] = await Promise.all([
      prisma.contactOption.findUnique({ where: { id: contactOptionId } }),
      prisma.priceOption.findUnique({ where: { id: priceOptionId } }),
      prisma.paymentOption.findUnique({ where: { id: paymentOptionId } }),
      prisma.audienceOption.findMany({ where: { name: { in: audience } } }),
    ]);
    if (!contactOption || !priceOption || !paymentOption || audienceOptions.length !== audience.length) {
      return NextResponse.json({ error: "Opções de cadastro inválidas." }, { status: 400 });
    }

    if (file instanceof File && file.size > 0) {
      if (existingImages.length >= 3) return NextResponse.json({ error: "Limite de fotos do plano gratuito atingido." }, { status: 400 });
      newImage = await uploadProfileImage(producer.profile.id, file);
    }

    const profileId = producer.profile.id;
    await prisma.$transaction(async (tx) => {
      await tx.producerProfile.update({
        where: { id: profileId },
        data: {
          name,
          age,
          languages: [{ name: language, level: "Fluente" }],
          ...(newImage ? { images: [...existingImages, newImage] as Prisma.InputJsonValue } : {}),
        },
      });

      const existingContact = producer.profile!.contacts.find((item) => item.contactId === contactOptionId);
      if (existingContact) {
        await tx.producerContact.update({ where: { id: existingContact.id }, data: { value: contact, isPublic: true, isPrimary: true } });
      } else {
        await tx.producerContact.create({ data: { profileId, contactId: contactOptionId, value: contact, isPublic: true, isPrimary: true } });
      }
      await tx.producerPrice.upsert({
        where: { profileId_priceId: { profileId, priceId: priceOptionId } },
        create: { profileId, priceId: priceOptionId, value: price },
        update: { value: price },
      });
      await tx.producerPayment.upsert({
        where: { profileId_paymentId: { profileId, paymentId: paymentOptionId } },
        create: { profileId, paymentId: paymentOptionId },
        update: {},
      });
      for (const option of audienceOptions) {
        await tx.producerAudience.upsert({
          where: { profileId_audienceId: { profileId, audienceId: option.id } },
          create: { profileId, audienceId: option.id, status: "yes" },
          update: { status: "yes" },
        });
      }
      await tx.locality.upsert({
        where: { userId: producer.userId },
        create: { userId: producer.userId, country: "Brasil", state, city },
        update: { state, city },
      });
    });
    saved = true;

    const verification = await updateProducerVerificationStatus(producer.id);
    return NextResponse.json({ ...verification, producerId: producer.id });
  } catch (error) {
    if (newImage && !saved) await deleteProfileImageUrl(newImage.url).catch(() => {});
    console.error("[PROFILE ONBOARDING ERROR]", error);
    return NextResponse.json({ error: "Não foi possível concluir o perfil. Tente novamente." }, { status: 500 });
  }
}
