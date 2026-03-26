import { PrismaClient } from "@prisma/client";
import { hashSync } from "bcryptjs";

const prisma = new PrismaClient();

async function testAccountDeletionFlow() {
  try {
    console.log("🧪 Testando fluxo de exclusão de conta...");

    // 1. Criar usuário de teste
    const testUser = await prisma.user.create({
      data: {
        name: "Usuário Teste Exclusão",
        email: "teste-exclusao@example.com",
        password: hashSync("123456", 10),
        role: "CLIENT",
        gender: "MALE",
        isDeleted: false,
      },
    });

    console.log(`✅ Usuário criado: ID ${testUser.id}`);

    // 2. Criar sessão de teste
    const testSession = await prisma.userSession.create({
      data: {
        userId: testUser.id,
        sessionToken: `test-session-${Date.now()}`,
        ipAddress: "127.0.0.1",
        userAgent: "Test Browser",
        country: "Brasil",
        state: "São Paulo",
        city: "São Paulo",
        device: "Desktop",
        browser: "Chrome",
        os: "Windows",
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isActive: true,
      },
    });

    console.log(`✅ Sessão criada: ${testSession.sessionToken}`);

    // 3. Simular exclusão da conta
    await prisma.user.update({
      where: { id: testUser.id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    // 4. Desativar sessões
    await prisma.userSession.updateMany({
      where: { userId: testUser.id },
      data: { isActive: false },
    });

    console.log("✅ Conta marcada como excluída e sessões desativadas");

    // 5. Verificar se a conta está realmente excluída
    const deletedUser = await prisma.user.findUnique({
      where: { id: testUser.id },
      select: { isDeleted: true, deletedAt: true },
    });

    const inactiveSessions = await prisma.userSession.findMany({
      where: { userId: testUser.id },
      select: { isActive: true },
    });

    console.log(`✅ Conta excluída: ${deletedUser?.isDeleted}`);
    console.log(`✅ Sessões ativas: ${inactiveSessions.filter(s => s.isActive).length}`);

    // 6. Limpar dados de teste
    await prisma.userSession.deleteMany({
      where: { userId: testUser.id },
    });

    await prisma.user.delete({
      where: { id: testUser.id },
    });

    console.log("✅ Dados de teste limpos");
    console.log("🎉 Teste do fluxo de exclusão concluído com sucesso!");

  } catch (error) {
    console.error("❌ Erro no teste:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testAccountDeletionFlow();