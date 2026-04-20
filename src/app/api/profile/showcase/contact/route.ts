import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { updateProducerVerificationStatus } from "@/lib/profile-verification";
import { auth } from "@/auth";
import { canUpdateProfile, logSubscriptionUsage } from "@/lib/subscription";

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { contactId, value, isPublic, isPrimary } = body;

    if (!contactId || typeof value !== "string") {
      return NextResponse.json(
        { error: "contactId e value são obrigatórios" },
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

    // 🔎 Busca o contato existente
    const existingContact = await prisma.producerContact.findUnique({
      where: { id: contactId },
      include: {
        profile: {
          select: { id: true, producerId: true },
          include: {
            producer: {
              select: { userId: true }
            }
          }
        },
      },
    });

    if (!existingContact) {
      return NextResponse.json(
        { error: "Contato não encontrado" },
        { status: 404 }
      );
    }

    // Verificar se o contato pertence ao usuário logado
    if (existingContact.profile.producer.userId !== parseInt(session.user.id)) {
      return NextResponse.json(
        { error: "Contato não autorizado" },
        { status: 403 }
      );
    }

    // ✏️ Atualiza
    const updatedContact = await prisma.producerContact.update({
      where: { id: contactId },
      data: {
        value,
        ...(typeof isPublic === "boolean" && { isPublic }),
        ...(typeof isPrimary === "boolean" && { isPrimary }),
      },
      include: {
        option: true,
      },
    });

    // Registrar uso da assinatura
    // await logSubscriptionUsage(parseInt(session.user.id), 'profile_update', `contact-${contactId}`, {
    //   field: 'contact',
    //   contactType: updatedContact.option?.name,
    //   value: value,
    // });

    // Atualiza o status de verificação do perfil
    await updateProducerVerificationStatus(existingContact.profile.producerId);

    return NextResponse.json(updatedContact, { status: 200 });
  } catch (error) {
    console.error("[CONTACT PUT ERROR]", error);

    return NextResponse.json(
      { error: "Erro interno ao salvar contato" },
      { status: 500 }
    );
  }
}
