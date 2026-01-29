import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const planFilter = searchParams.get("plan");
    const statusFilter = searchParams.get("status");
    const searchQuery = searchParams.get("search");

    const searchConditions = searchQuery
      ? {
          OR: [
            { user: { name: { contains: searchQuery } } },
            { user: { email: { contains: searchQuery } } },
            { name: { contains: searchQuery } },
            { phone: { contains: searchQuery } },
            { document: { contains: searchQuery } },
          ],
        }
      : {};

    const advertisers = await prisma.producer.findMany({
      where: {
        user: { role: "ADVERTISER" },
        ...(statusFilter && { verificationStatus: statusFilter as any }),
        ...(planFilter && { signature: planFilter as any }),
        ...searchConditions,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
          },
        },
        profile: {
          select: {
            id: true,
            views: true,
            contacts: { select: { id: true } },
            profileViews: {
              where: {
                viewedAt: {
                  gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                },
              },
              select: { id: true },
            },
          },
        },
      },
      orderBy: { user: { createdAt: "desc" } },
    });

    const processedAdvertisers = advertisers.map((advertiser) => ({
      id: advertiser.id,
      userId: advertiser.user.id,
      name: advertiser.user.name,
      producerName: advertiser.name,
      email: advertiser.user.email,
      signature: advertiser.signature,
      verificationStatus: advertiser.verificationStatus,
      phone: advertiser.phone,
      document: advertiser.document,
      createdAt: advertiser.user.createdAt,
      profile: advertiser.profile
        ? {
            id: advertiser.profile.id,
            views: advertiser.profile.views,
            weeklyViews: advertiser.profile.profileViews.length,
            contacts: advertiser.profile.contacts.length,
          }
        : null,
    }));

    return NextResponse.json(processedAdvertisers);
  } catch (error) {
    console.error("Erro ao buscar anunciantes:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const advertiserId = searchParams.get("id");
    const body = await request.json();

    if (!advertiserId) {
      return NextResponse.json(
        { error: "ID do anunciante é obrigatório" },
        { status: 400 },
      );
    }

    const { signature, verificationStatus } = body;

    const updatedAdvertiser = await prisma.producer.update({
      where: { id: parseInt(advertiserId) },
      data: {
        ...(signature && { signature }),
        ...(verificationStatus && { verificationStatus }),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
          },
        },
        profile: {
          select: {
            id: true,
            views: true,
            contacts: { select: { id: true } },
            profileViews: {
              where: {
                viewedAt: {
                  gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                },
              },
              select: { id: true },
            },
          },
        },
      },
    });

    const processedAdvertiser = {
      id: updatedAdvertiser.id,
      userId: updatedAdvertiser.user.id,
      name: updatedAdvertiser.user.name,
      producerName: updatedAdvertiser.name,
      email: updatedAdvertiser.user.email,
      signature: updatedAdvertiser.signature,
      verificationStatus: updatedAdvertiser.verificationStatus,
      phone: updatedAdvertiser.phone,
      document: updatedAdvertiser.document,
      createdAt: updatedAdvertiser.user.createdAt,
      profile: updatedAdvertiser.profile
        ? {
            id: updatedAdvertiser.profile.id,
            views: updatedAdvertiser.profile.views,
            weeklyViews: updatedAdvertiser.profile.profileViews.length,
            contacts: updatedAdvertiser.profile.contacts.length,
          }
        : null,
    };

    return NextResponse.json(processedAdvertiser);
  } catch (error) {
    console.error("Erro ao atualizar anunciante:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
