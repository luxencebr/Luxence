import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';

// Carrega variáveis de ambiente
dotenv.config({ path: '.env.local' });

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    const email = 'admin@luxence.com';
    const password = 'Admin@123'; // Altere esta senha!
    const name = 'Administrador';

    // Verifica se o admin já existe
    const existingAdmin = await prisma.user.findUnique({
      where: { email }
    });

    if (existingAdmin) {
      console.log('❌ Usuário admin já existe com este email:', email);
      return;
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Cria o usuário admin
    const admin = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'ADMIN',
        gender: 'MALE', // Ajuste conforme necessário
      }
    });

    console.log('✅ Usuário admin criado com sucesso!');
    console.log('📧 Email:', email);
    console.log('🔑 Senha:', password);
    console.log('⚠️  IMPORTANTE: Altere a senha após o primeiro login!');
    console.log('\nDados do usuário:');
    console.log(admin);

  } catch (error) {
    console.error('❌ Erro ao criar admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
