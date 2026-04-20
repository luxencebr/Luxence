import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    // Por enquanto, retornamos uma lista vazia
    // Futuramente aqui você integraria com um gateway de pagamento
    // como Stripe, PagSeguro, Mercado Pago, etc.
    
    return NextResponse.json({
      paymentMethods: [],
      message: "Funcionalidade em desenvolvimento"
    });
  } catch (error) {
    console.error("Erro ao buscar métodos de pagamento:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    // Aqui você implementaria a lógica para adicionar um método de pagamento
    // Integração com gateway de pagamento
    
    return NextResponse.json({
      success: false,
      message: "Funcionalidade em desenvolvimento"
    });
  } catch (error) {
    console.error("Erro ao adicionar método de pagamento:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}