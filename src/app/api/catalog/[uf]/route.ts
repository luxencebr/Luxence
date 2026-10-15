import { prisma } from "@/utils/prisma";
import { NextRequest, NextResponse } from "next/server";
import { GENDER } from "@prisma/client";
import { coordinatesForCeps, distanceKm, DISTANCE_RADII, isValidCoordinates, normalizeProfileCep, type Coordinates } from "@/lib/distance-filter";

type DistanceFilter = { coords: Coordinates; radius: number; gender: GENDER };

export async function POST(request: NextRequest, context: { params: Promise<{ uf: string }> }) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ error: "Filtro de distância inválido" }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "Filtro de distância inválido" }, { status: 400 });
  }
  const coords = { lat: body.lat, lng: body.lng } as Coordinates;
  const radius = body.radius;
  const gender = body.gender;
  if (typeof coords.lat !== "number" || typeof coords.lng !== "number" ||
      !isValidCoordinates(coords) || typeof radius !== "number" ||
      !DISTANCE_RADII.some((value) => value === radius) ||
      typeof gender !== "string" || !["female", "male", "trans"].includes(gender)) {
    return NextResponse.json({ error: "Filtro de distância inválido" }, { status: 400 });
  }
  return getCatalog(request, context, { coords, radius, gender: gender.toUpperCase() as GENDER });
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ uf: string }> },
) {
  return getCatalog(request, context);
}

async function getCatalog(
  request: NextRequest,
  { params }: { params: Promise<{ uf: string }> },
  distanceFilter?: DistanceFilter,
) {
  try {
    const { uf } = await params;
    const state = uf.toUpperCase();
    
    // Parâmetros de paginação
    const searchParams = request.nextUrl.searchParams;
    const page = Number(searchParams.get("page") || "1");
    const limit = Number(searchParams.get("limit") || "15");
    if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1 || limit > 50) {
      return NextResponse.json({ error: "Paginação inválida" }, { status: 400 });
    }
    const skip = (page - 1) * limit;

    const whereClause = {
      verificationStatus: "GREEN" as const,
      profile: {
        isNot: null,
      },
      user: {
        locality: {
          state,
        },
        isDeleted: false, // Excluir usuários com soft delete
        ...(distanceFilter ? { gender: distanceFilter.gender } : {}),
      },
    };

    // Buscar total de produtores para calcular se há mais páginas
    const totalCount = distanceFilter ? 0 : await prisma.producer.count({ where: whereClause });

    const producers = await prisma.producer.findMany({
      where: whereClause,
      include: {
        user: {
          include: {
            locality: true,
          },
        },
        profile: {
          include: {
            local: {
              include: {
                amenities: {
                  include: {
                    option: true,
                  },
                },
              },
            },
            appearance: {
              include: { option: true },
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
            reviews: {
              where: {
                isApproved: true,
              },
              include: { 
                user: { 
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    gender: true,
                    createdAt: true,
                    updatedAt: true,
                  }
                } 
              },
            },
          },
        },
      },
      ...(distanceFilter ? {} : { skip, take: limit }),
    });

    let selectedProducers = producers;
    let filteredTotal = totalCount;
    let unavailableLocations = 0;

    if (distanceFilter) {
      const ceps = producers.map((producer) => normalizeProfileCep(producer.profile?.local?.cep));
      const coordinates = await coordinatesForCeps(ceps);
      const nearby = producers.flatMap((producer, index) => {
        const location = coordinates.get(ceps[index]);
        if (!location) {
          unavailableLocations++;
          return [];
        }
        const km = distanceKm(distanceFilter.coords, location);
        return km <= distanceFilter.radius ? [{ producer, km }] : [];
      });
      nearby.sort((a, b) => a.km - b.km || a.producer.id - b.producer.id);
      filteredTotal = nearby.length;
      selectedProducers = nearby.slice(skip, skip + limit).map(({ producer }) => producer);
    }

    // Buscar assinaturas ativas separadamente para ordenação por prioridade
    const userIds = selectedProducers.map(p => p.userId);
    const activeSubscriptions = await prisma.subscription.findMany({
      where: {
        userId: { in: userIds },
        status: 'ACTIVE',
        endDate: { gte: new Date() },
      },
      include: {
        plan: true,
      },
      orderBy: {
        endDate: 'desc',
      },
    });

    // Criar mapa de assinaturas por usuário
    const subscriptionMap = new Map<number, (typeof activeSubscriptions)[number]>();
    activeSubscriptions.forEach((sub) => {
      if (!subscriptionMap.has(sub.userId)) {
        subscriptionMap.set(sub.userId, sub);
      }
    });

    // Ordenar por prioridade do plano (DIAMOND > GOLD > SILVER > COPPER)
    const priorityOrder = { 'DIAMOND': 4, 'GOLD': 3, 'SILVER': 2, 'COPPER': 1 };
    
    const sortedProducers = distanceFilter ? selectedProducers : selectedProducers.sort((a, b) => {
      const aSubscription = subscriptionMap.get(a.userId);
      const bSubscription = subscriptionMap.get(b.userId);
      
      const aPriority = aSubscription?.plan?.signature 
        ? priorityOrder[aSubscription.plan.signature as keyof typeof priorityOrder] || 1
        : 1; // COPPER como padrão
        
      const bPriority = bSubscription?.plan?.signature 
        ? priorityOrder[bSubscription.plan.signature as keyof typeof priorityOrder] || 1
        : 1; // COPPER como padrão
      
      // Ordenação decrescente (maior prioridade primeiro)
      return bPriority - aPriority;
    });

    const hasMore = skip + selectedProducers.length < filteredTotal;

    // CEP e endereço usados no cálculo permanecem somente no servidor.
    const publicProducers = sortedProducers.map((producer) => ({
      id: producer.id,
      userId: producer.userId,
      signature: producer.signature,
      verificationStatus: producer.verificationStatus,
      isVerified: producer.isVerified,
      name: producer.name,
      birthday: producer.birthday,
      nationality: producer.nationality,
      user: {
        id: producer.user.id,
        name: producer.user.name,
        gender: producer.user.gender,
        createdAt: producer.user.createdAt,
        locality: producer.user.locality ? {
          id: producer.user.locality.id,
          userId: producer.user.locality.userId,
          country: producer.user.locality.country,
          state: producer.user.locality.state,
          city: producer.user.locality.city,
          neighborhood: producer.user.locality.neighborhood,
        } : null,
      },
      profile: producer.profile ? {
        ...producer.profile,
        contacts: [],
        local: null,
        reviews: producer.profile.reviews.map((review) => ({
          id: review.id,
          rating: review.rating,
          isApproved: review.isApproved,
        })),
      } : null,
    }));

    return NextResponse.json({
      producers: publicProducers,
      pagination: {
        page,
        limit,
        total: filteredTotal,
        hasMore,
      },
      ...(distanceFilter ? { unavailableLocations } : {}),
    }, { status: 200, headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("[API CATALOG]", error);
    return NextResponse.json(
      { error: "Erro ao buscar produtores" },
      { status: 500 },
    );
  }
}
