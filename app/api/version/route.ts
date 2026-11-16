import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    app: "WishVerse",
    version: "2.2.0",
    commit: "6af178d",
    environment: process.env.NODE_ENV || "production",
    features: {
      mobileResponsive: "Fully responsive on phones (320px-480px), tablets, and desktop",
      creatorStudio: "Dual edit & preview toggle on mobile screens",
      audioTrimming: "In-browser Web Audio slice with @vercel/blob and resilient fallback",
      creatorProfile: "Handcrafted by Shubham Gawas with love",
      contactForm: "Direct contact to shubhamgawas4506@gmail.com"
    },
    deployedAt: new Date().toISOString()
  });
}
