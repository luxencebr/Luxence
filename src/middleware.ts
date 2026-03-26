import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/auth";
import { updateSessionActivity } from "@/lib/session-manager";

export async function middleware(request: NextRequest) {
  // Verificar se é uma rota protegida
  const protectedPaths = ['/profile', '/admin', '/advertiser'];
  const isProtectedPath = protectedPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );

  if (isProtectedPath) {
    try {
      const session = await auth();
      
      if (session?.user?.id) {
        // Verificar se a conta foi excluída via API call para evitar importar Prisma
        const checkUrl = new URL('/api/auth/check-account-status', request.url);
        const response = await fetch(checkUrl, {
          headers: {
            'Cookie': request.headers.get('cookie') || '',
          },
        });

        if (response.ok) {
          const { isDeleted } = await response.json();
          
          if (isDeleted) {
            // Redirecionar para logout se a conta foi excluída
            const logoutUrl = new URL('/api/auth/signout', request.url);
            logoutUrl.searchParams.set('callbackUrl', '/');
            return NextResponse.redirect(logoutUrl);
          }
        }

        if (session?.sessionToken) {
          // Atualizar atividade da sessão de forma assíncrona
          updateSessionActivity(session.sessionToken).catch(error => {
            console.error("Erro ao atualizar atividade da sessão:", error);
          });
        }
      }
    } catch (error) {
      console.error("Erro no middleware de sessão:", error);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};