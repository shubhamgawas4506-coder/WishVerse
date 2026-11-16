import type { Metadata } from "next";
import { Caveat, DM_Sans, Fredoka, Instrument_Serif, Special_Elite } from "next/font/google";
import "./globals.css";
import "./studio.css";
import "./experience.css";
import "./maker.css";
import "./platform.css";

const sans = DM_Sans({ subsets: ["latin"], variable: "--font-sans" });
const rounded = Fredoka({ subsets: ["latin"], variable: "--font-round" });
const handwritten = Caveat({ subsets: ["latin"], variable: "--font-hand" });
const typewriter = Special_Elite({ subsets: ["latin"], variable: "--font-type", weight: "400" });
const display = Instrument_Serif({
  subsets: ["latin"],
  variable: "--font-display",
  weight: "400",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "WishVerse — Turn memories into something touchable",
    template: "%s · WishVerse",
  },
  description:
    "Create immersive, interactive greeting experiences that feel made for one person in the whole universe.",
  applicationName: "WishVerse",
  keywords: ["interactive greeting", "digital gift", "memory scrapbook", "open when letters", "digital bouquet"],
  authors: [{ name: "Shubham Gawas", url: "mailto:shubhamgawas4506@gmail.com" }],
  creator: "Shubham Gawas",
  openGraph: {
    type: "website",
    siteName: "WishVerse",
    title: "WishVerse — Interactive gifts made with feeling",
    description: "Create letters, bouquets, memory films, photo stories and little surprises—then share one beautiful link.",
    images: [{ url: "/images/wishverse-hero.png", width: 1536, height: 1024, alt: "A pastel scrapbook desk representing WishVerse" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "WishVerse — Interactive gifts made with feeling",
    description: "Turn memories into interactive gifts people can open, flip and keep.",
    images: ["/images/wishverse-hero.png"],
  },
  icons: { icon: "/icon.svg", apple: "/icon.svg" },
  manifest: "/manifest.webmanifest",
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${sans.variable} ${rounded.variable} ${handwritten.variable} ${typewriter.variable} ${display.variable}`}>{children}</body>
    </html>
  );
}
