import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function testSessions() {
  try {
    console.log("🔍 Testando funcionalidade de sessões...");

    // Criar uma sessão de teste
    const testSession = await prisma.userSession.create({
      data: {
        userId: 1, // Assumindo que existe um usuário com ID 1
        sessionToken: `test-session-${Date.now()}`,
        ipAddress: "192.168.1.100",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        country: "Brasil",
        state: "São Paulo",
        city: "São Paulo",
        device: "Desktop",
        browser: "Chrome",
        os: "Windows",
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
      }
    });

    console.log("✅ Sessão de teste criada:", testSession.id);

    // Buscar todas as sessões ativas
    const activeSessions = await prisma.userSession.findMany({
      where: {
        isActive: true,
        expiresAt: {
          gt: new Date()
        }
      },
      orderBy: {
        lastActivity: 'desc'
      }
    });

    console.log(`📊 Encontradas ${activeSessions.length} sessões ativas`);

    // Mostrar detalhes das sessões
    activeSessions.forEach((session, index) => {
      console.log(`\n📱 Sessão ${index + 1}:`);
      console.log(`   ID: ${session.id}`);
      console.log(`   Usuário: ${session.userId}`);
      console.log(`   Dispositivo: ${session.device} - ${session.browser} em ${session.os}`);
      console.log(`   Localização: ${session.city}, ${session.state}`);
      console.log(`   IP: ${session.ipAddress}`);
      console.log(`   Última atividade: ${session.lastActivity.toLocaleString('pt-BR')}`);
      console.log(`   Criada em: ${session.createdAt.toLocaleString('pt-BR')}`);
    });

    // Limpar sessão de teste
    await prisma.userSession.delete({
      where: { id: testSession.id }
    });

    console.log("\n🧹 Sessão de teste removida");
    console.log("✅ Teste concluído com sucesso!");

  } catch (error) {
    console.error("❌ Erro durante o teste:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testSessions();