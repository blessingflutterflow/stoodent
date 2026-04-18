import Nav from "@/components/ui/Nav";
import Link from "next/link";
import { ArrowRight, MessageSquare, Upload, Zap } from "lucide-react";

export default function Home() {
  return (
    <main style={{ background: "#F3F0EE", minHeight: "100vh" }}>
      <Nav />

      {/* Hero */}
      <section
        className="relative flex flex-col items-center justify-center text-center px-6 overflow-hidden"
        style={{ paddingTop: 160, paddingBottom: 96 }}
      >
        {/* Ghost watermark */}
        <span
          className="absolute select-none pointer-events-none whitespace-nowrap"
          style={{
            fontSize: "clamp(80px, 18vw, 200px)",
            fontWeight: 500,
            color: "#E8E2DA",
            letterSpacing: -4,
            top: 80,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 0,
          }}
          aria-hidden
        >
          stoodent
        </span>

        <div className="relative z-10 max-w-3xl mx-auto">
          {/* Eyebrow */}
          <div
            className="inline-flex items-center gap-2 mb-6"
            style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.56px", textTransform: "uppercase", color: "#CF4500" }}
          >
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#F37338", display: "inline-block" }} />
            Real-time tutoring
          </div>

          <h1
            style={{
              fontSize: "clamp(40px, 6vw, 64px)",
              fontWeight: 500,
              lineHeight: 1,
              letterSpacing: -2,
              color: "#141413",
              marginBottom: 24,
            }}
          >
            Submit your assignment.<br />
            Get help in minutes.
          </h1>

          <p
            style={{
              fontSize: 18,
              fontWeight: 450,
              lineHeight: 1.5,
              color: "#696969",
              maxWidth: 480,
              margin: "0 auto 40px",
            }}
          >
            Upload or type your assignment, tell us the module, and collaborate
            live with your tutor inside a shared document.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/submit"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "#141413",
                color: "#F3F0EE",
                border: "1.5px solid #141413",
                borderRadius: 20,
                padding: "12px 32px",
                fontSize: 16,
                fontWeight: 500,
                letterSpacing: -0.32,
                textDecoration: "none",
              }}
            >
              Get assignment help <ArrowRight size={16} />
            </Link>
            <a
              href="#how"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "#FFFFFF",
                color: "#141413",
                border: "1.5px solid #141413",
                borderRadius: 20,
                padding: "12px 32px",
                fontSize: 16,
                fontWeight: 450,
                textDecoration: "none",
              }}
            >
              How it works
            </a>
          </div>
        </div>
      </section>

      {/* Preview card — stadium hero mock */}
      <section className="px-6 pb-24">
        <div
          className="mx-auto max-w-4xl relative overflow-hidden"
          style={{
            background: "#141413",
            borderRadius: 40,
            minHeight: 320,
            boxShadow: "rgba(0,0,0,0.08) 0px 24px 48px 0px",
          }}
        >
          {/* Decorative orbit arc */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            preserveAspectRatio="none"
            viewBox="0 0 800 320"
          >
            <path
              d="M -80 280 Q 400 -60 880 200"
              stroke="#F37338"
              strokeWidth="1.5"
              fill="none"
              strokeDasharray="4 8"
              opacity="0.6"
            />
          </svg>

          <div className="relative z-10 p-10 md:p-16 flex flex-col md:flex-row items-center gap-10">
            {/* Left */}
            <div className="flex-1">
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: "0.56px",
                  textTransform: "uppercase",
                  color: "#F37338",
                  marginBottom: 16,
                }}
              >
                <span style={{ marginRight: 6 }}>•</span> Live session
              </div>
              <h2
                style={{
                  fontSize: "clamp(24px, 4vw, 36px)",
                  fontWeight: 500,
                  lineHeight: 1.2,
                  letterSpacing: -1,
                  color: "#F3F0EE",
                  marginBottom: 12,
                }}
              >
                Your tutor joins the document and types alongside you.
              </h2>
              <p style={{ fontSize: 15, fontWeight: 450, color: "#9A9A9A", lineHeight: 1.5 }}>
                See their cursor in real-time. Ask questions. Get answers — right inside the doc.
              </p>
            </div>

            {/* Right — mock avatars */}
            <div className="flex-shrink-0 flex items-center gap-4">
              {[
                { label: "You", bg: "#F37338", initials: "ST" },
                { label: "Tutor", bg: "#FCFBFA", color: "#141413", initials: "TU" },
              ].map((a) => (
                <div key={a.label} className="flex flex-col items-center gap-2">
                  <div
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: "50%",
                      background: a.bg,
                      color: a.color ?? "#F3F0EE",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      fontSize: 18,
                      border: "3px solid #2a2a2a",
                    }}
                  >
                    {a.initials}
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 500, color: "#9A9A9A" }}>{a.label}</span>
                </div>
              ))}
              <div style={{ color: "#F37338", fontWeight: 700, fontSize: 20, paddingBottom: 20 }}>↔</div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" style={{ paddingTop: 96, paddingBottom: 96, paddingLeft: 24, paddingRight: 24 }}>
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-6" style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.56px", textTransform: "uppercase", color: "#CF4500" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#F37338", display: "inline-block" }} />
            How it works
          </div>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 36px)", fontWeight: 500, letterSpacing: -1, color: "#141413", marginBottom: 56, lineHeight: 1.2 }}>
            Three steps to a solved assignment.
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <Upload size={22} />,
                step: "01",
                title: "Upload or type",
                desc: "Paste your assignment or upload a PDF, Word doc, or image. Add your module name and code.",
              },
              {
                icon: <MessageSquare size={22} />,
                step: "02",
                title: "Tutor is notified",
                desc: "Your tutor receives an instant WhatsApp/SMS notification with a link to your session.",
              },
              {
                icon: <Zap size={22} />,
                step: "03",
                title: "Collaborate live",
                desc: "Work through the assignment together in a real-time shared document with live cursors.",
              },
            ].map((item) => (
              <div
                key={item.step}
                style={{
                  background: "#FCFBFA",
                  borderRadius: 40,
                  padding: "36px 32px",
                  border: "1px solid #E8E2DA",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Ghost step number */}
                <span
                  style={{
                    position: "absolute",
                    top: -8,
                    right: 16,
                    fontSize: 80,
                    fontWeight: 700,
                    color: "#E8E2DA",
                    lineHeight: 1,
                    userSelect: "none",
                  }}
                  aria-hidden
                >
                  {item.step}
                </span>

                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    background: "#141413",
                    color: "#F3F0EE",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 20,
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  {item.icon}
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 500, letterSpacing: -0.4, color: "#141413", marginBottom: 10, position: "relative", zIndex: 1 }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: 15, fontWeight: 450, color: "#696969", lineHeight: 1.55, position: "relative", zIndex: 1 }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section style={{ paddingTop: 64, paddingBottom: 128, paddingLeft: 24, paddingRight: 24 }}>
        <div
          className="mx-auto max-w-2xl text-center"
          style={{
            background: "#FCFBFA",
            borderRadius: 40,
            padding: "64px 48px",
            border: "1px solid #E8E2DA",
          }}
        >
          <div className="flex items-center justify-center gap-2 mb-4" style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.56px", textTransform: "uppercase", color: "#CF4500" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#F37338", display: "inline-block" }} />
            Ready?
          </div>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 36px)", fontWeight: 500, letterSpacing: -1, color: "#141413", marginBottom: 16, lineHeight: 1.2 }}>
            Stuck on an assignment?<br />We&apos;re here.
          </h2>
          <p style={{ fontSize: 16, fontWeight: 450, color: "#696969", lineHeight: 1.5, marginBottom: 32 }}>
            Log in with your phone number, submit your work, and your tutor will be there.
          </p>
          <Link
            href="/submit"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "#141413",
              color: "#F3F0EE",
              border: "1.5px solid #141413",
              borderRadius: 20,
              padding: "12px 36px",
              fontSize: 16,
              fontWeight: 500,
              letterSpacing: -0.32,
              textDecoration: "none",
            }}
          >
            Start now <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: "#141413", color: "#FFFFFF", padding: "64px 48px 48px" }}>
        <div className="max-w-4xl mx-auto">
          <h2 style={{ fontSize: "clamp(24px, 3vw, 32px)", fontWeight: 500, letterSpacing: -1, color: "#F3F0EE", marginBottom: 48, lineHeight: 1.2 }}>
            We&apos;re always here when<br />you need us.
          </h2>

          <div className="grid md:grid-cols-3 gap-10 mb-12">
            {[
              { heading: "Platform", links: ["Submit assignment", "Live sessions", "How it works"] },
              { heading: "Support", links: ["WhatsApp tutor", "FAQs", "Contact"] },
              { heading: "Account", links: ["Log in", "My sessions", "Profile"] },
            ].map((col) => (
              <div key={col.heading}>
                <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.56px", textTransform: "uppercase", color: "#696969", marginBottom: 16 }}>
                  {col.heading}
                </div>
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {col.links.map((l) => (
                    <li key={l} style={{ marginBottom: 12 }}>
                      <a href="#" style={{ color: "#FCFBFA", fontSize: 14, fontWeight: 450, textDecoration: "none", opacity: 0.85 }}>
                        {l}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div style={{ borderTop: "1px solid rgba(255,255,255,0.15)", paddingTop: 24, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <span style={{ fontSize: 13, color: "#696969", fontWeight: 450 }}>© 2026 Stoodent. All rights reserved.</span>
            <div style={{ display: "flex", gap: 16 }}>
              {["Privacy", "Terms"].map((t) => (
                <a key={t} href="#" style={{ fontSize: 13, color: "#696969", textDecoration: "none" }}>{t}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
