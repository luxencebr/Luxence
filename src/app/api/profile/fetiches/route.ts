import { prisma } from "@/utils/prisma";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const { profileId, fetiches } = await req.json();

    if (!profileId || !Array.isArray(fetiches)) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }

    // Validar se o perfil pertence ao usuário logado
    const profile = await prisma.producerProfile.findFirst({
      where: { 
        id: profileId,
        producer: {
          userId: parseInt(session.user.id)
        }
      },
    });

    if (!profile) {
      return NextResponse.json(
        { error: "Perfil não encontrado ou não autorizado" },
        { status: 404 }
      );
    }

    // Validar fetiches
    const validStatuses = ['AVAILABLE', 'UNAVAILABLE', 'NEGOTIABLE'];
    const isValidFetiches = fetiches.every((item: any) => 
      typeof item.serviceId === 'number' && 
      validStatuses.includes(item.status)
    );

    if (!isValidFetiches) {
      return NextResponse.json(
        { error: "Fetiches deve conter serviceId (number) e status válido" },
        { status: 400 }
      );
    }

    await prisma.producerFetish.deleteMany({
      where: { profileId },
    });

    if (fetiches.length > 0) {
      await prisma.producerFetish.createMany({
        data: fetiches.map((item: { serviceId: number; status: string }) => ({
          profileId,
          fetishId: item.serviceId,
          status: item.status,
        })),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao salvar fetiches:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
