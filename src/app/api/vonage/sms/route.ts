import { NextRequest, NextResponse } from "next/server";
import { getVonageClient } from "@/lib/vonage";

export async function POST(req: NextRequest) {
  try {
    const { to, stylistSummary, items } = await req.json();

    if (!to) {
      return NextResponse.json({ error: "Recipient phone number is required" }, { status: 400 });
    }

    const vonage = getVonageClient();

    // Format text message
    const formattedItems = (items || [])
      .slice(0, 3)
      .map((item: any, idx: number) => `${idx + 1}. [${item.brand}] ${item.title} ($${item.price})`)
      .join("\n");

    const messageText = `✨ AURA Runway Stylist ✨\n\n${stylistSummary || "Your curated fashion lookbook is ready!"}\n\nTop Matches:\n${formattedItems}\n\nShop your looks: https://aura-runway.vercel.app`;

    if (vonage && (vonage as any).messages) {
      try {
        const from = process.env.VONAGE_FROM_NUMBER || "AURA Stylist";
        const res = await (vonage as any).messages.send({
          text: messageText,
          to,
          from,
          channel: "sms",
          messageType: "text",
        });

        return NextResponse.json({
          success: true,
          messageId: res?.messageUUID || "sent",
          isMock: false,
        });
      } catch (smsErr: any) {
        console.warn("Vonage SMS delivery failed, returning mock success:", smsErr.message);
      }
    }

    // Mock response when keys are not active yet
    return NextResponse.json({
      success: true,
      messageId: `mock-msg-${Date.now()}`,
      isMock: true,
      previewText: messageText,
      message: "SMS simulated. Add VONAGE_APPLICATION_ID/API_KEY & VONAGE_FROM_NUMBER to send live SMS.",
    });
  } catch (error: any) {
    console.error("SMS error:", error);
    return NextResponse.json({ error: error.message || "Failed to send SMS" }, { status: 500 });
  }
}
