"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// Brand Configuration (User Editable)
const BRAND_CONFIG = {
  brandName: "Floral Perfumes",
  productName: "Floral L'Or",
  heroHeadline: "Scent of Pure Gold",
  heroTagline: "Crafted from solar nectar and night-blooming jasmine.",
  storyMessage: "An immersive sensory revolution that flows like molten light.",
  features: [
    {
      title: "Solar Nectar",
      description: "Infused with cold-pressed Sicilian mandarin and bright orange blossom.",
      accent: "Top Note"
    },
    {
      title: "Golden Heart",
      description: "A rich core of wild French rose, solar amber, and absolute jasmine.",
      accent: "Heart Note"
    },
    {
      title: "Nebula Wood",
      description: "Grounded by dark patchouli, creamy vanilla, and ancient sandalwood.",
      accent: "Base Note"
    }
  ],
  productCategory: "perfume" as "perfume" | "phone" | "chocolate",
  productDetails: {
    perfume: {
      topNotes: ["Sicilian Mandarin", "Orange Blossom", "Bergamot Accord"],
      heartNotes: ["Wild French Rose", "Solar Amber", "Absolute Jasmine"],
      baseNotes: ["Dark Patchouli", "Creamy Vanilla", "Sandalwood Essence"]
    }
  },
  ctaHeadline: "Possess the Light",
  ctaMessage: "Indulge in the limited-edition fragrance that defines cinematic elegance.",
  primaryButtonText: "Acquire Now"
};

interface ClientLandingPageProps {
  framePaths: string[];
}

