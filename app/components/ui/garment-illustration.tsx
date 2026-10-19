"use client";

import React, { useState } from "react";
import { WardrobeItem, MainCategory } from "../../../lib/types/wardrobe";

export function GarmentIllustration({
  item,
  large = false,
  className = ""
}: {
  item?: WardrobeItem | null;
  large?: boolean;
  className?: string;
}) {
  const [hasError, setHasError] = useState(false);

  // If no item or empty name: render the tailored dark luxury shirt hanging on a hanger!
  if (!item || !item.name) {
    return (
      <svg
        viewBox="0 0 180 200"
        role="img"
        aria-label="Tailored shirt hanging on hanger"
        className={className}
        style={{
          width: large ? "96%" : "82%",
          height: large ? "96%" : "82%",
          maxHeight: large ? 270 : 170,
          filter: "drop-shadow(0 10px 20px rgba(10, 11, 16, 0.16))"
        }}
      >
        <defs>
          <linearGradient id="shirtFabric" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#222534" />
            <stop offset="30%" stopColor="#151724" />
            <stop offset="70%" stopColor="#0c0e16" />
            <stop offset="100%" stopColor="#06070b" />
          </linearGradient>
          <linearGradient id="sleeveFold" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.04)" />
            <stop offset="50%" stopColor="rgba(255,255,255,0.18)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.3)" />
          </linearGradient>
          <linearGradient id="hangerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1e202c" />
            <stop offset="50%" stopColor="#303346" />
            <stop offset="100%" stopColor="#161822" />
          </linearGradient>
        </defs>

        {/* 1. Metal Hanger Hook (Silver Metallic) */}
        <path
          d="M90 26 C90 10, 107 8, 111 20 C113 28, 102 33, 90 38"
          fill="none"
          stroke="#d2d6e4"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle cx="90" cy="38" r="2.5" fill="#888d9e" />

        {/* 2. Hanger Shoulders */}
        <path
          d="M36 56 Q90 32 144 56 L143 62 Q90 40 37 62 Z"
          fill="url(#hangerGrad)"
          stroke="#686d7e"
          strokeWidth="1.2"
        />

        {/* 3. Main Shirt Body Silhouette (Torso & Sleeves) */}
        <path
          d="
            M70 42 
            L36 58 
            L20 128 
            L34 133 
            L48 94 
            L50 178 
            Q90 196 130 178 
            L132 94 
            L146 133 
            L160 128 
            L144 58 
            L110 42 
            Z
          "
          fill="url(#shirtFabric)"
          stroke="#555a6d"
          strokeWidth="1.2"
        />

        {/* Sleeve Inset Seams */}
        <path d="M36 58 L48 94" fill="none" stroke="#3e4252" strokeWidth="1.2" />
        <path d="M144 58 L132 94" fill="none" stroke="#3e4252" strokeWidth="1.2" />
        
        {/* Sleeve Cuffs */}
        <path d="M20 128 L34 133" stroke="#a2a7b6" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="28" cy="130" r="1.5" fill="#e2e5ee" />
        <path d="M146 133 L160 128" stroke="#a2a7b6" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="152" cy="130" r="1.5" fill="#e2e5ee" />

        {/* Sleeve Highlights */}
        <path d="M30 68 L26 120" fill="none" stroke="url(#sleeveFold)" strokeWidth="2" opacity="0.7" />
        <path d="M150 68 L154 120" fill="none" stroke="url(#sleeveFold)" strokeWidth="2" opacity="0.7" />

        {/* 4. Center Button Placket */}
        <path
          d="M85 54 L85 190 L95 190 L95 54 Z"
          fill="#10121a"
          stroke="#484d5e"
          strokeWidth="1"
        />

        {/* Pearl / Charcoal Buttons down placket */}
        <circle cx="90" cy="50" r="2" fill="#e2e5ee" stroke="#3a3e4e" strokeWidth="0.8" />
        <circle cx="90" cy="74" r="2" fill="#e2e5ee" stroke="#3a3e4e" strokeWidth="0.8" />
        <circle cx="90" cy="98" r="2" fill="#e2e5ee" stroke="#3a3e4e" strokeWidth="0.8" />
        <circle cx="90" cy="122" r="2" fill="#e2e5ee" stroke="#3a3e4e" strokeWidth="0.8" />
        <circle cx="90" cy="146" r="2" fill="#e2e5ee" stroke="#3a3e4e" strokeWidth="0.8" />
        <circle cx="90" cy="170" r="2" fill="#e2e5ee" stroke="#3a3e4e" strokeWidth="0.8" />

        {/* 5. Left Chest Pocket */}
        <path
          d="M60 88 L78 88 L78 110 L69 116 L60 110 Z"
          fill="#141622"
          stroke="#555a6d"
          strokeWidth="1"
        />
        <line x1="60" y1="92" x2="78" y2="92" stroke="#7a8094" strokeWidth="1" />

        {/* 6. Sharp Spread Collar */}
        <path
          d="M72 40 L60 66 L86 54 L86 45 Z"
          fill="#252838"
          stroke="#7a8094"
          strokeWidth="1.2"
        />
        <path
          d="M108 40 L120 66 L94 54 L94 45 Z"
          fill="#252838"
          stroke="#7a8094"
          strokeWidth="1.2"
        />
        <path
          d="M72 40 Q90 48 108 40"
          fill="none"
          stroke="#9aa0b2"
          strokeWidth="1.5"
        />

        {/* Side Torso Dart Lines */}
        <path d="M58 108 Q60 138 56 166" fill="none" stroke="#2a2d3a" strokeWidth="1" strokeDasharray="4 2" />
        <path d="M122 108 Q120 138 124 166" fill="none" stroke="#2a2d3a" strokeWidth="1" strokeDasharray="4 2" />

        {/* Curved Shirt Hemline */}
        <path
          d="M50 178 Q90 196 130 178"
          fill="none"
          stroke="#72778a"
          strokeWidth="1.2"
        />
      </svg>
    );
  }

  const imageSource = !hasError ? (item.thumbnailPath || item.processedImagePath || item.originalImagePath) : null;

  if (imageSource && imageSource.length > 5 && !hasError) {
    return (
      <img
        src={imageSource}
        alt={item.name}
        className={`object-contain max-h-full max-w-full transition-opacity duration-200 ${className}`}
        loading="eager"
        decoding="async"
        onError={() => setHasError(true)}
      />
    );
  }

  const hex = item.dominantHex || "#3A3D3B";
  const strokeColor = hex.toLowerCase() === "#292a28" || hex.toLowerCase() === "#1c1d1b" ? "#EEEEEE" : "#4A4D46";
  const common = {
    stroke: strokeColor,
    strokeWidth: 1.5,
    strokeLinejoin: "round" as const,
    strokeLinecap: "round" as const
  };

  const cat = item.category;
  const sub = item.subcategory;

  return (
    <svg
      viewBox="0 0 180 200"
      role="img"
      aria-label={`${item.colorName} ${item.name}`}
      className={className}
      style={{
        width: large ? "88%" : "76%",
        height: large ? "88%" : "76%",
        maxHeight: large ? 240 : 160
      }}
    >
      {/* Tops & Outerwear */}
      {cat === "Tops" || cat === "Outerwear" ? (
        sub === "T-Shirt" ? (
          // Crewneck Tee silhouette
          <g>
            <path
              d="M55 35 L70 24 Q90 32 110 24 L125 35 L158 56 L140 82 L124 72 L125 152 L55 152 L56 72 L40 82 L22 56 Z"
              fill={hex}
              {...common}
            />
            {/* Crew collar */}
            <path d="M70 24 Q90 38 110 24" fill="none" stroke={strokeColor} strokeWidth={2} />
          </g>
        ) : (
          // Collared button-down or jacket
          <g>
            <path
              d="M58 30 L74 20 Q90 28 106 20 L122 30 L156 54 L138 78 L122 66 L124 154 L56 154 L58 66 L42 78 L24 54 Z"
              fill={hex}
              {...common}
            />
            {/* Collar folds */}
            <path d="M74 20 L90 48 L106 20" fill="none" stroke={strokeColor} strokeWidth={1.8} />
            <line x1="90" y1="48" x2="90" y2="154" stroke={strokeColor} strokeWidth={1.2} strokeDasharray="4 3" />
          </g>
        )
      ) : cat === "Bottoms" ? (
        // Trousers / Jeans
        <g>
          <path
            d="M50 26 L130 26 L124 85 L116 156 L90 156 L86 86 L82 156 L56 156 L48 85 Z"
            fill={hex}
            {...common}
          />
          {/* Waistband and fly */}
          <line x1="50" y1="36" x2="130" y2="36" stroke={strokeColor} strokeWidth={1.5} />
          <line x1="88" y1="36" x2="88" y2="76" stroke={strokeColor} strokeWidth={1.2} />
        </g>
      ) : cat === "Dresses & One-Pieces" ? (
        // Elegant couture hanging dress in item's dominant color
        <g>
          {/* Hanger */}
          <path d="M90 26 C90 12, 106 10, 110 20" fill="none" stroke="#d2d6e4" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M42 56 Q90 34 138 56 L137 62 Q90 42 43 62 Z" fill="#1e202c" stroke="#888d9e" strokeWidth="1" />
          {/* Straps */}
          <path d="M60 48 L68 74 L74 73 L65 47 Z" fill={hex} />
          <path d="M120 48 L112 74 L106 73 L115 47 Z" fill={hex} />
          {/* Bodice */}
          <path d="M68 74 Q90 84 112 74 L109 106 Q90 110 71 106 Z" fill={hex} {...common} />
          {/* Skirt */}
          <path d="M71 106 Q90 110 109 106 Q128 145 144 182 Q125 188 105 182 Q90 188 75 182 Q55 188 36 182 Q52 145 71 106 Z" fill={hex} {...common} />
          <path d="M68 74 Q79 82 90 77 Q101 82 112 74" fill="none" stroke={strokeColor} strokeWidth={1.5} />
        </g>
      ) : cat === "Footwear" ? (
        // Shoe / Sneaker profile
        <g>
          <path
            d="M26 108 Q52 114 74 92 L94 114 Q112 128 154 128 Q162 129 160 146 L28 146 Q16 142 20 126 Z"
            fill={hex}
            {...common}
          />
          {/* Sole line */}
          <path d="M19 138 L160 138" stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round" />
        </g>
      ) : cat === "Watches" ? (
        // Clean watch face & strap
        <g {...common}>
          <rect x="76" y="14" width="28" height="152" rx="6" fill={hex} />
          <circle cx="90" cy="90" r="34" fill="#FAF9F4" stroke={hex} strokeWidth={6} />
          <circle cx="90" cy="90" r="3" fill="#2E3029" />
          <line x1="90" y1="90" x2="90" y2="68" stroke="#2E3029" strokeWidth={2.5} strokeLinecap="round" />
          <line x1="90" y1="90" x2="110" y2="98" stroke="#2E3029" strokeWidth={2} strokeLinecap="round" />
        </g>
      ) : cat === "Bags" ? (
        // Structured tote bag
        <g {...common}>
          {/* Handle */}
          <path d="M66 58 Q66 22 90 22 Q114 22 114 58" fill="none" strokeWidth={3.5} />
          {/* Body */}
          <path d="M42 58 L138 58 L130 156 L50 156 Z" fill={hex} />
          <line x1="42" y1="58" x2="138" y2="58" strokeWidth={2} />
        </g>
      ) : (
        // General accessories
        <g {...common}>
          <circle cx="90" cy="90" r="48" fill={hex} />
          <circle cx="90" cy="90" r="36" fill="none" strokeWidth={2} strokeDasharray="6 4" />
        </g>
      )}
    </svg>
  );
}
