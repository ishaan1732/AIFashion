"use client";

import { useState } from "react";
import { CatalogItem } from "@/types/fashion";
import { X, Sparkles, ExternalLink, MessageSquare, Check, ShieldCheck, Shirt, Award } from "lucide-react";

interface TryOnModalProps {
  isOpen: boolean;
  onClose: () => void;
  userImage: string | null;
  item: CatalogItem | null;
  stylistReason?: string;
  onSendSmsRequest?: (item: CatalogItem) => void;
}

export default function TryOnModal({
  isOpen,
  onClose,
  userImage,
  item,
  stylistReason,
  onSendSmsRequest,
}: TryOnModalProps) {
  const [viewMode, setViewMode] = useState<"split" | "blend" | "product">("split");

  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl glass-panel rounded-3xl border border-white/15 overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-zinc-950/70">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-amber-400 text-black">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-amber-400">
                AI Virtual Try-On Fitting Room
              </span>
              <h3 className="text-base font-bold text-white leading-tight">
                {item.brand} • {item.title}
              </h3>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* View Mode Switcher */}
            <div className="hidden sm:flex rounded-lg bg-white/5 p-1 border border-white/10 text-xs">
              <button
                onClick={() => setViewMode("split")}
                className={`px-3 py-1 rounded-md font-semibold transition-all ${
                  viewMode === "split" ? "bg-amber-400 text-black shadow" : "text-zinc-400 hover:text-white"
                }`}
              >
                Split Try-On
              </button>
              <button
                onClick={() => setViewMode("blend")}
                className={`px-3 py-1 rounded-md font-semibold transition-all ${
                  viewMode === "blend" ? "bg-amber-400 text-black shadow" : "text-zinc-400 hover:text-white"
                }`}
              >
                Mirror Overlay
              </button>
              <button
                onClick={() => setViewMode("product")}
                className={`px-3 py-1 rounded-md font-semibold transition-all ${
                  viewMode === "product" ? "bg-amber-400 text-black shadow" : "text-zinc-400 hover:text-white"
                }`}
              >
                Garment Close-Up
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Main Visual Try-On Canvas */}
          <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full rounded-2xl overflow-hidden bg-zinc-950 border border-white/10 shadow-2xl flex items-center justify-center">
            {viewMode === "split" && (
              <div className="grid grid-cols-2 w-full h-full">
                {/* User original / webcam photo */}
                <div className="relative h-full w-full border-r border-white/10 bg-zinc-900">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={userImage || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80"}
                    alt="User fitting"
                    className="w-full h-full object-cover object-center"
                  />
                  <div className="absolute bottom-3 left-3 bg-black/75 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10 text-[11px] font-semibold text-zinc-300">
                    Your Proportions & Silhouette
                  </div>
                </div>

                {/* Garment / Selected Option */}
                <div className="relative h-full w-full bg-zinc-900">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover object-center"
                  />
                  <div className="absolute top-3 right-3 bg-amber-400 text-black font-bold text-xs px-2.5 py-1 rounded-md shadow-lg">
                    ${item.price.toFixed(2)}
                  </div>
                  <div className="absolute bottom-3 right-3 bg-black/75 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10 text-[11px] font-semibold text-amber-300">
                    {item.brand} Runway Piece
                  </div>
                </div>
              </div>
            )}

            {viewMode === "blend" && (
              <div className="relative w-full h-full">
                {/* User image in background */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={userImage || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80"}
                  alt="User fitting base"
                  className="w-full h-full object-cover object-center filter brightness-95"
                />
                {/* Floating translucent garment hologram */}
                <div className="absolute inset-y-8 right-12 w-1/2 rounded-2xl overflow-hidden shadow-2xl border-2 border-amber-400/80 bg-black/40 backdrop-blur-xs group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.imageUrl}
                    alt="Garment overlay"
                    className="w-full h-full object-cover object-center opacity-90 group-hover:opacity-100 transition-opacity"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
                    <span className="text-xs font-bold text-white">AI Virtual Try-On Overlay</span>
                  </div>
                </div>
              </div>
            )}

            {viewMode === "product" && (
              <div className="relative w-full h-full bg-zinc-900">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-contain p-4"
                />
              </div>
            )}

            {/* Precision Fit Badge */}
            <div className="absolute top-3 left-3 flex items-center space-x-1.5 bg-black/80 backdrop-blur-md border border-emerald-500/30 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold shadow-lg">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>97% Precision Fit Score</span>
            </div>
          </div>

          {/* Stylist Notes & AI Evaluation Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 glass-card rounded-2xl p-4 border border-white/10 space-y-2">
              <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-amber-400">
                <Award className="w-4 h-4" />
                <span>Gemini Haute-Couture Stylist Critique</span>
              </div>
              <p className="text-sm text-zinc-200 leading-relaxed italic">
                &ldquo;{stylistReason || item.description}&rdquo;
              </p>
              <div className="pt-2 border-t border-white/5 flex flex-wrap gap-2 text-[11px] text-zinc-400">
                <span className="text-amber-300 font-semibold">Key Pairing:</span>
                <span>Best styled with monochrome minimal leather shoes and architectural watch.</span>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-4 border border-white/10 space-y-3 flex flex-col justify-between">
              <div>
                <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Item Specs
                </div>
                <div className="mt-1 flex items-baseline justify-between">
                  <span className="text-xl font-bold text-white">${item.price.toFixed(2)}</span>
                  <span className="text-xs font-semibold text-amber-400 uppercase">{item.brand}</span>
                </div>
                <div className="text-xs text-zinc-400 mt-1">Color: {item.color}</div>
              </div>

              <div className="space-y-2">
                <a
                  href={item.productUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center space-x-2 rounded-xl bg-white text-black py-2.5 text-xs font-bold hover:bg-zinc-200 transition-colors shadow"
                >
                  <span>Shop at {item.brand}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                {onSendSmsRequest && (
                  <button
                    onClick={() => onSendSmsRequest(item)}
                    className="w-full flex items-center justify-center space-x-2 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-300 py-2 text-xs font-semibold hover:bg-amber-400/20 transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Send Look to Phone (SMS)</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