export default function ClientLandingPage({ framePaths }: ClientLandingPageProps) {
  const [loading, setLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const heroRef = useRef<HTMLDivElement>(null);
  const pinnedRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const frameValRef = useRef<number>(0);

  // Overlay Refs
  const brandTitleRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const taglineRef = useRef<HTMLDivElement>(null);
  const storyRef = useRef<HTMLDivElement>(null);

  // Sections Refs
  const featuresSectionRef = useRef<HTMLDivElement>(null);
  const featuresGridRef = useRef<HTMLDivElement>(null);

  // Particles generator
  const [particles, setParticles] = useState<{ id: number; left: string; top: string; size: string; delay: string; duration: string }[]>([]);

  useEffect(() => {
    // Generate floating dust particles
    const generated = Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: `${Math.random() * 5 + 2}px`,
      delay: `${Math.random() * 8}s`,
      duration: `${Math.random() * 12 + 10}s`
    }));
    setParticles(generated);
  }, []);

  // Preloading image frames
  useEffect(() => {
    if (framePaths.length === 0) return;

    let loadedCount = 0;
    const total = framePaths.length;
    const images: HTMLImageElement[] = [];

    framePaths.forEach((path, idx) => {
      const img = new Image();
      img.src = path;
      img.onload = () => {
        loadedCount++;
        setLoadProgress(Math.round((loadedCount / total) * 100));
        if (loadedCount === total) {
          imagesRef.current = images;
          setLoading(false);
        }
      };
      img.onerror = () => {
        loadedCount++;
        setLoadProgress(Math.round((loadedCount / total) * 100));
        if (loadedCount === total) {
          imagesRef.current = images;
          setLoading(false);
        }
      };
      images[idx] = img;
    });
  }, [framePaths]);

  // Object-fit cover helper for canvas
  const drawImageCover = (ctx: CanvasRenderingContext2D, img: HTMLImageElement) => {
    const canvas = ctx.canvas;
    const imgWidth = img.width;
    const imgHeight = img.height;
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    const imgRatio = imgWidth / imgHeight;
    const canvasRatio = canvasWidth / canvasHeight;

    let drawWidth = canvasWidth;
    let drawHeight = canvasHeight;
    let drawX = 0;
    let drawY = 0;

    if (canvasRatio > imgRatio) {
      drawHeight = canvasWidth / imgRatio;
      drawY = (canvasHeight - drawHeight) / 2;
    } else {
      drawWidth = canvasHeight * imgRatio;
      drawX = (canvasWidth - drawWidth) / 2;
    }

    // Set filters for sharpening contrast and details safely
    if ("filter" in ctx) {
      ctx.filter = "contrast(1.08) saturate(1.03) brightness(1.01)";
    }

    // Ensure smoothing is always high-quality on every draw
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
  };

  // Main ScrollTrigger setup
  useEffect(() => {
    if (loading || imagesRef.current.length === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Resize handler
    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      
      // Force high-quality image smoothing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      
      const currentFrame = Math.round(frameValRef.current);
      if (imagesRef.current[currentFrame]) {
        drawImageCover(ctx, imagesRef.current[currentFrame]);
      }
    };

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas(); // Draw initial frame

    // 1. Frame sequence scrubbing trigger
    const airProps = { frame: 0 };
    const frameCount = imagesRef.current.length;

    const frameScroll = gsap.to(airProps, {
      frame: frameCount - 1,
      snap: "frame",
      ease: "none",
      scrollTrigger: {
        trigger: heroRef.current,
        pin: pinnedRef.current,
        start: "top top",
        end: "bottom bottom",
        scrub: 2.2, // Inertia scroll scrubbing
      },
      onUpdate: () => {
        const frameIndex = Math.round(airProps.frame);
        frameValRef.current = frameIndex;
        if (imagesRef.current[frameIndex]) {
          // Re-apply smoothing parameters on each frame draw to prevent browser resets
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          drawImageCover(ctx, imagesRef.current[frameIndex]);
        }
      }
    });

    // 2. Sequential Overlay text timeline
    const textTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: heroRef.current,
        start: "top top",
        end: "bottom bottom",
        scrub: 1.8,
      }
    });

    // Reset initial text positions and opacities
    gsap.set(brandTitleRef.current, { opacity: 1, y: 0 });
    gsap.set(headlineRef.current, { opacity: 0, y: -100 });
    gsap.set(taglineRef.current, { opacity: 0, x: 150 });
    gsap.set(storyRef.current, { opacity: 0, y: 100 });

    textTimeline
      // Phase A: Brand Name fades out immediately as scroll begins
      .to(brandTitleRef.current, {
        opacity: 0,
        y: -60,
        duration: 1.2,
        ease: "power2.inOut"
      })
      // Phase B: Headline slides from top and fades in (around frame 30 / 15% progress)
      .to(headlineRef.current, {
        opacity: 1,
        y: 0,
        duration: 1.8,
        ease: "power3.out"
      }, "+=0.4")
      .to(headlineRef.current, {
        opacity: 0,
        y: 60,
        duration: 1.8,
        ease: "power3.in"
      }, "+=2.2")
      // Phase C: Tagline slides from right and fades in
      .to(taglineRef.current, {
        opacity: 1,
        x: 0,
        duration: 1.8,
        ease: "power3.out"
      }, "+=0.4")
      .to(taglineRef.current, {
        opacity: 0,
        x: -150,
        duration: 1.8,
        ease: "power3.in"
      }, "+=2.2")
      // Phase D: Story message slides from bottom and fades in
      .to(storyRef.current, {
        opacity: 1,
        y: 0,
        duration: 1.8,
        ease: "power3.out"
      }, "+=0.4")
      .to(storyRef.current, {
        opacity: 0,
        y: -60,
        duration: 1.8,
        ease: "power3.in"
      }, "+=2.2");

    // 3. Staggered reveal for Feature Cards
    const featuresGrid = featuresGridRef.current;
    let cardsTrigger: ScrollTrigger | null = null;
    if (featuresGrid) {
      const cards = featuresGrid.querySelectorAll(".feature-card");
      cardsTrigger = ScrollTrigger.create({
        trigger: featuresGrid,
        start: "top 80%",
        onEnter: () => {
          gsap.fromTo(
            cards,
            { opacity: 0, y: 80, scale: 0.96 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 1.4,
              stagger: 0.25,
              ease: "power4.out",
              overwrite: "auto"
            }
          );
        },
        onLeaveBack: () => {
          gsap.to(cards, {
            opacity: 0,
            y: 80,
            scale: 0.96,
            duration: 0.8,
            overwrite: "auto"
          });
        }
      });
    }

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      frameScroll.kill();
      textTimeline.kill();
      if (cardsTrigger) cardsTrigger.kill();
    };
  }, [loading]);

  return (
    <div className="relative w-full bg-black text-zinc-100 overflow-x-hidden selection:bg-gold selection:text-black">
      {/* LUXURY STICKY HEADER */}
      <header
        className={`fixed top-0 left-0 w-full z-40 py-6 px-8 md:px-16 flex items-center justify-between border-b transition-all duration-500 ${
          scrolled
            ? "bg-black/85 backdrop-blur-md border-gold/15 shadow-[0_4px_30px_rgba(0,0,0,0.8)]"
            : "bg-transparent border-transparent"
        }`}
      >
        <a href="#hero-section" className="font-serif-display text-2xl uppercase tracking-[0.25em] text-white hover:text-gold transition-colors duration-300">
          Floral
        </a>
        <nav className="hidden md:flex items-center gap-10 text-[10px] tracking-[0.25em] uppercase font-light text-zinc-400">
          <a href="#hero-section" className="hover:text-gold transition-colors duration-300">Film</a>
          <a href="#features-section" className="hover:text-gold transition-colors duration-300">Attributes</a>
          <a href="#notes-section" className="hover:text-gold transition-colors duration-300">Architecture</a>
          <a href="#cta-section" className="hover:text-gold transition-colors duration-300">Acquire</a>
        </nav>
        <a
          href="#cta-section"
          className="px-5 py-2.5 font-sans font-medium uppercase tracking-[0.15em] text-[10px] text-gold border border-gold/30 hover:border-gold hover:text-black hover:bg-gold transition-all duration-500 rounded-sm"
        >
          Acquire
        </a>
      </header>
      {/* 1. LUXURY SEQUENCE PRELOADER */}
      {loading && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center text-center">
          <div className="relative w-32 h-32 flex items-center justify-center">
            {/* Circular Progress SVG */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="48"
                stroke="rgba(212, 175, 55, 0.08)"
                strokeWidth="2"
                fill="transparent"
              />
              <circle
                cx="64"
                cy="64"
                r="48"
                stroke="#d4af37"
                strokeWidth="2"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 48}
                strokeDashoffset={2 * Math.PI * 48 * (1 - loadProgress / 100)}
                className="transition-all duration-300"
              />
            </svg>
            <div className="absolute font-serif-display text-xl text-white font-light tracking-wider">
              {loadProgress}%
            </div>
          </div>
          <h2 className="mt-8 font-serif-display text-2xl uppercase tracking-widest text-gold text-luxury-shadow">
            Film Sequence Loading
          </h2>
          <p className="mt-2 text-zinc-500 text-xs tracking-widest uppercase font-light">
            Preparing Cinematic Experience
          </p>
        </div>
      )}

      {/* FLOATING DUST PARTICLES */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
        {particles.map((p) => (
          <div
            key={p.id}
            className="dust-particle"
            style={{
              left: p.left,
              top: p.top,
              width: p.size,
              height: p.size,
              animationDelay: p.delay,
              animationDuration: p.duration,
            }}
          />
        ))}
      </div>

      {/* 2. HERO CANVAS SECTION (Pinned Frame Animation) */}
      <div
        id="hero-section"
        ref={heroRef}
        className="relative w-full"
        style={{ height: "450vh" }} // Pinned scroll duration for storytelling (350% scroll distance)
      >
        <div
          id="hero-pinned"
          ref={pinnedRef}
          className="sticky top-0 left-0 w-full h-screen overflow-hidden bg-black flex items-center justify-center"
        >
          {/* Canvas for rendering frames */}
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover z-0 sharp-canvas" />

          {/* Luxury moving film grain overlay to enhance perceived image details */}
          <div className="film-grain-container z-5">
            <div className="film-grain" />
          </div>

          {/* Luxury Vignette and Glow overlays for legibility */}
          <div className="absolute inset-0 vignette-overlay z-5" />
          <div className="absolute inset-0 luxury-glow-overlay z-5" />
          
          {/* Subtle blurred backdrop behind text for extra readability */}
          <div className="absolute inset-0 bg-black/15 backdrop-blur-[1px] pointer-events-none z-5" />

          {/* Sequential Text Overlays */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
            {/* Ambient gold glow behind active text */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full gold-glow-radial opacity-60 blur-3xl pointer-events-none z-0" />

            {/* INITIAL STATE: Static centered brand name */}
            <div ref={brandTitleRef} className="text-center px-4 absolute flex flex-col items-center">
              <h1 className="font-serif-display text-6xl md:text-9xl text-white tracking-[0.2em] uppercase text-luxury-shadow">
                {BRAND_CONFIG.brandName}
              </h1>
              <div className="w-16 h-[1px] bg-gold/60 my-6" />
              <p className="text-gold tracking-[0.3em] uppercase text-xs md:text-sm font-light">
                HAUTE PERFUMERY
              </p>
            </div>

            {/* OVERLAY 1: Hero Headline (Slides from Top) */}
            <div ref={headlineRef} className="absolute text-center max-w-5xl px-6 flex flex-col items-center">
              <h2 className="font-serif-display text-5xl md:text-7xl lg:text-8xl text-white text-luxury-shadow tracking-wide leading-tight">
                {BRAND_CONFIG.heroHeadline}
              </h2>
            </div>

            {/* OVERLAY 2: Hero Tagline (Slides from Right) */}
            <div ref={taglineRef} className="absolute text-center max-w-4xl px-8 flex flex-col items-center">
              <span className="text-gold font-light tracking-[0.3em] text-xs uppercase mb-4">
                THE SIGNATURE HARMONY
              </span>
              <h3 className="font-serif-display text-4xl md:text-6xl text-white text-luxury-shadow tracking-wide leading-snug">
                {BRAND_CONFIG.heroTagline}
              </h3>
            </div>

            {/* OVERLAY 3: Story Message (Slides from Bottom) */}
            <div ref={storyRef} className="absolute text-center max-w-3xl px-8 flex flex-col items-center">
              <blockquote className="font-serif-display italic text-3xl md:text-5xl text-white text-luxury-shadow leading-relaxed">
                "{BRAND_CONFIG.storyMessage}"
              </blockquote>
              <div className="w-16 h-[1px] bg-gold mx-auto mt-8"></div>
            </div>
          </div>

          {/* Minimal gold scroll indicator */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-20 text-zinc-500 hover:text-gold transition-colors duration-300">
            <span className="text-[10px] tracking-[0.25em] uppercase font-light">Scroll to Explore</span>
            <div className="w-[1px] h-12 bg-gradient-to-b from-gold/80 to-transparent animate-pulse" />
          </div>
        </div>
      </div>

      {/* 3. PREMIUM FEATURE SECTION */}
      <section
        id="features-section"
        ref={featuresSectionRef}
        className="py-28 relative bg-black overflow-hidden"
      >
        {/* Decorative divider top */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-gold/25 to-transparent" />
        
        {/* Soft backlighting */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] rounded-full gold-glow-radial opacity-50 blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <span className="text-xs uppercase tracking-[0.3em] text-gold/80 block mb-2 font-medium">DISTINGUISHED ATTRIBUTES</span>
            <h2 className="font-serif-display text-4xl md:text-6xl text-white tracking-wide">Olfactory Mastery</h2>
            <div className="w-12 h-[1px] bg-gold/50 mx-auto mt-4" />
          </div>

          {/* Glassmorphic cards */}
          <div
            ref={featuresGridRef}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {BRAND_CONFIG.features.map((feature, idx) => (
              <div
                key={idx}
                className="feature-card glass-card corner-accent p-8 md:p-10 relative overflow-hidden group flex flex-col justify-between min-h-[280px]"
              >
                <div className="corner-accent-inner" />
                <div>
                  <span className="text-[10px] uppercase tracking-[0.25em] text-gold font-medium mb-4 block">
                    {feature.accent}
                  </span>
                  <h3 className="font-serif-display text-2xl md:text-3xl text-white font-medium mb-4 tracking-wide">
                    {feature.title}
                  </h3>
                  <p className="text-zinc-400 font-light leading-relaxed text-sm md:text-base">
                    {feature.description}
                  </p>
                </div>
                {/* Glow highlight on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-gold/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. PRODUCT DETAILS SECTION (Editorial layout) */}
      <section id="notes-section" className="py-28 relative bg-black overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-gold/25 to-transparent" />
        
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-20">
            <span className="text-xs uppercase tracking-[0.3em] text-gold/80 block mb-2 font-medium">OLFACTORY ARCHITECTURE</span>
            <h2 className="font-serif-display text-4xl md:text-6xl text-white tracking-wide">The Anatomy of {BRAND_CONFIG.productName}</h2>
            <div className="w-12 h-[1px] bg-gold/50 mx-auto mt-4" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
            {/* Note Column 1 */}
            <div className="border-b lg:border-b-0 lg:border-r border-gold/15 pb-8 lg:pb-0 lg:pr-8 last:border-0">
              <span className="font-serif-display italic text-6xl text-gold/20 block mb-4">01</span>
              <h3 className="font-serif-display text-2xl text-white tracking-[0.15em] uppercase mb-4">Top Notes</h3>
              <p className="text-zinc-400 font-light text-sm leading-relaxed mb-6">
                The immediate introduction. Ethereal, volatile molecules that rise immediately to captivate the senses upon first mist.
              </p>
              <ul className="space-y-3 font-serif-display text-lg text-gold-light">
                {BRAND_CONFIG.productDetails.perfume.topNotes.map((note, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rotate-45 bg-gold" />
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Note Column 2 */}
            <div className="border-b lg:border-b-0 lg:border-r border-gold/15 pb-8 lg:pb-0 lg:pr-8 last:border-0">
              <span className="font-serif-display italic text-6xl text-gold/20 block mb-4">02</span>
              <h3 className="font-serif-display text-2xl text-white tracking-[0.15em] uppercase mb-4">Heart Notes</h3>
              <p className="text-zinc-400 font-light text-sm leading-relaxed mb-6">
                The soul of the fragrance. Deeply textured florals and warm ambers that emerge as the top notes gently dissipate.
              </p>
              <ul className="space-y-3 font-serif-display text-lg text-gold-light">
                {BRAND_CONFIG.productDetails.perfume.heartNotes.map((note, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rotate-45 bg-gold" />
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Note Column 3 */}
            <div className="last:border-0">
              <span className="font-serif-display italic text-6xl text-gold/20 block mb-4">03</span>
              <h3 className="font-serif-display text-2xl text-white tracking-[0.15em] uppercase mb-4">Base Notes</h3>
              <p className="text-zinc-400 font-light text-sm leading-relaxed mb-6">
                The lasting silhouette. Rich, molecular base notes that latch to the skin, establishing depth and a lingering trail.
              </p>
              <ul className="space-y-3 font-serif-display text-lg text-gold-light">
                {BRAND_CONFIG.productDetails.perfume.baseNotes.map((note, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rotate-45 bg-gold" />
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FINAL DRAMATIC CTA SECTION */}
      <section id="cta-section" className="py-32 relative bg-black overflow-hidden flex flex-col items-center justify-center text-center">
        {/* Subtle top border line */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-gold/25 to-transparent" />

        {/* Stage Light Radial Glow behind headline */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] rounded-full bg-radial-gradient(circle, rgba(212,175,55,0.08) 0%, rgba(0,0,0,0) 75%) blur-3xl pointer-events-none z-0" />

        <div className="max-w-4xl mx-auto px-6 relative z-10 flex flex-col items-center">
          <span className="text-xs uppercase tracking-[0.3em] text-gold mb-6 font-medium">EXCLUSIVE ACCESS</span>
          <h2 className="font-serif-display text-5xl md:text-8xl text-white mb-6 tracking-wide leading-tight text-luxury-shadow">
            {BRAND_CONFIG.ctaHeadline}
          </h2>
          <p className="text-zinc-400 font-light max-w-xl mx-auto text-base md:text-lg mb-12 leading-relaxed">
            {BRAND_CONFIG.ctaMessage}
          </p>

          <button className="relative px-10 py-5 font-sans font-medium uppercase tracking-[0.2em] text-xs text-black bg-gold hover:bg-white transition-all duration-500 shadow-[0_0_20px_rgba(212,175,55,0.2)] hover:shadow-[0_0_35px_rgba(212,175,55,0.5)] rounded-sm group overflow-hidden">
            {/* Luxury corner accents */}
            <span className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-white/60 pointer-events-none" />
            <span className="absolute top-0 right-0 w-2.5 h-2.5 border-t border-r border-white/60 pointer-events-none" />
            <span className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b border-l border-white/60 pointer-events-none" />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r border-white/60 pointer-events-none" />
            
            <span className="relative z-10 transition-colors duration-500 group-hover:text-black">{BRAND_CONFIG.primaryButtonText}</span>
          </button>
        </div>
      </section>

      {/* LUXURY EXPANDED FOOTER */}
      <footer className="bg-black text-zinc-500 py-16 relative overflow-hidden">
        {/* Decorative divider top */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4/5 h-[1px] bg-gradient-to-r from-transparent via-gold/15 to-transparent" />
        
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 relative z-10">
          {/* Col 1: Brand Info */}
          <div className="md:col-span-2 space-y-6 text-left">
            <h4 className="font-serif-display text-3xl uppercase tracking-[0.2em] text-white">Floral Perfumes</h4>
            <p className="text-zinc-400 font-light text-sm max-w-sm leading-relaxed">
              Creating celestial sensory narratives and timeless fragrances that capture the essence of luxury. Each bottle is a curated universe of rare blossoms and night-blooming accords.
            </p>
          </div>
          
          {/* Col 2: Navigation Links */}
          <div className="text-left">
            <h5 className="text-[10px] uppercase tracking-[0.2em] text-gold font-medium mb-4">Discover</h5>
            <ul className="space-y-3 text-xs font-light">
              <li><a href="#hero-section" className="hover:text-white transition-colors duration-300">The Film Sequence</a></li>
              <li><a href="#features-section" className="hover:text-white transition-colors duration-300">Olfactory Mastery</a></li>
              <li><a href="#notes-section" className="hover:text-white transition-colors duration-300">Anatomy of Fragrance</a></li>
            </ul>
          </div>
          
          {/* Col 3: Legal & Info */}
          <div className="text-left">
            <h5 className="text-[10px] uppercase tracking-[0.2em] text-gold font-medium mb-4">Client Relations</h5>
            <ul className="space-y-3 text-xs font-light">
              <li><a href="#" className="hover:text-white transition-colors duration-300">Bespoke Services</a></li>
              <li><a href="#" className="hover:text-white transition-colors duration-300">Private Consultations</a></li>
              <li><a href="#" className="hover:text-white transition-colors duration-300">Shipping & Returns</a></li>
            </ul>
          </div>
        </div>
        
        {/* Footer bottom bar */}
        <div className="max-w-6xl mx-auto px-6 mt-16 pt-8 border-t border-zinc-900 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-light relative z-10 text-left">
          <p>© {new Date().getFullYear()} {BRAND_CONFIG.brandName}. All Rights Reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors duration-300">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors duration-300">Terms of Use</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
