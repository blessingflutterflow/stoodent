"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, ArrowRight, FileText, Hash,
  Image as ImageIcon, MessageCircle, Phone,
  ShieldCheck, Type, UploadCloud, X,
} from "lucide-react";

type InputMode = "type" | "upload";
type AuthStep = "idle" | "phone" | "otp" | "creating";

const MODULES = [
  "Mathematics", "Physics", "Chemistry", "Biology",
  "Computer Science", "Accounting", "Economics",
  "English Literature", "History", "Geography",
];

// ─── WhatsApp icon SVG ────────────────────────────────────
function WhatsAppIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export default function SubmitPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  // Form state
  const [mode, setMode] = useState<InputMode>("type");
  const [assignmentText, setAssignmentText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileDragOver, setFileDragOver] = useState(false);
  const [moduleName, setModuleName] = useState("");
  const [moduleCode, setModuleCode] = useState("");

  // Auth sheet state
  const [authStep, setAuthStep] = useState<AuthStep>("idle");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);

  // ── File helpers ──────────────────────────────────────
  function handleFileDrop(e: React.DragEvent) {
    e.preventDefault();
    setFileDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) setFile(f);
  }
  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  }
  function fileIcon(f: File) {
    return f.type.startsWith("image/") ? <ImageIcon size={18} /> : <FileText size={18} />;
  }
  function formatBytes(b: number) {
    if (b < 1024) return `${b} B`;
    if (b < 1048576) return `${(b / 1024).toFixed(1)} KB`;
    return `${(b / 1048576).toFixed(1)} MB`;
  }

  const canSubmit =
    moduleName.trim() &&
    moduleCode.trim() &&
    (mode === "type" ? assignmentText.trim().length > 20 : !!file);

  // ── OTP input helpers ─────────────────────────────────
  function handleOtpChange(index: number, value: string) {
    if (!/^\d?$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    if (value && index < 5) {
      (document.getElementById(`otp-${index + 1}`) as HTMLInputElement)?.focus();
    }
  }
  function handleOtpKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      (document.getElementById(`otp-${index - 1}`) as HTMLInputElement)?.focus();
    }
  }

  // ── Step 1: open auth sheet when form is valid ────────
  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setApiError("");
    setAuthStep("phone");
  }

  // ── Step 2: send OTP ──────────────────────────────────
  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || phone.replace(/\D/g, "").length < 9) return;
    setLoading(true);
    setApiError("");

    const digits = phone.replace(/\D/g, "").replace(/^0/, "");
    const res = await fetch("/api/auth/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: `+27${digits}` }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setApiError((data.detail ?? data.error) ?? "Something went wrong.");
      return;
    }

    console.log("[send-otp response]", data);
    setOtp(["", "", "", "", "", ""]);
    setAuthStep("otp");
  }

  // ── Step 3: verify OTP + create session ──────────────
  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    const code = otp.join("");
    if (code.length !== 6) return;

    setLoading(true);
    setApiError("");

    // Verify OTP
    const verifyRes = await fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: `+27${phone.replace(/\D/g, "").replace(/^0/, "")}`, code, name: name.trim() }),
    });
    const verifyData = await verifyRes.json();

    if (!verifyRes.ok) {
      setLoading(false);
      setApiError(verifyData.error ?? "Verification failed.");
      return;
    }

    // Create session
    setAuthStep("creating");
    const sessionRes = await fetch("/api/sessions/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        module: moduleName,
        moduleCode,
        assignmentText: mode === "type" ? assignmentText : `[File uploaded: ${file?.name}]`,
      }),
    });
    const sessionData = await sessionRes.json();
    setLoading(false);

    if (!sessionRes.ok) {
      setApiError(sessionData.error ?? "Failed to create session.");
      setAuthStep("otp");
      return;
    }

    router.push(`/session/${sessionData.sessionId}`);
  }

  const isOtpFull = otp.every(Boolean);

  // ── Render ────────────────────────────────────────────
  return (
    <main style={{ background: "#F3F0EE", minHeight: "100vh", padding: "24px" }}>
      <div style={{ marginBottom: 32 }}>
        <Link
          href="/"
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "#FFFFFF", borderRadius: 999, padding: "8px 18px",
            boxShadow: "rgba(0,0,0,0.04) 0px 4px 24px 0px",
            fontSize: 14, fontWeight: 500, color: "#141413", textDecoration: "none",
          }}
        >
          <ArrowLeft size={14} /> Back
        </Link>
      </div>

      <div className="max-w-2xl mx-auto">
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12, fontSize: 12, fontWeight: 700, letterSpacing: "0.56px", textTransform: "uppercase", color: "#CF4500" }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#F37338", display: "inline-block" }} />
            New session
          </div>
          <h1 style={{ fontSize: "clamp(28px, 5vw, 40px)", fontWeight: 500, letterSpacing: -1, color: "#141413", lineHeight: 1.1, marginBottom: 10 }}>
            Submit your assignment
          </h1>
          <p style={{ fontSize: 16, fontWeight: 450, color: "#696969", lineHeight: 1.5 }}>
            Fill in your assignment, then verify with WhatsApp to open your session.
          </p>
        </div>

        <form onSubmit={handleFormSubmit} style={{ display: "flex", flexDirection: "column", gap: 24 }}>

          {/* Module fields */}
          <div style={{ background: "#FCFBFA", borderRadius: 32, padding: "28px", border: "1px solid #E8E2DA" }}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.56px", textTransform: "uppercase", color: "#696969", marginBottom: 20, display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#D1CDC7", display: "inline-block" }} />
              Module info
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: "#141413", display: "block", marginBottom: 8 }}>
                  <Type size={12} style={{ display: "inline", marginRight: 6 }} />Module name
                </label>
                <input
                  list="modules-list"
                  value={moduleName}
                  onChange={(e) => setModuleName(e.target.value)}
                  placeholder="e.g. Mathematics"
                  style={{ width: "100%", background: "#FFFFFF", border: "1.5px solid", borderColor: moduleName ? "#141413" : "#D1CDC7", borderRadius: 999, padding: "11px 18px", fontSize: 15, fontWeight: 500, color: "#141413", outline: "none", fontFamily: "inherit", transition: "border-color 0.2s" }}
                />
                <datalist id="modules-list">{MODULES.map((m) => <option key={m} value={m} />)}</datalist>
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: "#141413", display: "block", marginBottom: 8 }}>
                  <Hash size={12} style={{ display: "inline", marginRight: 6 }} />Module code
                </label>
                <input
                  value={moduleCode}
                  onChange={(e) => setModuleCode(e.target.value.toUpperCase())}
                  placeholder="e.g. MAT101"
                  maxLength={10}
                  style={{ width: "100%", background: "#FFFFFF", border: "1.5px solid", borderColor: moduleCode ? "#141413" : "#D1CDC7", borderRadius: 999, padding: "11px 18px", fontSize: 15, fontWeight: 500, color: "#141413", outline: "none", fontFamily: "inherit", letterSpacing: 1, transition: "border-color 0.2s" }}
                />
              </div>
            </div>
          </div>

          {/* Assignment content */}
          <div style={{ background: "#FCFBFA", borderRadius: 32, padding: "28px", border: "1px solid #E8E2DA" }}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.56px", textTransform: "uppercase", color: "#696969", marginBottom: 20, display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#D1CDC7", display: "inline-block" }} />
              Assignment content
            </div>

            {/* Toggle */}
            <div style={{ display: "inline-flex", background: "#F3F0EE", borderRadius: 999, padding: 4, marginBottom: 24 }}>
              {(["type", "upload"] as InputMode[]).map((m) => (
                <button key={m} type="button" onClick={() => setMode(m)}
                  style={{ padding: "8px 22px", borderRadius: 999, border: "none", background: mode === m ? "#141413" : "transparent", color: mode === m ? "#F3F0EE" : "#696969", fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s", display: "flex", alignItems: "center", gap: 6 }}>
                  {m === "type" ? <><Type size={13} /> Type it</> : <><UploadCloud size={13} /> Upload file</>}
                </button>
              ))}
            </div>

            {mode === "type" ? (
              <textarea value={assignmentText} onChange={(e) => setAssignmentText(e.target.value)}
                placeholder="Paste or type your assignment question here…" rows={8}
                style={{ width: "100%", background: "#FFFFFF", border: "1.5px solid", borderColor: assignmentText.length > 20 ? "#141413" : "#D1CDC7", borderRadius: 24, padding: "18px 20px", fontSize: 15, fontWeight: 450, color: "#141413", lineHeight: 1.6, outline: "none", resize: "vertical", fontFamily: "inherit", transition: "border-color 0.2s" }} />
            ) : !file ? (
              <div onDragOver={(e) => { e.preventDefault(); setFileDragOver(true); }} onDragLeave={() => setFileDragOver(false)} onDrop={handleFileDrop} onClick={() => fileRef.current?.click()}
                style={{ border: `2px dashed ${fileDragOver ? "#141413" : "#D1CDC7"}`, borderRadius: 24, padding: "48px 24px", textAlign: "center", cursor: "pointer", background: fileDragOver ? "#F3F0EE" : "#FFFFFF", transition: "all 0.2s" }}>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
                  <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#F3F0EE", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <UploadCloud size={24} color="#696969" />
                  </div>
                </div>
                <p style={{ fontSize: 15, fontWeight: 500, color: "#141413", marginBottom: 6 }}>Drag & drop or click to upload</p>
                <p style={{ fontSize: 13, color: "#696969" }}>PDF, Word (.docx), or images — max 20MB</p>
                <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp" onChange={handleFileSelect} style={{ display: "none" }} />
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#FFFFFF", border: "1.5px solid #141413", borderRadius: 999, padding: "14px 20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 38, height: 38, borderRadius: "50%", background: "#F3F0EE", display: "flex", alignItems: "center", justifyContent: "center" }}>{fileIcon(file)}</div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: "#141413", margin: 0 }}>{file.name}</p>
                    <p style={{ fontSize: 12, color: "#696969", margin: 0 }}>{formatBytes(file.size)}</p>
                  </div>
                </div>
                <button type="button" onClick={() => setFile(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#696969", display: "flex" }}>
                  <X size={18} />
                </button>
              </div>
            )}
          </div>

          {/* Submit */}
          <button type="submit" disabled={!canSubmit}
            style={{ width: "100%", background: canSubmit ? "#141413" : "#D1CDC7", color: "#F3F0EE", border: "none", borderRadius: 20, padding: "16px 0", fontSize: 17, fontWeight: 500, letterSpacing: -0.34, cursor: canSubmit ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: "inherit", transition: "background 0.2s" }}>
            Continue to WhatsApp verification <ArrowRight size={18} />
          </button>

          <p style={{ textAlign: "center", fontSize: 13, color: "#696969", marginTop: -8 }}>
            You&apos;ll verify with WhatsApp OTP before the session opens.
          </p>
        </form>
      </div>

      {/* ── WhatsApp Auth Bottom Sheet ─────────────────── */}
      {authStep !== "idle" && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
          {/* Backdrop */}
          <div
            onClick={() => { if (authStep !== "creating") { setAuthStep("idle"); setApiError(""); } }}
            style={{ position: "absolute", inset: 0, background: "rgba(20,20,19,0.55)", backdropFilter: "blur(4px)" }}
          />

          {/* Sheet */}
          <div style={{ position: "relative", background: "#FCFBFA", borderRadius: "40px 40px 0 0", padding: "32px 32px 56px", maxWidth: 520, width: "100%", margin: "0 auto", zIndex: 1 }}>
            {/* Handle */}
            <div style={{ width: 40, height: 4, background: "#D1CDC7", borderRadius: 999, margin: "0 auto 32px" }} />

            {/* WhatsApp badge */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#25D366", color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <WhatsAppIcon size={22} />
              </div>
              <div>
                <p style={{ fontSize: 16, fontWeight: 600, color: "#141413", margin: 0, letterSpacing: -0.32 }}>
                  {authStep === "phone" ? "Verify with WhatsApp" : authStep === "otp" ? "Enter your code" : "Creating your session…"}
                </p>
                <p style={{ fontSize: 13, color: "#696969", margin: 0, fontWeight: 450 }}>
                  {authStep === "phone" ? "We'll send a 6-digit code via SMS" : authStep === "otp" ? `Sent via SMS to +27 ${phone.replace(/\D/g, "").replace(/^0/, "")}` : "Almost there, please wait"}
                </p>
              </div>
            </div>

            {/* Error */}
            {apiError && (
              <div style={{ background: "#FFF5F0", border: "1px solid #F37338", borderRadius: 16, padding: "12px 16px", marginBottom: 20, fontSize: 14, color: "#CF4500", fontWeight: 450 }}>
                {apiError}
              </div>
            )}

            {/* ── Phone step ── */}
            {authStep === "phone" && (
              <form onSubmit={handleSendOtp} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {/* Name */}
                <div>
                  <label style={{ fontSize: 13, fontWeight: 700, color: "#141413", display: "block", marginBottom: 8 }}>Your first name</label>
                  <input
                    value={name} onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Thabo"
                    autoFocus
                    style={{ width: "100%", background: "#FFFFFF", border: "1.5px solid", borderColor: name ? "#141413" : "#D1CDC7", borderRadius: 999, padding: "12px 20px", fontSize: 15, fontWeight: 500, color: "#141413", outline: "none", fontFamily: "inherit" }}
                  />
                </div>

                {/* Phone */}
                <div>
                  <label style={{ fontSize: 13, fontWeight: 700, color: "#141413", display: "block", marginBottom: 8 }}>WhatsApp number</label>
                  <div style={{ display: "flex", alignItems: "center", background: "#FFFFFF", border: "1.5px solid", borderColor: phone.replace(/\D/g, "").length >= 9 ? "#141413" : "#D1CDC7", borderRadius: 999, overflow: "hidden" }}>
                    <div style={{ padding: "12px 16px 12px 20px", borderRight: "1.5px solid #E8E2DA", display: "flex", alignItems: "center", gap: 6, color: "#696969", fontSize: 15, fontWeight: 500, whiteSpace: "nowrap" }}>
                      <Phone size={14} /> +27
                    </div>
                    <input
                      type="tel" value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                      placeholder="82 123 4567" maxLength={10}
                      style={{ flex: 1, border: "none", outline: "none", background: "transparent", padding: "12px 20px 12px 14px", fontSize: 16, fontWeight: 500, color: "#141413", fontFamily: "inherit" }}
                    />
                  </div>
                </div>

                <button type="submit" disabled={loading || !name.trim() || phone.replace(/\D/g, "").length < 9}
                  style={{ width: "100%", background: (!loading && name.trim() && phone.replace(/\D/g, "").length >= 9) ? "#25D366" : "#D1CDC7", color: "#FFFFFF", border: "none", borderRadius: 20, padding: "14px 0", fontSize: 16, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: "inherit", transition: "background 0.2s" }}>
                  {loading ? "Sending…" : <><WhatsAppIcon size={18} /> Send code on WhatsApp</>}
                </button>
              </form>
            )}

            {/* ── OTP step ── */}
            {(authStep === "otp" || authStep === "creating") && (
              <form onSubmit={handleVerifyOtp} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                  {otp.map((digit, i) => (
                    <input key={i} id={`otp-${i}`} type="text" inputMode="numeric" maxLength={1} value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      style={{ width: 48, height: 56, textAlign: "center", fontSize: 22, fontWeight: 600, background: digit ? "#141413" : "#FFFFFF", color: digit ? "#F3F0EE" : "#141413", border: "1.5px solid", borderColor: digit ? "#141413" : "#D1CDC7", borderRadius: 16, outline: "none", transition: "all 0.15s", fontFamily: "inherit" }}
                      autoFocus={i === 0} />
                  ))}
                </div>

                <button type="submit" disabled={!isOtpFull || loading || authStep === "creating"}
                  style={{ width: "100%", background: (isOtpFull && authStep !== "creating") ? "#141413" : "#D1CDC7", color: "#F3F0EE", border: "none", borderRadius: 20, padding: "14px 0", fontSize: 16, fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: "inherit" }}>
                  {authStep === "creating" ? "Creating your session…" : <><ShieldCheck size={16} /> Verify &amp; open session</>}
                </button>

                <button type="button" onClick={() => { setAuthStep("phone"); setApiError(""); setOtp(["","","","","",""]); }}
                  style={{ width: "100%", background: "transparent", border: "none", fontSize: 14, color: "#696969", cursor: "pointer", fontFamily: "inherit" }}>
                  Didn&apos;t get the code? Go back
                </button>
              </form>
            )}

            {/* Progress dots */}
            <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 28 }}>
              {["phone", "otp"].map((s) => (
                <div key={s} style={{ width: s === authStep ? 24 : 8, height: 8, borderRadius: 999, background: s === authStep ? "#141413" : "#D1CDC7", transition: "all 0.2s" }} />
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
