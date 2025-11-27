import { prisma } from "@/utils/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { profileId, slogan } = await req.json();

    if (!profileId) {
      return NextResponse.json(
        { error: "profileId é obrigatório" },
        { status: 400 }
      );
    }

    await prisma.producerProfile.update({
      where: { id: profileId },
      data: { slogan },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("SLOGAN POST ERROR:", error);
    return NextResponse.json(
      { error: "Erro ao salvar slogan", details: String(error) },
      { status: 500 }
    );
  }
}
