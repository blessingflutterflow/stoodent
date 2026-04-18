import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { normalizePhone } from "@/lib/twilio";
import { sessionOptions, SessionData } from "@/lib/session";
import { doc, getDoc, updateDoc, setDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const { phone, code, name } = await req.json();

    if (!phone || !code) {
      return NextResponse.json({ error: "Phone and code are required" }, { status: 400 });
    }

    const normalized = normalizePhone(phone.replace(/\s/g, ""));

    // Fetch OTP record
    const otpRef = doc(db, "otps", normalized);
    const otpSnap = await getDoc(otpRef);

    if (!otpSnap.exists()) {
      return NextResponse.json({ error: "No code found. Please request a new one." }, { status: 400 });
    }

    const data = otpSnap.data();

    if (data.used) {
      return NextResponse.json({ error: "This code has already been used." }, { status: 400 });
    }

    if (data.attempts >= 3) {
      return NextResponse.json({ error: "Too many attempts. Please request a new code." }, { status: 400 });
    }

    const expiresAt = (data.expiresAt as Timestamp).toDate();
    if (new Date() > expiresAt) {
      return NextResponse.json({ error: "Code expired. Please request a new one." }, { status: 400 });
    }

    if (data.code !== code.trim()) {
      await updateDoc(otpRef, { attempts: data.attempts + 1 });
      const remaining = 3 - (data.attempts + 1);
      return NextResponse.json(
        { error: `Incorrect code. ${remaining} attempt${remaining !== 1 ? "s" : ""} remaining.` },
        { status: 400 }
      );
    }

    // Mark OTP as used
    await updateDoc(otpRef, { used: true });

    // Upsert user in Firestore
    const userId = normalized.replace(/^\+/, "");
    const studentName = (name ?? "").trim() || "Student";

    await setDoc(
      doc(db, "users", userId),
      {
        phone: normalized,
        name: studentName,
        role: "student",
        lastSeen: serverTimestamp(),
      },
      { merge: true }
    );

    // Set encrypted session cookie
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    session.userId = userId;
    session.phone = normalized;
    session.name = studentName;
    session.role = "student";
    session.isLoggedIn = true;
    await session.save();

    return NextResponse.json({ success: true, userId, name: studentName });
  } catch (err) {
    console.error("[verify-otp]", err);
    return NextResponse.json({ error: "Verification failed. Please try again." }, { status: 500 });
  }
}
