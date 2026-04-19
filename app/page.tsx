import Nav from "@/components/ui/Nav";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, MessageSquare, Upload, Zap } from "lucide-react";

export default function Home() {
  return (
    <main style={{ background: "#F3F0EE", minHeight: "100vh" }}>
      <Nav />

      {/* ── Hero ── */}
      <section style={{ maxWidth: 760, margin: "0 auto", padding: "148px 24px 80px", textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 24, fontSize: 12, fontWeight: 700, letterSpacing: "0.56px", textTransform: "uppercase", color: "#CF4500" }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#F37338", display: "inline-block" }} />
          Real-time tutoring
        </div>

        <h1 style={{ fontSize: "clamp(40px, 6vw, 68px)", fontWeight: 500, lineHeight: 1.05, letterSpacing: -2.5, color: "#141413", marginBottom: 20 }}>
          Submit your assignment.<br />Get help in minutes.
        </h1>

        <p style={{ fontSize: 18, fontWeight: 450, lineHeight: 1.55, color: "#696969", maxWidth: 420, margin: "0 auto 40px" }}>
          Type or upload your work — your tutor joins a live shared doc and helps you through it.
        </p>

        <Link href="/submit" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#141413", color: "#F3F0EE", borderRadius: 20, padding: "13px 36px", fontSize: 16, fontWeight: 500, letterSpacing: -0.32, textDecoration: "none" }}>
          Get assignment help <ArrowRight size={16} />
        </Link>
      </section>

      {/* ── Hero image ── */}
      <section style={{ padding: "0 24px 96px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", borderRadius: 40, overflow: "hidden", boxShadow: "0 24px 64px rgba(20,20,19,0.10)" }}>
          <Image
            src="/hero.png"
            alt="Tutor and student collaborating in real time"
            width={900}
            height={506}
            style={{ width: "100%", height: "auto", display: "block" }}
            priority
          />
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how" style={{ padding: "80px 24px 96px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12, fontSize: 12, fontWeight: 700, letterSpacing: "0.56px", textTransform: "uppercase", color: "#CF4500" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#F37338", display: "inline-block" }} />
            How it works
          </div>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 500, letterSpacing: -1, color: "#141413", marginBottom: 48, lineHeight: 1.1 }}>
            Three steps, that&apos;s it.
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
            {[
              { icon: <Upload size={20} />, step: "01", title: "Submit your assignment", desc: "Type the question or upload a file. Add your module name and code." },
              { icon: <MessageSquare size={20} />, step: "02", title: "Tutor is notified instantly", desc: "Your tutor gets a WhatsApp message with a direct link to your session." },
              { icon: <Zap size={20} />, step: "03", title: "Collaborate live", desc: "Work through it together in a real-time shared document with live cursors." },
            ].map((item) => (
              <div key={item.step} style={{ background: "#FCFBFA", borderRadius: 32, padding: "32px 28px", border: "1px solid #E8E2DA", position: "relative", overflow: "hidden" }}>
                <span style={{ position: "absolute", top: -8, right: 16, fontSize: 72, fontWeight: 700, color: "#E8E2DA", lineHeight: 1, userSelect: "none" }} aria-hidden>{item.step}</span>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#141413", color: "#F3F0EE", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18, position: "relative", zIndex: 1 }}>
                  {item.icon}
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 600, letterSpacing: -0.4, color: "#141413", marginBottom: 8, position: "relative", zIndex: 1 }}>{item.title}</h3>
                <p style={{ fontSize: 14, fontWeight: 450, color: "#696969", lineHeight: 1.6, position: "relative", zIndex: 1, margin: 0 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: "0 24px 96px" }}>
        <div style={{ maxWidth: 600, margin: "0 auto", background: "#141413", borderRadius: 40, padding: "56px 48px", textAlign: "center", position: "relative", overflow: "hidden" }}>
          <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} viewBox="0 0 600 220" preserveAspectRatio="none">
            <path d="M -40 180 Q 300 20 640 140" stroke="#F37338" strokeWidth="1.5" fill="none" strokeDasharray="4 8" opacity="0.5" />
          </svg>
          <div style={{ position: "relative", zIndex: 1 }}>
            <h2 style={{ fontSize: "clamp(26px, 4vw, 36px)", fontWeight: 500, letterSpacing: -1, color: "#F3F0EE", marginBottom: 12, lineHeight: 1.2 }}>
              Stuck on an assignment?
            </h2>
            <p style={{ fontSize: 16, color: "#9A9A9A", fontWeight: 450, marginBottom: 32, lineHeight: 1.5 }}>
              Your tutor is a message away.
            </p>
            <Link href="/submit" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#F3F0EE", color: "#141413", borderRadius: 20, padding: "12px 36px", fontSize: 16, fontWeight: 500, textDecoration: "none" }}>
              Get help now <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ background: "#141413", padding: "48px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: "#F3F0EE", letterSpacing: -0.3 }}>stoodent</span>
        <span style={{ fontSize: 13, color: "#696969" }}>© 2026 Stoodent. All rights reserved.</span>
        <div style={{ display: "flex", gap: 20 }}>
          {["Privacy", "Terms"].map((t) => (
            <a key={t} href="#" style={{ fontSize: 13, color: "#696969", textDecoration: "none" }}>{t}</a>
          ))}
        </div>
      </footer>
    </main>
  );
}
