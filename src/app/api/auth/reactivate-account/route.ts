import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { compareSync } from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email e senha são obrigatórios" },
        { status: 400 }
      );
    }

    // Buscar usuário excluído
    const user = await prisma.user.findFirst({
      where: { 
        email,
        isDeleted: true // Apenas usuários excluídos
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Conta não encontrada ou não foi excluída" },
        { status: 404 }
      );
    }

    // Verificar senha
    const passwordMatches = compareSync(password, user.password);
    if (!passwordMatches) {
      return NextResponse.json(
        { error: "Senha incorreta" },
        { status: 401 }
      );
    }

    // Reativar conta
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isDeleted: false,
        deletedAt: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Conta reativada com sucesso"
    });
  } catch (error) {
    console.error("Erro ao reativar conta:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}