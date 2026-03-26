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

    const { profileId, appearance } = await req.json();

    if (!profileId || !Array.isArray(appearance)) {
      return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
    }

    // Verificar limitações de assinatura
    const { canUpdate, reason } = await canUpdateProfile(parseInt(session.user.id));
    
    if (!canUpdate) {
      return NextResponse.json(
        { error: reason || 'Não é possível atualizar o perfil' },
        { status: 403 }
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

    await prisma.producerAppearance.deleteMany({
      where: { profileId },
    });

    const dataToCreate = appearance.map((a: any) => {
      let valueNumber = typeof a.valueNumber === "number" ? a.valueNumber : null;
      
      // Validação especial para dote (appearanceId 15)
      if (a.appearanceId === 15 && valueNumber !== null) {
        // Desconsiderar valor zero ou fora do range 0-99
        if (valueNumber <= 0 || valueNumber > 99) {
          valueNumber = null;
        }
      }

      return {
        profileId,
        appearanceId: a.appearanceId,
        valueBoolean: a.valueBoolean ?? null,
        valueNumber,
        valueString: typeof a.valueString === "string" ? a.valueString : null,
      };
    });

    if (dataToCreate.length > 0) {
      await prisma.producerAppearance.createMany({
        data: dataToCreate,
      });
    }

    // Registrar uso da assinatura
    await logSubscriptionUsage(parseInt(session.user.id), 'profile_update', `appearance-${profileId}`, {
      field: 'appearance',
      itemCount: dataToCreate.length,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao salvar aparência:", error);

    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
