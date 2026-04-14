import { NextRequest, NextResponse } from "next/server";
import { analyticsMonitor } from "@/lib/analytics-monitor";

// Função para obter localização aproximada por IP
async function getLocationFromIP(ip: string) {
  // Para IPs locais (IPv4 e IPv6), retornar localização padrão
  if (ip.startsWith("192.168.") || ip.startsWith("10.") || ip === "127.0.0.1" || 
      ip.startsWith("172.") || ip === "::1" || ip.startsWith("fe80:") || 
      ip.startsWith("fc00:") || ip.startsWith("fd00:")) {
    return {
      country: "Brasil",
      region: "Local",
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
          region: data.region,
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
          region: data.regionName,
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
      region: "São Paulo",
      city: "São Paulo"
    };
  }
  
  // Fallback final
  return {
    country: "Brasil",
    region: "Não identificado",
    city: "Localização aproximada"
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { path, referrer, sessionId, userId, viewport, deviceInfo } = body;

    // Extract analytics data from request
    const userAgent = request.headers.get("user-agent") || deviceInfo?.userAgent || "";
    const ip =
      request.headers.get("x-forwarded-for")?.split(',')[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      request.ip ||
      "127.0.0.1";
    const acceptLanguage = request.headers.get("accept-language") || deviceInfo?.language || "en";
    const language = acceptLanguage.split(",")[0].split("-")[0];

    console.log(`📊 Tracking page view: ${path} from IP: ${ip} (${userAgent.substring(0, 50)}...)`);

    // Get location data from IP
    const location = await getLocationFromIP(ip);
    console.log(`📍 Location detected: ${location.city}, ${location.region}, ${location.country}`);

    // Track the page view with location data
    const pageViewId = analyticsMonitor.trackPageView({
      sessionId:
        sessionId ||
        `sess_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      path,
      referrer: referrer || "",
      userAgent,
      ip,
      country: location.country,
      region: location.region,
      city: location.city,
      language,
      userId,
      viewport,
    });

    return NextResponse.json({ success: true, pageViewId });
  } catch (error) {
    console.error("Analytics tracking error:", error);
    return NextResponse.json(
      { error: "Failed to track page view" },
      { status: 500 },
    );
  }
}
