import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { updateProducerVerificationStatus } from "@/lib/profile-verification";

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { contactId, value, isPublic, isPrimary } = body;

    if (!contactId || typeof value !== "string") {
      return NextResponse.json(
        { error: "contactId e value são obrigatórios" },
        { status: 400 }
      );
    }

    // 🔎 Busca o contato existente
    const existingContact = await prisma.producerContact.findUnique({
      where: { id: contactId },
      include: {
        profile: {
          select: { id: true, producerId: true },
        },
      },
    });

    if (!existingContact) {
      return NextResponse.json(
        { error: "Contato não encontrado" },
        { status: 404 }
      );
    }

    // 🔐 (Opcional) Aqui você pode validar se o usuário é dono do profile
    // ex: comparar session.user.id com producer.userId

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
