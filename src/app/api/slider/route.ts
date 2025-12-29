import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  const sliderDir = path.join(process.cwd(), "public", "slider");

  const files = fs
    .readdirSync(sliderDir)
    .filter((file) => /\.(png|jpe?g|webp|svg)$/i.test(file));

  const slides = files.map((file) => `/slider/${file}`);

  return NextResponse.json(slides);
}
