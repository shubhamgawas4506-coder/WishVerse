import { ExperienceKind } from "@/lib/greeting";

export type ExperienceCategory = "Birthday" | "Love" | "Friendship" | "Memories" | "Flowers" | "Coffee Date" | "Places" | "Celebration" | "Appreciation" | "Custom";

export type ExperienceDefinition = {
  id: ExperienceKind;
  name: string;
  eyebrow: string;
  description: string;
  categories: ExperienceCategory[];
  capability: string;
  art: string;
  size: "standard" | "wide" | "tall";
  available: boolean;
};

export const experienceDefinitions: ExperienceDefinition[] = [
  { id: "flowers", name: "Digital Flower Bouquet", eyebrow: "Botanical", description: "Select real flower varieties and watch a personal bouquet bloom into place.", categories: ["Flowers", "Love", "Appreciation"], capability: "Flowers · note · photo", art: "botanical", size: "wide", available: true },
  { id: "birthday", name: "Birthday Celebration", eyebrow: "Birthday", description: "Cake, candles, balloons and a tap-to-make-a-wish finale.", categories: ["Birthday", "Celebration"], capability: "Cake · candles · confetti", art: "birthday", size: "tall", available: true },
  { id: "coffee", name: "Coffee Date", eyebrow: "Invitation", description: "Pick the drink, mood, date, time and place for a warm invitation.", categories: ["Coffee Date", "Love", "Friendship"], capability: "Drink · date · place", art: "coffee", size: "standard", available: true },
  { id: "place", name: "Our Place", eyebrow: "Places", description: "Pin the places that became part of your shared story.", categories: ["Places", "Memories", "Love"], capability: "Place · date · photo", art: "map", size: "wide", available: true },
  { id: "film", name: "Memory Film", eyebrow: "Memories", description: "Turn an ordered set of moments into a cinematic little film.", categories: ["Memories", "Friendship", "Love"], capability: "Photos · dates · playback", art: "film", size: "wide", available: true },
  { id: "scrapbook", name: "Polaroid Memory Wall", eyebrow: "Memories", description: "Tape, arrange and reveal captions behind tactile photo keepsakes.", categories: ["Memories", "Friendship"], capability: "Photos · captions · secrets", art: "polaroid", size: "tall", available: true },
  { id: "typewriter", name: "Digital Letter", eyebrow: "Letter", description: "A timeless typed or handwritten letter delivered inside an envelope.", categories: ["Love", "Friendship", "Appreciation"], capability: "Letter · signature · photo", art: "letter", size: "standard", available: true },
  { id: "gift", name: "Surprise Gift Box", eyebrow: "Celebration", description: "Unwrap a stack of messages, promises and little surprises one at a time.", categories: ["Birthday", "Celebration", "Love"], capability: "Layers · ribbon · confetti", art: "gift", size: "tall", available: true },
  { id: "chocolate", name: "Chocolate Box", eyebrow: "Sweet", description: "Hide a compliment, memory or joke underneath every chocolate.", categories: ["Love", "Birthday", "Appreciation"], capability: "Chocolates · hidden notes", art: "chocolate", size: "standard", available: true },
  { id: "playlist", name: "Song Dedication", eyebrow: "Music", description: "A record-player dedication for a song that says what words cannot.", categories: ["Love", "Friendship", "Appreciation"], capability: "Song link · cover · reason", art: "record", size: "tall", available: true },
  { id: "video", name: "Video Message", eyebrow: "Video", description: "Build anticipation before a personal recording, then reveal a final note.", categories: ["Birthday", "Celebration", "Appreciation"], capability: "Video · cover · final note", art: "video", size: "wide", available: true },
  { id: "jar", name: "Compliment Jar", eyebrow: "Appreciation", description: "Fill a virtual jar with notes they can pull out whenever they need one.", categories: ["Appreciation", "Friendship", "Love"], capability: "Pullable notes", art: "jar", size: "standard", available: true },
  { id: "coupons", name: "Digital Coupons", eyebrow: "Promises", description: "A collectible ticket book for future coffees, hugs and adventures.", categories: ["Love", "Friendship", "Appreciation"], capability: "Tickets · redeem confirmation", art: "tickets", size: "wide", available: true },
  { id: "promise", name: "Future Date", eyebrow: "Invitation", description: "Turn a plan for later into an event pass worth looking forward to.", categories: ["Love", "Friendship", "Places"], capability: "Activity · date · place", art: "pass", size: "standard", available: true },
  { id: "letters", name: "Open When…", eyebrow: "Letter bundle", description: "Create a collection of envelopes for different kinds of days.", categories: ["Love", "Friendship", "Appreciation"], capability: "Multiple envelopes", art: "envelopes", size: "tall", available: true },
  { id: "puzzle", name: "Secret Message Puzzle", eyebrow: "Play", description: "Let them reveal a hidden message by flipping a few friendly clues.", categories: ["Love", "Friendship", "Celebration"], capability: "Flip cards · secret reveal", art: "puzzle", size: "wide", available: true },
  { id: "book", name: "Our Little Story", eyebrow: "Story", description: "Write your own chapters and let them turn through the pages.", categories: ["Memories", "Love", "Friendship"], capability: "Chapters · page turns", art: "book", size: "tall", available: true },
  { id: "timeline", name: "Memory Timeline", eyebrow: "Memories", description: "An exploratory trail through dates, places and moments that mattered.", categories: ["Memories", "Love", "Friendship"], capability: "Dates · milestones · photos", art: "timeline", size: "wide", available: true },
  { id: "custom", name: "Create From Scratch", eyebrow: "Custom", description: "Build a tiny world from reorderable text, photo, quote and surprise blocks.", categories: ["Custom"], capability: "Flexible blocks", art: "blocks", size: "wide", available: true },
  { id: "camera", name: "Digital Photo Booth", eyebrow: "Memories", description: "Snap together a playful photo strip with captions and filters.", categories: ["Memories", "Friendship", "Celebration"], capability: "Photos · filters · strip", art: "camera", size: "standard", available: true },
  { id: "newspaper", name: "Digital Newspaper", eyebrow: "Celebration", description: "Make them the headline of a very important special edition.", categories: ["Birthday", "Celebration", "Appreciation"], capability: "Headline · article · photo", art: "news", size: "tall", available: true },
];

export const experienceById = Object.fromEntries(experienceDefinitions.map((experience) => [experience.id, experience])) as Record<ExperienceKind, ExperienceDefinition>;

export const experienceCategories: Array<"All" | ExperienceCategory> = ["All", "Birthday", "Love", "Friendship", "Memories", "Flowers", "Coffee Date", "Places", "Celebration", "Appreciation", "Custom"];
