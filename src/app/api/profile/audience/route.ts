import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";

export async function PUT(req: Request) {
  try {
    const { profileId, languages, audience } = await req.json();

    if (!profileId) {
      return NextResponse.json(
        { error: "profileId não fornecido." },
        { status: 400 }
      );
    }

    await prisma.$transaction(async (tx) => {
      // 🔹 Atualiza idiomas (JSON no profile)
      await tx.producerProfile.update({
        where: { id: profileId },
        data: {
          languages: languages ?? [],
        },
      });

      // 🔹 Remove audience anterior
      await tx.producerAudience.deleteMany({
        where: { profileId },
      });

      // 🔹 Cria novo audience
      if (audience?.length) {
        await tx.producerAudience.createMany({
          data: audience.map((a: any) => ({
            profileId,
            audienceId: a.audienceId,
            status: a.status,
          })),
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Erro ao atualizar audience:", err);
    return NextResponse.json(
      { error: "Erro interno ao atualizar audience." },
      { status: 500 }
    );
  }
}
