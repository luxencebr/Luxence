import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const advertiserId = parseInt(id);

    if (isNaN(advertiserId)) {
      return NextResponse.json(
        { error: "ID do anunciante inválido" },
        { status: 400 },
      );
    }

    const advertiser = await prisma.producer.findUnique({
      where: { id: advertiserId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            gender: true,
            createdAt: true,
            updatedAt: true,
            emailNotifications: true,
            whatsappNotifications: true,
            isDeleted: true,
            deletedAt: true,
          },
        },
        profile: {
          include: {
            contacts: {
              include: {
                option: true,
              },
            },
            profileViews: {
              where: {
                viewedAt: {
                  gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // últimos 30 dias
                },
              },
              orderBy: { viewedAt: "desc" },
            },
            reviews: {
              include: {
                user: {
                  select: {
                    name: true,
                  },
                },
              },
              orderBy: { createdAt: "desc" },
              take: 10,
            },
            prices: {
              include: {
                option: true,
              },
            },
            payments: {
              include: {
                option: true,
              },
            },
          },
        },
      },
    });

    if (!advertiser) {
      return NextResponse.json(
        { error: "Anunciante não encontrado" },
        { status: 404 },
      );
    }

    // Buscar assinaturas separadamente para evitar problemas de relacionamento
    const subscriptions = await prisma.subscription.findMany({
      where: { userId: advertiser.userId },
      include: {
        plan: true,
        payments: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Buscar sessões ativas separadamente
    const activeSessions = await prisma.userSession.findMany({
      where: {
        userId: advertiser.userId,
        isActive: true,
      },
      orderBy: { lastActivity: "desc" },
      take: 5,
    });

    // Calcular estatísticas de visualizações
    const viewsLast7Days =
      advertiser.profile?.profileViews.filter(
        (view) =>
          view.viewedAt >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      ).length || 0;

    const viewsLast30Days = advertiser.profile?.profileViews.length || 0;

    // Buscar assinatura atual
    const currentSubscription = subscriptions.find(
      (sub) => sub.status === "ACTIVE",
    );

    // Processar dados para resposta
    const response = {
      id: advertiser.id,
      userId: advertiser.user.id,
      name: advertiser.user.name,
      producerName: advertiser.name,
      email: advertiser.user.email,
      phone: advertiser.user.phone || advertiser.phone,
      gender: advertiser.user.gender,
      document: advertiser.document,
      nationality: advertiser.nationality,
      birthday: advertiser.birthday,
      signature: advertiser.signature,
      verificationStatus: advertiser.verificationStatus,
      isVerified: advertiser.isVerified,
      createdAt: advertiser.user.createdAt,
      updatedAt: advertiser.user.updatedAt,
      isDeleted: advertiser.user.isDeleted,
      deletedAt: advertiser.user.deletedAt,
      notifications: {
        email: advertiser.user.emailNotifications,
        whatsapp: advertiser.user.whatsappNotifications,
      },
      profile: advertiser.profile
        ? {
            id: advertiser.profile.id,
            name: advertiser.profile.name,
            age: advertiser.profile.age,
            slogan: advertiser.profile.slogan,
            description: advertiser.profile.description,
            images: advertiser.profile.images,
            views: {
              total: advertiser.profile.views,
              last7Days: viewsLast7Days,
              last30Days: viewsLast30Days,
            },
            contacts: advertiser.profile.contacts.map((contact) => ({
              id: contact.id,
              type: contact.option.name,
              label: contact.option.label,
              value: contact.value,
              isPrimary: contact.isPrimary,
              isPublic: contact.isPublic,
            })),
            reviews: advertiser.profile.reviews.map((review) => ({
              id: review.id,
              rating: review.rating,
              comment: review.comment,
              reviewerName: review.reviewerName || review.user.name,
              isApproved: review.isApproved,
              createdAt: review.createdAt,
            })),
            prices: advertiser.profile.prices.map((price) => ({
              id: price.id,
              type: price.option.name,
              label: price.option.label,
              value: price.value,
            })),
            payments: advertiser.profile.payments.map((payment) => ({
              id: payment.id,
              type: payment.option.name,
              label: payment.option.label,
            })),
          }
        : null,
      subscriptions: subscriptions.map((sub) => ({
        id: sub.id,
        planName: sub.plan.name,
        signature: sub.plan.signature,
        status: sub.status,
        startDate: sub.startDate,
        endDate: sub.endDate,
        autoRenew: sub.autoRenew,
        createdAt: sub.createdAt,
        payments: sub.payments.map((payment) => ({
          id: payment.id,
          amount: payment.amount,
          method: payment.method,
          status: payment.status,
          dueDate: payment.dueDate,
          paidAt: payment.paidAt,
          createdAt: payment.createdAt,
        })),
      })),
      currentSubscription: currentSubscription
        ? {
            id: currentSubscription.id,
            planName: currentSubscription.plan.name,
            signature: currentSubscription.plan.signature,
            status: currentSubscription.status,
            startDate: currentSubscription.startDate,
            endDate: currentSubscription.endDate,
            autoRenew: currentSubscription.autoRenew,
          }
        : null,
      activeSessions: activeSessions.map((session) => ({
        id: session.id,
        ipAddress: session.ipAddress,
        userAgent: session.userAgent,
        country: session.country,
        state: session.state,
        city: session.city,
        device: session.device,
        browser: session.browser,
        os: session.os,
        lastActivity: session.lastActivity,
        createdAt: session.createdAt,
      })),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Erro ao buscar detalhes do anunciante:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const advertiserId = parseInt(id);
    const body = await request.json();

    console.log("PATCH /api/admin/advertisers/[id] - Dados recebidos:", {
      advertiserId,
      body: JSON.stringify(body, null, 2),
    });

    if (isNaN(advertiserId)) {
      return NextResponse.json(
        { error: "ID do anunciante inválido" },
        { status: 400 },
      );
    }

    const {
      signature,
      verificationStatus,
      isVerified,
      user,
      profile,
      contactId,
      contactValue,
      notifications,
      ...producerData
    } = body;

    // Buscar o producer para obter o userId e profileId
    const producer = await prisma.producer.findUnique({
      where: { id: advertiserId },
      select: {
        userId: true,
        profile: { select: { id: true } },
        name: true,
        document: true,
        nationality: true,
        birthday: true,
        phone: true,
      },
    });

    if (!producer) {
      return NextResponse.json(
        { error: "Anunciante não encontrado" },
        { status: 404 },
      );
    }

    console.log("Producer encontrado:", producer);

    // Usar transação para garantir consistência
    const result = await prisma.$transaction(async (tx) => {
      let updatedUser = null;
      let updatedProfile = null;
      let updatedProducer = null;
      let updatedContact = null;

      // 1. Atualizar dados do usuário se fornecidos
      if (user && Object.keys(user).length > 0) {
        console.log("Atualizando dados do usuário:", user);

        // Validar campos do usuário
        const userUpdateData: any = {};

        if (user.name !== undefined) userUpdateData.name = user.name;
        if (user.email !== undefined) userUpdateData.email = user.email;
        if (user.phone !== undefined) userUpdateData.phone = user.phone;
        if (user.gender !== undefined) userUpdateData.gender = user.gender;
        if (user.emailNotifications !== undefined)
          userUpdateData.emailNotifications = user.emailNotifications;
        if (user.whatsappNotifications !== undefined)
          userUpdateData.whatsappNotifications = user.whatsappNotifications;
        if (user.isDeleted !== undefined)
          userUpdateData.isDeleted = user.isDeleted;
        if (user.deletedAt !== undefined)
          userUpdateData.deletedAt = user.deletedAt;

        if (Object.keys(userUpdateData).length > 0) {
          updatedUser = await tx.user.update({
            where: { id: producer.userId },
            data: userUpdateData,
          });
          console.log("Usuário atualizado:", updatedUser);
        }
      }

      // 2. Atualizar notificações se fornecidas
      if (notifications && Object.keys(notifications).length > 0) {
        console.log("Atualizando notificações:", notifications);

        const notificationData: any = {};
        if (notifications.email !== undefined)
          notificationData.emailNotifications = notifications.email;
        if (notifications.whatsapp !== undefined)
          notificationData.whatsappNotifications = notifications.whatsapp;

        if (Object.keys(notificationData).length > 0) {
          await tx.user.update({
            where: { id: producer.userId },
            data: notificationData,
          });
          console.log("Notificações atualizadas");
        }
      }

      // 3. Atualizar dados do perfil se fornecidos
      if (profile && producer.profile && Object.keys(profile).length > 0) {
        console.log("Atualizando dados do perfil:", profile);

        // Validar campos do perfil
        const profileUpdateData: any = {};

        if (profile.name !== undefined) profileUpdateData.name = profile.name;
        if (profile.age !== undefined) {
          const age = parseInt(profile.age);
          if (!isNaN(age) && age >= 18 && age <= 99) {
            profileUpdateData.age = age;
          } else {
            throw new Error("Idade deve ser um número entre 18 e 99 anos");
          }
        }
        if (profile.slogan !== undefined)
          profileUpdateData.slogan = profile.slogan;
        if (profile.description !== undefined)
          profileUpdateData.description = profile.description;
        if (profile.images !== undefined)
          profileUpdateData.images = profile.images;
        if (profile.scholarity !== undefined)
          profileUpdateData.scholarity = profile.scholarity;
        if (profile.languages !== undefined)
          profileUpdateData.languages = profile.languages;
        if (profile.hasLocal !== undefined)
          profileUpdateData.hasLocal = profile.hasLocal;
        if (profile.neighborhoods !== undefined)
          profileUpdateData.neighborhoods = profile.neighborhoods;

        if (Object.keys(profileUpdateData).length > 0) {
          updatedProfile = await tx.producerProfile.update({
            where: { id: producer.profile.id },
            data: profileUpdateData,
          });
          console.log("Perfil atualizado:", updatedProfile);
        }
      }

      // 4. Atualizar contato específico se fornecido
      if (contactId && contactValue !== undefined) {
        console.log("Atualizando contato:", { contactId, contactValue });

        updatedContact = await tx.producerContact.update({
          where: { id: parseInt(contactId) },
          data: { value: contactValue },
        });
        console.log("Contato atualizado:", updatedContact);
      }

      // 5. Atualizar dados do producer
      const updateData: any = {};

      // Campos administrativos
      if (signature !== undefined) updateData.signature = signature;
      if (verificationStatus !== undefined)
        updateData.verificationStatus = verificationStatus;
      if (typeof isVerified === "boolean") updateData.isVerified = isVerified;

      // Campos pessoais do producer
      if (producerData.name !== undefined) updateData.name = producerData.name;
      if (producerData.document !== undefined)
        updateData.document = producerData.document;
      if (producerData.nationality !== undefined)
        updateData.nationality = producerData.nationality;
      if (producerData.phone !== undefined)
        updateData.phone = producerData.phone;
      if (producerData.birthday !== undefined) {
        // Validar data de nascimento
        const birthDate = new Date(producerData.birthday);
        if (isNaN(birthDate.getTime())) {
          throw new Error("Data de nascimento inválida");
        }

        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        if (age < 18) {
          throw new Error("Deve ter pelo menos 18 anos");
        }

        updateData.birthday = birthDate;
      }

      // Campos de documentos (se fornecidos)
      if (producerData.documentFrontPhoto !== undefined)
        updateData.documentFrontPhoto = producerData.documentFrontPhoto;
      if (producerData.documentBackPhoto !== undefined)
        updateData.documentBackPhoto = producerData.documentBackPhoto;
      if (producerData.selfieWithDocument !== undefined)
        updateData.selfieWithDocument = producerData.selfieWithDocument;

      console.log("Dados para atualizar no producer:", updateData);

      if (Object.keys(updateData).length > 0) {
        updatedProducer = await tx.producer.update({
          where: { id: advertiserId },
          data: updateData,
        });
        console.log("Producer atualizado:", updatedProducer);
      }

      return {
        updatedUser,
        updatedProfile,
        updatedProducer,
        updatedContact,
      };
    });

    console.log("Transação concluída com sucesso:", result);

    return NextResponse.json({
      success: true,
      message: "Anunciante atualizado com sucesso",
      data: {
        user: result.updatedUser,
        profile: result.updatedProfile,
        producer: result.updatedProducer,
        contact: result.updatedContact,
      },
    });
  } catch (error) {
    console.error("Erro ao atualizar anunciante:", error);

    // Retornar erro mais específico
    const errorMessage =
      error instanceof Error ? error.message : "Erro interno do servidor";

    return NextResponse.json(
      {
        error: errorMessage,
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    );
  } finally {
    await prisma.$disconnect();
  }
}
