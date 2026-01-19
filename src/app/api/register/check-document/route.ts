import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const document = searchParams.get("document");

    if (!document) {
      return NextResponse.json(
        { error: "Documento é obrigatório." },
        { status: 400 },
      );
    }

    // Remove formatting for comparison
    const cleanDocument = document.replace(/\D/g, "");

    // Check if document exists - search both with and without formatting
    const existingProducer = await prisma.producer.findFirst({
      where: {
        OR: [
          { document: document },
          { document: cleanDocument },
          // Also check formatted versions
          { document: { contains: cleanDocument } },
        ],
      },
      select: { id: true },
    });

    return NextResponse.json({ exists: !!existingProducer });
  } catch (error: any) {
    console.error("[v0] Check document error:", error);
    return NextResponse.json(
      { error: "Erro ao verificar documento." },
      { status: 500 },
    );
  }
}
