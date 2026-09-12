"use client";

import Link from "next/link";
import { Sparkles, Video, ShoppingBag } from "lucide-react";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#070709]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 py-3.5">
        {/* Logo & Hackathon Tag */}
        <div className="flex items-center space-x-3">
          <Link href="/" className="flex items-center space-x-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-black shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-wider text-white">AURA</span>
              <span className="ml-1.5 text-xs uppercase tracking-widest text-amber-400 font-semibold">Studio</span>
            </div>
          </Link>
          <div className="hidden md:flex items-center space-x-1.5 pl-3 border-l border-white/10 text-[11px] text-zinc-400">
            <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 font-medium text-emerald-400 ring-1 ring-inset ring-emerald-500/20">
              Runway to Reality
            </span>
            <span>GDG Brooklyn × Vonage</span>
          </div>
        </div>

        {/* Brand Badges */}
        <div className="hidden lg:flex items-center space-x-4 text-xs tracking-widest text-zinc-400 uppercase font-semibold">
          <span className="hover:text-white transition-colors">Zara</span>
          <span className="text-zinc-600">•</span>
          <span className="hover:text-white transition-colors">Calvin Klein</span>
          <span className="text-zinc-600">•</span>
          <span className="hover:text-white transition-colors">Boss</span>
        </div>

        {/* Quick Nav Actions */}
        <div className="flex items-center space-x-3">
          <Link
            href="/studio"
            className="flex items-center space-x-2 rounded-lg bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-200 hover:bg-white/10 hover:text-white border border-white/10 transition-colors"
          >
            <Video className="h-3.5 w-3.5 text-amber-400" />
            <span>Vonage Mirror</span>
          </Link>
          <Link
            href="/#catalog"
            className="flex items-center space-x-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 px-3.5 py-1.5 text-xs font-semibold text-black hover:brightness-110 shadow-sm transition-all"
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            <span>Catalog</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
