import { prisma } from "@/utils/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("image") as File | null;
    const title = formData.get("title")?.toString() || "";
    const content = formData.get("content")?.toString() || "";

    if (!title || !content) {
      return NextResponse.json(
        { error: "Título e conteúdo são obrigatórios" },
        { status: 400 }
      );
    }

    let imageJson: string[] | null = null;

    if (file) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const mimeType = file.type;
      const dataUrl = `data:${mimeType};base64,${buffer.toString("base64")}`;

      // Salva apenas o base64 em um array
      imageJson = [dataUrl];
    }

    const newPost = await prisma.post.create({
      data: {
        title,
        content,
        image: imageJson ?? undefined, // JSON de string
      },
    });

    return NextResponse.json(newPost);
  } catch (error) {
    console.error("POST CREATE ERROR:", error);
    return NextResponse.json(
      { error: "Erro ao criar post", details: String(error) },
      { status: 500 }
    );
  }
}
