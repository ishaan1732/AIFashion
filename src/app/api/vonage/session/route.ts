import { NextRequest, NextResponse } from "next/server";
import { getVonageClient } from "@/lib/vonage";

// In-memory cache of room sessions for multi-user co-shopping
const roomSessions = new Map<string, string>();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const roomId = body.roomId || "fashion-runway-studio";

    const vonage = getVonageClient();

    // If Vonage is configured
    if (vonage && vonage.video) {
      let sessionId = roomSessions.get(roomId);

      if (!sessionId) {
        const session = await vonage.video.createSession({ mediaMode: "routed" as any });
        sessionId = session.sessionId;
        roomSessions.set(roomId, sessionId);
      }

      const token = vonage.video.generateClientToken(sessionId, {
        role: "publisher",
        expireTime: Math.floor(Date.now() / 1000) + 7200, // 2 hours
        data: JSON.stringify({ name: "Runway User", role: "shopper" }),
      });

      return NextResponse.json({
        sessionId,
        token,
        apiKey: process.env.VONAGE_API_KEY || process.env.VONAGE_APPLICATION_ID,
        isMock: false,
        roomId,
      });
    }

    // Fallback Mock Mode (ideal for offline testing or prior to adding keys)
    const mockSessionId = `session_mock_${roomId}_${Date.now()}`;
    const mockToken = `token_mock_${Date.now()}`;

    return NextResponse.json({
      sessionId: mockSessionId,
      token: mockToken,
      apiKey: "mock-vonage-api-key",
      isMock: true,
      roomId,
      message: "Running in local WebRTC / preview mode. Add Vonage credentials to .env.local to enable cloud video relay.",
    });
  } catch (error: any) {
    console.error("Vonage session creation error:", error);
    return NextResponse.json(
      {
        error: error.message || "Failed to create video session",
        isMock: true,
        sessionId: "fallback-session",
        token: "fallback-token",
      },
      { status: 200 }
    );
  }
}
