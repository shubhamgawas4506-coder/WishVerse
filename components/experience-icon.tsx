import {
  Blocks,
  BookHeart,
  CakeSlice,
  CalendarHeart,
  Camera,
  Candy,
  Coffee,
  Disc3,
  Film,
  Flower2,
  Gift,
  GlassWater,
  Mail,
  MapPin,
  Milestone,
  Newspaper,
  Puzzle,
  Ticket,
  Type,
  Video,
} from "lucide-react";
import { ExperienceKind } from "@/lib/greeting";

const iconMap = {
  letters: Mail,
  scrapbook: BookHeart,
  camera: Camera,
  flowers: Flower2,
  newspaper: Newspaper,
  book: BookHeart,
  coffee: Coffee,
  place: MapPin,
  typewriter: Type,
  gift: Gift,
  film: Film,
  birthday: CakeSlice,
  chocolate: Candy,
  playlist: Disc3,
  video: Video,
  jar: GlassWater,
  coupons: Ticket,
  promise: CalendarHeart,
  puzzle: Puzzle,
  timeline: Milestone,
  custom: Blocks,
} satisfies Record<ExperienceKind, React.ComponentType<{ className?: string }>>;

export function ExperienceIcon({ experience, className }: { experience: ExperienceKind; className?: string }) {
  const Icon = iconMap[experience];
  return <Icon className={className} aria-hidden="true" />;
}
