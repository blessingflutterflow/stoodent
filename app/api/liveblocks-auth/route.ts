import { Liveblocks } from "@liveblocks/node";
import { NextRequest } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions, SessionData } from "@/lib/session";

const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET_KEY!,
});

// Avatar colors — cycled for guests
const GUEST_COLORS = ["#F37338", "#3860BE", "#a855f7", "#22c55e", "#f59e0b"];

export async function POST(request: NextRequest) {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  const { room } = await request.json();

  const isAuthenticated = !!session.isLoggedIn;

  const userId = session.userId ?? `guest-${Math.random().toString(36).slice(2, 8)}`;
  const name = session.name ?? "Guest";
  const color = session.role === "tutor"
    ? "#141413"
    : GUEST_COLORS[Math.abs(userId.charCodeAt(0)) % GUEST_COLORS.length];

  const liveblocksSession = liveblocks.prepareSession(userId, {
    userInfo: {
      name,
      color,
      role: session.role ?? "student",
      isAuthenticated,
    },
  });

  liveblocksSession.allow(room, liveblocksSession.FULL_ACCESS);

  const { body, status } = await liveblocksSession.authorize();
  return new Response(body, { status });
}
