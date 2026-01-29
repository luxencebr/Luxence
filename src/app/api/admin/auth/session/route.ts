import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";

export async function GET() {
  try {
    const user = await getAdminSession();

    if (!user) {
      return NextResponse.json(
        {
          error:
            "Acesso negado. Apenas administradores podem acessar esta área.",
        },
        { status: 401 },
      );
    }

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Erro ao verificar sessão admin:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
