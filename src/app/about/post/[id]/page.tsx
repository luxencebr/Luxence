import { permanentRedirect } from "next/navigation";

export default async function OldPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  permanentRedirect(`/blog/post/${encodeURIComponent(id)}`);
}
