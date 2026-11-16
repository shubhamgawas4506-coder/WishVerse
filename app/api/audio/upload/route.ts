import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import os from "os";
import { put } from "@vercel/blob";

// Support Vercel Blob (primary for production), plus public, data, and serverless tmp upload directories
const PUBLIC_UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "audio");
const DATA_UPLOAD_DIR = path.join(process.cwd(), "data", "uploads", "audio");
const TMP_UPLOAD_DIR = path.join(os.tmpdir(), "wishverse_audio");

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const clientName = formData.get("name") as string | null;
    const durationStr = formData.get("duration") as string | null;

    if (!file) {
      return NextResponse.json({ success: false, error: "No audio file provided." }, { status: 400 });
    }

    // Validate size (max 50MB for source audio or trimmed clips)
    const MAX_SIZE = 50 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, error: `File size exceeds the 50 MB limit.` },
        { status: 400 }
      );
    }

    // Determine extension & MIME
    let ext = "wav";
    const originalName = clientName || file.name || "audio.wav";
    const dotIdx = originalName.lastIndexOf(".");
    if (dotIdx !== -1) {
      const detectedExt = originalName.substring(dotIdx + 1).toLowerCase();
      if (["wav", "mp3", "m4a", "aac", "ogg", "webm"].includes(detectedExt)) {
        ext = detectedExt;
      }
    }

    const uniqueId = `wv_audio_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const filename = `${uniqueId}.${ext}`;

    // 1. If Vercel Blob token is configured (Official Vercel Cloud Storage)
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const blob = await put(`wishverse-audio/${filename}`, file, {
          access: "public",
        });

        return NextResponse.json({
          success: true,
          url: blob.url,
          staticUrl: blob.url,
          filename,
          size: file.size,
          duration: durationStr ? parseFloat(durationStr) : undefined,
          name: originalName,
        });
      } catch (blobErr) {
        console.warn("Vercel Blob upload warning, attempting disk fallback:", blobErr);
      }
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 2. Local disk fallback (for local development or persistent Node server)
    let saved = false;
    try {
      await fs.mkdir(PUBLIC_UPLOAD_DIR, { recursive: true });
      await fs.mkdir(DATA_UPLOAD_DIR, { recursive: true });
      const publicFilePath = path.join(PUBLIC_UPLOAD_DIR, filename);
      const dataFilePath = path.join(DATA_UPLOAD_DIR, filename);
      await Promise.all([
        fs.writeFile(publicFilePath, buffer),
        fs.writeFile(dataFilePath, buffer),
      ]);
      saved = true;
    } catch {
      try {
        await fs.mkdir(TMP_UPLOAD_DIR, { recursive: true });
        const tmpFilePath = path.join(TMP_UPLOAD_DIR, filename);
        await fs.writeFile(tmpFilePath, buffer);
        saved = true;
      } catch (tmpErr) {
        console.warn("Serverless tmp audio write warning:", tmpErr);
      }
    }

    // If written to disk or /tmp
    if (saved) {
      const audioUrl = `/api/audio/${filename}`;
      const staticUrl = `/uploads/audio/${filename}`;

      return NextResponse.json({
        success: true,
        url: audioUrl,
        staticUrl,
        filename,
        size: buffer.length,
        duration: durationStr ? parseFloat(durationStr) : undefined,
        name: originalName,
      });
    }

    // 3. Ultra-safe fallback for read-only serverless if no blob token is provided
    const base64Data = `data:audio/${ext};base64,${buffer.toString("base64")}`;
    return NextResponse.json({
      success: true,
      url: base64Data,
      staticUrl: base64Data,
      filename,
      size: buffer.length,
      duration: durationStr ? parseFloat(durationStr) : undefined,
      name: originalName,
    });
  } catch (error) {
    console.error("Audio upload error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process and store audio file on server." },
      { status: 500 }
    );
  }
}

