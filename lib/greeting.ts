export type GreetingFormat =
  | "typewriter"
  | "receipt"
  | "envelope"
  | "postcard"
  | "chat"
  | "memory";

export type GreetingTheme = "moonlight" | "golden" | "cafe" | "cosmic";

export type ExperienceKind =
  | "letters"
  | "scrapbook"
  | "camera"
  | "flowers"
  | "newspaper"
  | "book"
  | "coffee"
  | "place"
  | "typewriter"
  | "gift"
  | "film"
  | "birthday"
  | "chocolate"
  | "playlist"
  | "video"
  | "jar"
  | "coupons"
  | "promise"
  | "puzzle"
  | "timeline"
  | "custom";

export type GreetingData = {
  version: 1;
  recipient: string;
  sender: string;
  occasion: string;
  format: GreetingFormat;
  theme: GreetingTheme;
  title: string;
  message: string;
  memories: string[];
  signoff: string;
  music: boolean;
  experience: ExperienceKind;
  media?: string[];
  details?: Record<string, string>;
};

export const defaultGreeting: GreetingData = {
  version: 1,
  recipient: "Maya",
  sender: "Someone who adores you",
  occasion: "Birthday",
  format: "typewriter",
  theme: "moonlight",
  title: "A little universe for you",
  message:
    "You have a way of making ordinary days feel like stories worth remembering. I hope this next chapter brings you every bit of magic you give to everyone else.",
  memories: [
    "The laugh that fixes everything",
    "Our very long, very unnecessary calls",
    "Every tiny adventure still to come",
  ],
  signoff: "Always in your corner",
  music: false,
  experience: "typewriter",
};

export const experienceMeta: Record<ExperienceKind, {
  name: string;
  shortName: string;
  kicker: string;
  description: string;
  format: GreetingFormat;
  theme: GreetingTheme;
}> = {
  letters: { name: "Open When Letters", shortName: "Open When", kicker: "A letter for every kind of day", description: "Create a bundle of sealed notes they can open whenever the moment feels right.", format: "envelope", theme: "golden" },
  scrapbook: { name: "Memory Scrapbook", shortName: "Scrapbook", kicker: "Cut, tape, keep", description: "Layer photographs, tiny captions and memories into a tactile digital page.", format: "memory", theme: "golden" },
  camera: { name: "Camera Roll", shortName: "Photo Booth", kicker: "Three, two, one—remember", description: "Build a playful digital photo booth and send a swipeable strip of your favorite frames.", format: "memory", theme: "cosmic" },
  flowers: { name: "Flower Bouquet", shortName: "Bouquet", kicker: "A message in every bloom", description: "Choose digital flowers, attach secret meanings and let the bouquet bloom for them.", format: "memory", theme: "golden" },
  newspaper: { name: "Digital Newspaper", shortName: "Newspaper", kicker: "Today’s most important headline", description: "Turn their story into a charming front page with a headline, article and special edition photo.", format: "receipt", theme: "golden" },
  book: { name: "Memory Book", shortName: "Memory Book", kicker: "A story worth turning pages for", description: "Write chapters, add keepsakes and create a book they can revisit page by page.", format: "memory", theme: "golden" },
  coffee: { name: "Coffee Date", shortName: "Coffee Date", kicker: "Made warm, served with memories", description: "Recreate your favorite café ritual with a drink, a table note and ambient warmth.", format: "chat", theme: "cafe" },
  place: { name: "Favorite Place", shortName: "Favorite Place", kicker: "Pin the places that hold your story", description: "Create a postcard map of meaningful places, routes and reasons they matter.", format: "postcard", theme: "golden" },
  typewriter: { name: "Typewriter Letter", shortName: "Typewriter", kicker: "Every word arrives key by key", description: "Write a timeless letter and let them watch it appear with a satisfying typewriter rhythm.", format: "typewriter", theme: "golden" },
  gift: { name: "Surprise Gift Box", shortName: "Gift Box", kicker: "One box, many little surprises", description: "Stack notes, wishes and memories into layers they unwrap one at a time.", format: "memory", theme: "cosmic" },
  film: { name: "Memory Film", shortName: "Memory Film", kicker: "A few moments, kept in motion", description: "Arrange photographs into a cinematic sequence with dates, captions and a final note.", format: "memory", theme: "moonlight" },
  birthday: { name: "Birthday Celebration", shortName: "Birthday", kicker: "Cake, candles, wish, confetti", description: "Build a playful birthday ritual with a cake, candles, balloons and a message after the wish.", format: "memory", theme: "cosmic" },
  chocolate: { name: "Chocolate Box", shortName: "Chocolate Box", kicker: "A sweet note under every piece", description: "Fill a collectible chocolate box with compliments, memories and tiny surprises.", format: "memory", theme: "cafe" },
  playlist: { name: "Song Dedication", shortName: "Playlist", kicker: "Press play on a feeling", description: "Dedicate a legally embeddable song link in a tactile record-player experience.", format: "memory", theme: "moonlight" },
  video: { name: "Video Message", shortName: "Video Message", kicker: "Someone recorded this for you", description: "Frame a personal video with a cover, short introduction and final note.", format: "memory", theme: "cosmic" },
  jar: { name: "Compliment Jar", shortName: "Compliment Jar", kicker: "Pull one whenever you need it", description: "Fill a glass jar with compliments, encouragement, memories and inside jokes.", format: "memory", theme: "golden" },
  coupons: { name: "Digital Coupons", shortName: "Coupons", kicker: "Little promises you can redeem", description: "Create a stack of tearable personal tickets for dates, hugs and future plans.", format: "receipt", theme: "golden" },
  promise: { name: "Future Date", shortName: "Future Date", kicker: "Save a place for something lovely", description: "Turn a future plan into a beautiful event pass with a date, time and place.", format: "postcard", theme: "golden" },
  puzzle: { name: "Secret Message Puzzle", shortName: "Secret Puzzle", kicker: "A tiny mystery with a warm ending", description: "Hide a message behind a short, accessible set of flip cards.", format: "memory", theme: "cosmic" },
  timeline: { name: "Memory Timeline", shortName: "Timeline", kicker: "Follow the moments that brought us here", description: "Build an exploratory trail of dated memories, places and photographs.", format: "memory", theme: "golden" },
  custom: { name: "Create From Scratch", shortName: "Blank Canvas", kicker: "Your story, your building blocks", description: "Compose a personal experience from reorderable text, photo, quote and surprise blocks.", format: "memory", theme: "golden" },
};

