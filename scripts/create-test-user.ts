#!/usr/bin/env ts-node

/**
 * Script para criar usuário de teste para os testes end-to-end
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createTestUser() {
  console.log('🧪 Criando usuário de teste...');

  try {
    // Verificar se já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: 'teste@luxence.com.br' },
    });

    if (existingUser) {
      console.log('✅ Usuário de teste já existe:', {
        id: existingUser.id,
        email: existingUser.email,
        role: existingUser.role,
      });
      return existingUser;
    }

    // Criar usuário
    const hashedPassword = await bcrypt.hash('Teste@123', 10);
    
    const user = await prisma.user.create({
      data: {
        email: 'teste@luxence.com.br',
        password: hashedPassword,
        role: 'ADVERTISER',
        name: 'Usuário Teste',
        gender: 'MALE',
        phone: '11999999999',
        emailNotifications: true,
        whatsappNotifications: false,
      },
    });

    console.log('✅ Usuário criado:', {
      id: user.id,
      email: user.email,
      role: user.role,
    });

    // Criar produtor
    const producer = await prisma.producer.create({
      data: {
        userId: user.id,
        signature: 'COPPER',
        isVerified: true,
        verificationStatus: 'GREEN',
        name: 'Produtor Teste',
        birthday: new Date('1990-01-01'),
        nationality: 'Brasileiro',
        document: '12345678901',
        phone: '11999999999',
        documentFrontPhoto: 'test-front.jpg',
        documentBackPhoto: 'test-back.jpg',
        selfieWithDocument: 'test-selfie.jpg',
      },
    });

    console.log('✅ Produtor criado:', {
      id: producer.id,
      signature: producer.signature,
      isVerified: producer.isVerified,
    });

    // Criar localidade
    await prisma.locality.create({
      data: {
        userId: user.id,
        cep: '01234567',
        country: 'Brasil',
        state: 'SP',
        city: 'São Paulo',
        neighborhood: 'Centro',
        street: 'Rua Teste',
        number: '123',
      },
    });

    console.log('✅ Localidade criada');

    console.log('\n🎉 Usuário de teste criado com sucesso!');
    console.log('📧 Email: teste@luxence.com.br');
    console.log('🔑 Senha: Teste@123');

    return user;
  } catch (error) {
    console.error('❌ Erro ao criar usuário de teste:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  createTestUser().catch(console.error);
}

export { createTestUser };