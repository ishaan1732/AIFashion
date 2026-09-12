"use client";

import { useState } from "react";
import { CatalogItem, Brand, Category } from "@/types/fashion";
import { fullCatalog } from "@/lib/catalog";
import { ExternalLink, Tag } from "lucide-react";

export default function CatalogGrid() {
  const [activeBrand, setActiveBrand] = useState<string>("all");
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const filtered = fullCatalog.filter((item) => {
    if (activeBrand !== "all" && item.brand !== activeBrand) return false;
    if (activeCategory !== "all" && item.category !== activeCategory) return false;
    return true;
  });

  return (
    <section id="catalog" className="space-y-6 pt-12 pb-16 border-t border-white/10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs uppercase tracking-widest text-amber-400 font-semibold">
            <Tag className="w-3.5 h-3.5" />
            <span>Curated Collection</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white mt-1">
            Featured Catalog (Zara • Calvin Klein • Boss)
          </h2>
          <p className="text-sm text-zinc-400 mt-1 max-w-xl">
            Live catalog synced with our AI stylist brain. Every piece has verified sizing, fabric specifications, and aesthetic attributes.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {["all", "Zara", "Calvin Klein", "Boss"].map((b) => (
            <button
              key={b}
              onClick={() => setActiveBrand(b)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all border ${
                activeBrand === b
                  ? "bg-amber-400 text-black border-amber-400 font-bold"
                  : "bg-white/5 text-zinc-400 border-white/10 hover:text-white hover:bg-white/10"
              }`}
            >
              {b}
            </button>
          ))}
          <div className="w-[1px] h-7 bg-white/10 self-center mx-1" />
          {["all", "top", "trouser"].map((c) => (
            <button
              key={c}
              onClick={() => setActiveCategory(c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all border ${
                activeCategory === c
                  ? "bg-white text-black border-white"
                  : "bg-white/5 text-zinc-400 border-white/10 hover:text-white hover:bg-white/10"
              }`}
            >
              {c === "all" ? "All Items" : c === "top" ? "Tops" : "Trousers"}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {filtered.map((item: CatalogItem) => (
          <div
            key={item.id}
            className="group glass-card rounded-xl overflow-hidden border border-white/10 hover:border-amber-400/50 transition-all duration-300 flex flex-col justify-between"
          >
            <div className="relative aspect-[4/5] w-full overflow-hidden bg-zinc-900">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.imageUrl}
                alt={item.title}
                className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute top-2.5 left-2.5">
                <span className="px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wider uppercase bg-black/80 text-white backdrop-blur-md border border-white/10">
                  {item.brand}
                </span>
              </div>
              <div className="absolute top-2.5 right-2.5">
                <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold tracking-wide bg-amber-400/90 text-black backdrop-blur-md">
                  ${item.price.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="p-4 space-y-2.5 flex-1 flex flex-col justify-between">
              <div>
                <div className="text-[11px] uppercase tracking-wider text-amber-400/90 font-medium">
                  {item.category} • {item.vibe.join(", ")}
                </div>
                <h3 className="text-sm font-semibold text-white line-clamp-1 group-hover:text-amber-200 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-zinc-400 line-clamp-2 mt-1">
                  {item.description}
                </p>
              </div>

              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                <span className="text-zinc-500 font-medium">{item.color}</span>
                <a
                  href={item.productUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-zinc-400 hover:text-amber-400 flex items-center space-x-1 font-medium transition-colors"
                >
                  <span>Store</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
