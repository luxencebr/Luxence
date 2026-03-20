import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface SessionData {
  userId: number;
  sessionToken: string;
  ipAddress?: string;
  userAgent?: string;
}

// Função para extrair informações do User-Agent
function parseUserAgent(userAgent: string) {
  const device = /Mobile|Android|iPhone|iPad/.test(userAgent) ? "Mobile" : "Desktop";
  
  let browser = "Unknown";
  if (userAgent.includes("Chrome")) browser = "Chrome";
  else if (userAgent.includes("Firefox")) browser = "Firefox";
  else if (userAgent.includes("Safari")) browser = "Safari";
  else if (userAgent.includes("Edge")) browser = "Edge";
  
  let os = "Unknown";
  if (userAgent.includes("Windows")) os = "Windows";
  else if (userAgent.includes("Mac")) os = "macOS";
  else if (userAgent.includes("Linux")) os = "Linux";
  else if (userAgent.includes("Android")) os = "Android";
  else if (userAgent.includes("iOS")) os = "iOS";
  
  return { device, browser, os };
}

// Função para obter localização aproximada por IP
async function getLocationFromIP(ip: string) {
  // Para IPs locais (IPv4 e IPv6), retornar localização padrão
  if (ip.startsWith("192.168.") || ip.startsWith("10.") || ip === "127.0.0.1" || 
      ip.startsWith("172.") || ip === "::1" || ip.startsWith("fe80:") || 
      ip.startsWith("fc00:") || ip.startsWith("fd00:")) {
    return {
      country: "Brasil",
      state: "Local",
      city: "Rede Local"
    };
  }
  
  try {
    // Tentar usar uma API gratuita de geolocalização
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    
    const response = await fetch(`https://ipapi.co/${ip}/json/`, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Luxence/1.0'
      }
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      const data = await response.json();
      if (data.country_name && data.region && data.city) {
        return {
          country: data.country_name,
          state: data.region,
          city: data.city
        };
      }
    }
  } catch (error) {
    console.log("Erro ao obter localização por IP (ipapi.co):", error);
  }
  
  // Tentar API alternativa
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    
    const response = await fetch(`https://ip-api.com/json/${ip}?lang=pt&fields=status,country,regionName,city`, {
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      const data = await response.json();
      if (data.status === 'success' && data.country && data.regionName && data.city) {
        return {
          country: data.country,
          state: data.regionName,
          city: data.city
        };
      }
    }
  } catch (error) {
    console.log("Erro ao obter localização por IP (ip-api.com):", error);
  }
  
  // Fallback baseado em ranges de IP brasileiros conhecidos
  if (ip.startsWith("200.") || ip.startsWith("201.") || ip.startsWith("189.")) {
    return {
      country: "Brasil",
      state: "São Paulo",
      city: "São Paulo"
    };
  }
  
  // Fallback final
  return {
    country: "Brasil",
    state: "Não identificado",
    city: "Localização aproximada"
  };
}

export async function registerSession(data: SessionData) {
  try {
    const { userId, sessionToken, ipAddress = "127.0.0.1", userAgent = "" } = data;
    
    // Extrair informações do User-Agent
    const { device, browser, os } = parseUserAgent(userAgent);
    
    // Obter localização (em produção, usar serviço real)
    const location = await getLocationFromIP(ipAddress);
    
    // Criar ou atualizar sessão
    const userSession = await prisma.userSession.upsert({
      where: { sessionToken },
      update: {
        lastActivity: new Date(),
        ipAddress,
        userAgent,
        ...location,
        device,
        browser,
        os,
        isActive: true
      },
      create: {
        userId,
        sessionToken,
        ipAddress,
        userAgent,
        ...location,
        device,
        browser,
        os,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
        isActive: true
      }
    });
    
    return userSession;
  } catch (error) {
    console.error("Erro ao registrar sessão:", error);
    throw error;
  }
}

export async function updateSessionActivity(sessionToken: string) {
  try {
    await prisma.userSession.update({
      where: { sessionToken },
      data: {
        lastActivity: new Date()
      }
    });
  } catch (error) {
    console.error("Erro ao atualizar atividade da sessão:", error);
  }
}

export async function deactivateSession(sessionToken: string) {
  try {
    await prisma.userSession.update({
      where: { sessionToken },
      data: {
        isActive: false
      }
    });
  } catch (error) {
    console.error("Erro ao desativar sessão:", error);
  }
}

export async function cleanupExpiredSessions() {
  try {
    await prisma.userSession.updateMany({
      where: {
        expiresAt: {
          lt: new Date()
        },
        isActive: true
      },
      data: {
        isActive: false
      }
    });
  } catch (error) {
    console.error("Erro ao limpar sessões expiradas:", error);
  }
}