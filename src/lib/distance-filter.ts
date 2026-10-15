export type Coordinates = { lat: number; lng: number };

export const DEFAULT_PROFILE_CEP = "22640334";
export const DISTANCE_RADII = [5, 10, 25, 50] as const;

const cache = new Map<string, { value: Coordinates | null; expiresAt: number }>();
const pending = new Map<string, Promise<Coordinates | null>>();

export function normalizeProfileCep(value?: string | null): string {
  const digits = value?.replace(/\D/g, "") || "";
  return digits.length === 8 ? digits : DEFAULT_PROFILE_CEP;
}

export function isValidCoordinates({ lat, lng }: Coordinates): boolean {
  return Number.isFinite(lat) && Number.isFinite(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

export function distanceKm(from: Coordinates, to: Coordinates): number {
  const radians = (degrees: number) => (degrees * Math.PI) / 180;
  const dLat = radians(to.lat - from.lat);
  const dLng = radians(to.lng - from.lng);
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(radians(from.lat)) * Math.cos(radians(to.lat)) * Math.sin(dLng / 2) ** 2;
  const bounded = Math.min(1, Math.max(0, a));
  return 6371.0088 * 2 * Math.atan2(Math.sqrt(bounded), Math.sqrt(1 - bounded));
}

export async function coordinatesForCep(cep: string): Promise<Coordinates | null> {
  const cached = cache.get(cep);
  if (cached && cached.expiresAt > Date.now()) return cached.value;
  const inFlight = pending.get(cep);
  if (inFlight) return inFlight;

  const lookup = (async () => {
    try {
      const response = await fetch(`https://brasilapi.com.br/api/cep/v2/${cep}`, {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(5000),
      });
      if (!response.ok) throw new Error(`CEP lookup failed: ${response.status}`);
      const result = await response.json();
      const lat = Number(result?.location?.coordinates?.latitude);
      const lng = Number(result?.location?.coordinates?.longitude);
      const value = result?.location?.coordinates?.latitude != null &&
        result?.location?.coordinates?.longitude != null &&
        isValidCoordinates({ lat, lng }) ? { lat, lng } : null;
      cache.set(cep, { value, expiresAt: Date.now() + (value ? 24 * 60 * 60 * 1000 : 10 * 60 * 1000) });
      return value;
    } catch {
      // Uma falha de geocodificação não deve expor o endereço nem gerar distância falsa.
      cache.set(cep, { value: null, expiresAt: Date.now() + 60 * 1000 });
      return null;
    } finally {
      pending.delete(cep);
    }
  })();
  pending.set(cep, lookup);
  return lookup;
}

export async function coordinatesForCeps(ceps: string[]): Promise<Map<string, Coordinates | null>> {
  const unique = [...new Set(ceps)];
  const results = new Map<string, Coordinates | null>();
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(4, unique.length) }, async () => {
    while (next < unique.length) {
      const cep = unique[next++];
      results.set(cep, await coordinatesForCep(cep));
    }
  }));
  return results;
}
