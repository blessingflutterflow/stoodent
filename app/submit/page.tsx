"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { app } from "@/lib/firebase";
import {
  ArrowLeft, ArrowRight, FileText, Hash,
  Image as ImageIcon, LogOut, Phone,
  ShieldCheck, Type, UploadCloud, X,
} from "lucide-react";

function WhatsAppIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

type AuthStep = "idle" | "phone" | "otp" | "creating";

export default function SubmitPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  // Form state
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

  // Persistent session
  const [loggedInUser, setLoggedInUser] = useState<{ name: string; phone: string } | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => { if (d.isLoggedIn) setLoggedInUser({ name: d.name, phone: d.phone }); })
      .finally(() => setSessionChecked(true));
  }, []);

  // ── File helpers ───────────────────────────────────────
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
    (assignmentText.trim().length > 0 || !!file);

  // ── OTP input helpers ──────────────────────────────────
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

  // ── Create session (shared) ────────────────────────────
  async function createSession() {
    setAuthStep("creating");
    let fileUrl = "";
    if (file) {
      try {
        const storage = getStorage(app);
        const storageRef = ref(storage, `assignments/${Date.now()}-${file.name}`);
        await uploadBytes(storageRef, file);
        fileUrl = await getDownloadURL(storageRef);
      } catch {
        // file upload failure is non-fatal — session still creates
      }
    }

    const sessionRes = await fetch("/api/sessions/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ module: moduleName, moduleCode, assignmentText, fileUrl }),
    });
    const sessionData = await sessionRes.json();
    if (!sessionRes.ok) {
      setApiError(sessionData.error ?? "Failed to create session.");
      setAuthStep("idle");
      return;
    }
    router.push(`/session/${sessionData.sessionId}`);
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setLoggedInUser(null);
  }

  // ── Step 1: submit form ────────────────────────────────
  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setApiError("");
    if (loggedInUser) {
      createSession();
    } else {
      setAuthStep("phone");
    }
  }

  // ── Step 2: send OTP ───────────────────────────────────
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
    setOtp(["", "", "", "", "", ""]);
    setAuthStep("otp");
  }

  // ── Step 3: verify OTP ─────────────────────────────────
  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    const code = otp.join("");
    if (code.length !== 6) return;
    setLoading(true);
    setApiError("");
    const digits = phone.replace(/\D/g, "").replace(/^0/, "");
    const verifyRes = await fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: `+27${digits}`, code, name: name.trim() }),
    });
    const verifyData = await verifyRes.json();
    if (!verifyRes.ok) {
      setLoading(false);
      setApiError(verifyData.error ?? "Verification failed.");
      return;
    }
    setLoading(false);
    setLoggedInUser({ name: verifyData.name, phone: `+27${digits}` });
    await createSession();
  }

  const isOtpFull = otp.every(Boolean);

  return (
    <main style={{ background: "#F3F0EE", minHeight: "100vh", padding: "24px" }}>
      <div style={{ marginBottom: 32 }}>
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#FFFFFF", borderRadius: 999, padding: "8px 18px", boxShadow: "rgba(0,0,0,0.04) 0px 4px 24px 0px", fontSize: 14, fontWeight: 500, color: "#141413", textDecoration: "none" }}>
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
            Fill in your module and assignment — your tutor will be notified instantly.
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
                  value={moduleName}
                  onChange={(e) => setModuleName(e.target.value)}
                  placeholder="e.g. Mathematics"
                  style={{ width: "100%", background: "#FFFFFF", border: "1.5px solid", borderColor: moduleName ? "#141413" : "#D1CDC7", borderRadius: 999, padding: "11px 18px", fontSize: 15, fontWeight: 500, color: "#141413", outline: "none", fontFamily: "inherit", transition: "border-color 0.2s" }}
                />
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

          {/* Assignment content — text + optional file, both allowed */}
          <div style={{ background: "#FCFBFA", borderRadius: 32, padding: "28px", border: "1px solid #E8E2DA" }}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.56px", textTransform: "uppercase", color: "#696969", marginBottom: 20, display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#D1CDC7", display: "inline-block" }} />
              Assignment content
            </div>

            <textarea
              value={assignmentText}
              onChange={(e) => setAssignmentText(e.target.value)}
              placeholder="Describe your assignment or paste the question here… (optional if uploading a file)"
              rows={6}
              style={{ width: "100%", background: "#FFFFFF", border: "1.5px solid", borderColor: assignmentText ? "#141413" : "#D1CDC7", borderRadius: 24, padding: "18px 20px", fontSize: 15, fontWeight: 450, color: "#141413", lineHeight: 1.6, outline: "none", resize: "vertical", fontFamily: "inherit", transition: "border-color 0.2s", marginBottom: 16 }}
            />

            {/* File upload — always optional */}
            {!file ? (
              <div
                onDragOver={(e) => { e.preventDefault(); setFileDragOver(true); }}
                onDragLeave={() => setFileDragOver(false)}
                onDrop={handleFileDrop}
                onClick={() => fileRef.current?.click()}
                style={{ border: `2px dashed ${fileDragOver ? "#141413" : "#D1CDC7"}`, borderRadius: 24, padding: "28px 24px", textAlign: "center", cursor: "pointer", background: fileDragOver ? "#F3F0EE" : "#FFFFFF", transition: "all 0.2s" }}
              >
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}>
                  <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#F3F0EE", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <UploadCloud size={20} color="#696969" />
                  </div>
                </div>
                <p style={{ fontSize: 14, fontWeight: 500, color: "#141413", marginBottom: 4 }}>Attach a file <span style={{ fontWeight: 450, color: "#696969" }}>(optional)</span></p>
                <p style={{ fontSize: 12, color: "#696969" }}>PDF, Word, or image — max 20MB</p>
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

          {/* Logged-in banner */}
          {sessionChecked && loggedInUser && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#FCFBFA", border: "1.5px solid #E8E2DA", borderRadius: 20, padding: "14px 20px" }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: "#141413", margin: 0 }}>Signed in as {loggedInUser.name}</p>
                <p style={{ fontSize: 12, color: "#696969", margin: 0 }}>{loggedInUser.phone}</p>
              </div>
              <button type="button" onClick={handleLogout} style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "none", border: "none", fontSize: 13, color: "#696969", cursor: "pointer", fontFamily: "inherit" }}>
                <LogOut size={13} /> Switch
              </button>
            </div>
          )}

          {/* Error */}
          {apiError && (
            <div style={{ background: "#FFF5F0", border: "1px solid #F37338", borderRadius: 16, padding: "12px 16px", fontSize: 14, color: "#CF4500" }}>
              {apiError}
            </div>
          )}

          {/* Submit */}
          <button type="submit" disabled={!canSubmit || authStep === "creating"}
            style={{ width: "100%", background: canSubmit ? "#141413" : "#D1CDC7", color: "#F3F0EE", border: "none", borderRadius: 20, padding: "16px 0", fontSize: 17, fontWeight: 500, letterSpacing: -0.34, cursor: canSubmit ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: "inherit", transition: "background 0.2s" }}>
            {authStep === "creating"
              ? "Creating your session…"
              : loggedInUser
              ? <><ArrowRight size={18} /> Submit assignment</>
              : <>Continue to verification <ArrowRight size={18} /></>}
          </button>

          {!loggedInUser && sessionChecked && (
            <p style={{ textAlign: "center", fontSize: 13, color: "#696969", marginTop: -8 }}>
              You&apos;ll verify with SMS OTP before the session opens.
            </p>
          )}
        </form>
      </div>

      {/* ── Auth Bottom Sheet ──────────────────────────────── */}
      {authStep !== "idle" && authStep !== "creating" && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
          <div onClick={() => { setAuthStep("idle"); setApiError(""); }} style={{ position: "absolute", inset: 0, background: "rgba(20,20,19,0.55)", backdropFilter: "blur(4px)" }} />
          <div style={{ position: "relative", background: "#FCFBFA", borderRadius: "40px 40px 0 0", padding: "32px 32px 56px", maxWidth: 520, width: "100%", margin: "0 auto", zIndex: 1 }}>
            <div style={{ width: 40, height: 4, background: "#D1CDC7", borderRadius: 999, margin: "0 auto 32px" }} />

            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#25D366", color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <WhatsAppIcon size={22} />
              </div>
              <div>
                <p style={{ fontSize: 16, fontWeight: 600, color: "#141413", margin: 0, letterSpacing: -0.32 }}>
                  {authStep === "phone" ? "Verify your number" : "Enter your code"}
                </p>
                <p style={{ fontSize: 13, color: "#696969", margin: 0, fontWeight: 450 }}>
                  {authStep === "phone" ? "We'll send a 6-digit code via SMS" : `Sent via SMS to +27 ${phone.replace(/\D/g, "").replace(/^0/, "")}`}
                </p>
              </div>
            </div>

            {apiError && (
              <div style={{ background: "#FFF5F0", border: "1px solid #F37338", borderRadius: 16, padding: "12px 16px", marginBottom: 20, fontSize: 14, color: "#CF4500" }}>
                {apiError}
              </div>
            )}

            {authStep === "phone" && (
              <form onSubmit={handleSendOtp} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 700, color: "#141413", display: "block", marginBottom: 8 }}>Your first name</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Thabo" autoFocus
                    style={{ width: "100%", background: "#FFFFFF", border: "1.5px solid", borderColor: name ? "#141413" : "#D1CDC7", borderRadius: 999, padding: "12px 20px", fontSize: 15, fontWeight: 500, color: "#141413", outline: "none", fontFamily: "inherit" }} />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 700, color: "#141413", display: "block", marginBottom: 8 }}>Phone number</label>
                  <div style={{ display: "flex", alignItems: "center", background: "#FFFFFF", border: "1.5px solid", borderColor: phone.replace(/\D/g, "").length >= 9 ? "#141413" : "#D1CDC7", borderRadius: 999, overflow: "hidden" }}>
                    <div style={{ padding: "12px 16px 12px 20px", borderRight: "1.5px solid #E8E2DA", display: "flex", alignItems: "center", gap: 6, color: "#696969", fontSize: 15, fontWeight: 500, whiteSpace: "nowrap" }}>
                      <Phone size={14} /> +27
                    </div>
                    <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))} placeholder="82 123 4567" maxLength={10}
                      style={{ flex: 1, border: "none", outline: "none", background: "transparent", padding: "12px 20px 12px 14px", fontSize: 16, fontWeight: 500, color: "#141413", fontFamily: "inherit" }} />
                  </div>
                </div>
                <button type="submit" disabled={loading || !name.trim() || phone.replace(/\D/g, "").length < 9}
                  style={{ width: "100%", background: (!loading && name.trim() && phone.replace(/\D/g, "").length >= 9) ? "#25D366" : "#D1CDC7", color: "#FFFFFF", border: "none", borderRadius: 20, padding: "14px 0", fontSize: 16, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: "inherit" }}>
                  {loading ? "Sending…" : <><WhatsAppIcon size={18} /> Send code</>}
                </button>
              </form>
            )}

            {authStep === "otp" && (
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
                <button type="submit" disabled={!isOtpFull || loading}
                  style={{ width: "100%", background: isOtpFull ? "#141413" : "#D1CDC7", color: "#F3F0EE", border: "none", borderRadius: 20, padding: "14px 0", fontSize: 16, fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: "inherit" }}>
                  {loading ? "Verifying…" : <><ShieldCheck size={16} /> Verify &amp; open session</>}
                </button>
                <button type="button" onClick={() => { setAuthStep("phone"); setApiError(""); setOtp(["","","","","",""]); }}
                  style={{ background: "transparent", border: "none", fontSize: 14, color: "#696969", cursor: "pointer", fontFamily: "inherit" }}>
                  Didn&apos;t get the code? Go back
                </button>
              </form>
            )}

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
