import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

interface UploadToSpacesParams {
  buffer: Buffer;
  filename: string;
  contentType: string;
  folder?: string;
}

const s3 = new S3Client({
  region: process.env.DO_SPACES_REGION!,
  endpoint: process.env.DO_SPACES_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.DO_SPACES_KEY!,
    secretAccessKey: process.env.DO_SPACES_SECRET!,
  },
});

export async function uploadToSpaces({
  buffer,
  filename,
  contentType,
  folder,
}: UploadToSpacesParams): Promise<string> {
  const bucket = process.env.DO_SPACES_BUCKET!;
  const key = folder ? `${folder}/${filename}` : filename;

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    ACL: "public-read", // fundamental para acesso via URL
  });

  await s3.send(command);

  return `${process.env.DO_SPACES_ENDPOINT}/${bucket}/${key}`;
}

import { randomUUID } from "crypto";

type ProfileImage = {
  id?: string;
  name: string;
  url: string;
};

function isProfileImageArray(value: unknown): value is ProfileImage[] {
  return (
    Array.isArray(value) &&
    value.every(
      (img) =>
        typeof img === "object" &&
        img !== null &&
        "url" in img &&
        typeof (img as any).url === "string"
    )
  );
}

function parseBase64Image(dataUrl: string) {
  const match = dataUrl.match(/^data:(image\/\w+);base64,(.+)$/);

  if (!match) {
    throw new Error("Base64 inválido");
  }

  const mimeType = match[1];
  const base64Data = match[2];

  return {
    buffer: Buffer.from(base64Data, "base64"),
    mimeType,
    extension: mimeType.split("/")[1],
  };
}

async function migrate() {
  const profiles = await prisma.producerProfile.findMany();

  console.log(`🔎 ${profiles.length} perfis encontrados`);

  for (const profile of profiles) {
    const images = profile.images;

    if (!isProfileImageArray(images) || images.length === 0) continue;

    let hasChanges = false;

    const migratedImages = await Promise.all(
      images.map(async (img) => {
        if (!img.url.startsWith("data:image/")) {
          return img;
        }

        try {
          const { buffer, mimeType, extension } = parseBase64Image(img.url);

          const imageId = img.id ?? randomUUID();
          const fileName = `${imageId}-legacy.${extension}`;

          const uploadedUrl = await uploadToSpaces({
            buffer,
            filename: fileName,
            contentType: mimeType,
            folder: `profiles/${profile.id}`,
          });

          hasChanges = true;

          console.log(`✅ Migrada imagem ${imageId} (profile ${profile.id})`);

          return {
            ...img,
            id: imageId,
            url: uploadedUrl,
          };
        } catch (err) {
          console.error(
            `❌ Erro ao migrar imagem do profile ${profile.id}`,
            err
          );
          return img;
        }
      })
    );

    if (hasChanges) {
      await prisma.producerProfile.update({
        where: { id: profile.id },
        data: { images: migratedImages },
      });
    }
  }

  console.log("🎉 Migração finalizada");
}

migrate()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
