import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { uploadToSpaces } from "@/lib/uploadToSpaces";
import { randomUUID } from "crypto";
import { hash } from "bcryptjs";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    // ========== EXTRAIR DADOS ==========
    // Dados da conta
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const gender = formData.get("gender") as "MALE" | "FEMALE" | "TRANS";
    const preferences = formData.getAll("preferences") as ("MALE" | "FEMALE" | "TRANS")[];

    // Dados do perfil
    const birthday = formData.get("birthday") as string;
    const nationality = formData.get("nationality") as string;
    const document = formData.get("document") as string;
    const phone = formData.get("phone") as string;

    // Arquivos de verificação
    const documentFrontFile = formData.get("documentFrontFile") as File | null;
    const documentBackFile = formData.get("documentBackFile") as File | null;
    const selfieWithDocumentFile = formData.get("selfieWithDocumentFile") as File | null;

    // ========== VALIDAÇÕES ==========
    if (!name || !email || !password || !gender || preferences.length === 0) {
      return NextResponse.json(
        { error: "Dados da conta incompletos." },
        { status: 400 },
      );
    }

    if (!birthday || !nationality || !document || !phone) {
      return NextResponse.json(
        { error: "Dados do perfil incompletos." },
        { status: 400 },
      );
    }

    if (!documentFrontFile || !documentBackFile || !selfieWithDocumentFile) {
      return NextResponse.json(
        { error: "Todas as fotos de documento são obrigatórias." },
        { status: 400 },
      );
    }

    // Verificar email duplicado
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: "Este email já está cadastrado." },
        { status: 400 },
      );
    }

    // Verificar documento duplicado
    const cleanDocument = document.replace(/\D/g, "");
    const existingProducer = await prisma.producer.findFirst({
      where: {
        OR: [{ document }, { document: cleanDocument }],
      },
    });

    if (existingProducer) {
      return NextResponse.json(
        { error: "Este documento já está cadastrado." },
        { status: 400 },
      );
    }

    // ========== CRIAR USUÁRIO ==========
    const hashedPassword = await hash(password, 10);
    const [day, month, year] = birthday.split("/");
    const birthdayDate = new Date(`${year}-${month}-${day}`);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        gender,
        preferences: {
          create: preferences.map((pref) => ({ gender: pref })),
        },
        role: "ADVERTISER",
      },
    });

    // ========== UPLOAD DE DOCUMENTOS ==========
    const verificationFolder = `verification/${user.id}`;
    const uniqueId = randomUUID();

    let documentFrontPhoto: string;
    let documentBackPhoto: string;
    let selfieWithDocument: string;

    try {
      const frontBuffer = Buffer.from(await documentFrontFile.arrayBuffer());
      documentFrontPhoto = await uploadToSpaces({
        buffer: frontBuffer,
        filename: `${uniqueId}-front-${documentFrontFile.name}`,
        contentType: documentFrontFile.type,
        folder: verificationFolder,
      });

      const backBuffer = Buffer.from(await documentBackFile.arrayBuffer());
      documentBackPhoto = await uploadToSpaces({
        buffer: backBuffer,
        filename: `${uniqueId}-back-${documentBackFile.name}`,
        contentType: documentBackFile.type,
        folder: verificationFolder,
      });

      const selfieBuffer = Buffer.from(await selfieWithDocumentFile.arrayBuffer());
      selfieWithDocument = await uploadToSpaces({
        buffer: selfieBuffer,
        filename: `${uniqueId}-selfie-${selfieWithDocumentFile.name}`,
        contentType: selfieWithDocumentFile.type,
        folder: verificationFolder,
      });
    } catch (uploadError: any) {
      console.error("Upload error:", uploadError);
      // Rollback: deletar usuário se upload falhar
      await prisma.user.delete({ where: { id: user.id } });
      return NextResponse.json(
        { error: "Erro ao fazer upload das imagens." },
        { status: 500 },
      );
    }

    // ========== CRIAR PRODUCER E PERFIL ==========
    const contactOptions = await prisma.contactOption.findMany({
      select: { id: true },
    });

    const producer = await prisma.producer.create({
      data: {
        name: "", // Perfil sem nome inicialmente
        birthday: birthdayDate,
        nationality,
        document,
        phone,
        documentFrontPhoto,
        documentBackPhoto,
        selfieWithDocument,
        signature: "COPPER",
        user: {
          connect: { id: user.id },
        },
        profile: {
          create: {
            slogan: "",
            description: "",
            images: [],
            scholarity: "",
            languages: [],
            neighborhoods: [],
            contacts: {
              create: contactOptions.map((option, index) => ({
                option: {
                  connect: { id: option.id },
                },
                value: "",
                label: null,
                isPrimary: false,
                isPublic: false,
                order: index,
              })),
            },
          },
        },
      },
      include: {
        profile: {
          include: {
            contacts: {
              include: { option: true },
            },
          },
        },
      },
    });

    // Criar localidade padrão
    await prisma.locality.create({
      data: {
        userId: user.id,
        country: "Brasil",
        state: "RJ",
        city: "Rio de Janeiro",
      },
    });

    return NextResponse.json({ producer }, { status: 201 });
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
