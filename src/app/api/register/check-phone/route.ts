import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get("phone");

    if (!phone) {
      return NextResponse.json(
        { error: "Telefone é obrigatório." },
        { status: 400 },
      );
    }

    // Remove formatting for comparison
    const cleanPhone = phone.replace(/\D/g, "");

    // Check if phone exists
    const existingProducer = await prisma.producer.findFirst({
      where: {
        OR: [
          { phone: phone },
          { phone: cleanPhone },
          { phone: { contains: cleanPhone } },
        ],
      },
      select: { id: true },
    });

    return NextResponse.json({ exists: !!existingProducer });
  } catch (error: any) {
    console.error("[v0] Check phone error:", error);
    return NextResponse.json(
      { error: "Erro ao verificar telefone." },
      { status: 500 },
    );
  }
}
