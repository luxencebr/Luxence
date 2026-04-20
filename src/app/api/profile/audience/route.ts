import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/utils/prisma";
import { updateProducerVerificationStatus } from "@/lib/profile-verification";
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

    const { profileId, languages, audience } = await req.json();

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

    // Validar languages
    if (languages && (!Array.isArray(languages) || languages.some(lang => typeof lang !== 'object' || !lang.name || !lang.level || typeof lang.name !== 'string' || typeof lang.level !== 'string'))) {
      return NextResponse.json(
        { error: "Languages deve ser um array de objetos com name e level" },
        { status: 400 }
      );
    }

    // Validar audience
    if (audience && (!Array.isArray(audience) || audience.some(a => !a.audienceId || typeof a.status !== 'string' || !['yes', 'no', 'neutral'].includes(a.status)))) {
      return NextResponse.json(
        { error: "Audience deve ser um array com audienceId e status válido (yes, no, neutral)" },
        { status: 400 }
      );
    }

    // Verificar se os IDs de audiência existem
    if (audience && audience.length > 0) {
      const audienceIds = audience.map((a: any) => a.audienceId);
      const existingOptions = await prisma.audienceOption.findMany({
        where: { id: { in: audienceIds } },
        select: { id: true }
      });
      
      const existingIds = existingOptions.map(opt => opt.id);
      const invalidIds = audienceIds.filter((id: any) => !existingIds.includes(id));
      
      if (invalidIds.length > 0) {
        return NextResponse.json(
          { error: `IDs de audiência inválidos: ${invalidIds.join(', ')}` },
          { status: 400 }
        );
      }
    }

    let producerId: number | null = null;

    await prisma.$transaction(async (tx) => {
      // 🔹 Atualiza idiomas (JSON no profile)
      const updatedProfile = await tx.producerProfile.update({
        where: { id: profileId },
        data: {
          languages: languages ?? [],
        },
        select: { producerId: true },
      });

      producerId = updatedProfile.producerId;

      // 🔹 Remove audience anterior
      await tx.producerAudience.deleteMany({
        where: { profileId },
      });

      // 🔹 Cria novo audience
      if (audience?.length) {
        await tx.producerAudience.createMany({
          data: audience.map((a: any) => ({
            profileId,
            audienceId: a.audienceId,
            status: a.status,
          })),
        });
      }
    });

    // Registrar uso da assinatura
    // await logSubscriptionUsage(parseInt(session.user.id), 'profile_update', `audience-${profileId}`, {
    //   field: 'audience',
    //   languagesCount: languages?.length || 0,
    //   audienceCount: audience?.length || 0,
    // });

    // Atualiza o status de verificação do perfil
    if (producerId) {
      await updateProducerVerificationStatus(producerId);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Erro ao atualizar audience:", err);
    
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
