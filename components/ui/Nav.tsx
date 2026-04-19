"use client";
import Link from "next/link";
import { GraduationCap } from "lucide-react";

export default function Nav() {
  return (
    <div className="fixed top-6 left-0 right-0 z-50 flex justify-center px-6 pointer-events-none">
      <nav
        className="pointer-events-auto flex items-center justify-between gap-8 bg-white px-10 py-3.5"
        style={{
          borderRadius: 999,
          boxShadow: "rgba(0,0,0,0.04) 0px 4px 24px 0px",
          minWidth: 320,
          maxWidth: 760,
          width: "100%",
        }}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 no-underline">
          <div
            className="flex items-center justify-center bg-[#141413] text-[#F3F0EE]"
            style={{ width: 32, height: 32, borderRadius: 999 }}
          >
            <GraduationCap size={16} />
          </div>
          <span style={{ fontWeight: 700, fontSize: 16, color: "#141413", letterSpacing: -0.32 }}>
            stoodent
          </span>
        </Link>

        {/* Links */}
        <div className="hidden md:flex items-center gap-8">
          {[
            { label: "How it works", href: "/#how" },
            { label: "Assignments", href: "/my-sessions" },
          ].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="no-underline"
              style={{ fontSize: 15, fontWeight: 500, color: "#141413", letterSpacing: -0.3 }}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* CTA */}
        <Link
          href="/submit"
          style={{
            background: "#141413",
            color: "#F3F0EE",
            border: "1.5px solid #141413",
            borderRadius: 20,
            padding: "6px 20px",
            fontSize: 15,
            fontWeight: 500,
            letterSpacing: -0.3,
            textDecoration: "none",
            whiteSpace: "nowrap",
          }}
        >
          Get help
        </Link>
      </nav>
    </div>
  );
}
