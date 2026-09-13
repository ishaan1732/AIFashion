"use client";

import { useState, useRef } from "react";
import { Playfair_Display } from "next/font/google";
import { searchCatalog, fullCatalog, SearchFilters } from "@/lib/catalog";
import { CatalogItem } from "@/types/fashion";
import { Sparkles, Upload, Camera, ExternalLink, RefreshCw, Check, ArrowRight, Loader2 } from "lucide-react";

const editorialFont = Playfair_Display({ subsets: ["latin"], weight: ["700"] });

// Active-state class applied to the currently-selected quiz option buttons.
const activeQuizButtonClass =
  "bg-black text-white border-black shadow-sm ring-2 ring-amber-400 ring-offset-2 ring-offset-white";
const inactiveQuizButtonClass = "bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100";

export default function SimpleFashionApp() {
  // 1. Question selections (buttons)
  const [gender, setGender] = useState<SearchFilters["gender"]>("female");
  const [budgetTier, setBudgetTier] = useState<SearchFilters["budgetTier"]>("75-150");
  const [vibe, setVibe] = useState<SearchFilters["vibe"]>("party");
  const [category, setCategory] = useState<SearchFilters["category"]>("top");

  // 2. Recommendations state
  const [results, setResults] = useState<CatalogItem[] | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // 3. User photo / try-on state
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [activeTryOnItem, setActiveTryOnItem] = useState<CatalogItem | null>(null);
  const [isGeneratingTryOn, setIsGeneratingTryOn] = useState(false);
  const [virtualResult, setVirtualResult] = useState<{
    virtualImageUrl: string | null;
    stylistComment: string;
    item: CatalogItem;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Search Outfits
  const handleSearch = () => {
    const items = searchCatalog({ budgetTier, vibe, category, gender });
    setResults(items);
    setHasSearched(true);
    setVirtualResult(null);

    // Scroll to results
    setTimeout(() => {
      document.getElementById("results-section")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  // Photo Upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setUserPhoto(reader.result);
        stopWebcam();
      }
    };
    reader.readAsDataURL(file);
  };

  // Webcam Start/Stop & Capture
  const startWebcam = async () => {
    try {
      setIsWebcamActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 640, facingMode: "user" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(console.warn);
      }
    } catch (err) {
      console.warn("Could not access camera:", err);
      alert("Could not access camera. Please upload an image file instead.");
      setIsWebcamActive(false);
    }
  };

  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setIsWebcamActive(false);
  };

  const captureWebcamPhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 640;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const base64 = canvas.toDataURL("image/jpeg", 0.9);
    setUserPhoto(base64);
    stopWebcam();
  };

  // Helper to visually fuse the garment directly onto the user's photo
  const createFusedTryOnImage = async (
    userBase64: string,
    garmentUrl: string,
    cat: "top" | "trouser"
  ): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      canvas.width = 800;
      canvas.height = 1000;
      const ctx = canvas.getContext("2d");
      if (!ctx) return resolve(userBase64);

      const userImg = new Image();
      userImg.crossOrigin = "anonymous";
      userImg.onload = () => {
        // Draw user photo covering canvas
        const scale = Math.max(canvas.width / userImg.width, canvas.height / userImg.height);
        const x = (canvas.width - userImg.width * scale) / 2;
        const y = (canvas.height - userImg.height * scale) / 2;
        ctx.drawImage(userImg, x, y, userImg.width * scale, userImg.height * scale);

        // Load and overlay garment
        const garmentImg = new Image();
        garmentImg.crossOrigin = "anonymous";
        garmentImg.onload = () => {
          ctx.save();
          if (cat === "top") {
            const gWidth = canvas.width * 0.76;
            const gHeight = canvas.height * 0.52;
            const gx = (canvas.width - gWidth) / 2;
            const gy = canvas.height * 0.26;

            ctx.shadowColor = "rgba(0, 0, 0, 0.45)";
            ctx.shadowBlur = 24;
            ctx.shadowOffsetY = 12;

            // Draw translucent subtle blending
            ctx.globalAlpha = 0.95;
            ctx.drawImage(garmentImg, gx, gy, gWidth, gHeight);
          } else {
            const gWidth = canvas.width * 0.7;
            const gHeight = canvas.height * 0.54;
            const gx = (canvas.width - gWidth) / 2;
            const gy = canvas.height * 0.44;

            ctx.shadowColor = "rgba(0, 0, 0, 0.45)";
            ctx.shadowBlur = 24;
            ctx.shadowOffsetY = 12;

            ctx.globalAlpha = 0.95;
            ctx.drawImage(garmentImg, gx, gy, gWidth, gHeight);
          }
          ctx.restore();

          // Style watermark
          ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
          ctx.fillRect(24, canvas.height - 54, 220, 36);
          ctx.fillStyle = "#ffffff";
          ctx.font = "bold 12px sans-serif";
          ctx.fillText("✨ AI VIRTUAL TRY-ON FIT", 38, canvas.height - 32);

          resolve(canvas.toDataURL("image/jpeg", 0.92));
        };
        garmentImg.onerror = () => resolve(userBase64);
        garmentImg.src = garmentUrl;
      };
      userImg.onerror = () => resolve(userBase64);
      userImg.src = userBase64;
    });
  };

  // Trigger AI Virtual Try-On
  const handleTryOn = async (item: CatalogItem) => {
    if (!userPhoto) {
      alert("Please upload your photo or take a webcam snapshot first to try on!");
      document.getElementById("upload-section")?.scrollIntoView({ behavior: "smooth" });
      return;
    }

    setActiveTryOnItem(item);
    setIsGeneratingTryOn(true);
    setVirtualResult(null);

    try {
      const res = await fetch("/api/gemini/tryon", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userImageBase64: userPhoto,
          catalogItemId: item.id,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        let finalImageUrl = data.virtualImageUrl;

        // If Gemini didn't return image bytes (e.g. key missing or text-only response),
        // fuse the garment directly onto the user's uploaded photo!
        if (!finalImageUrl) {
          finalImageUrl = await createFusedTryOnImage(userPhoto, item.imageUrl, item.category as any);
        }

        setVirtualResult({
          virtualImageUrl: finalImageUrl,
          stylistComment: data.stylistComment,
          item,
        });

        setTimeout(() => {
          document.getElementById("tryon-result-section")?.scrollIntoView({ behavior: "smooth" });
        }, 150);
      } else {
        alert(data.error || "Failed to generate try-on");
      }
    } catch (err) {
      console.error("Try-on error:", err);
      // Fallback to fused image directly
      const fused = await createFusedTryOnImage(userPhoto, item.imageUrl, item.category as any);
      setVirtualResult({
        virtualImageUrl: fused,
        stylistComment: `The ${item.brand} ${item.title} fits your proportions with a clean, contemporary drape in ${item.color}.`,
        item,
      });
      setTimeout(() => {
        document.getElementById("tryon-result-section")?.scrollIntoView({ behavior: "smooth" });
      }, 150);
    } finally {
      setIsGeneratingTryOn(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-zinc-900 pb-20">
      {/* Clean Minimalist Header */}
      <header className="border-b border-zinc-200 bg-white sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold tracking-tight text-black">AIFashion</span>
            <span className="text-xs bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded font-medium border border-zinc-200">
              8 Curated Fashion Houses
            </span>
          </div>
          <div className="text-xs text-zinc-500 font-medium">
            AI Stylist & Virtual Try-On
          </div>
        </div>
        <div className="h-px w-full bg-gradient-to-r from-amber-400 via-amber-400/30 to-transparent" />
      </header>

      <main className="max-w-5xl mx-auto px-4 pt-8 space-y-12">
        {/* Step 1: Simple Questions (Buttons) */}
        <section className="bg-white p-7 sm:p-9 rounded-2xl border border-zinc-200 shadow-sm space-y-6">
          <div>
            <h1 className={`${editorialFont.className} text-2xl sm:text-3xl font-bold text-zinc-900`}>
              Find Your Style & Try It On
            </h1>
            <p className="text-sm text-zinc-500 mt-1">
              Select your budget, fashion vibe, and the item you are looking for.
            </p>
          </div>

          {/* Question 1: Gender */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-600">
              1. Who are you shopping for?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { id: "male", label: "Male" },
                { id: "female", label: "Female" },
              ].map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setGender(option.id as any)}
                  className={`py-3 px-4 rounded-xl text-sm font-semibold border transition-all ${
                    gender === option.id
                      ? activeQuizButtonClass
                      : inactiveQuizButtonClass
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Question 2: Budget */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-600">
              2. What is your budget?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { id: "under-75", label: "Under $75" },
                { id: "75-150", label: "$75 - $150" },
                { id: "150-250", label: "$150 - $250" },
                { id: "above-250", label: "$250+ (Luxury)" },
              ].map((tier) => (
                <button
                  key={tier.id}
                  type="button"
                  onClick={() => setBudgetTier(tier.id as any)}
                  className={`py-3 px-4 rounded-xl text-sm font-semibold border transition-all ${
                    budgetTier === tier.id
                      ? activeQuizButtonClass
                      : inactiveQuizButtonClass
                  }`}
                >
                  {tier.label}
                </button>
              ))}
            </div>
          </div>

          {/* Question 3: Fashion Style */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-600">
              3. What is your fashion style / occasion?
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { id: "comfy", label: "Comfy / Casual", icon: "☕" },
                { id: "beach", label: "Beach / Resort", icon: "🏖️" },
                { id: "party", label: "Party / Night Out", icon: "🍸" },
              ].map((style) => (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => setVibe(style.id as any)}
                  className={`py-3.5 px-4 rounded-xl text-sm font-semibold border transition-all flex flex-col items-center justify-center space-y-1 ${
                    vibe === style.id
                      ? activeQuizButtonClass
                      : inactiveQuizButtonClass
                  }`}
                >
                  <span className="text-xl">{style.icon}</span>
                  <span>{style.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Question 4: Item looking for */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-600">
              4. What item are you looking for?
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { id: "top", label: "Top (Shirt, Blazer, Knit)", icon: "👕" },
                { id: "trouser", label: "Trouser (Pants, Linen, Jeans)", icon: "👖" },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id as any)}
                  className={`py-3.5 px-4 rounded-xl text-sm font-semibold border transition-all flex items-center justify-center space-x-2 ${
                    category === cat.id
                      ? activeQuizButtonClass
                      : inactiveQuizButtonClass
                  }`}
                >
                  <span className="text-xl">{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Search Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleSearch}
              className="w-full py-4 rounded-xl bg-black text-white font-bold text-base hover:bg-zinc-800 transition-colors shadow-sm flex items-center justify-center space-x-2"
            >
              <span>Search Outfits</span>
              <ArrowRight className="w-5 h-5 text-amber-400" />
            </button>
          </div>
        </section>

        {/* Step 2: Recommendations from Zara, Calvin Klein & Boss */}
        {hasSearched && results && (
          <section id="results-section" className="space-y-6 scroll-mt-20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-200 pb-3">
              <div>
                <h2 className={`${editorialFont.className} text-xl font-bold text-zinc-900`}>
                  Recommended Matches ({results.length} Options)
                </h2>
                <p className="text-xs text-zinc-500">
                  Curated based on your choices from Zara, Calvin Klein, and Hugo Boss.
                </p>
              </div>
              <div className="text-xs font-medium text-zinc-600 bg-zinc-100 px-3 py-1 rounded-full w-fit">
                {gender.toUpperCase()} • {category.toUpperCase()} • {vibe.toUpperCase()}
              </div>
            </div>

            {/* Product Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {results.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl border border-zinc-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow hover:-translate-y-0.5 transition-transform flex flex-col justify-between"
                >
                  <div className="relative aspect-[4/5] bg-zinc-100 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2.5 left-2.5 bg-black/80 text-white text-[11px] font-bold px-2 py-0.5 rounded">
                      {item.brand}
                    </div>
                    <div className="absolute top-2.5 right-2.5 bg-white text-black text-xs font-bold px-2 py-0.5 rounded shadow">
                      ${item.price.toFixed(2)}
                    </div>
                    <div className="absolute bottom-2.5 left-2.5 bg-white text-black text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full shadow">
                      {item.gender === "male" ? "♂" : "♀"}
                    </div>
                  </div>

                  <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-semibold text-sm text-zinc-900 line-clamp-1">
                        {item.title}
                      </h3>
                      <p className="text-xs text-zinc-500 line-clamp-2 mt-1">
                        {item.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-zinc-100 space-y-2">
                      <button
                        onClick={() => handleTryOn(item)}
                        className="w-full py-2.5 rounded-lg bg-zinc-900 hover:bg-black text-white text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        <span>Try On With AI</span>
                      </button>

                      <a
                        href={item.productUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-1.5 rounded-lg text-center block text-xs font-medium text-zinc-600 hover:text-black transition-colors"
                      >
                        View on {item.brand} Store &rarr;
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Step 3: Photo Upload / Webcam Studio Bar */}
            <div
              id="upload-section"
              className="bg-white p-6 rounded-2xl border border-zinc-300 shadow-sm space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className={`${editorialFont.className} text-base font-bold text-zinc-900 flex items-center space-x-2`}>
                    <Camera className="w-5 h-5 text-zinc-800" />
                    <span>Upload Your Photo to Try On</span>
                  </h3>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Upload a photo of yourself or enable your webcam so the AI can show you how these options look on you.
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoUpload}
                  />

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-semibold flex items-center space-x-1.5 border border-zinc-300 transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload Photo</span>
                  </button>

                  {!isWebcamActive ? (
                    <button
                      type="button"
                      onClick={startWebcam}
                      className="px-4 py-2 rounded-xl bg-black hover:bg-zinc-800 text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Enable Webcam</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={stopWebcam}
                      className="px-3 py-2 rounded-xl bg-red-100 hover:bg-red-200 text-red-700 text-xs font-semibold transition-colors"
                    >
                      Close Camera
                    </button>
                  )}
                </div>
              </div>

              {/* Webcam Viewfinder */}
              {isWebcamActive && (
                <div className="relative aspect-video max-w-md mx-auto rounded-xl overflow-hidden bg-black border border-zinc-300">
                  <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover -scale-x-100" />
                  <div className="absolute bottom-3 inset-x-0 flex justify-center">
                    <button
                      type="button"
                      onClick={captureWebcamPhoto}
                      className="px-4 py-2 rounded-full bg-white text-black font-bold text-xs shadow-lg hover:bg-zinc-100"
                    >
                      Snap Photo
                    </button>
                  </div>
                </div>
              )}

              {/* User Photo Preview */}
              {userPhoto && (
                <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={userPhoto}
                      alt="Your uploaded photo"
                      className="w-14 h-14 rounded-lg object-cover border border-zinc-300"
                    />
                    <div>
                      <div className="text-xs font-bold text-zinc-900 flex items-center space-x-1">
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span>Your Photo is Ready for AI Try-On</span>
                      </div>
                      <div className="text-xs text-zinc-500">
                        Click &ldquo;Try On With AI&rdquo; on any item above to see your virtual look!
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setUserPhoto(null)}
                    className="text-xs text-zinc-500 hover:text-black underline"
                  >
                    Change Photo
                  </button>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Loading Spinner for AI Try-On */}
        {isGeneratingTryOn && (
          <div className="p-8 rounded-2xl bg-white border border-zinc-200 text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-black" />
            <div className="text-sm font-bold text-zinc-900">
              Generating Your AI Try-On Photo...
            </div>
            <p className="text-xs text-zinc-500">
              Google Gemini is rendering {activeTryOnItem?.brand} {activeTryOnItem?.title} on your photo.
            </p>
          </div>
        )}

        {/* Step 4: AI Virtual Try-On Result Display */}
        {virtualResult && (
          <section
            id="tryon-result-section"
            className="bg-white p-7 sm:p-9 rounded-2xl border-2 border-black shadow-md space-y-6 scroll-mt-20"
          >
            <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                  AI Virtual Try-On Result
                </span>
                <h3 className={`${editorialFont.className} text-xl font-bold text-zinc-900`}>
                  {virtualResult.item.brand} • {virtualResult.item.title}
                </h3>
              </div>
              <span className="text-lg font-bold text-zinc-900">
                ${virtualResult.item.price.toFixed(2)}
              </span>
            </div>

            {/* Virtual Photos: Side-by-Side or Generated Photo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Your Original Photo */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-zinc-500">Your Original Photo</span>
                <div className="aspect-[4/5] rounded-xl overflow-hidden bg-zinc-100 border border-zinc-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={userPhoto || ""}
                    alt="Your Photo"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* AI Virtual Try-On Photo */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-zinc-900 flex items-center space-x-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>AI Fused Virtual Try-On Look</span>
                </span>
                <div className="aspect-[4/5] rounded-xl overflow-hidden bg-zinc-100 border-2 border-black relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={virtualResult.virtualImageUrl || virtualResult.item.imageUrl}
                    alt="AI Virtual Try On"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2.5 left-2.5 bg-black/80 text-white text-[11px] font-bold px-2.5 py-1 rounded backdrop-blur">
                    AI Fused Try-On
                  </div>
                </div>
              </div>
            </div>

            {/* Stylist Comment */}
            <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200">
              <span className="text-xs font-bold text-zinc-900">AI Stylist Note:</span>
              <p className="text-xs text-zinc-600 mt-1 leading-relaxed">
                {virtualResult.stylistComment}
              </p>
            </div>

            {/* Buy / Store Button */}
            <div className="flex justify-end space-x-3">
              <a
                href={virtualResult.item.productUrl}
                target="_blank"
                rel="noreferrer"
                className="px-6 py-3 rounded-xl bg-black text-white text-xs font-bold hover:bg-zinc-800 transition-colors flex items-center space-x-2"
              >
                <span>Shop This Item on {virtualResult.item.brand}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
