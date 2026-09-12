"use client";

import { useState } from "react";
import { CatalogItem } from "@/types/fashion";
import { X, Send, MessageSquare, Check, Phone, Sparkles, AlertCircle } from "lucide-react";

interface VonageSmsModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CatalogItem[];
  stylistSummary?: string;
}

export default function VonageSmsModal({
  isOpen,
  onClose,
  items,
  stylistSummary,
}: VonageSmsModalProps) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim()) return;

    setIsSending(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/vonage/sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: phoneNumber.trim(),
          stylistSummary: stylistSummary || "Your curated runway fashion lookbook",
          items,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSendSuccess(true);
        setStatusMessage(
          data.isMock
            ? "Lookbook dispatched! (Simulated mode: Add VONAGE keys to .env.local for live telecom network delivery)"
            : "Lookbook sent directly to your phone via Vonage Messages API!"
        );
      } else {
        setStatusMessage(data.error || "Failed to send SMS.");
      }
    } catch (err: any) {
      console.error("SMS Error:", err);
      setStatusMessage("Network error sending SMS.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md glass-panel rounded-3xl border border-white/15 p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-amber-400 text-black">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Text Lookbook to Phone</h3>
              <p className="text-[11px] text-amber-400 font-semibold uppercase tracking-wider">
                Powered by Vonage Messages API
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {sendSuccess ? (
          <div className="space-y-4 py-4 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
              <Check className="w-6 h-6 stroke-[3]" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white">Lookbook Dispatched!</h4>
              <p className="text-xs text-zinc-300 mt-1 max-w-xs mx-auto">
                {statusMessage}
              </p>
            </div>
            <button
              onClick={() => {
                setSendSuccess(false);
                onClose();
              }}
              className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-colors"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSend} className="space-y-4">
            <p className="text-xs text-zinc-300 leading-relaxed">
              Receive your personalized Zara, Calvin Klein, and Hugo Boss outfit links and stylist notes straight to your mobile device via SMS.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300 flex items-center space-x-1.5">
                <Phone className="w-3.5 h-3.5 text-amber-400" />
                <span>Mobile Number (with country code)</span>
              </label>
              <input
                type="tel"
                placeholder="+1 555 123 4567"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
                className="w-full rounded-xl bg-black/60 border border-white/15 px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Lookbook Items Preview */}
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5 text-xs">
              <div className="font-semibold text-zinc-400">Included in SMS:</div>
              <ul className="space-y-1 text-zinc-300">
                {items.slice(0, 3).map((item) => (
                  <li key={item.id} className="flex justify-between items-center text-[11px]">
                    <span className="truncate max-w-[220px]">
                      {item.brand} • {item.title}
                    </span>
                    <span className="text-amber-400 font-semibold">${item.price}</span>
                  </li>
                ))}
              </ul>
            </div>

            {statusMessage && (
              <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-center space-x-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{statusMessage}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSending || !phoneNumber.trim()}
              className="w-full flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 py-3 text-xs font-bold text-black hover:brightness-110 disabled:opacity-50 transition-all shadow-lg"
            >
              {isSending ? (
                <span>Sending via Vonage...</span>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Lookbook Now</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
