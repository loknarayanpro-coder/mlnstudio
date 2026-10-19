"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Sparkles,
  Layers,
  Heart,
  ShieldCheck,
  Check,
  AlertCircle,
  KeyRound,
  X,
  User
} from "lucide-react";
import { useWardrobe } from "../../../lib/store/wardrobe-context";
import { getSupabaseClient } from "../../../lib/supabase/client";

export function GothicLandingView() {
  const { signIn, signUp } = useWardrobe();
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetStatus, setResetStatus] = useState<"idle" | "sending" | "sent">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMsg("Please enter both email address and password.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      if (isSignUp) {
        await signUp(email.trim(), password);
        setSuccessMsg("Account initialized. Accessing your archive...");
      } else {
        await signIn(email.trim(), password);
        setSuccessMsg("Cipher verified. Entering the Haute Atelier...");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Authentication failed. Please verify credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) return;
    setResetStatus("sending");
    try {
      const supabase = getSupabaseClient();
      if (supabase) {
        await supabase.auth.resetPasswordForEmail(resetEmail.trim());
      }
      setResetStatus("sent");
    } catch {
      setResetStatus("sent");
    }
  };

  return (
    <div className="relative min-h-[100dvh] w-full bg-[#d8dbe5] text-[#0a0b10] selection:bg-[#0a0b10] selection:text-white flex flex-col justify-between overflow-x-hidden safe-pb">
      {/* Ambient Radial Atmosphere */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(10,11,16,0.08),transparent_70%)]" />

      {/* Top Header */}
      <header className="relative z-20 w-full px-4 py-3 sm:px-8 sm:py-4 flex items-center justify-between border-b border-[#bcc0ce]/60 bg-white/40 backdrop-blur-md safe-pt">
        <div className="flex items-center gap-3">
          <Link href="/" className="relative h-10 w-40 sm:h-12 sm:w-48 block">
            <Image
              src="/brand/mln-studio-black.png"
              alt="MLN STUDIO"
              fill
              priority
              className="object-contain object-left"
            />
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-block font-gothic text-[9.5px] uppercase tracking-[0.24em] text-[#585c6e] font-bold">
            Haute Atelier &bull; Vol. I
          </span>
        </div>
      </header>

      {/* Main Hero & Auth Split */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8 sm:px-8 sm:py-12 lg:px-12">
        <div className="w-full max-w-5xl mx-auto grid gap-8 lg:grid-cols-12 items-center">
          
          {/* LEFT COLUMN: BRAND MANIFESTO & PHILOSOPHY */}
          <div className="lg:col-span-6 flex flex-col justify-center text-left">
            <div className="mb-3 flex items-center gap-2">
              <span className="text-[10px] text-[#0a0b10] font-gothic tracking-[0.28em] uppercase font-bold">
                ✦ ATELIER NOIRE
              </span>
              <span className="h-px w-8 bg-[#0a0b10]/40" />
              <span className="text-[10px] text-[#525666] font-gothic tracking-[0.24em] uppercase font-semibold">
                ARCHIVE
              </span>
            </div>

            <h1 className="font-gothic text-3xl sm:text-5xl lg:text-5xl font-bold uppercase tracking-[0.16em] text-[#090a10] leading-[1.1]">
              MLN STUDIO
            </h1>

            <div className="mt-2 text-sm sm:text-base font-gothic tracking-[0.18em] text-[#1a1c26] uppercase font-bold">
              Silence as Luxury &bull; Darkness as Elegance
            </div>

            <p className="mt-4 font-editorial italic text-base sm:text-lg text-[#3e4252] leading-relaxed max-w-lg">
              A private digital archive for those who dress with architectural intent. Catalog your garments, isolate silhouettes in studio light, and let our deterministic engine score each look for color harmony.
            </p>

            {/* Feature Highlights */}
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-xl border border-[#bcc0ce] bg-white/70 p-3 backdrop-blur-xs shadow-2xs">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#0a0b10] text-white">
                  <Sparkles size={14} />
                </div>
                <div className="min-w-0">
                  <div className="font-gothic text-[11px] font-bold tracking-wider text-[#0a0b10] uppercase">
                    AI Studio Isolation
                  </div>
                  <div className="font-editorial italic text-[11px] text-[#525666] line-clamp-1">
                    Studio lighting & background removal
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-[#bcc0ce] bg-white/70 p-3 backdrop-blur-xs shadow-2xs">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#0a0b10] text-white">
                  <Layers size={14} />
                </div>
                <div className="min-w-0">
                  <div className="font-gothic text-[11px] font-bold tracking-wider text-[#0a0b10] uppercase">
                    Deterministic Harmony
                  </div>
                  <div className="font-editorial italic text-[11px] text-[#525666] line-clamp-1">
                    Color & silhouette matching rules
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: SUPABASE EMAIL / PASSWORD AUTH CARD */}
          <div className="flex justify-center lg:col-span-6">
            <div className="w-full max-w-[420px] rounded-[24px] sm:rounded-[28px] border border-[#b8bcc8] bg-white/95 p-6 sm:p-8 shadow-[0_20px_50px_rgba(10,11,16,0.12)] backdrop-blur-xl">
              
              {/* Card Header Switcher */}
              <div className="grid grid-cols-2 p-1 bg-[#eaedf5] rounded-xl border border-[#c2c6d2] mb-5 text-xs font-gothic tracking-wider">
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(false);
                    setErrorMsg("");
                    setSuccessMsg("");
                  }}
                  className={`py-2 rounded-lg transition-all duration-150 flex items-center justify-center gap-1.5 ${
                    !isSignUp
                      ? "bg-[#0a0b10] text-white shadow-sm font-bold"
                      : "text-[#525666] hover:text-black font-semibold"
                  }`}
                >
                  <span>SIGN IN</span>
                  {!isSignUp && <Check size={12} className="text-white" />}
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(true);
                    setErrorMsg("");
                    setSuccessMsg("");
                  }}
                  className={`py-2 rounded-lg transition-all duration-150 flex items-center justify-center gap-1.5 ${
                    isSignUp
                      ? "bg-[#0a0b10] text-white shadow-sm font-bold"
                      : "text-[#525666] hover:text-black font-semibold"
                  }`}
                >
                  <span>CREATE ACCOUNT</span>
                  {isSignUp && <Check size={12} className="text-white" />}
                </button>
              </div>

              {/* Feedback Alerts */}
              {errorMsg && (
                <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-300 bg-red-50 p-3 text-xs text-red-900 font-medium">
                  <AlertCircle size={15} className="mt-0.5 shrink-0 text-red-600" />
                  <div className="flex-1">{errorMsg}</div>
                </div>
              )}

              {successMsg && (
                <div className="mb-4 flex items-start gap-2 rounded-xl border border-emerald-300 bg-emerald-50 p-3 text-xs text-emerald-900 font-medium">
                  <Check size={15} className="mt-0.5 shrink-0 text-emerald-600" />
                  <div className="flex-1">{successMsg}</div>
                </div>
              )}

              {/* Clean Email & Password Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {isSignUp && (
                  <div>
                    <label className="block text-[10px] font-gothic tracking-[0.2em] uppercase text-[#4a4e5e] mb-1.5 font-bold">
                      Your Name
                    </label>
                    <div className="relative">
                      <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#787c8c]" />
                      <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="e.g. Alex"
                        className="w-full rounded-xl border border-[#c2c6d2] bg-[#f4f6fa] pl-10 pr-3.5 py-2.5 text-base sm:text-sm text-[#0a0b10] placeholder-[#8a8e9e] outline-none transition focus:border-[#0a0b10] focus:bg-white"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-gothic tracking-[0.2em] uppercase text-[#4a4e5e] mb-1.5 font-bold">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#787c8c]" />
                    <input
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="name@atelier.goth"
                      className="w-full rounded-xl border border-[#c2c6d2] bg-[#f4f6fa] pl-10 pr-3.5 py-2.5 text-base sm:text-sm text-[#0a0b10] placeholder-[#8a8e9e] outline-none transition focus:border-[#0a0b10] focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[10px] font-gothic tracking-[0.2em] uppercase text-[#4a4e5e] font-bold">
                      Password
                    </label>
                    {!isSignUp && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowForgotModal(true);
                          setResetStatus("idle");
                          setResetEmail(email);
                        }}
                        className="text-[10px] font-gothic tracking-wider text-[#525666] hover:text-black font-bold uppercase transition"
                      >
                        Forgot Password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#787c8c]" />
                    <input
                      type={showPassword ? "text" : "password"}
                      autoComplete={isSignUp ? "new-password" : "current-password"}
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full rounded-xl border border-[#c2c6d2] bg-[#f4f6fa] pl-10 pr-10 py-2.5 text-base sm:text-sm text-[#0a0b10] placeholder-[#8a8e9e] outline-none transition focus:border-[#0a0b10] focus:bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#787c8c] hover:text-black p-1 transition"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={e => setRememberMe(e.target.checked)}
                      className="h-3.5 w-3.5 rounded border-[#bcc0ce] text-[#0a0b10] accent-[#0a0b10]"
                    />
                    <span className="text-xs text-[#525666]">Remember this session</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 flex w-full h-11 items-center justify-center gap-2 rounded-xl bg-[#0a0b10] text-xs font-gothic font-bold tracking-[0.18em] text-white shadow-md transition duration-200 hover:bg-[#1a1c26] active:scale-[0.99] disabled:opacity-70"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <span className="h-3.5 w-3.5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                      <span>AUTHENTICATING...</span>
                    </div>
                  ) : (
                    <>
                      <span>{isSignUp ? "INITIALIZE ACCOUNT" : "ENTER ATELIER"}</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md selection:bg-[#0a0b10] selection:text-white"
          onMouseDown={e => {
            if (e.target === e.currentTarget) setShowForgotModal(false);
          }}
        >
          <div className="relative w-full max-w-sm rounded-[24px] border border-[#bcc0ce] bg-white p-6 shadow-2xl">
            <button
              onClick={() => setShowForgotModal(false)}
              aria-label="Close"
              className="absolute top-4 right-4 rounded-full border border-[#bcc0ce] bg-[#f0f2f8] p-1.5 text-[#525666] hover:bg-[#e2e5ee] hover:text-black transition"
            >
              <X size={15} />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#0a0b10] text-white">
                <KeyRound size={15} />
              </div>
              <h3 className="font-gothic text-sm font-bold tracking-wider text-[#0a0b10] uppercase">
                Reset Password
              </h3>
            </div>

            <p className="font-editorial italic text-xs text-[#4e5262] mb-4">
              Enter your email to receive password reset instructions.
            </p>

            {resetStatus === "sent" ? (
              <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-3 text-center">
                <div className="mx-auto mb-1 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-white">
                  <Check size={14} />
                </div>
                <div className="font-gothic text-xs font-bold uppercase tracking-wider text-emerald-950">
                  Reset Link Dispatched
                </div>
                <p className="mt-1 text-xs text-emerald-800">
                  If an account exists for {resetEmail}, instructions have been sent.
                </p>
                <button
                  onClick={() => setShowForgotModal(false)}
                  className="mt-3 rounded-full bg-[#0a0b10] px-4 py-1.5 font-gothic text-xs font-bold uppercase tracking-wider text-white"
                >
                  Dismiss
                </button>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-3">
                <input
                  type="email"
                  required
                  value={resetEmail}
                  onChange={e => setResetEmail(e.target.value)}
                  placeholder="name@atelier.goth"
                  className="w-full rounded-xl border border-[#c2c6d2] bg-[#f4f6fa] px-3.5 py-2 text-sm text-[#0a0b10] outline-none focus:border-[#0a0b10] focus:bg-white"
                />
                <button
                  type="submit"
                  disabled={resetStatus === "sending"}
                  className="w-full rounded-xl bg-[#0a0b10] py-2 text-xs font-gothic font-bold tracking-widest text-white shadow-xs hover:bg-[#1a1c26]"
                >
                  {resetStatus === "sending" ? "SENDING CIPHER..." : "SEND RESET LINK"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="relative z-10 w-full px-4 py-4 text-center border-t border-[#bcc0ce]/40 bg-white/20 text-[10px] font-gothic tracking-widest text-[#585c6e] uppercase">
        MLN STUDIO &bull; ATELIER NOIRE &bull; ARCHIVAL HAUTE COUTURE STYLE ENGINE &bull; 2026
      </footer>
    </div>
  );
}
