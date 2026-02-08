import { NextResponse } from "next/server";
import { verifyProfileCompletion, updateProducerVerificationStatus } from "@/lib/profile-verification";

/**
 * GET - Verifica o status de completude do perfil sem atualizar no banco
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const producerId = Number(searchParams.get("producerId"));

    if (!producerId || isNaN(producerId)) {
      return NextResponse.json(
        { error: "producerId é obrigatório" },
        { status: 400 }
      );
    }

    const verification = await verifyProfileCompletion(producerId);

    return NextResponse.json(verification);
  } catch (error) {
    console.error("[PROFILE VERIFICATION GET ERROR]", error);
    return NextResponse.json(
      { error: "Erro ao verificar perfil" },
      { status: 500 }
    );
  }
}

/**
 * POST - Atualiza o status de verificação do perfil no banco de dados
 */
export async function POST(req: Request) {
  try {
    const { producerId } = await req.json();

    if (!producerId) {
      return NextResponse.json(
        { error: "producerId é obrigatório" },
        { status: 400 }
      );
    }

    const verification = await updateProducerVerificationStatus(producerId);

    return NextResponse.json(verification);
  } catch (error) {
    console.error("[PROFILE VERIFICATION POST ERROR]", error);
    return NextResponse.json(
      { error: "Erro ao atualizar status do perfil" },
      { status: 500 }
    );
  }
}
