import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/utils/prisma";

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const { profileId, bio } = await req.json();

    if (!profileId) {
      return NextResponse.json(
        { error: "profileId não fornecido." },
        { status: 400 }
      );
    }

    // Validar se o perfil pertence ao usuário logado
    const profile = await prisma.producerProfile.findFirst({
      where: { 
        id: profileId,
        producer: {
          userId: parseInt(session.user.id)
        }
      },
    });

    if (!profile) {
      return NextResponse.json(
        { error: "Perfil não encontrado ou não autorizado" },
        { status: 404 }
      );
    }

    // Validar bio
    if (bio && bio.length > 1000) {
      return NextResponse.json(
        { error: "Bio deve ter no máximo 1000 caracteres" },
        { status: 400 }
      );
    }

    await prisma.producerProfile.update({
      where: { id: profileId },
      data: {
        description: bio || null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Erro ao atualizar about:", err);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
