import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import { createReadStream, existsSync, statSync } from "fs";
import path from "path";
import os from "os";
import { Readable } from "stream";

const PUBLIC_UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "audio");
const DATA_UPLOAD_DIR = path.join(process.cwd(), "data", "uploads", "audio");
const TMP_UPLOAD_DIR = path.join(os.tmpdir(), "wishverse_audio");

const MIME_MAP: Record<string, string> = {
  wav: "audio/wav",
  mp3: "audio/mpeg",
  m4a: "audio/mp4",
  aac: "audio/aac",
  ogg: "audio/ogg",
  webm: "audio/webm",
  flac: "audio/flac",
};

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await context.params;

    // Sanitize filename to prevent directory traversal
    if (!filename || !/^[a-zA-Z0-9_\-\.]+$/.test(filename)) {
      return new NextResponse("Invalid audio identifier.", { status: 400 });
    }

    let filePath = path.join(PUBLIC_UPLOAD_DIR, filename);
    if (!existsSync(filePath)) {
      filePath = path.join(DATA_UPLOAD_DIR, filename);
      if (!existsSync(filePath)) {
        filePath = path.join(TMP_UPLOAD_DIR, filename);
        if (!existsSync(filePath)) {
          return new NextResponse("Audio file not found.", { status: 404 });
        }
      }
    }

    const stat = statSync(filePath);
    const fileSize = stat.size;
    const ext = filename.split(".").pop()?.toLowerCase() || "wav";
    const contentType = MIME_MAP[ext] || "audio/wav";

    const rangeHeader = request.headers.get("range");

    if (rangeHeader) {
      // Parse Range header (e.g. "bytes=0-1024")
      const parts = rangeHeader.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      if (start >= fileSize || end >= fileSize) {
        return new NextResponse("Requested range not satisfiable", {
          status: 416,
          headers: { "Content-Range": `bytes */${fileSize}` },
        });
      }

      const chunksize = end - start + 1;
      const fileStream = createReadStream(filePath, { start, end });
      const webStream = Readable.toWeb(fileStream) as ReadableStream;

      return new NextResponse(webStream, {
        status: 206,
        headers: {
          "Content-Range": `bytes ${start}-${end}/${fileSize}`,
          "Accept-Ranges": "bytes",
          "Content-Length": chunksize.toString(),
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }

    const fileStream = createReadStream(filePath);
    const webStream = Readable.toWeb(fileStream) as ReadableStream;

    return new NextResponse(webStream, {
      status: 200,
      headers: {
        "Content-Length": fileSize.toString(),
        "Content-Type": contentType,
        "Accept-Ranges": "bytes",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Audio streaming error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

