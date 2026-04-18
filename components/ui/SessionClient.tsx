"use client";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { LiveblocksProvider, RoomProvider, useOthers, useSelf, ClientSideSuspense } from "@liveblocks/react";
import {
  AlignLeft, Bold, ChevronDown, GraduationCap,
  Italic, Link2, List, ListOrdered,
  MoreHorizontal, Redo2, Share2, Strikethrough,
  Type, Underline, Undo2, Users,
} from "lucide-react";

const CollabEditor = dynamic(() => import("./CollabEditor"), { ssr: false });

interface SessionData {
  id: string;
  module: string;
  moduleCode: string;
  studentName: string;
  studentPhone: string;
  assignmentText: string;
  status: "waiting" | "active" | "closed";
  createdAt: { seconds: number } | null;
}

function formatTime(ts: { seconds: number } | null) {
  if (!ts) return "Just now";
  return new Date(ts.seconds * 1000).toLocaleString("en-ZA", {
    hour: "2-digit", minute: "2-digit",
    day: "numeric", month: "short",
  });
}

// ── Toolbar helpers ──────────────────────────────────────
function ToolbarDivider() {
  return <div style={{ width: 1, height: 20, background: "#E0E3E7", margin: "0 4px", flexShrink: 0 }} />;
}
function ToolbarBtn({ children, title }: { children: React.ReactNode; title?: string }) {
  return (
    <button title={title} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, borderRadius: 4, background: "transparent", border: "none", cursor: "pointer", color: "#444746", transition: "background 0.1s" }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "#E8EAED")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
      {children}
    </button>
  );
}

// ── Participants sidebar panel (uses Liveblocks presence) ─
function ParticipantsPanel({ studentName }: { studentName: string }) {
  const others = useOthers();
  const self = useSelf();

  const all = [
    ...(self ? [{ id: self.id, name: (self.info as { name?: string })?.name ?? "You", color: (self.info as { color?: string })?.color ?? "#F37338", isSelf: true }] : []),
    ...others.map((o) => ({ id: o.id, name: (o.info as { name?: string })?.name ?? "Guest", color: (o.info as { color?: string })?.color ?? "#3860BE", isSelf: false })),
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {all.length === 0 && (
        <div style={{ fontSize: 13, color: "#D1CDC7" }}>No one else yet…</div>
      )}
      {all.map((p) => (
        <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 12, background: "#F3F0EE" }}>
          <div style={{ position: "relative", flexShrink: 0 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: p.color, color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13 }}>
              {p.name.slice(0, 2).toUpperCase()}
            </div>
            <span style={{ position: "absolute", bottom: 0, right: 0, width: 10, height: 10, borderRadius: "50%", background: "#22c55e", border: "2px solid #F3F0EE" }} />
          </div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#141413", margin: 0 }}>{p.name}{p.isSelf ? " (you)" : ""}</p>
            <p style={{ fontSize: 11, fontWeight: 450, color: "#696969", margin: 0 }}>Online now</p>
          </div>
        </div>
      ))}

      {/* Tutor slot if not yet joined */}
      {all.length < 2 && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 12, background: "#F3F0EE" }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#F3F0EE", border: "2px dashed #D1CDC7", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <GraduationCap size={15} color="#D1CDC7" />
          </div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#D1CDC7", margin: 0 }}>Tutor</p>
            <p style={{ fontSize: 11, color: "#D1CDC7", margin: 0 }}>Joining soon…</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main session workspace ────────────────────────────────
