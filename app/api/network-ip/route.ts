import { NextResponse } from "next/server";
import os from "os";

export async function GET() {
  try {
    const interfaces = os.networkInterfaces();
    let lanIp = "127.0.0.1";

    for (const name of Object.keys(interfaces)) {
      const netList = interfaces[name];
      if (!netList) continue;
      for (const net of netList) {
        // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
        if (net.family === "IPv4" && !net.internal) {
          lanIp = net.address;
          break;
        }
      }
      if (lanIp !== "127.0.0.1") break;
    }

    return NextResponse.json({ lanIp });
  } catch {
    return NextResponse.json({ lanIp: "127.0.0.1" });
  }
}

