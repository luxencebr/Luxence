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

    const { profileId, services } = await req.json();

    if (!profileId || !Array.isArray(services)) {
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

    // Validar services
    const validStatuses = ['AVAILABLE', 'UNAVAILABLE', 'NEGOTIABLE'];
    const isValidServices = services.every((item: any) => 
      typeof item.serviceId === 'number' && 
      validStatuses.includes(item.status)
    );

    if (!isValidServices) {
      return NextResponse.json(
        { error: "Services deve conter serviceId (number) e status válido" },
        { status: 400 }
      );
    }

    await prisma.producerService.deleteMany({
      where: { profileId },
    });

    if (services.length > 0) {
      await prisma.producerService.createMany({
        data: services.map((item: { serviceId: number; status: string }) => ({
          profileId,
          serviceId: item.serviceId,
          status: item.status,
        })),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao salvar serviços:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
