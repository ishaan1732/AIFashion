"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import WebcamMirror from "@/components/WebcamMirror";
import StyleQuiz from "@/components/StyleQuiz";
import LookbookGrid from "@/components/LookbookGrid";
import VonageSmsModal from "@/components/VonageSmsModal";
import { UserPreferences, RecommendationResponse } from "@/types/fashion";
import { Sparkles, SlidersHorizontal, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function StudioPage() {
  const [preferences, setPreferences] = useState<UserPreferences>({
    budget: 150,
    category: "top",
    vibe: "party",
    preferredBrands: ["Zara", "Calvin Klein", "Boss"],
  });

  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState<boolean>(false);
  const [recommendationsResponse, setRecommendationsResponse] = useState<RecommendationResponse | null>(null);
  const [showPreferencesEditor, setShowPreferencesEditor] = useState<boolean>(false);
  const [showSmsModal, setShowSmsModal] = useState<boolean>(false);

  // Load preferences from session storage if available
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("user_preferences");
      if (stored) {
        try {
          setPreferences(JSON.parse(stored));
        } catch (e) {
          console.warn("Could not parse stored preferences", e);
        }
      }
    }
  }, []);

  const handleCapture = (base64: string) => {
    setCapturedImage(base64);
  };

  const handleClearCapture = () => {
    setCapturedImage(null);
    setRecommendationsResponse(null);
  };

  // Trigger Gemini AI Stylist analysis
  const handleAnalyzeAndCurate = async () => {
    setIsLoadingRecommendations(true);
    setRecommendationsResponse(null);

    try {
      const res = await fetch("/api/gemini/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: capturedImage,
          preferences,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setRecommendationsResponse(data);
        // Smooth scroll to recommendations section
        setTimeout(() => {
          document.getElementById("recommendations-section")?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      } else {
        console.error("Failed to fetch recommendations:", data);
      }
    } catch (err) {
      console.error("Stylist analysis error:", err);
    } finally {
      setIsLoadingRecommendations(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#070709]">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Navigation Breadcrumb */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/"
            className="flex items-center space-x-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Runway Overview</span>
          </Link>

          {/* Current Brief Badges & Edit Button */}
          <div className="flex items-center space-x-2">
            <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs">
              <span className="text-zinc-400">Brief:</span>
              <span className="text-white font-bold capitalize">{preferences.category}</span>
              <span className="text-zinc-600">•</span>
              <span className="text-amber-400 font-bold capitalize">{preferences.vibe}</span>
              <span className="text-zinc-600">•</span>
              <span className="text-emerald-400 font-bold">${preferences.budget}</span>
            </div>

            <button
              onClick={() => setShowPreferencesEditor(!showPreferencesEditor)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-xs font-semibold text-white border border-white/15 transition-colors"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
              <span>{showPreferencesEditor ? "Hide Brief" : "Adjust Brief"}</span>
            </button>
          </div>
        </div>

        {/* Collapsible Style Quiz Editor */}
        {showPreferencesEditor && (
          <div className="animate-in slide-in-from-top-4 duration-300">
            <StyleQuiz
              initialPreferences={preferences}
              onPreferencesChange={(newPrefs) => {
                setPreferences(newPrefs);
                if (typeof window !== "undefined") {
                  sessionStorage.setItem("user_preferences", JSON.stringify(newPrefs));
                }
              }}
            />
          </div>
        )}

        {/* Live Webcam & Vonage Video Mirror */}
        <WebcamMirror
          onCapture={handleCapture}
          capturedImage={capturedImage}
          onClearCapture={handleClearCapture}
        />

        {/* Gemini Stylist Trigger Bar */}
        <div className="flex flex-col items-center justify-center p-6 glass-panel rounded-2xl border border-white/10 space-y-4 text-center">
          <div className="max-w-md space-y-1">
            <h3 className="text-lg font-bold text-white">Step 3: Consult Google Gemini Stylist</h3>
            <p className="text-xs text-zinc-400">
              {capturedImage
                ? "Your look is captured! Gemini is ready to curate top matches from Zara, Calvin Klein, and Boss."
                : "Capture your photo above (or upload a photo) to enable personalized AI body silhouette matching."}
            </p>
          </div>

          <button
            onClick={handleAnalyzeAndCurate}
            disabled={isLoadingRecommendations}
            className="flex items-center space-x-3 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 px-8 py-4 text-sm font-extrabold text-black hover:brightness-110 disabled:opacity-50 shadow-xl shadow-amber-500/25 transition-all scale-105"
          >
            {isLoadingRecommendations ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Gemini 2.5 is Curating Your Runway Lookbook...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>
                  {capturedImage ? "Curate Matches with My Photo" : "Curate Matches with Brief"}
                </span>
              </>
            )}
          </button>
        </div>

        {/* Recommendations & Try-On Section */}
        {recommendationsResponse && (
          <section id="recommendations-section" className="scroll-mt-20 pt-4">
            <LookbookGrid
              response={recommendationsResponse}
              userImage={capturedImage}
              onOpenSmsModal={() => setShowSmsModal(true)}
            />
          </section>
        )}
      </main>

      {/* Vonage SMS Lookbook Modal */}
      <VonageSmsModal
        isOpen={showSmsModal}
        onClose={() => setShowSmsModal(false)}
        items={recommendationsResponse?.recommendations.map((r) => r.item) || []}
        stylistSummary={recommendationsResponse?.overallStylistSummary}
      />
    </div>
  );
}
