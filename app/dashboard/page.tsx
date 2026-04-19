"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Nav from "@/components/ui/Nav";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ArrowRight, Clock, GraduationCap, Users, Zap } from "lucide-react";

type SessionStatus = "waiting" | "active" | "closed";

interface Session {
  id: string;
  studentName: string;
  module: string;
  moduleCode: string;
  assignmentText: string;
  createdAt: { seconds: number } | null;
  status: SessionStatus;
}

const STATUS_CONFIG: Record<SessionStatus, { label: string; dotColor: string; textColor: string; bg: string }> = {
  waiting: { label: "Waiting", dotColor: "#F37338", textColor: "#CF4500", bg: "#FFF5F0" },
  active: { label: "Active", dotColor: "#22c55e", textColor: "#16a34a", bg: "#F0FFF4" },
  closed: { label: "Closed", dotColor: "#D1CDC7", textColor: "#696969", bg: "#F3F0EE" },
};

function formatTime(ts: { seconds: number } | null) {
  if (!ts) return "Just now";
  const d = new Date(ts.seconds * 1000);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  return isToday
    ? `Today, ${d.toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" })}`
    : d.toLocaleString("en-ZA", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

export default function DashboardPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "sessions"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setSessions(snap.docs.map((doc) => {
        const d = doc.data();
        return {
          id: doc.id,
          studentName: d.studentName ?? "Student",
          module: d.module ?? "Unknown",
          moduleCode: d.moduleCode ?? "???",
          assignmentText: d.assignmentText ?? "",
          createdAt: d.createdAt ?? null,
          status: d.status ?? "waiting",
        };
      }));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const waiting = sessions.filter((s) => s.status === "waiting").length;
  const active = sessions.filter((s) => s.status === "active").length;

  const stats = [
    { icon: <Clock size={18} />, label: "Waiting", value: waiting, color: "#CF4500" },
    { icon: <Zap size={18} />, label: "Active", value: active, color: "#22c55e" },
    { icon: <Users size={18} />, label: "Total sessions", value: sessions.length, color: "#141413" },
  ];

  return (
    <main style={{ background: "#F3F0EE", minHeight: "100vh" }}>
      <Nav />

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "120px 24px 80px" }}>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12, fontSize: 12, fontWeight: 700, letterSpacing: "0.56px", textTransform: "uppercase", color: "#CF4500" }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#F37338", display: "inline-block" }} />
            Tutor dashboard
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
            <h1 style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 500, letterSpacing: -1, color: "#141413", lineHeight: 1.1, margin: 0 }}>
              All sessions
            </h1>
            <Link href="/submit" style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#FFFFFF", border: "1.5px solid #141413", borderRadius: 20, padding: "9px 20px", fontSize: 14, fontWeight: 500, color: "#141413", textDecoration: "none" }}>
              <GraduationCap size={14} /> New session
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 40 }}>
          {stats.map((stat) => (
            <div key={stat.label} style={{ background: "#FCFBFA", borderRadius: 32, padding: "24px 28px", border: "1px solid #E8E2DA", display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#F3F0EE", display: "flex", alignItems: "center", justifyContent: "center", color: stat.color }}>
                {stat.icon}
              </div>
              <div>
                <p style={{ fontSize: 28, fontWeight: 700, letterSpacing: -1, color: "#141413", margin: 0, lineHeight: 1 }}>{stat.value}</p>
                <p style={{ fontSize: 13, fontWeight: 450, color: "#696969", margin: 0, marginTop: 4 }}>{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", border: "3px solid #E8E2DA", borderTopColor: "#141413", animation: "spin 0.8s linear infinite" }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {!loading && sessions.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 24px", color: "#696969", fontSize: 15 }}>
            No sessions yet — students will appear here when they submit.
          </div>
        )}

        {/* Session list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {sessions.map((session) => {
            const sc = STATUS_CONFIG[session.status];
            return (
              <div key={session.id} style={{ background: "#FCFBFA", borderRadius: 32, padding: "24px 28px", border: "1px solid #E8E2DA", display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap", transition: "box-shadow 0.2s" }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: session.status === "active" ? "#141413" : "#F3F0EE", color: session.status === "active" ? "#F3F0EE" : "#696969", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 16, flexShrink: 0 }}>
                  {session.studentName.slice(0, 2).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 180 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 15, fontWeight: 600, color: "#141413" }}>{session.studentName}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.4px", textTransform: "uppercase", background: sc.bg, color: sc.textColor, borderRadius: 999, padding: "2px 10px", display: "inline-flex", alignItems: "center", gap: 4 }}>
                      <span style={{ width: 5, height: 5, borderRadius: "50%", background: sc.dotColor, display: "inline-block" }} />
                      {sc.label}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.4px", textTransform: "uppercase", color: "#CF4500" }}>{session.moduleCode}</span>
                    <span style={{ fontSize: 13, fontWeight: 500, color: "#141413" }}>{session.module}</span>
                    <span style={{ fontSize: 12, color: "#696969", display: "flex", alignItems: "center", gap: 4 }}>
                      <Clock size={11} /> {formatTime(session.createdAt)}
                    </span>
                  </div>
                  {session.assignmentText && (
                    <p style={{ fontSize: 13, color: "#696969", margin: 0, lineHeight: 1.5, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical" as const }}>
                      {session.assignmentText}
                    </p>
                  )}
                </div>
                <Link href={`/session/${session.id}?tutor=1`} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: session.status === "closed" ? "#F3F0EE" : "#141413", color: session.status === "closed" ? "#696969" : "#F3F0EE", border: "1.5px solid", borderColor: session.status === "closed" ? "#D1CDC7" : "#141413", borderRadius: 20, padding: "9px 20px", fontSize: 14, fontWeight: 500, textDecoration: "none", whiteSpace: "nowrap" }}>
                  {session.status === "waiting" ? "Join session" : session.status === "active" ? "Resume" : "View"}
                  <ArrowRight size={14} />
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
