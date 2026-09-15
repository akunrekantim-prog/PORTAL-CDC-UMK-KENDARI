import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getHeroSlides } from '../data';
import { HeroSlideItem } from '../types';

interface HeroSliderProps {
  setTab: (tab: string) => void;
  onNavigateToLogin: () => void;
  onNavigateToRegister?: (type?: 'alumni' | 'perusahaan') => void;
  onSelectLowongan?: (id: string) => void;
}

export default function HeroSlider({ setTab }: HeroSliderProps) {
  const [slides, setSlides] = useState<HeroSlideItem[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState<number>(1);
  const [isPaused, setIsPaused] = useState(false);

  const SLIDE_DURATION = 5000; // 5 seconds per slide

  useEffect(() => {
    const loaded = getHeroSlides().filter((s) => s.isActive !== false).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    setSlides(loaded);
  }, []);

  const totalSlides = slides.length;

  useEffect(() => {
    if (currentSlide >= totalSlides && totalSlides > 0) {
      setCurrentSlide(0);
    }
  }, [totalSlides, currentSlide]);

  const nextSlide = () => {
    if (totalSlides === 0) return;
    setDirection(1);
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    if (totalSlides === 0) return;
    setDirection(-1);
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const goToSlide = (index: number) => {
    setDirection(index > currentSlide ? 1 : -1);
    setCurrentSlide(index);
  };

  // Progressive Preload: Preload HANYA 1 slide berikutnya secara bertahap
  useEffect(() => {
    if (totalSlides <= 1) return;
    const nextIndex = (currentSlide + 1) % totalSlides;
    const nextSlideObj = slides[nextIndex];
    if (nextSlideObj?.imageUrl) {
      const img = new Image();
      img.src = nextSlideObj.imageUrl;
    }
  }, [currentSlide, slides, totalSlides]);

  // Auto-play timer
  useEffect(() => {
    if (isPaused || totalSlides <= 1) return;

    const timer = setInterval(() => {
      setDirection(1);
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, SLIDE_DURATION);

    return () => clearInterval(timer);
  }, [isPaused, totalSlides]);

  const handleSlideClick = (slide: HeroSlideItem) => {
    if (!slide.targetUrl || !slide.targetUrl.trim()) {
      return;
    }
    if (slide.targetUrl.startsWith('http://') || slide.targetUrl.startsWith('https://')) {
      window.open(slide.targetUrl, '_blank');
    } else {
      setTab(slide.targetUrl);
    }
  };

  if (totalSlides === 0) return null;

  // Ultra-smooth GPU-accelerated slide variants
  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? '100%' : '-100%',
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: {
        x: { ease: [0.25, 1, 0.35, 1] as [number, number, number, number], duration: 0.6 },
        opacity: { duration: 0.4, ease: 'easeInOut' as const },
      },
    },
    exit: (dir: number) => ({
      x: dir < 0 ? '100%' : '-100%',
      opacity: 0,
      transition: {
        x: { ease: [0.25, 1, 0.35, 1] as [number, number, number, number], duration: 0.6 },
        opacity: { duration: 0.4, ease: 'easeInOut' as const },
      },
    }),
  };

  const current = slides[currentSlide] || slides[0];

  return (
    <section
      id="carouselExampleControls"
      className="relative w-full overflow-hidden select-none bg-slate-900"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* 100% EDGE-TO-EDGE CAROUSEL CONTAINER WITH PERMANENT ASPECT RATIO */}
      <div className="carousel-inner w-full relative overflow-hidden">
        {/* Invisible Height Keeper to guarantee ZERO layout shift / container collapse */}
        <img
          src={slides[0]?.imageUrl || ''}
          className="w-full h-auto block opacity-0 pointer-events-none select-none aria-hidden"
          alt=""
          aria-hidden="true"
          loading="eager"
          decoding="async"
        />

        {/* ABSOLUTE SLIDE STACKING LAYER FOR ZERO-BLINK TRANSITIONS */}
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <motion.div
              key={current.id}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className={`carousel-item active absolute inset-0 w-full h-full transform-gpu ${
                current.targetUrl && current.targetUrl.trim() ? 'cursor-pointer hover:opacity-95' : 'cursor-default'
              }`}
              onClick={() => handleSlideClick(current)}
            >
              <img
                src={current.imageUrl}
                className="w-full h-full object-cover block m-0 p-0"
                alt={current.alt || current.title}
                loading={currentSlide === 0 ? "eager" : "lazy"}
                decoding="async"
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* FLOATING PREVIOUS CONTROL */}
        {totalSlides > 1 && (
          <button
            onClick={prevSlide}
            aria-label="Previous Slide"
            className="carousel-control-prev absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 p-2.5 sm:p-3.5 rounded-full bg-transparent hover:bg-white/20 text-white transition-all hover:scale-110 active:scale-95 drop-shadow-lg"
          >
            <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8 drop-shadow-md" />
            <span className="sr-only">Previous</span>
          </button>
        )}

        {/* FLOATING NEXT CONTROL */}
        {totalSlides > 1 && (
          <button
            onClick={nextSlide}
            aria-label="Next Slide"
            className="carousel-control-next absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 p-2.5 sm:p-3.5 rounded-full bg-transparent hover:bg-white/20 text-white transition-all hover:scale-110 active:scale-95 drop-shadow-lg"
          >
            <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8 drop-shadow-md" />
            <span className="sr-only">Next</span>
          </button>
        )}

        {/* FLOATING SLIDE INDICATORS */}
        {totalSlides > 1 && (
          <div className="absolute bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-slate-950/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 shadow-lg">
            {slides.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => goToSlide(idx)}
                className={`h-2.5 rounded-full transition-all duration-300 ${idx === currentSlide
                  ? 'w-7 bg-emerald-400'
                  : 'w-2.5 bg-white/40 hover:bg-white/70'
                  }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
