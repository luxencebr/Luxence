import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🔄 Iniciando preenchimento de contatos...");

  const profiles = await prisma.producerProfile.findMany({
    select: {
      id: true,
      contacts: {
        select: {
          contactId: true,
        },
      },
    },
  });

  const contactOptions = await prisma.contactOption.findMany({
    select: {
      id: true,
    },
  });

  let createdCount = 0;

  for (const profile of profiles) {
    const existingContactIds = profile.contacts.map(
      (contact) => contact.contactId
    );

    const missingOptions = contactOptions.filter(
      (option) => !existingContactIds.includes(option.id)
    );

    if (missingOptions.length === 0) continue;

    await prisma.producerContact.createMany({
      data: missingOptions.map((option, index) => ({
        profileId: profile.id,
        contactId: option.id,
        value: "",
        label: null,
        isPrimary: false,
        isPublic: false,
        order: index,
      })),
    });

    createdCount += missingOptions.length;
  }

  console.log(`✅ Contatos criados: ${createdCount}`);
  console.log("🎉 Finalizado com sucesso!");
}

main()
  .catch((err) => {
    console.error("❌ Erro ao preencher contatos:", err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
