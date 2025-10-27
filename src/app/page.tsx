import { redirect } from "next/navigation";

export default function HomePage() {
  const userUf = "rj";

  redirect(`/catalog/${userUf}`);

  return <div style={{ padding: 50 }}>Redirecionando...</div>;
}
