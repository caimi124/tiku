import { NextResponse } from "next/server";

const DEBUG_ENDPOINT = process.env.DEBUG_ENDPOINT || null;

export async function POST(request: Request) {
  try {
    // Only log in development or if DEBUG_ENDPOINT is configured
    if (!DEBUG_ENDPOINT || process.env.NODE_ENV === 'production') {
      return NextResponse.json({ success: true, skipped: true });
    }

    const payload = await request.json();
    await fetch(DEBUG_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("调试日志转发失败", error);
    return NextResponse.json({ success: false, error: "failed_to_log" }, { status: 500 });
  }
}

