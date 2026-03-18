import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/utils/prisma";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: parseInt(session.user.id) },
      select: {
        emailNotifications: true,
        whatsappNotifications: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Erro ao buscar configurações de notificação:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { emailNotifications, whatsappNotifications } = body;

    // Validar que pelo menos um campo foi enviado
    if (emailNotifications === undefined && whatsappNotifications === undefined) {
      return NextResponse.json(
        { error: "Nenhuma configuração fornecida" },
        { status: 400 }
      );
    }

    // Preparar dados para atualização
    const updateData: any = {};
    if (emailNotifications !== undefined) {
      updateData.emailNotifications = Boolean(emailNotifications);
    }
    if (whatsappNotifications !== undefined) {
      updateData.whatsappNotifications = Boolean(whatsappNotifications);
    }

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(session.user.id) },
      data: updateData,
      select: {
        emailNotifications: true,
        whatsappNotifications: true,
      },
    });

    return NextResponse.json({
      message: "Configurações atualizadas com sucesso",
      ...updatedUser,
    });
  } catch (error) {
    console.error("Erro ao atualizar configurações de notificação:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}