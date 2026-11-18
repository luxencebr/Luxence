import { readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ profileId: string; filename: string }> },
) {
  const { profileId, filename } = await params;
  const directory = process.env.PROFILE_MEDIA_DIR;
  if (!directory || !/^\d+$/.test(profileId) || !/^[a-f0-9-]+\.webp$/.test(filename)) {
    return new NextResponse(null, { status: 404 });
  }

  try {
    const image = await readFile(path.join(directory, profileId, filename));
    return new NextResponse(image, {
      headers: { "Content-Type": "image/webp", "Cache-Control": "public, max-age=86400" },
    });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}
