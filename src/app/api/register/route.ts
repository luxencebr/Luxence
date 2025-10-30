import { prisma } from "@/utils/prisma";
import { hash } from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { name, email, password, gender, preffer, role } = await req.json();

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: "Email já cadastrado." },
        { status: 400 }
      );
    }

    const hashedPassword = await hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        gender,
        preffer,
        role: role || "client",
      },
    });

    return NextResponse.json(
      { message: "Usuário criado com sucesso!", user },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("Erro /api/register:", err);
    return NextResponse.json(
      { error: "Erro interno no servidor." },
      { status: 500 }
    );
  }
}
