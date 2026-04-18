"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, GraduationCap, Phone, ShieldCheck } from "lucide-react";

type Step = "phone" | "otp";

export default function AuthPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);

  function handlePhoneSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!phone || phone.length < 9) return;
    setLoading(true);
    // TODO: call Twilio SMS API
    setTimeout(() => { setLoading(false); setStep("otp"); }, 900);
  }

  function handleOtpChange(index: number, value: string) {
    if (!/^\d?$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      (nextInput as HTMLInputElement)?.focus();
    }
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prev = document.getElementById(`otp-${index - 1}`);
      (prev as HTMLInputElement)?.focus();
    }
  }

  function handleOtpSubmit(e: React.FormEvent) {
    e.preventDefault();
    const code = otp.join("");
    if (code.length !== 6) return;
    setLoading(true);
    // TODO: verify OTP with Twilio Verify
    setTimeout(() => { setLoading(false); router.push("/submit"); }, 900);
  }

  const isOtpFull = otp.every(Boolean);

  return (
    <main
      style={{ background: "#F3F0EE", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px" }}
    >
      {/* Back to home */}
      <div style={{ position: "fixed", top: 28, left: 28 }}>
        <Link
          href="/"
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "#FFFFFF", borderRadius: 999, padding: "8px 18px",
            boxShadow: "rgba(0,0,0,0.04) 0px 4px 24px 0px",
            fontSize: 14, fontWeight: 500, color: "#141413", textDecoration: "none",
          }}
        >
          <ArrowLeft size={14} /> Home
        </Link>
      </div>

      {/* Card */}
      <div
        style={{
          background: "#FCFBFA",
          borderRadius: 40,
          padding: "56px 48px",
          maxWidth: 440,
          width: "100%",
          boxShadow: "rgba(0,0,0,0.06) 0px 24px 48px 0px",
          border: "1px solid #E8E2DA",
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 40 }}>
          <div
            style={{
              width: 40, height: 40, borderRadius: "50%",
              background: "#141413", color: "#F3F0EE",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <GraduationCap size={20} />
          </div>
          <span style={{ fontWeight: 700, fontSize: 18, color: "#141413", letterSpacing: -0.36 }}>stoodent</span>
        </div>

        {step === "phone" ? (
          <form onSubmit={handlePhoneSubmit}>
            {/* Eyebrow */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12, fontSize: 12, fontWeight: 700, letterSpacing: "0.56px", textTransform: "uppercase", color: "#CF4500" }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#F37338", display: "inline-block" }} />
              Step 1 of 2
            </div>

            <h1 style={{ fontSize: 28, fontWeight: 500, letterSpacing: -0.56, color: "#141413", marginBottom: 8, lineHeight: 1.15 }}>
              Enter your phone number
            </h1>
            <p style={{ fontSize: 15, fontWeight: 450, color: "#696969", lineHeight: 1.5, marginBottom: 36 }}>
              We&apos;ll send a one-time code via SMS to verify it&apos;s you.
            </p>

            {/* Phone input */}
            <label style={{ fontSize: 13, fontWeight: 700, color: "#141413", letterSpacing: 0.2, display: "block", marginBottom: 8 }}>
              Phone number
            </label>
            <div
              style={{
                display: "flex", alignItems: "center", gap: 0,
                background: "#FFFFFF", borderRadius: 999,
                border: "1.5px solid #141413",
                overflow: "hidden",
                marginBottom: 28,
              }}
            >
              <div style={{ padding: "12px 16px 12px 20px", borderRight: "1.5px solid #E8E2DA", display: "flex", alignItems: "center", gap: 6, color: "#696969", fontSize: 15, fontWeight: 500, whiteSpace: "nowrap" }}>
                <Phone size={15} />
                +27
              </div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                placeholder="82 123 4567"
                maxLength={10}
                style={{
                  flex: 1, border: "none", outline: "none",
                  background: "transparent", padding: "12px 20px 12px 14px",
                  fontSize: 16, fontWeight: 500, color: "#141413",
                  fontFamily: "inherit",
                }}
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={loading || phone.length < 9}
              style={{
                width: "100%",
                background: phone.length >= 9 ? "#141413" : "#D1CDC7",
                color: "#F3F0EE",
                border: "none",
                borderRadius: 20,
                padding: "14px 0",
                fontSize: 16, fontWeight: 500, letterSpacing: -0.32,
                cursor: phone.length >= 9 ? "pointer" : "not-allowed",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                transition: "background 0.2s",
                fontFamily: "inherit",
              }}
            >
              {loading ? "Sending…" : <>Send OTP <ArrowRight size={16} /></>}
            </button>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12, fontSize: 12, fontWeight: 700, letterSpacing: "0.56px", textTransform: "uppercase", color: "#CF4500" }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#F37338", display: "inline-block" }} />
              Step 2 of 2
            </div>

            <h1 style={{ fontSize: 28, fontWeight: 500, letterSpacing: -0.56, color: "#141413", marginBottom: 8, lineHeight: 1.15 }}>
              Enter the code
            </h1>
            <p style={{ fontSize: 15, fontWeight: 450, color: "#696969", lineHeight: 1.5, marginBottom: 36 }}>
              We sent a 6-digit code to{" "}
              <span style={{ color: "#141413", fontWeight: 600 }}>+27 {phone}</span>
            </p>

            {/* OTP boxes */}
            <div style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 36 }}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  id={`otp-${i}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  style={{
                    width: 48, height: 56,
                    textAlign: "center",
                    fontSize: 22, fontWeight: 600,
                    background: digit ? "#141413" : "#FFFFFF",
                    color: digit ? "#F3F0EE" : "#141413",
                    border: "1.5px solid",
                    borderColor: digit ? "#141413" : "#D1CDC7",
                    borderRadius: 16,
                    outline: "none",
                    transition: "all 0.15s",
                    fontFamily: "inherit",
                  }}
                  autoFocus={i === 0}
                />
              ))}
            </div>

            {/* Verify */}
            <button
              type="submit"
              disabled={loading || !isOtpFull}
              style={{
                width: "100%",
                background: isOtpFull ? "#141413" : "#D1CDC7",
                color: "#F3F0EE",
                border: "none",
                borderRadius: 20,
                padding: "14px 0",
                fontSize: 16, fontWeight: 500, letterSpacing: -0.32,
                cursor: isOtpFull ? "pointer" : "not-allowed",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                fontFamily: "inherit",
              }}
            >
              {loading ? "Verifying…" : <><ShieldCheck size={16} /> Verify &amp; continue</>}
            </button>

            {/* Resend */}
            <button
              type="button"
              onClick={() => setStep("phone")}
              style={{
                width: "100%", marginTop: 16,
                background: "transparent", border: "none",
                fontSize: 14, fontWeight: 450, color: "#696969",
                cursor: "pointer", fontFamily: "inherit",
              }}
            >
              Wrong number? Go back
            </button>
          </form>
        )}
      </div>

      {/* Progress dots */}
      <div style={{ marginTop: 28, display: "flex", gap: 8 }}>
        {(["phone", "otp"] as Step[]).map((s) => (
          <div
            key={s}
            style={{
              width: s === step ? 24 : 8,
              height: 8,
              borderRadius: 999,
              background: s === step ? "#141413" : "#D1CDC7",
              transition: "all 0.2s",
            }}
          />
        ))}
      </div>
    </main>
  );
}
