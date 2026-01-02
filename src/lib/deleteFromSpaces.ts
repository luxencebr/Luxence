import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: process.env.DO_SPACES_REGION!,
  endpoint: process.env.DO_SPACES_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.DO_SPACES_KEY!,
    secretAccessKey: process.env.DO_SPACES_SECRET!,
  },
});

export async function deleteFromSpaces(key: string) {
  const bucket = process.env.DO_SPACES_BUCKET!;

  const command = new DeleteObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  await s3.send(command);
}
