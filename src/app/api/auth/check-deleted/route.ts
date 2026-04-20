import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/utils/prisma";

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ isDeleted: false });
    }

    const user = await prisma.user.findUnique({
      where: { id: parseInt(session.user.id) },
      select: { isDeleted: true },
    });

    if (!user) {
      return NextResponse.json({ isDeleted: true });
    }

    return NextResponse.json({ isDeleted: user.isDeleted });
  } catch (error) {
    console.error("Erro ao verificar conta excluída:", error);
    return NextResponse.json({ isDeleted: false });
  }
}