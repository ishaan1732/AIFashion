"use client";

import { useState } from "react";
import { RecommendationResponse, StylistRecommendation, CatalogItem } from "@/types/fashion";
import { Sparkles, Eye, ExternalLink, MessageSquare, Flame, CheckCircle, Percent } from "lucide-react";
import TryOnModal from "@/components/TryOnModal";

interface LookbookGridProps {
  response: RecommendationResponse;
  userImage: string | null;
  onOpenSmsModal: () => void;
}

export default function LookbookGrid({
  response,
  userImage,
  onOpenSmsModal,
}: LookbookGridProps) {
  const [selectedTryOnItem, setSelectedTryOnItem] = useState<{
    item: CatalogItem;
    reason: string;
  } | null>(null);

  const { recommendations, vibeAnalysis, overallStylistSummary } = response;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* AI Stylist Executive Summary Card */}
      <div className="glass-panel rounded-2xl p-6 md:p-8 border border-amber-400/30 bg-gradient-to-r from-zinc-950 via-[#14141c] to-zinc-950 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-widest">
              <Sparkles className="w-4 h-4" />
              <span>Gemini 2.5 Fashion Vibe Analysis</span>
            </div>
            <h3 className="text-2xl font-bold text-white tracking-tight">
              {overallStylistSummary}
            </h3>
            <p className="text-sm text-zinc-300 leading-relaxed">
              {vibeAnalysis}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={onOpenSmsModal}
              className="flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 px-5 py-3 text-xs font-bold text-black hover:brightness-110 shadow-lg shadow-amber-500/20 transition-all"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Send Lookbook to Phone (Vonage SMS)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top 3-5 Matches Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xl font-bold text-white">Your Top {recommendations.length} Stylist Matches</h4>
            <p className="text-xs text-zinc-400">
              Ranked and evaluated across Zara, Calvin Klein, and Hugo Boss.
            </p>
          </div>
          <span className="text-xs font-semibold text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
            Interactive Try-On Enabled
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map((rec: StylistRecommendation, idx: number) => {
            const item = rec.item;
            return (
              <div
                key={item.id}
                className="group glass-card rounded-2xl overflow-hidden border border-white/10 hover:border-amber-400/60 transition-all duration-300 flex flex-col justify-between shadow-xl"
              >
                {/* Product Image & Top Overlays */}
                <div className="relative aspect-[4/5] w-full overflow-hidden bg-zinc-950">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Match Rank & Brand Badge */}
                  <div className="absolute top-3 left-3 flex items-center space-x-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 text-black text-xs font-black shadow-md">
                      #{idx + 1}
                    </span>
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wider uppercase bg-black/80 text-white backdrop-blur-md border border-white/15">
                      {item.brand}
                    </span>
                  </div>

                  {/* Match Score Badge */}
                  <div className="absolute top-3 right-3 flex items-center space-x-1 px-2.5 py-1 rounded-md bg-emerald-500/90 text-black text-xs font-bold shadow-lg">
                    <Percent className="w-3 h-3 stroke-[3]" />
                    <span>{rec.matchScore}% Match</span>
                  </div>

                  {/* Quick Try-On Overlay button on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-4">
                    <button
                      onClick={() => setSelectedTryOnItem({ item, reason: rec.stylistReason })}
                      className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs flex items-center justify-center space-x-2 shadow-xl transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Virtual Try-On This Look</span>
                    </button>
                  </div>
                </div>

                {/* Content Details */}
                <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-amber-400 font-semibold uppercase tracking-wider text-[11px]">
                        {item.category} • {item.vibe.join(", ")}
                      </span>
                      <span className="text-base font-bold text-white">${item.price.toFixed(2)}</span>
                    </div>

                    <h4 className="text-base font-bold text-white group-hover:text-amber-200 transition-colors">
                      {item.title}
                    </h4>

                    {/* Gemini Stylist Commentary */}
                    <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-1.5">
                      <div className="text-[11px] font-semibold text-amber-300 flex items-center space-x-1">
                        <Sparkles className="w-3 h-3" />
                        <span>Stylist Reasoning:</span>
                      </div>
                      <p className="text-xs text-zinc-300 leading-relaxed italic">
                        &ldquo;{rec.stylistReason}&rdquo;
                      </p>
                    </div>

                    {/* Actionable tip */}
                    <div className="text-xs text-zinc-400">
                      <strong className="text-zinc-300">Styling Tip:</strong> {rec.stylingTip}
                    </div>
                  </div>

                  {/* Card bottom action row */}
                  <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setSelectedTryOnItem({ item, reason: rec.stylistReason })}
                      className="flex-1 flex items-center justify-center space-x-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white py-2 text-xs font-semibold border border-white/10 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5 text-amber-400" />
                      <span>Try On</span>
                    </button>

                    <a
                      href={item.productUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white text-xs font-medium border border-white/10 flex items-center space-x-1 transition-colors"
                    >
                      <span>Store</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Try-On Modal */}
      <TryOnModal
        isOpen={!!selectedTryOnItem}
        onClose={() => setSelectedTryOnItem(null)}
        userImage={userImage}
        item={selectedTryOnItem?.item || null}
        stylistReason={selectedTryOnItem?.reason}
        onSendSmsRequest={() => onOpenSmsModal()}
      />
    </div>
  );
}
