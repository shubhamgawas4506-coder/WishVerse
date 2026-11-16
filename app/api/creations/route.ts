import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { StoredCreation } from "@/lib/creation-store";

const CREATIONS_DIR = path.join(process.cwd(), "data", "creations");
const CREATIONS_INDEX_FILE = path.join(CREATIONS_DIR, "index.json");

async function ensureDir() {
  await fs.mkdir(CREATIONS_DIR, { recursive: true });
}

export async function POST(request: NextRequest) {
  try {
    const creation = (await request.json()) as StoredCreation;
    if (!creation || (!creation.id && !creation.publicId)) {
      return NextResponse.json({ success: false, error: "Invalid creation data." }, { status: 400 });
    }

    await ensureDir();

    // Store individual creation file by publicId and id
    const filename = `${creation.publicId || creation.id}.json`;
    const filePath = path.join(CREATIONS_DIR, filename);
    await fs.writeFile(filePath, JSON.stringify(creation, null, 2), "utf-8");

    // Also update index file if feasible
    let indexData: StoredCreation[] = [];
    if (existsSync(CREATIONS_INDEX_FILE)) {
      try {
        const raw = await fs.readFile(CREATIONS_INDEX_FILE, "utf-8");
        indexData = JSON.parse(raw);
      } catch {
        indexData = [];
      }
    }
    const filtered = indexData.filter(
      (c) => c.id !== creation.id && c.publicId !== creation.publicId
    );
    const updated = [creation, ...filtered].slice(0, 500); // keep top 500
    await fs.writeFile(CREATIONS_INDEX_FILE, JSON.stringify(updated, null, 2), "utf-8");

    return NextResponse.json({ success: true, creation });
  } catch (error) {
    console.error("Creation save error:", error);
    return NextResponse.json({ success: false, error: "Failed to persist creation." }, { status: 500 });
  }
}

