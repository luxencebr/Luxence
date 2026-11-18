import { randomUUID } from "crypto";
import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import sharp from "sharp";
import { deleteFromSpaces } from "@/lib/deleteFromSpaces";
import { uploadToSpaces } from "@/lib/uploadToSpaces";

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

export async function uploadProfileImage(profileId: number, file: File) {
  if (!file.type.startsWith("image/") || file.size === 0 || file.size > MAX_IMAGE_BYTES) {
    throw new Error("Envie uma imagem JPG, PNG ou WebP de até 8 MB.");
  }

  const buffer = await sharp(Buffer.from(await file.arrayBuffer()))
    .rotate()
    .resize(1600, 1600, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();
  const id = randomUUID();
  const filename = `${id}.webp`;

  if (process.env.PROFILE_MEDIA_DIR) {
    const directory = path.join(process.env.PROFILE_MEDIA_DIR, String(profileId));
    await mkdir(directory, { recursive: true });
    await writeFile(path.join(directory, filename), buffer, { flag: "wx" });
    return { id, name: file.name, url: `/api/profile-media/${profileId}/${filename}` };
  }

  const url = await uploadToSpaces({
    buffer,
    filename,
    contentType: "image/webp",
    folder: `profiles/${profileId}`,
  });
  return { id, name: file.name, url };
}

export async function deleteProfileImageUrl(url: string) {
  const local = /^\/api\/profile-media\/(\d+)\/([a-f0-9-]+\.webp)$/.exec(url);
  if (local) {
    if (!process.env.PROFILE_MEDIA_DIR) return;
    await unlink(path.join(process.env.PROFILE_MEDIA_DIR, local[1], local[2])).catch((error) => {
      if (error?.code !== "ENOENT") throw error;
    });
    return;
  }

  const bucket = process.env.DO_SPACES_BUCKET;
  if (!bucket) return;
  const key = url.split(`/${bucket}/`)[1];
  if (key?.startsWith("profiles/")) await deleteFromSpaces(key);
}
