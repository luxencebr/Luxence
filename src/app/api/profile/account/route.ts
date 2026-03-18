import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/utils/prisma";

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: parseInt(session.user.id) },
      include: {
        locality: true,
        producer: true, // Incluir dados do producer para pegar o telefone
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.producer?.phone || "", // Telefone só existe para anunciantes
      gender: user.gender,
      locality: user.locality,
      isAdvertiser: !!user.producer, // Indicar se é anunciante
    });
  } catch (error) {
    console.error("Erro ao buscar dados da conta:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const userId = parseInt(session.user.id);

    // Validar dados recebidos
    const allowedFields = ['name', 'email', 'phone', 'address'];
    const updates: any = {};
    const producerUpdates: any = {};
    
    for (const [key, value] of Object.entries(body)) {
      if (allowedFields.includes(key)) {
        if (key === 'address') {
          // Tratar endereço separadamente
          continue;
        } else if (key === 'phone') {
          // Telefone vai para o producer
          producerUpdates[key] = value;
        } else {
          // Nome e email vão para o user
          updates[key] = value;
        }
      }
    }

    // Atualizar dados básicos do usuário
    if (Object.keys(updates).length > 0) {
      await prisma.user.update({
        where: { id: userId },
        data: updates,
      });
    }

    // Atualizar telefone no producer (apenas para anunciantes)
    if (Object.keys(producerUpdates).length > 0) {
      // Verificar se o usuário é anunciante
      const existingProducer = await prisma.producer.findUnique({
        where: { userId },
      });

      if (existingProducer) {
        await prisma.producer.update({
          where: { userId },
          data: producerUpdates,
        });
      } else {
        // Se não é anunciante, não pode atualizar telefone
        return NextResponse.json(
          { error: "Apenas anunciantes podem ter telefone" },
          { status: 400 }
        );
      }
    }

    // Atualizar endereço se fornecido
    if (body.address) {
      const addressData = body.address;
      
      // Verificar se já existe um endereço
      const existingLocality = await prisma.locality.findUnique({
        where: { userId },
      });

      const localityData = {
        cep: addressData.cep || null,
        country: addressData.country || "Brasil",
        state: addressData.state || "",
        city: addressData.city || "",
        neighborhood: addressData.neighborhood || null,
        street: addressData.street || null,
        number: addressData.number || null,
        complement: addressData.complement || null,
      };

      if (existingLocality) {
        // Atualizar endereço existente
        await prisma.locality.update({
          where: { userId },
          data: localityData,
        });
      } else {
        // Criar novo endereço
        await prisma.locality.create({
          data: {
            userId,
            ...localityData,
          },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao atualizar dados da conta:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}