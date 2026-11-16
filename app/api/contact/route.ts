import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const MESSAGES_DIR = path.join(process.cwd(), "data", "messages");

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, message } = body || {};

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ success: false, error: "Please provide your name." }, { status: 400 });
    }

    if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return NextResponse.json({ success: false, error: "Please enter a valid email address." }, { status: 400 });
    }

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json({ success: false, error: "Please enter a message." }, { status: 400 });
    }

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedMsg = message.trim();
    const targetEmail = "shubhamgawas4506@gmail.com";
    const timestamp = new Date().toISOString();

    const record = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: trimmedName,
      email: trimmedEmail,
      message: trimmedMsg,
      recipientEmail: targetEmail,
      createdAt: timestamp,
    };

    // Ensure storage directory exists
    await fs.mkdir(MESSAGES_DIR, { recursive: true });

    // Save message persistently to disk
    const filePath = path.join(MESSAGES_DIR, `${record.id}.json`);
    await fs.writeFile(filePath, JSON.stringify(record, null, 2), "utf-8");

    // Also update index list
    const indexFile = path.join(MESSAGES_DIR, "index.json");
    let existingList: typeof record[] = [];
    try {
      const raw = await fs.readFile(indexFile, "utf-8");
      existingList = JSON.parse(raw);
    } catch {
      existingList = [];
    }
    const updated = [record, ...existingList].slice(0, 500);
    await fs.writeFile(indexFile, JSON.stringify(updated, null, 2), "utf-8");

    console.log(`[Contact Form] Message recorded for ${targetEmail} from ${trimmedName} (${trimmedEmail})`);

    // Prepare mailto link as fallback
    const mailtoSubject = encodeURIComponent(`Message for Shubham from ${trimmedName}`);
    const mailtoBody = encodeURIComponent(
      `Hi Shubham,\n\n${trimmedMsg}\n\n---\nFrom: ${trimmedName}\nEmail: ${trimmedEmail}`
    );
    const mailtoUrl = `mailto:${targetEmail}?subject=${mailtoSubject}&body=${mailtoBody}`;

    return NextResponse.json({
      success: true,
      message: `Your message has been received! It is directed to ${targetEmail}.`,
      mailtoUrl,
      recordId: record.id,
    });
  } catch (error) {
    console.error("Contact API error:", error);
    return NextResponse.json(
      { success: false, error: "Unable to send message right now. Please email directly." },
      { status: 500 }
    );
  }
}
