import { prisma } from "@/utils/prisma";
import { type NextRequest, NextResponse } from "next/server";

// Função para calcular idade a partir da data de nascimento
function calculateAge(birthday: Date): number {
  const today = new Date();
  const birthDate = new Date(birthday);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age;
}

// Transforma os dados do banco para o formato esperado pelos componentes
function transformProducer(dbProducer: any) {
  const user = dbProducer.user;
  const profile = dbProducer.profile;

  return {
    id: dbProducer.id,
    userId: dbProducer.userId,
    user: user,
    signature: dbProducer.signature,
    verificationStatus: dbProducer.verificationStatus,
    isVerified: dbProducer.isVerified,
    birthday: dbProducer.birthday,
    document: dbProducer.document,
    nationality: dbProducer.nationality,
    phone: dbProducer.phone,
    profile: {
      id: profile?.id,
      producerId: profile?.producerId,
      name: user?.name || "",
      gender: user?.gender?.toLowerCase() || "",
      images: profile?.images || [],
      age: calculateAge(dbProducer.birthday),
      slogan: profile?.slogan || "",
      description: profile?.description || "",
      scholarity: profile?.scholarity || "",
      languages: profile?.languages || [],
      hasLocal: profile?.hasLocal || false,
      views: profile?.views || 0,
      local: profile?.local,
      appearance: profile?.appearance || [],
      prices: profile?.prices || [],
      services: profile?.services || [],
      fetiches: profile?.fetiches || [],
      audience: profile?.audience || [],
      locations: profile?.locations || [],
      payments: profile?.payments || [],
      reviews: profile?.reviews || [],
    },
    // Campos de compatibilidade com o formato antigo usado nos componentes
    locality: {
      country: user?.locality?.country || "Brasil",
      state: user?.locality?.state || "",
      city: user?.locality?.city || "",
      neighborhood: user?.locality?.neighborhood || "",
      hasLocal: profile?.hasLocal || false,
      locations: {
        athome:
          profile?.locations?.some((l: any) => l.option?.name === "athome") ||
          false,
        hotels:
          profile?.locations?.some((l: any) => l.option?.name === "hotels") ||
          false,
        motels:
          profile?.locations?.some((l: any) => l.option?.name === "motels") ||
          false,
        events:
          profile?.locations?.some((l: any) => l.option?.name === "events") ||
          false,
      },
      local: profile?.local
        ? {
            state: profile.local.state,
            city: profile.local.city,
            neighborhood: profile.local.neighborhood,
            amenities:
              profile.local.amenities?.reduce((acc: any, a: any) => {
                acc[a.option?.name] = true;
                return acc;
              }, {}) || {},
          }
        : null,
    },
    // Reviews no formato esperado
    reviews:
      profile?.reviews?.map((r: any) => ({
        id: r.id,
        userId: r.userId,
        userName: r.user?.name || "Anônimo",
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt,
      })) || [],
    // Preços no formato esperado
    prices:
      profile?.prices?.map((p: any) => ({
        duration: p.option?.label || p.option?.name || "",
        price: p.value,
      })) || [],
    // Serviços no formato esperado
    services: {
      mans:
        profile?.audience?.some((a: any) => a.option?.name === "mans") || false,
      women:
        profile?.audience?.some((a: any) => a.option?.name === "women") ||
        false,
      couple:
        profile?.audience?.some((a: any) => a.option?.name === "couple") ||
        false,
      group:
        profile?.audience?.some((a: any) => a.option?.name === "group") ||
        false,
      offered: profile?.services?.reduce(
        (acc: any, s: any) => {
          if (s.status === "active" || s.status === "yes") {
            acc[s.option?.name] = true;
          }
          return acc;
        },
        {
          fetishes:
            profile?.fetiches?.reduce((acc: any, f: any) => {
              acc[f.option?.name] = true;
              return acc;
            }, {}) || {},
        }
      ) || { fetishes: {} },
    },
    // Pagamentos no formato esperado
    payments:
      profile?.payments?.reduce((acc: any, p: any) => {
        acc[p.option?.name] = true;
        return acc;
      }, {}) || {},
    // Aparência no formato esperado
    appearance:
      profile?.appearance?.reduce((acc: any, a: any) => {
        const name = a.appearance?.name || a.appearance?.label;
        if (a.appearance?.type === "select") {
          acc[a.appearance?.label || name] = a.appearance?.label;
        } else if (a.height !== null) {
          acc["Altura"] = a.height;
        } else if (a.mannequin !== null) {
          acc["Manequim"] = a.mannequin;
        } else if (a.feet !== null) {
          acc["Pés"] = a.feet;
        }
        if (a.tattoos !== null) acc["Tatuagens"] = a.tattoos;
        if (a.piercings !== null) acc["Piercings"] = a.piercings;
        if (a.silicone !== null) acc["Silicone"] = a.silicone;
        return acc;
      }, {}) || {},
    // Metadata para compatibilidade
    metadata: {
      createdAt: user?.createdAt || new Date().toISOString(),
      lastLogin: user?.updatedAt || new Date().toISOString(),
      email: user?.email || "",
      status: dbProducer.isVerified ? "active" : "pending",
      verified: dbProducer.isVerified,
      signature: dbProducer.signature,
      views: profile?.views || 0,
    },
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ uf: string }> }
) {
  try {
    const { uf } = await params;
    const normalizedUf = uf.toUpperCase();

    const producers = await prisma.producer.findMany({
      where: {
        user: {
          locality: {
            state: normalizedUf,
          },
        },
        profile: {
          isNot: null,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            gender: true,
            createdAt: true,
            updatedAt: true,
            locality: true,
          },
        },
        profile: {
          include: {
            appearance: {
              include: { appearance: true },
            },
            prices: {
              include: { option: true },
            },
            services: {
              include: { option: true },
            },
            fetiches: {
              include: { option: true },
            },
            audience: {
              include: { option: true },
            },
            locations: {
              include: { option: true },
            },
            payments: {
              include: { option: true },
            },
            local: {
              include: { amenities: { include: { option: true } } },
            },
            reviews: {
              include: {
                user: {
                  select: { id: true, name: true },
                },
              },
            },
          },
        },
      },
    });

    const transformedProducers = producers.map(transformProducer);

    return NextResponse.json(transformedProducers, { status: 200 });
  } catch (error) {
    console.error("[API Catalog] Erro ao buscar produtores:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
