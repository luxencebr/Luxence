import { NextRequest, NextResponse } from "next/server";
import { verifyProfileCompletion } from "@/lib/profile-verification";
import { prisma } from "@/utils/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const producerId = searchParams.get("producerId");

    if (!producerId) {
      return NextResponse.json(
        { error: "ID do produtor é obrigatório" },
        { status: 400 },
      );
    }

    const producerIdNum = parseInt(producerId);

    // Usar a mesma verificação de completude do sistema
    const verification = await verifyProfileCompletion(producerIdNum);

    // Buscar apenas nome e telefone (verifyProfileCompletion já validou a existência)
    const producer = await prisma.producer.findUnique({
      where: { id: producerIdNum },
      select: {
        phone: true,
        user: { select: { name: true } },
      },
    });

    if (!producer) {
      return NextResponse.json(
        { error: "Produtor não encontrado" },
        { status: 404 },
      );
    }

    const totalFields = verification.completedFields.length + verification.missingFields.length;
    const completionPercentage = totalFields > 0 
      ? Math.round((verification.completedFields.length / totalFields) * 100)
      : 0;

    return NextResponse.json({
      missing: verification.missingFields,
      completed: verification.completedFields,
      completionPercentage,
      producerName: producer.user.name,
      phone: producer.phone,
      isComplete: verification.isComplete,
    });
  } catch (error) {
    console.error("Erro ao verificar perfil:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
