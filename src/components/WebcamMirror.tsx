"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Camera, CameraOff, Sparkles, RefreshCw, Upload, Video, Users, Copy, Check } from "lucide-react";

declare global {
  interface Window {
    OT: any;
  }
}

interface WebcamMirrorProps {
  onCapture: (base64Image: string) => void;
  capturedImage: string | null;
  onClearCapture: () => void;
}

export default function WebcamMirror({
  onCapture,
  capturedImage,
  onClearCapture,
}: WebcamMirrorProps) {
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [vonageSessionState, setVonageSessionState] = useState<{
    sessionId: string | null;
    token: string | null;
    apiKey: string | null;
    isMock: boolean;
    connected: boolean;
  }>({
    sessionId: null,
    token: null,
    apiKey: null,
    isMock: false,
    connected: false,
  });

  const [copiedLink, setCopiedLink] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const publisherRef = useRef<any>(null);
  const sessionRef = useRef<any>(null);

  // Stop local media stream helper
  const stopLocalStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopLocalStream();
      if (sessionRef.current) {
        sessionRef.current.disconnect();
      }
    };
  }, [stopLocalStream]);

  // Connect to Vonage Video session or initialize local stream
  const startCamera = async () => {
    setErrorMsg(null);
    setIsCameraActive(true);

    try {
      // 1. Fetch or create Vonage Session
      const res = await fetch("/api/vonage/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId: "fashion-runway-studio" }),
      });
      const data = await res.json();

      setVonageSessionState({
        sessionId: data.sessionId,
        token: data.token,
        apiKey: data.apiKey,
        isMock: data.isMock,
        connected: false,
      });

      // 2. If real Vonage OpenTok credentials and window.OT exists
      if (!data.isMock && window.OT && data.apiKey && data.sessionId && data.token) {
        const session = window.OT.initSession(data.apiKey, data.sessionId);
        sessionRef.current = session;

        session.connect(data.token, (error: any) => {
          if (error) {
            console.warn("Vonage session connect failed, falling back to direct webcam:", error);
            initDirectWebcam();
          } else {
            setVonageSessionState((prev) => ({ ...prev, connected: true }));
            const publisher = window.OT.initPublisher("vonage-publisher-container", {
              insertMode: "append",
              width: "100%",
              height: "100%",
              style: { nameDisplayMode: "off" },
              mirror: true,
            });
            publisherRef.current = publisher;
            session.publish(publisher, (pubErr: any) => {
              if (pubErr) console.warn("Vonage publish warning:", pubErr);
            });
          }
        });
      } else {
        // Direct WebRTC webcam mirror
        await initDirectWebcam();
      }
    } catch (err: any) {
      console.warn("Error starting camera, attempting direct fallback:", err);
      await initDirectWebcam();
    }
  };

  const initDirectWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(console.warn);
      }
      setVonageSessionState((prev) => ({ ...prev, connected: true }));
    } catch (err: any) {
      console.error("Webcam access error:", err);
      setErrorMsg(
        err.name === "NotAllowedError"
          ? "Camera access was denied. Please allow camera permissions or upload a photo."
          : "Could not access webcam. Please check your camera connection."
      );
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    stopLocalStream();
    if (sessionRef.current) {
      sessionRef.current.disconnect();
      sessionRef.current = null;
    }
    setIsCameraActive(false);
    setVonageSessionState((prev) => ({ ...prev, connected: false }));
  };

  // Capture snapshot from video stream
  const captureSnapshot = () => {
    setIsCapturing(true);

    try {
      let videoEl = videoRef.current;

      // Check if Vonage publisher video element is present
      const otVideo = document.querySelector("#vonage-publisher-container video") as HTMLVideoElement | null;
      if (otVideo && otVideo.videoWidth > 0) {
        videoEl = otVideo;
      }

      if (!videoEl || !canvasRef.current) {
        setErrorMsg("Video stream is not ready for capture.");
        setIsCapturing(false);
        return;
      }

      const canvas = canvasRef.current;
      canvas.width = videoEl.videoWidth || 1280;
      canvas.height = videoEl.videoHeight || 720;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        setIsCapturing(false);
        return;
      }

      // Mirror capture to match what user sees
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);

      const base64 = canvas.toDataURL("image/jpeg", 0.92);
      onCapture(base64);
    } catch (err: any) {
      console.error("Capture failed:", err);
      setErrorMsg("Failed to capture image. Please try again.");
    } finally {
      setTimeout(() => setIsCapturing(false), 200);
    }
  };

  // File upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        onCapture(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const copyRoomLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-6 md:p-8 space-y-6 shadow-2xl relative">
      {/* Flash overlay for shutter effect */}
      {isCapturing && (
        <div className="absolute inset-0 bg-white z-50 pointer-events-none animate-ping duration-150 rounded-2xl" />
      )}

      {/* Top Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-semibold tracking-widest uppercase">
            <Video className="w-3.5 h-3.5" />
            <span>Step 2: Live Stylist Mirror (Vonage Video)</span>
          </div>
          <h2 className="text-2xl font-bold text-white mt-1">Virtual Runway Mirror</h2>
          <p className="text-xs text-zinc-400">
            Step in front of the lens. Gemini will analyze your posture, coloring, and fit for Zara, Calvin Klein, and Boss.
          </p>
        </div>

        {/* Co-Shopping & Room sharing */}
        <div className="flex items-center space-x-2">
          <button
            onClick={copyRoomLink}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-zinc-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedLink ? "Room Copied!" : "Share Co-Shop Room"}</span>
          </button>
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-amber-400/10 border border-amber-400/30 text-[11px] text-amber-300 font-medium">
            <Users className="w-3 h-3" />
            <span>Vonage Live Room</span>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="text-red-400 hover:text-white font-bold ml-2">
            ×
          </button>
        </div>
      )}

      {/* Video Viewport / Viewfinder */}
      <div className="relative aspect-video w-full max-w-3xl mx-auto rounded-2xl overflow-hidden bg-black border border-white/10 shadow-inner group">
        {/* Hidden Canvas for Frame Capture */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileUpload}
        />

        {capturedImage ? (
          /* Captured Snapshot View */
          <div className="relative w-full h-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={capturedImage}
              alt="Captured Style Snapshot"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 flex flex-col justify-between p-6">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center space-x-1.5 rounded-full bg-emerald-500/90 text-black px-3 py-1 text-xs font-bold shadow-lg">
                  <Check className="w-3.5 h-3.5" />
                  <span>Look Captured & Ready for Gemini</span>
                </span>
                <button
                  onClick={onClearCapture}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-black/70 hover:bg-black text-white text-xs font-semibold backdrop-blur-md border border-white/20 transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retake</span>
                </button>
              </div>

              <div className="text-center text-xs text-zinc-300">
                <span>Snapshot captured. Scroll down to trigger Gemini Stylist Recommendations!</span>
              </div>
            </div>
          </div>
        ) : isCameraActive ? (
          /* Active Camera Stream View */
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Vonage OpenTok container */}
            <div id="vonage-publisher-container" className="absolute inset-0 w-full h-full z-10" />

            {/* Direct WebRTC Video Fallback */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover -scale-x-100"
            />

            {/* High-Fashion Viewfinder Overlay */}
            <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between p-6">
              {/* Corner brackets */}
              <div className="flex justify-between items-start">
                <div className="w-8 h-8 border-t-2 border-l-2 border-amber-400/80 rounded-tl-lg" />
                <div className="flex items-center space-x-2 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-[11px] font-semibold tracking-wider uppercase text-zinc-200">
                    Vonage Live Feed
                  </span>
                </div>
                <div className="w-8 h-8 border-t-2 border-r-2 border-amber-400/80 rounded-tr-lg" />
              </div>

              {/* Center Silhouette Alignment Guide */}
              <div className="self-center w-48 h-64 border border-dashed border-white/20 rounded-full flex items-center justify-center">
                <span className="text-[10px] uppercase tracking-widest text-white/40 font-medium">
                  Center Silhouette
                </span>
              </div>

              {/* Bottom brackets */}
              <div className="flex justify-between items-end">
                <div className="w-8 h-8 border-b-2 border-l-2 border-amber-400/80 rounded-bl-lg" />
                <span className="text-[10px] tracking-wider uppercase text-zinc-400 bg-black/50 px-2.5 py-0.5 rounded backdrop-blur">
                  1080p HD Studio Stream
                </span>
                <div className="w-8 h-8 border-b-2 border-r-2 border-amber-400/80 rounded-br-lg" />
              </div>
            </div>
          </div>
        ) : (
          /* Inactive Camera Placeholder */
          <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-zinc-950/60">
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-amber-400 mb-4 shadow-xl">
              <Camera className="w-8 h-8 stroke-[1.5]" />
            </div>
            <h3 className="text-lg font-bold text-white">Enable Your Runway Camera</h3>
            <p className="text-xs text-zinc-400 max-w-sm mt-1.5 leading-relaxed">
              Activate your webcam to step into the Vonage Live Mirror. Your stylist will inspect your proportions and color harmony.
            </p>
          </div>
        )}
      </div>

      {/* Control Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
        {!isCameraActive && !capturedImage && (
          <button
            onClick={startCamera}
            className="flex items-center space-x-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 px-6 py-3 text-sm font-bold text-black hover:brightness-110 shadow-lg shadow-amber-500/25 transition-all"
          >
            <Camera className="w-4 h-4" />
            <span>Enable Webcam (Virtual Mirror)</span>
          </button>
        )}

        {isCameraActive && !capturedImage && (
          <>
            <button
              onClick={captureSnapshot}
              className="flex items-center space-x-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 px-8 py-3.5 text-sm font-bold text-black hover:brightness-110 shadow-xl shadow-amber-500/30 transition-all scale-105"
            >
              <Sparkles className="w-4 h-4" />
              <span>Snap Look (Capture Frame)</span>
            </button>

            <button
              onClick={stopCamera}
              className="flex items-center space-x-2 rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-xs font-semibold text-zinc-300 hover:bg-white/10 hover:text-white transition-colors"
            >
              <CameraOff className="w-4 h-4" />
              <span>Turn Off Camera</span>
            </button>
          </>
        )}

        {/* Fallback Upload Photo Button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center space-x-2 rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-xs font-semibold text-zinc-300 hover:bg-white/10 hover:text-white transition-colors"
        >
          <Upload className="w-4 h-4 text-amber-400" />
          <span>Upload Photo File</span>
        </button>
      </div>
    </div>
  );
}
