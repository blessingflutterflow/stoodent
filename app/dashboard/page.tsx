import Link from "next/link";
import Nav from "@/components/ui/Nav";
import { ArrowRight, Clock, GraduationCap, Users, Zap } from "lucide-react";

type SessionStatus = "waiting" | "active" | "closed";

interface Session {
  id: string;
  studentName: string;
  module: string;
  code: string;
  submittedAt: string;
  status: SessionStatus;
  preview: string;
}

// Mock data — replace with Firebase query
const SESSIONS: Session[] = [
  {
    id: "ax7k9f2m",
    studentName: "Thabo M.",
    module: "Mathematics",
    code: "MAT101",
    submittedAt: "Today, 2:14 PM",
    status: "waiting",
    preview: "I need help with question 3 of my calculus assignment. The problem involves finding the derivative of a composite function…",
  },
  {
    id: "bz3r1p8n",
    studentName: "Lerato K.",
    module: "Physics",
    code: "PHY201",
    submittedAt: "Today, 11:40 AM",
    status: "active",
    preview: "Uploaded: Assignment_2_Mechanics.pdf — Chapter 5 questions on Newton's laws and friction coefficients.",
  },
  {
    id: "cn5w2q6j",
    studentName: "Sipho D.",
    module: "Computer Science",
    code: "CSC110",
    submittedAt: "Yesterday, 4:05 PM",
    status: "closed",
    preview: "I'm struggling with my binary search tree implementation. The delete function isn't working correctly…",
  },
  {
    id: "dq8v3h1e",
    studentName: "Amahle N.",
    module: "Accounting",
    code: "ACC201",
    submittedAt: "Yesterday, 9:22 AM",
    status: "closed",
    preview: "Uploaded: Trial_Balance_Exercise.pdf — Please help me with the adjusting journal entries and closing balances.",
  },
];

const STATUS_CONFIG: Record<SessionStatus, { label: string; dotColor: string; textColor: string; bg: string }> = {
  waiting: { label: "Waiting", dotColor: "#F37338", textColor: "#CF4500", bg: "#FFF5F0" },
  active: { label: "Active", dotColor: "#22c55e", textColor: "#16a34a", bg: "#F0FFF4" },
  closed: { label: "Closed", dotColor: "#D1CDC7", textColor: "#696969", bg: "#F3F0EE" },
};

const STATS = [
  { icon: <Clock size={18} />, label: "Waiting", value: SESSIONS.filter((s) => s.status === "waiting").length, color: "#CF4500" },
  { icon: <Zap size={18} />, label: "Active", value: SESSIONS.filter((s) => s.status === "active").length, color: "#22c55e" },
  { icon: <Users size={18} />, label: "Total sessions", value: SESSIONS.length, color: "#141413" },
];

export default function DashboardPage() {
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
            <Link
              href="/submit"
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                background: "#FFFFFF", border: "1.5px solid #141413",
                borderRadius: 20, padding: "9px 20px",
                fontSize: 14, fontWeight: 500, color: "#141413", textDecoration: "none",
              }}
            >
              <GraduationCap size={14} /> New session
            </Link>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 40 }}>
          {STATS.map((stat) => (
            <div
              key={stat.label}
              style={{
                background: "#FCFBFA",
                borderRadius: 32,
                padding: "24px 28px",
                border: "1px solid #E8E2DA",
                display: "flex", alignItems: "center", gap: 16,
              }}
            >
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#F3F0EE", display: "flex", alignItems: "center", justifyContent: "center", color: stat.color }}>
                {stat.icon}
              </div>
              <div>
                <p style={{ fontSize: 28, fontWeight: 700, letterSpacing: -1, color: "#141413", margin: 0, lineHeight: 1 }}>
                  {stat.value}
                </p>
                <p style={{ fontSize: 13, fontWeight: 450, color: "#696969", margin: 0, marginTop: 4 }}>
                  {stat.label}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Session list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {SESSIONS.map((session) => {
            const sc = STATUS_CONFIG[session.status];
            return (
              <div
                key={session.id}
                style={{
                  background: "#FCFBFA",
                  borderRadius: 32,
                  padding: "24px 28px",
                  border: "1px solid #E8E2DA",
                  display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap",
                  transition: "box-shadow 0.2s",
                }}
              >
                {/* Student avatar */}
                <div
                  style={{
                    width: 48, height: 48, borderRadius: "50%",
                    background: session.status === "active" ? "#141413" : "#F3F0EE",
                    color: session.status === "active" ? "#F3F0EE" : "#696969",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: 700, fontSize: 16, flexShrink: 0,
                  }}
                >
                  {session.studentName.slice(0, 2).toUpperCase()}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 180 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 15, fontWeight: 600, color: "#141413" }}>{session.studentName}</span>
                    <span
                      style={{
                        fontSize: 11, fontWeight: 700, letterSpacing: "0.4px", textTransform: "uppercase",
                        background: sc.bg, color: sc.textColor,
                        borderRadius: 999, padding: "2px 10px",
                        display: "inline-flex", alignItems: "center", gap: 4,
                      }}
                    >
                      <span style={{ width: 5, height: 5, borderRadius: "50%", background: sc.dotColor, display: "inline-block" }} />
                      {sc.label}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.4px", textTransform: "uppercase", color: "#CF4500" }}>{session.code}</span>
                    <span style={{ fontSize: 13, fontWeight: 500, color: "#141413" }}>{session.module}</span>
                    <span style={{ fontSize: 12, color: "#696969", display: "flex", alignItems: "center", gap: 4 }}>
                      <Clock size={11} /> {session.submittedAt}
                    </span>
                  </div>
                  <p style={{ fontSize: 13, fontWeight: 450, color: "#696969", margin: 0, lineHeight: 1.5, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical" as const }}>
                    {session.preview}
                  </p>
                </div>

                {/* Join button */}
                <Link
                  href={`/session/${session.id}`}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    background: session.status === "waiting" ? "#141413" : session.status === "active" ? "#141413" : "#F3F0EE",
                    color: session.status === "closed" ? "#696969" : "#F3F0EE",
                    border: "1.5px solid",
                    borderColor: session.status === "closed" ? "#D1CDC7" : "#141413",
                    borderRadius: 20, padding: "9px 20px",
                    fontSize: 14, fontWeight: 500, textDecoration: "none",
                    whiteSpace: "nowrap",
                  }}
                >
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
