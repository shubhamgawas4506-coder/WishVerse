import { GreetingData } from "@/lib/greeting";

const CREATIONS_KEY = "wishverse-creations-v2";
const FAVOURITES_KEY = "wishverse-favourite-experiences-v1";

export type CreationStatus = "draft" | "published";

export type StoredCreation = {
  id: string;
  publicId: string;
  rCode: string;
  name: string;
  status: CreationStatus;
  greeting: GreetingData;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
};

function storageAvailable() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function generateRCode(): string {
  const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  let code = "R-";
  if (typeof crypto !== "undefined" && "getRandomValues" in crypto) {
    const bytes = crypto.getRandomValues(new Uint8Array(6));
    for (let i = 0; i < 6; i++) {
      code += chars[bytes[i] % chars.length];
    }
  } else {
    for (let i = 0; i < 6; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
  }
  return code;
}

export function getUniqueRCode(): string {
  const existingCodes = new Set(getCreations().map((c) => c.rCode?.toUpperCase()).filter(Boolean));
  let code = generateRCode();
  let attempts = 0;
  while (existingCodes.has(code.toUpperCase()) && attempts < 15) {
    code = generateRCode();
    attempts++;
  }
  return code;
}

export function createOpaqueId(prefix = "wv") {
  if (typeof crypto !== "undefined" && "getRandomValues" in crypto) {
    const bytes = crypto.getRandomValues(new Uint8Array(12));
    return `${prefix}_${Array.from(bytes, (byte) => byte.toString(36).padStart(2, "0")).join("")}`;
  }
  return `${prefix}_${Date.now().toString(36)}`;
}

export function getCreations(): StoredCreation[] {
  if (!storageAvailable()) return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(CREATIONS_KEY) || "[]") as StoredCreation[];
    return Array.isArray(parsed) ? parsed.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)) : [];
  } catch {
    return [];
  }
}

export function getCreation(id: string) {
  return getCreations().find((creation) => creation.id === id) || null;
}

export function getCreationByRCode(rCode: string): StoredCreation | null {
  if (!rCode) return null;
  const clean = rCode.trim().toUpperCase();
  return getCreations().find((c) => c.rCode?.toUpperCase() === clean) || null;
}

export function getCreationByPublicId(publicId: string): StoredCreation | null {
  if (!publicId) return null;
  return getCreations().find((c) => c.publicId === publicId) || null;
}

export async function fetchCreationFromServer(idOrPublicId: string): Promise<StoredCreation | null> {
  if (!idOrPublicId) return null;
  try {
    const res = await fetch(`/api/creations/${encodeURIComponent(idOrPublicId)}`);
    if (res.ok) {
      const data = await res.json();
      if (data?.creation) return data.creation as StoredCreation;
    }
  } catch {
    // offline or network failure
  }
  return null;
}

export function saveCreation(input: Partial<StoredCreation> & Pick<StoredCreation, "greeting">): StoredCreation {
  const current = getCreations();
  const existing = input.id ? current.find((creation) => creation.id === input.id) : undefined;
  const now = new Date().toISOString();
  const rCode = existing?.rCode || input.rCode || getUniqueRCode();

  // Strip any old heavy base64 audio data strings so storage is fast and never exceeds quota
  const cleanDetails = { ...input.greeting.details };
  delete cleanDetails.audioClip;
  const cleanGreeting = { ...input.greeting, details: cleanDetails };

  const creation: StoredCreation = {
    id: existing?.id || input.id || createOpaqueId("draft"),
    publicId: existing?.publicId || input.publicId || createOpaqueId("gift"),
    rCode,
    name: input.name || existing?.name || input.greeting.title || "Untitled WishVerse",
    status: input.status || existing?.status || "draft",
    greeting: cleanGreeting,
    createdAt: existing?.createdAt || input.createdAt || now,
    updatedAt: now,
    publishedAt: input.status === "published" ? existing?.publishedAt || now : existing?.publishedAt,
  };
  if (storageAvailable()) {
    try {
      const next = [creation, ...current.filter((item) => item.id !== creation.id)];
      localStorage.setItem(CREATIONS_KEY, JSON.stringify(next));
      window.dispatchEvent(new CustomEvent("wishverse:creations"));
    } catch (storageErr) {
      console.warn("LocalStorage save skipped:", storageErr);
    }
    try {
      fetch("/api/creations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(creation),
      }).catch(() => {});
    } catch {}
  }
  return creation;
}

export function deleteCreation(id: string) {
  if (!storageAvailable()) return;
  localStorage.setItem(CREATIONS_KEY, JSON.stringify(getCreations().filter((creation) => creation.id !== id)));
  window.dispatchEvent(new CustomEvent("wishverse:creations"));
}

export function duplicateCreation(id: string) {
  const source = getCreation(id);
  if (!source) return null;
  return saveCreation({
    greeting: { ...source.greeting, media: [...(source.greeting.media || [])], memories: [...source.greeting.memories], details: { ...source.greeting.details } },
    name: `${source.name} — copy`,
    status: "draft",
  });
}

export function getFavouriteExperiences(): string[] {
  if (!storageAvailable()) return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(FAVOURITES_KEY) || "[]") as string[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function toggleFavouriteExperience(id: string) {
  const current = getFavouriteExperiences();
  const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
  if (storageAvailable()) localStorage.setItem(FAVOURITES_KEY, JSON.stringify(next));
  return next;
}
