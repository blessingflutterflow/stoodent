import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { twilioClient, normalizePhone } from "@/lib/twilio";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json();

    if (!phone) {
      return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
    }

    const normalized = normalizePhone(phone.replace(/\s/g, ""));
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 min

    // Store OTP in Firestore
    await setDoc(doc(db, "otps", normalized), {
      code: otp,
      expiresAt,
      attempts: 0,
      createdAt: serverTimestamp(),
      used: false,
    });

    // Send via SMS
    await twilioClient.messages.create({
      from: process.env.TWILIO_PHONE_NUMBER!,
      to: normalized,
      body: `Your Stoodent code is: ${otp}\n\nExpires in 5 minutes. Do not share this code.`,
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[send-otp]", msg);
    return NextResponse.json(
      { error: "Failed to send OTP. Please try again.", detail: msg },
      { status: 500 }
    );
  }
}
