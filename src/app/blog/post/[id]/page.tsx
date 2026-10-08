import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/utils/prisma";
import PostClient from "./PostClient";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

async function getPost(id: string) {
  const postId = Number(id);
  if (!Number.isSafeInteger(postId) || postId <= 0) return null;

  return prisma.post.findUnique({
    where: { id: postId },
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const post = await getPost(id);
  if (!post) return { title: "Artigo não encontrado" };

  const excerpt = post.content
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const description = excerpt.length > 155
    ? `${excerpt.slice(0, 156).replace(/\s+\S*$/, "").trimEnd()}…`
    : excerpt;

  return {
    title: post.title,
    description,
    openGraph: {
      title: post.title,
      description,
      type: "article",
      images: post.imageUrl ? [{ url: post.imageUrl }] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { id } = await params;
  const post = await getPost(id);
  if (!post) notFound();

  return <PostClient initialPost={{ ...post, imageUrl: post.imageUrl ?? undefined }} />;
}
