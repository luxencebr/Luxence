import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/utils/prisma";
import { canUpdateProfile, logSubscriptionUsage } from "@/lib/subscription";

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

    // Verificar limitações de assinatura
    // const { canUpdate, reason } = await canUpdateProfile(parseInt(session.user.id));
    
    // if (!canUpdate) {
    //   return NextResponse.json(
    //     { error: reason || 'Não é possível atualizar o perfil' },
    //     { status: 403 }
    //   );
    // }

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

    // Registrar uso da assinatura
    // await logSubscriptionUsage(parseInt(session.user.id), 'profile_update', `bio-${profileId}`, {
    //   field: 'description',
    //   value: bio,
    // });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Erro ao atualizar about:", err);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
