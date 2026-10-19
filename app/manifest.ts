import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "THREADS — AI Digital Wardrobe",
    short_name: "THREADS",
    description: "Curate your wardrobe, discover outfits, and style your daily rotation with AI.",
    start_url: "/",
    display: "standalone",
    background_color: "#F6F5F0",
    theme_color: "#20221D",
    icons: [
      {
        src: "/icon",
        sizes: "192x192",
        type: "image/png"
      }
    ]
  };
}
