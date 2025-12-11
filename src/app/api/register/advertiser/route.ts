import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { userId } = data;

    if (!userId) {
      return NextResponse.json(
        { error: "userId é obrigatório." },
        { status: 400 }
      );
    }

    const [day, month, year] = data.birthday.split("/");
    const birthday = new Date(`${year}-${month}-${day}`);

    const producer = await prisma.producer.create({
      data: {
        birthday,
        nationality: data.nationality,
        document: data.document,
        phone: data.phone,
        documentFrontPhoto: data.documentFrontPhoto,
        documentBackPhoto: data.documentBackPhoto,
        selfieWithDocument: data.selfieWithDocument,
        signature: "COPPER",
        user: {
          connect: { id: Number(data.userId) },
        },
        // Create empty profile to ensure data consistency
        profile: {
          create: {
            slogan: "",
            description: "",
            images: [],
            scholarity: "",
            languages: [],
            neighborhoods: [],
          },
        },
      },
      include: {
        profile: true,
      },
    });

    return NextResponse.json({ producer }, { status: 201 });
  } catch (error: any) {
    console.error("[v0] Registration error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
