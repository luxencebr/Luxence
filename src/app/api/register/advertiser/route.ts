import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { uploadToSpaces } from "@/lib/uploadToSpaces";
import { randomUUID } from "crypto";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const userId = formData.get("userId") as string;
    const birthday = formData.get("birthday") as string;
    const nationality = formData.get("nationality") as string;
    const document = formData.get("document") as string;
    const phone = formData.get("phone") as string;

    const documentFrontFile = formData.get("documentFrontFile") as File | null;
    const documentBackFile = formData.get("documentBackFile") as File | null;
    const selfieWithDocumentFile = formData.get(
      "selfieWithDocumentFile",
    ) as File | null;

    if (!userId) {
      return NextResponse.json(
        { error: "userId é obrigatório." },
        { status: 400 },
      );
    }

    const cleanDocument = document?.replace(/\D/g, "");
    const existingProducer = await prisma.producer.findFirst({
      where: {
        OR: [{ document: document }, { document: cleanDocument }],
      },
    });

    if (existingProducer) {
      return NextResponse.json(
        { error: "Este documento já está cadastrado." },
        { status: 400 },
      );
    }

    const [day, month, year] = birthday.split("/");
    const birthdayDate = new Date(`${year}-${month}-${day}`);

    if (!documentFrontFile || !documentBackFile || !selfieWithDocumentFile) {
      return NextResponse.json(
        { error: "Todas as fotos de documento são obrigatórias." },
        { status: 400 },
      );
    }

    // Upload das imagens de verificação para o storage
    const verificationFolder = `verification/${userId}`;
    const uniqueId = randomUUID();

    let documentFrontPhoto: string;
    let documentBackPhoto: string;
    let selfieWithDocument: string;

    try {
      // Upload frente do documento
      const frontBuffer = Buffer.from(await documentFrontFile.arrayBuffer());
      documentFrontPhoto = await uploadToSpaces({
        buffer: frontBuffer,
        filename: `${uniqueId}-document-front-${documentFrontFile.name}`,
        contentType: documentFrontFile.type,
        folder: verificationFolder,
      });

      // Upload verso do documento
      const backBuffer = Buffer.from(await documentBackFile.arrayBuffer());
      documentBackPhoto = await uploadToSpaces({
        buffer: backBuffer,
        filename: `${uniqueId}-document-back-${documentBackFile.name}`,
        contentType: documentBackFile.type,
        folder: verificationFolder,
      });

      // Upload selfie com documento
      const selfieBuffer = Buffer.from(
        await selfieWithDocumentFile.arrayBuffer(),
      );
      selfieWithDocument = await uploadToSpaces({
        buffer: selfieBuffer,
        filename: `${uniqueId}-selfie-${selfieWithDocumentFile.name}`,
        contentType: selfieWithDocumentFile.type,
        folder: verificationFolder,
      });
    } catch (uploadError: any) {
      console.error("[v0] Upload error:", uploadError);
      return NextResponse.json(
        {
          error:
            "Erro ao fazer upload das imagens. Verifique se o serviço de armazenamento está configurado.",
        },
        { status: 500 },
      );
    }

    // Buscar o nome do usuário
    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
      select: { name: true },
    });

    const producer = await prisma.producer.create({
      data: {
        name: user?.name || "",
        birthday: birthdayDate,
        nationality,
        document,
        phone,
        documentFrontPhoto,
        documentBackPhoto,
        selfieWithDocument,
        signature: "COPPER",
        user: {
          connect: { id: Number(userId) },
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

    // Update user with locality information (upsert para não dar erro se já existir)
    const existingLocality = await prisma.locality.findUnique({
      where: { userId: Number(userId) },
    });

    if (!existingLocality) {
      await prisma.locality.create({
        data: {
          userId: Number(userId),
          country: "Brasil",
          state: "RJ",
          city: "Rio de Janeiro",
        },
      });
    }

    return NextResponse.json({ producer }, { status: 201 });
  } catch (error: any) {
    console.error("[v0] Registration error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
