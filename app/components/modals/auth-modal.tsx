"use client";

import React, { useState } from "react";
import Image from "next/image";
import { X, ArrowRight, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useWardrobe } from "../../../lib/store/wardrobe-context";

export function AuthModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { signIn, signUp } = useWardrobe();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMsg("Please enter both email and password.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    try {
      if (isSignUp) {
        await signUp(email.trim(), password);
      } else {
        await signIn(email.trim(), password);
      }
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Authentication failed. Please verify credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm selection:bg-[#0a0b10] selection:text-white"
      onMouseDown={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-md rounded-[24px] border border-[#bcc0ce] bg-white/95 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
        {/* Header with MLN Studio Gothic Black Logo */}
        <div className="flex items-center justify-between border-b border-[#bcc0ce] pb-4">
          <div className="relative h-11 w-44">
            <Image
              src="/brand/mln-studio-black.png"
              alt="MLN STUDIO"
              fill
              priority
              className="object-contain object-left"
            />
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-full border border-[#bcc0ce] bg-[#f0f2f8] p-2 text-[#4a4e5e] hover:bg-[#e2e5ee] hover:text-black transition"
          >
            <X size={15} />
          </button>
        </div>

        <div className="mt-6">
          <div className="flex rounded-xl border border-[#c2c6d2] bg-[#eaedf5] p-1 text-xs font-gothic tracking-wider">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(false);
                setErrorMsg("");
              }}
              className={`flex-1 rounded-lg py-2 transition ${
                !isSignUp ? "bg-[#0a0b10] text-white shadow-sm font-bold" : "text-[#525666] hover:text-black font-semibold"
              }`}
            >
              SIGN IN
            </button>
            <button
              type="button"
              onClick={() => {
                setIsSignUp(true);
                setErrorMsg("");
              }}
              className={`flex-1 rounded-lg py-2 transition ${
                isSignUp ? "bg-[#0a0b10] text-white shadow-sm font-bold" : "text-[#525666] hover:text-black font-semibold"
              }`}
            >
              CREATE ACCOUNT
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            {errorMsg && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-900 font-medium">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="text-[10px] font-gothic tracking-[0.2em] text-[#4a4e5e] uppercase font-bold">
                Email Address
              </label>
              <div className="relative mt-1.5">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#787c8c]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@atelier.goth"
                  className="w-full rounded-xl border border-[#c2c6d2] bg-[#f2f4fa] pl-10 pr-3.5 py-2.5 text-sm text-[#0a0b10] placeholder-[#787c8c] outline-none transition focus:border-[#0a0b10] focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-gothic tracking-[0.2em] text-[#4a4e5e] uppercase font-bold">
                Password
              </label>
              <div className="relative mt-1.5">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#787c8c]" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-xl border border-[#c2c6d2] bg-[#f2f4fa] pl-10 pr-10 py-2.5 text-sm text-[#0a0b10] placeholder-[#787c8c] outline-none transition focus:border-[#0a0b10] focus:bg-white"
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

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0a0b10] py-3 text-xs font-gothic font-bold tracking-widest text-white shadow-md transition hover:bg-[#1a1c26] active:scale-[0.99] disabled:opacity-70"
            >
              <span>{isSignUp ? "INITIALIZE ACCOUNT" : "ENTER ATELIER"}</span>
              <ArrowRight size={14} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
