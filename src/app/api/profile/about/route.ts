import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";

export async function PUT(req: Request) {
  try {
    const { profileId, bio } = await req.json();

    if (!profileId) {
      return NextResponse.json(
        { error: "profileId não fornecido." },
        { status: 400 }
      );
    }

    await prisma.producerProfile.update({
      where: { id: profileId },
      data: {
        description: bio,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Erro ao atualizar about:", err);
    return NextResponse.json(
      { error: "Erro interno ao atualizar dados." },
      { status: 500 }
    );
  }
}
