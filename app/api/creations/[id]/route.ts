import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import os from "os";
import { StoredCreation } from "@/lib/creation-store";

const CREATIONS_DIR = path.join(process.cwd(), "data", "creations");
const CREATIONS_INDEX_FILE = path.join(CREATIONS_DIR, "index.json");
const TMP_CREATIONS_DIR = path.join(os.tmpdir(), "wishverse_creations");

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    if (!id || !/^[a-zA-Z0-9_\-]+$/.test(id)) {
      return NextResponse.json({ success: false, error: "Invalid identifier." }, { status: 400 });
    }

    // Check direct file: <id>.json
    const filePath = path.join(CREATIONS_DIR, `${id}.json`);
    if (existsSync(filePath)) {
      const raw = await fs.readFile(filePath, "utf-8");
      const creation = JSON.parse(raw);
      return NextResponse.json({ success: true, creation });
    }

    // Check tmp dir file: <id>.json
    const tmpFilePath = path.join(TMP_CREATIONS_DIR, `${id}.json`);
    if (existsSync(tmpFilePath)) {
      const raw = await fs.readFile(tmpFilePath, "utf-8");
      const creation = JSON.parse(raw);
      return NextResponse.json({ success: true, creation });
    }

    // Check index file by id, publicId, or rCode
    if (existsSync(CREATIONS_INDEX_FILE)) {
      const raw = await fs.readFile(CREATIONS_INDEX_FILE, "utf-8");
      const list = JSON.parse(raw) as StoredCreation[];
      const match = list.find(
        (c) =>
          c.publicId === id ||
          c.id === id ||
          c.rCode?.toUpperCase() === id.toUpperCase()
      );
      if (match) {
        return NextResponse.json({ success: true, creation: match });
      }
    }

    return NextResponse.json({ success: false, error: "Creation not found." }, { status: 404 });
  } catch (error) {
    console.error("Creation lookup error:", error);
    return NextResponse.json({ success: false, error: "Server error." }, { status: 500 });
  }
}

