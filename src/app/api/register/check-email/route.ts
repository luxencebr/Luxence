import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { error: "Email é obrigatório" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    return NextResponse.json({ exists: !!existingUser });
  } catch (error) {
    console.error("Erro ao verificar email:", error);
    return NextResponse.json(
      { error: "Erro ao verificar email" },
      { status: 500 }
    );
  }
}
