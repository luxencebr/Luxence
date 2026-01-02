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
