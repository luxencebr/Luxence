import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/utils/prisma";
import { verifyProfileCompletion, updateProducerVerificationStatus } from "@/lib/profile-verification";

/**
 * GET - Verifica o status de completude do perfil sem atualizar no banco
 */
export async function GET(req: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const producerId = Number(searchParams.get("producerId"));

    if (!producerId || isNaN(producerId)) {
      return NextResponse.json(
        { error: "producerId é obrigatório" },
        { status: 400 }
      );
    }

    // Verificar se o producer pertence ao usuário logado
    const producer = await prisma.producer.findFirst({
      where: {
        id: producerId,
        userId: parseInt(session.user.id)
      }
    });

    if (!producer) {
      return NextResponse.json(
        { error: "Producer não encontrado ou não autorizado" },
        { status: 404 }
      );
    }

    const verification = await verifyProfileCompletion(producerId);

    return NextResponse.json(verification);
  } catch (error) {
    console.error("[PROFILE VERIFICATION GET ERROR]", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

/**
 * POST - Atualiza o status de verificação do perfil no banco de dados
 */
export async function POST(req: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const { producerId } = await req.json();

    if (!producerId) {
      return NextResponse.json(
        { error: "producerId é obrigatório" },
        { status: 400 }
      );
    }

    // Verificar se o producer pertence ao usuário logado
    const producer = await prisma.producer.findFirst({
      where: {
        id: producerId,
        userId: parseInt(session.user.id)
      }
    });

    if (!producer) {
      return NextResponse.json(
        { error: "Producer não encontrado ou não autorizado" },
        { status: 404 }
      );
    }

    const verification = await updateProducerVerificationStatus(producerId);

    return NextResponse.json(verification);
  } catch (error) {
    console.error("[PROFILE VERIFICATION POST ERROR]", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
