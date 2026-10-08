import { createHash, createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { Prisma } from "@prisma/client";
import type { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";

const VISITOR_COOKIE = "luxence_visitor";
const DAY_MS = 24 * 60 * 60 * 1000;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const BOT_PATTERN = /bot|crawl|spider|slurp|headless|lighthouse|facebookexternalhit|preview|curl|wget|python-requests|node-fetch/i;

function signVisitorId(id: string, secret: string): string {
  return createHmac("sha256", secret).update(id).digest("hex");
}

function readVisitorId(request: NextRequest, secret: string): string | null {
  const value = request.cookies.get(VISITOR_COOKIE)?.value;
  if (!value) return null;

  const [id, signature] = value.split(".");
  if (!id || !UUID_PATTERN.test(id) || !signature || !/^[a-f0-9]{64}$/.test(signature)) {
    return null;
  }

  const expected = Buffer.from(signVisitorId(id, secret), "hex");
  if (!timingSafeEqual(expected, Buffer.from(signature, "hex"))) return null;
  return id;
}

export function getVisitorIdentity(
  request: NextRequest,
  userId?: string,
): { visitorHash: string; cookieValue?: string } | null {
  const userAgent = request.headers.get("user-agent") || "";
  if (!userAgent || BOT_PATTERN.test(userAgent)) return null;

  if (userId) {
    return {
      visitorHash: createHash("sha256").update(`user:${userId}`).digest("hex"),
    };
  }

  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET não configurado para visitas anônimas");

  const existingId = readVisitorId(request, secret);
  const id = existingId || randomUUID();

  return {
    visitorHash: createHash("sha256").update(`anonymous:${id}`).digest("hex"),
    cookieValue: existingId ? undefined : `${id}.${signVisitorId(id, secret)}`,
  };
}

export function setVisitorCookie(response: NextResponse, cookieValue?: string): void {
  if (!cookieValue) return;
  response.cookies.set(VISITOR_COOKIE, cookieValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 365 * 24 * 60 * 60,
    path: "/",
  });
}

export async function countUniqueProfileView(
  profileId: number,
  visitorHash: string,
): Promise<number | null> {
  const now = new Date();
  const cutoff = new Date(now.getTime() - DAY_MS);

  try {
    return await prisma.$transaction(async (tx) => {
      const visitor = await tx.profileVisitor.findUnique({
        where: { profileId_visitorHash: { profileId, visitorHash } },
        select: { lastCountedAt: true },
      });

      if (visitor) {
        if (visitor.lastCountedAt > cutoff) return null;

        const claimed = await tx.profileVisitor.updateMany({
          where: { profileId, visitorHash, lastCountedAt: { lte: cutoff } },
          data: { lastCountedAt: now },
        });
        if (claimed.count === 0) return null;
      } else {
        await tx.profileVisitor.create({ data: { profileId, visitorHash, lastCountedAt: now } });
      }

      await tx.profileView.create({ data: { profileId, viewedAt: now } });
      const profile = await tx.producerProfile.update({
        where: { id: profileId },
        data: { views: { increment: 1 } },
        select: { views: true },
      });
      return profile.views;
    }, { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted });
  } catch (error) {
    // Outra requisição do mesmo visitante criou a chave primeiro.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return null;
    }
    throw error;
  }
}