function SessionWorkspace({ session }: { session: SessionData }) {
  const statusCfg = {
    waiting: { label: "Waiting for tutor", dot: "#F37338", text: "#CF4500" },
    active: { label: "Active", dot: "#22c55e", text: "#16a34a" },
    closed: { label: "Closed", dot: "#696969", text: "#696969" },
  }[session.status];

  const others = useOthers();
  const self = useSelf();
  const allUsers = [
    ...(self ? [{ id: self.id, color: (self.info as { color?: string })?.color ?? "#F37338", name: (self.info as { name?: string })?.name ?? "You" }] : []),
    ...others.map((o) => ({ id: o.id, color: (o.info as { color?: string })?.color ?? "#3860BE", name: (o.info as { name?: string })?.name ?? "Guest" })),
  ];

  const userColor = (self?.info as { color?: string })?.color ?? "#F37338";
  const userName = (self?.info as { name?: string })?.name ?? session.studentName;

  function copyLink() {
    navigator.clipboard.writeText(`${window.location.origin}/session/${session.id}`);
  }

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "#F3F0EE", overflow: "hidden" }}>

      {/* ── TOP BAR ── */}
      <header style={{ background: "#FCFBFA", borderBottom: "1px solid #E8E2DA", padding: "0 16px", display: "flex", alignItems: "center", gap: 12, height: 56, flexShrink: 0, zIndex: 30 }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", flexShrink: 0 }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#141413", color: "#F3F0EE", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <GraduationCap size={16} />
          </div>
        </Link>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 16, fontWeight: 600, color: "#141413", letterSpacing: -0.32, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 320 }}>
              {session.module} — Assignment Help
            </span>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.4px", textTransform: "uppercase", background: session.status === "active" ? "#ECFDF5" : "#FFF5F0", color: statusCfg.text, borderRadius: 999, padding: "2px 10px", display: "inline-flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: statusCfg.dot, display: "inline-block" }} />
              {statusCfg.label}
            </div>
          </div>
          <div style={{ fontSize: 11, color: "#696969", fontWeight: 450, marginTop: 1 }}>
            <span style={{ color: "#CF4500", fontWeight: 700, letterSpacing: "0.3px", textTransform: "uppercase" }}>{session.moduleCode}</span>
            <span style={{ margin: "0 6px" }}>·</span>
            {formatTime(session.createdAt)}
            <span style={{ margin: "0 6px" }}>·</span>
            #{session.id.toUpperCase()}
          </div>
        </div>

        {/* Live avatar stack */}
        <div style={{ display: "flex" }}>
          {allUsers.slice(0, 4).map((u, i) => (
            <div key={u.id} title={u.name} style={{ width: 32, height: 32, borderRadius: "50%", background: u.color, color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12, border: "2px solid #FCFBFA", marginLeft: i > 0 ? -8 : 0, zIndex: 4 - i, position: "relative" }}>
              {u.name.slice(0, 2).toUpperCase()}
            </div>
          ))}
        </div>

        <button onClick={copyLink} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#141413", color: "#F3F0EE", border: "none", borderRadius: 20, padding: "7px 18px", fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}>
          <Share2 size={13} /> Share
        </button>
      </header>

      {/* ── TOOLBAR ── */}
      <div style={{ background: "#FCFBFA", borderBottom: "1px solid #E8E2DA", padding: "0 16px", display: "flex", alignItems: "center", gap: 2, height: 40, flexShrink: 0, overflowX: "auto" }}>
        <ToolbarBtn title="Undo"><Undo2 size={16} /></ToolbarBtn>
        <ToolbarBtn title="Redo"><Redo2 size={16} /></ToolbarBtn>
        <ToolbarDivider />
        <button style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "transparent", border: "none", cursor: "pointer", borderRadius: 4, padding: "4px 8px", fontSize: 13, fontWeight: 450, color: "#444746", fontFamily: "inherit", whiteSpace: "nowrap" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#E8EAED")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
          <Type size={14} /> Normal text <ChevronDown size={13} />
        </button>
        <ToolbarDivider />
        <ToolbarBtn title="Bold"><Bold size={15} /></ToolbarBtn>
        <ToolbarBtn title="Italic"><Italic size={15} /></ToolbarBtn>
        <ToolbarBtn title="Underline"><Underline size={15} /></ToolbarBtn>
        <ToolbarBtn title="Strikethrough"><Strikethrough size={15} /></ToolbarBtn>
        <ToolbarDivider />
        <ToolbarBtn title="Align left"><AlignLeft size={15} /></ToolbarBtn>
        <ToolbarDivider />
        <ToolbarBtn title="Bulleted list"><List size={15} /></ToolbarBtn>
        <ToolbarBtn title="Numbered list"><ListOrdered size={15} /></ToolbarBtn>
        <ToolbarDivider />
        <ToolbarBtn title="Insert link"><Link2 size={15} /></ToolbarBtn>
        <ToolbarDivider />
        <ToolbarBtn title="More"><MoreHorizontal size={15} /></ToolbarBtn>
      </div>

      {/* ── BODY ── */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* Doc canvas */}
        <div style={{ flex: 1, background: "#f0f4f9", overflowY: "auto", padding: "32px 24px 64px" }}>
          <div style={{ background: "#FFFFFF", maxWidth: 816, margin: "0 auto", minHeight: 1056, padding: "96px 96px 96px", boxShadow: "0 1px 2px rgba(60,64,67,0.3), 0 2px 6px 2px rgba(60,64,67,0.15)" }}>

            {/* Doc header */}
            <div style={{ marginBottom: 40 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.56px", textTransform: "uppercase", color: "#CF4500", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#F37338", display: "inline-block" }} />
                {session.moduleCode} — {session.module}
              </div>
              <div contentEditable suppressContentEditableWarning style={{ fontSize: 26, fontWeight: 700, color: "#141413", outline: "none", letterSpacing: -0.52, lineHeight: 1.2, marginBottom: 8, cursor: "text" }}>
                Assignment Session
              </div>
              <div style={{ fontSize: 12, color: "#696969", fontWeight: 450, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <span>{session.studentName}</span>
                <span>·</span>
                <span>{formatTime(session.createdAt)}</span>
                <span>·</span>
                <span style={{ fontFamily: "monospace", background: "#F3F0EE", borderRadius: 4, padding: "1px 6px", fontSize: 11 }}>#{session.id.toUpperCase()}</span>
              </div>
            </div>

            {/* Assignment text preview if submitted */}
            {session.assignmentText && (
              <div style={{ background: "#FCFBFA", borderRadius: 16, padding: "16px 20px", marginBottom: 32, border: "1px solid #E8E2DA" }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.4px", textTransform: "uppercase", color: "#696969", marginBottom: 8 }}>Assignment submitted</div>
                <p style={{ fontSize: 14, color: "#141413", lineHeight: 1.6, margin: 0 }}>{session.assignmentText}</p>
              </div>
            )}

            <div style={{ borderTop: "1px solid #E8E2DA", marginBottom: 32 }} />

            {/* Live BlockNote editor */}
            <ClientSideSuspense fallback={<div style={{ color: "#696969", fontSize: 14 }}>Connecting…</div>}>
              <CollabEditor userName={userName} userColor={userColor} />
            </ClientSideSuspense>
          </div>
        </div>

        {/* ── Sidebar ── */}
        <aside style={{ width: 272, borderLeft: "1px solid #E8E2DA", background: "#FCFBFA", overflowY: "auto", display: "flex", flexDirection: "column", flexShrink: 0 }}>

          <div style={{ padding: "20px 20px 0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 16, fontSize: 11, fontWeight: 700, letterSpacing: "0.56px", textTransform: "uppercase", color: "#696969" }}>
              <Users size={12} /> Participants
            </div>
            <ClientSideSuspense fallback={null}>
              <ParticipantsPanel studentName={session.studentName} />
            </ClientSideSuspense>
          </div>

          <div style={{ margin: "20px 20px", borderTop: "1px solid #E8E2DA" }} />

          {/* Notification card */}
          <div style={{ margin: "0 20px" }}>
            <div style={{ background: "#141413", borderRadius: 20, padding: "18px", position: "relative", overflow: "hidden" }}>
              <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} viewBox="0 0 260 120" preserveAspectRatio="none">
                <path d="M -10 110 Q 130 20 270 80" stroke="#F37338" strokeWidth="1" fill="none" opacity="0.5" />
              </svg>
              <div style={{ position: "relative", zIndex: 1 }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.56px", textTransform: "uppercase", color: "#F37338", marginBottom: 8, display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#F37338", display: "inline-block" }} />
                  Tutor notified
                </div>
                <p style={{ fontSize: 13, fontWeight: 450, color: "#F3F0EE", lineHeight: 1.5, margin: 0 }}>
                  Your tutor received an SMS with a link to this session.
                </p>
              </div>
            </div>
          </div>

          <div style={{ margin: "20px 20px 0", borderTop: "1px solid #E8E2DA" }} />

          {/* Tips */}
          <div style={{ padding: "20px" }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.56px", textTransform: "uppercase", color: "#696969", marginBottom: 12 }}>Tips</div>
            {["Your tutor will type directly in this document.", "You can both edit at the same time — changes sync live.", "See each other's cursors in real time."].map((tip, i) => (
              <div key={i} style={{ display: "flex", gap: 8, marginBottom: 10, alignItems: "flex-start" }}>
                <span style={{ width: 18, height: 18, borderRadius: "50%", background: "#F3F0EE", border: "1px solid #D1CDC7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#696969", flexShrink: 0, marginTop: 1 }}>{i + 1}</span>
                <p style={{ fontSize: 12, fontWeight: 450, color: "#696969", lineHeight: 1.5, margin: 0 }}>{tip}</p>
              </div>
            ))}
          </div>

        </aside>
      </div>

      <style>{`@media (max-width: 900px) { aside { display: none !important; } }`}</style>
    </div>
  );
}

// ── Root: fetches session + wraps with Liveblocks ─────────
export default function SessionClient({ id }: { id: string }) {
  const [session, setSession] = useState<SessionData | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    getDoc(doc(db, "sessions", id)).then((snap) => {
      if (!snap.exists()) { setNotFound(true); return; }
      const d = snap.data();
      setSession({
        id,
        module: d.module ?? "Unknown module",
        moduleCode: d.moduleCode ?? "???",
        studentName: d.studentName ?? "Student",
        studentPhone: d.studentPhone ?? "",
        assignmentText: d.assignmentText ?? "",
        status: d.status ?? "waiting",
        createdAt: d.createdAt ?? null,
      });
    });
  }, [id]);

  if (notFound) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#F3F0EE" }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: 20, fontWeight: 500, color: "#141413" }}>Session not found</p>
          <Link href="/" style={{ color: "#CF4500", fontSize: 14 }}>Go home</Link>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#F3F0EE" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", border: "3px solid #E8E2DA", borderTopColor: "#141413", animation: "spin 0.8s linear infinite" }} />
          <p style={{ fontSize: 14, color: "#696969" }}>Loading session…</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <LiveblocksProvider authEndpoint="/api/liveblocks-auth">
      <RoomProvider id={`session-${id}`} initialPresence={{}}>
        <SessionWorkspace session={session} />
      </RoomProvider>
    </LiveblocksProvider>
  );
}
