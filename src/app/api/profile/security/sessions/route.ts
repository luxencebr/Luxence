import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { PrismaClient } from "@prisma/client";
import { headers } from "next/headers";

const prisma = new PrismaClient();

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

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    const currentSessionToken = session.sessionToken;

    // Buscar todas as sessões ativas do usuário
    const sessions = await prisma.userSession.findMany({
      where: {
        userId,
        isActive: true,
        expiresAt: {
          gt: new Date()
        }
      },
      orderBy: [
        { lastActivity: 'desc' }
      ]
    });

    // Marcar a sessão atual e ordenar (atual primeiro, depois por atividade)
    const sessionsWithCurrent = sessions
      .map(session => ({
        ...session,
        isCurrent: session.sessionToken === currentSessionToken,
        // Não expor o token completo por segurança
        sessionToken: session.sessionToken.substring(0, 8) + "..."
      }))
      .sort((a, b) => {
        // Sessão atual sempre primeiro
        if (a.isCurrent && !b.isCurrent) return -1;
        if (!a.isCurrent && b.isCurrent) return 1;
        // Depois ordenar por última atividade
        return new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime();
      });

    return NextResponse.json({ sessions: sessionsWithCurrent });
  } catch (error) {
    console.error("Erro ao buscar sessões:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    const headersList = await headers();
    const userAgent = headersList.get("user-agent") || "";
    const ip = headersList.get("x-forwarded-for") || 
               headersList.get("x-real-ip") || 
               "127.0.0.1";

    const body = await request.json();
    const sessionToken = body.sessionToken || session.sessionToken || `session-${userId}-${Date.now()}`;

    if (!sessionToken) {
      return NextResponse.json({ error: "Token de sessão obrigatório" }, { status: 400 });
    }

    // Extrair informações do User-Agent
    const { device, browser, os } = parseUserAgent(userAgent);
    
    // Obter localização (em produção, usar serviço real)
    const location = await getLocationFromIP(ip);

    // Criar ou atualizar sessão
    const userSession = await prisma.userSession.upsert({
      where: { sessionToken },
      update: {
        lastActivity: new Date(),
        ipAddress: ip,
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
        ipAddress: ip,
        userAgent,
        ...location,
        device,
        browser,
        os,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
        isActive: true
      }
    });

    return NextResponse.json({ success: true, sessionId: userSession.id });
  } catch (error) {
    console.error("Erro ao registrar sessão:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    const { sessionId, logoutAll } = await request.json();

    if (logoutAll) {
      // Desativar todas as sessões do usuário
      await prisma.userSession.updateMany({
        where: {
          userId,
          isActive: true
        },
        data: {
          isActive: false
        }
      });
    } else if (sessionId) {
      // Desativar sessão específica
      await prisma.userSession.update({
        where: {
          id: sessionId,
          userId // Garantir que o usuário só pode desativar suas próprias sessões
        },
        data: {
          isActive: false
        }
      });
    } else {
      return NextResponse.json({ error: "sessionId ou logoutAll obrigatório" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao desativar sessão:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}