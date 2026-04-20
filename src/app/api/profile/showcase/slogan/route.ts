import { prisma } from "@/utils/prisma";
import { auth } from "@/auth";
import { NextResponse } from "next/server";
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

    const { profileId, slogan } = await req.json();

    if (!profileId) {
      return NextResponse.json(
        { error: "profileId é obrigatório" },
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

    // Validar slogan
    if (slogan && slogan.length > 100) {
      return NextResponse.json(
        { error: "Slogan deve ter no máximo 100 caracteres" },
        { status: 400 }
      );
    }

    await prisma.producerProfile.update({
      where: { id: profileId },
      data: { slogan: slogan || null },
    });

    // Registrar uso da assinatura
    // await logSubscriptionUsage(parseInt(session.user.id), 'profile_update', `slogan-${profileId}`, {
    //   field: 'slogan',
    //   value: slogan,
    // });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao salvar slogan:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
