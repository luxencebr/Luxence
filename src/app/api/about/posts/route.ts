import { prisma } from "@/utils/prisma";
import { uploadToSpaces } from "@/lib/uploadToSpaces";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("image") as File | null;
    const title = formData.get("title")?.toString() || "";
    const content = formData.get("content")?.toString() || "";

    if (!title || !content) {
      return NextResponse.json(
        { error: "Título e conteúdo são obrigatórios" },
        { status: 400 },
      );
    }

    let imageUrl: string | undefined = undefined;

    if (file) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Gerar nome único para o arquivo
      const fileExtension = file.name.split(".").pop() || "jpg";
      const filename = `${randomUUID()}.${fileExtension}`;

      // Upload para DigitalOcean Spaces
      imageUrl = await uploadToSpaces({
        buffer,
        filename,
        contentType: file.type,
        folder: "blog",
      });
    }

    const newPost = await prisma.post.create({
      data: {
        title,
        content,
        imageUrl,
      },
    });

    return NextResponse.json(newPost);
  } catch (error) {
    console.error("POST CREATE ERROR:", error);
    return NextResponse.json(
      { error: "Erro ao criar publicação", details: String(error) },
      { status: 500 },
    );
  }
}
