import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";

export async function POST(req: Request) {
  try {
    const {
      profileId,
      hasLocal,
      locality,
      local,
      locations,
      amenities,
      neighborhoods,
    } = await req.json();

    console.log(
      "📦 RECEBIDO DO FRONT:",
      JSON.stringify({
        profileId,
        hasLocal,
        locality,
        local,
        locations,
        amenities,
        neighborhoods, // Log neighborhoods
      })
    );

    if (!profileId) {
      return NextResponse.json(
        { error: "profileId é obrigatório" },
        { status: 400 }
      );
    }

    const profile = await prisma.producerProfile.findUnique({
      where: { id: Number(profileId) },
      include: {
        producer: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!profile) {
      return NextResponse.json(
        { error: "Perfil não encontrado" },
        { status: 404 }
      );
    }

    const userId = profile.producer.userId;

    // ----------------------------
    // 1) Atualiza locality no user
    // ----------------------------
    if (locality) {
      await prisma.locality.upsert({
        where: { userId },
        update: {
          country: locality.country,
          state: locality.state,
          city: locality.city,
          neighborhood: locality.neighborhood,
        },
        create: {
          userId,
          country: locality.country,
          state: locality.state,
          city: locality.city,
          neighborhood: locality.neighborhood,
        },
      });
    }

    // ----------------------------
    // 2) Atualiza hasLocal e neighborhoods do profile
    // ----------------------------
    await prisma.producerProfile.update({
      where: { id: profileId },
      data: {
        hasLocal,
        neighborhoods: neighborhoods || [], // Save neighborhoods as JSON
      },
    });

    // ----------------------------
    // 3) Atualiza LOCAL (local e amenities)
    // ----------------------------
    if (local) {
      // Remove antigo local
      await prisma.producerLocal.deleteMany({
        where: { profileId },
      });

      // Cria novo local
      const newLocal = await prisma.producerLocal.create({
        data: {
          profileId,
          cep: local.cep,
          country: local.country,
          state: local.state,
          city: local.city,
          neighborhood: local.neighborhood,
          street: local.street,
          number: local.number,
          complement: local.complement,
        },
      });

      // Remove amenidades antigas
      await prisma.localAmenity.deleteMany({
        where: { localId: newLocal.id },
      });

      // Cria novas amenidades
      if (amenities?.length) {
        await prisma.localAmenity.createMany({
          data: amenities.map((a: { amenityId: number }) => ({
            localId: newLocal.id,
            amenityId: a.amenityId,
          })),
        });
      }
    }

    // ----------------------------
    // 4) Atualiza LOCATIONS (atua onde)
    // ----------------------------
    await prisma.producerLocation.deleteMany({
      where: { profileId },
    });

    if (locations?.length) {
      await prisma.producerLocation.createMany({
        data: locations.map((loc: { locationId: number }) => ({
          profileId,
          locationId: loc.locationId,
        })),
      });
    }

    // ----------------------------
    // 5) Buscar dados atualizados
    // ----------------------------
    const updated = await prisma.producerProfile.findUnique({
      where: { id: Number(profileId) },
      include: {
        producer: {
          include: {
            user: { include: { locality: true } },
          },
        },
        local: {
          include: {
            amenities: { include: { option: true } },
          },
        },
        locations: {
          include: { option: true },
        },
      },
    });

    // ----------------------------
    // 6) Formatar resposta
    // ----------------------------
    const formatted = {
      hasLocal: updated?.hasLocal,
      neighborhoods: updated?.neighborhoods,
      locality: updated?.producer.user.locality,
      local: updated?.local
        ? {
            ...updated.local,
            amenities: updated.local.amenities.map((a) => ({
              id: a.id,
              amenityId: a.amenityId,
              option: a.option,
            })),
          }
        : null,
      locations: updated?.locations.map((loc) => ({
        id: loc.id,
        locationId: loc.locationId,
        option: loc.option,
      })),
    };

    return NextResponse.json(formatted);
  } catch (err) {
    console.error("LOCATION POST ERROR:", err);
    return NextResponse.json(
      { error: "SERVER_ERROR", details: String(err) },
      { status: 500 }
    );
  }
}
