export function formatUserName(fullName?: string): string {
  if (!fullName) return "Usuário";

  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return capitalize(parts[0]);

  const first = capitalize(parts[0]);
  const last = capitalize(parts[parts.length - 1]);
  return `${first} ${last}`;
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}
