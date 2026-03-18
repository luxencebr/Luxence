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

    // Buscar usuário independente do status de exclusão
    const user = await prisma.user.findFirst({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ status: "not_found" });
    }

    // Verificar senha
    const passwordMatches = compareSync(password, user.password);
    if (!passwordMatches) {
      return NextResponse.json({ status: "invalid_credentials" });
    }

    // Verificar se foi excluído
    if (user.isDeleted) {
      return NextResponse.json({ status: "deleted" });
    }

    return NextResponse.json({ status: "active" });
  } catch (error) {
    console.error("Erro ao verificar status da conta:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}