import fs from "fs";
import path from "path";
import type { Metadata } from "next";
import ClientLandingPage from "./ClientLandingPage";

export const metadata: Metadata = {
  title: "Floral Perfumes | Haute Perfumery & Cinematic Experience",
  description: "Experience Floral L'Or, an ultra-premium luxury fragrance crafted from solar nectar and night-blooming jasmine. Discover the story through our immersive scrollytelling experience.",
  openGraph: {
    title: "Floral Perfumes | Haute Perfumery",
    description: "Experience Floral L'Or, an ultra-premium luxury fragrance crafted from solar nectar and night-blooming jasmine.",
    type: "website",
  },
};

export default function Page() {
  const framesDirectory = path.join(process.cwd(), "public", "frames");
  let frames: string[] = [];

  try {
    if (fs.existsSync(framesDirectory)) {
      const files = fs.readdirSync(framesDirectory);
      frames = files
        .filter((file) => file.startsWith("ezgif-frame-") && file.endsWith(".jpg"))
        .sort((a, b) => {
          const numA = parseInt(a.replace("ezgif-frame-", "").replace(".jpg", ""), 10);
          const numB = parseInt(b.replace("ezgif-frame-", "").replace(".jpg", ""), 10);
          return numA - numB;
        })
        .map((file) => `/frames/${file}`);
    } else {
      console.warn(`Frames directory not found at: ${framesDirectory}`);
    }
  } catch (error) {
    console.error("Error reading frames directory at build time:", error);
  }

  return <ClientLandingPage framePaths={frames} />;
}