export const formatMeta: Record<
  GreetingFormat,
  { name: string; description: string; symbol: string }
> = {
  typewriter: { name: "Typewriter", description: "Written key by key", symbol: "Aa" },
  receipt: { name: "Memory receipt", description: "Little things, itemized", symbol: "#" },
  envelope: { name: "Addressed letter", description: "Sealed and delivered", symbol: "✉" },
  postcard: { name: "Postcard", description: "Sent from a memory", symbol: "⌁" },
  chat: { name: "Midnight chat", description: "A familiar conversation", symbol: "…" },
  memory: { name: "Memory note", description: "Soft, handwritten warmth", symbol: "♡" },
};

export const themeMeta: Record<GreetingTheme, { name: string; mood: string }> = {
  moonlight: { name: "Moonlit Garden", mood: "Dreamy · Tender" },
  golden: { name: "Golden Hour", mood: "Warm · Nostalgic" },
  cafe: { name: "Cozy Café", mood: "Soft · Intimate" },
  cosmic: { name: "Starry Voyage", mood: "Magical · Vast" },
};

export function encodeGreeting(greeting: GreetingData): string {
  // Strip any heavy base64 data strings before encoding so share URLs remain lightweight (< 2KB)
  const cleanDetails = { ...greeting.details };
  delete cleanDetails.audioClip;
  const cleanGreeting = { ...greeting, details: cleanDetails };

  const json = JSON.stringify(cleanGreeting);
  const bytes = new TextEncoder().encode(json);
  let binary = "";
  bytes.forEach((byte) => (binary += String.fromCharCode(byte)));
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

export function decodeGreeting(value: string): GreetingData | null {
  try {
    const normalized = value.replaceAll("-", "+").replaceAll("_", "/");
    const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    const parsed = JSON.parse(new TextDecoder().decode(bytes)) as Partial<GreetingData>;
    if (parsed.version !== 1 || !parsed.recipient || !parsed.message) return null;
    return { ...defaultGreeting, ...parsed };
  } catch {
    return null;
  }
}
