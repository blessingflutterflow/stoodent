import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { getTwilioClient, WHATSAPP_FROM, TUTOR_WHATSAPP } from "@/lib/twilio";
import { sessionOptions, SessionData } from "@/lib/session";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";

function generateSessionId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export async function POST(req: NextRequest) {
  try {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);

    if (!session.isLoggedIn) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { module, moduleCode, assignmentText } = await req.json();

    if (!module || !moduleCode) {
      return NextResponse.json({ error: "Module name and code are required" }, { status: 400 });
    }

    const sessionId = generateSessionId();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const sessionUrl = `${appUrl}/session/${sessionId}`;

    // Save session to Firestore
    await setDoc(doc(db, "sessions", sessionId), {
      id: sessionId,
      studentId: session.userId,
      studentPhone: session.phone,
      studentName: session.name,
      module,
      moduleCode,
      assignmentText: assignmentText ?? "",
      status: "waiting",
      tutorJoined: false,
      createdAt: serverTimestamp(),
    });

    // Notify tutor via WhatsApp
    await getTwilioClient().messages.create({
      from: WHATSAPP_FROM(),
      to: TUTOR_WHATSAPP(),
      body:
        `📚 *New assignment submitted!*\n\n` +
        `👤 Student: ${session.name}\n` +
        `📖 Module: ${moduleCode} — ${module}\n\n` +
        `Join the session:\n${sessionUrl}`,
    });

    return NextResponse.json({ success: true, sessionId });
  } catch (err) {
    console.error("[sessions/create]", err);
    return NextResponse.json({ error: "Failed to create session. Please try again." }, { status: 500 });
  }
}
