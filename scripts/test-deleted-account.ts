import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function createTestDeletedAccount() {
  try {
    console.log("🧪 Criando conta de teste excluída...");

    const testEmail = "teste.excluido@example.com";
    const testPassword = "Teste123!";

    // Verificar se já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: testEmail },
    });

    if (existingUser) {
      console.log("📧 Usuário já existe, atualizando para excluído...");
      await prisma.user.update({
        where: { email: testEmail },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
        },
      });
    } else {
      console.log("📧 Criando novo usuário excluído...");
      const hashedPassword = await hash(testPassword, 10);

      await prisma.user.create({
        data: {
          name: "Usuário Teste Excluído",
          email: testEmail,
          password: hashedPassword,
          gender: "FEMALE",
          role: "CLIENT",
          isDeleted: true,
          deletedAt: new Date(),
          preferences: {
            create: [{ gender: "MALE" }],
          },
        },
      });
    }

    console.log("✅ Conta de teste criada com sucesso!");
    console.log(`📧 Email: ${testEmail}`);
    console.log(`🔑 Senha: ${testPassword}`);
    console.log("🧪 Agora você pode testar o login com esta conta excluída.");
  } catch (error) {
    console.error("❌ Erro ao criar conta de teste:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestDeletedAccount();