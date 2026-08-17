import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface HeroSliderProps {
  setTab: (tab: string) => void;
  onNavigateToLogin: () => void;
  onNavigateToRegister?: (type?: 'alumni' | 'perusahaan') => void;
  onSelectLowongan?: (id: string) => void;
}

export default function HeroSlider({ setTab }: HeroSliderProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState<number>(1);
  const [isPaused, setIsPaused] = useState(false);

  const SLIDE_DURATION = 5000; // 5 seconds per slide

  const slides = [
    {
      id: 'slide-1',
      imageUrl: '/poster-cdc-web-umk-1.svg',
      alt: 'Poster CDC WEB UMK - Slide 1',
    },
    {
      id: 'slide-2',
      imageUrl: '/poster-cdc-web-umk-2.svg',
      alt: 'Poster CDC WEB UMK - Slide 2',
    },
    {
      id: 'slide-3',
      imageUrl: '/PENGEMBANGAN%20KARIR.svg',
      alt: 'Pengembangan Karir - Slide 3',
    },
    {
      id: 'slide-4',
      imageUrl: '/TENTANG%20TRACER%20baru.svg',
      alt: 'Tentang Tracer - Slide 4',
    },
    {
      id: 'slide-5',
      imageUrl: '/KONSELING%20KARIR%20slide%20ke%205.svg',
      alt: 'Konseling Karir - Slide 5',
    },
  ];

  const totalSlides = slides.length;

  const nextSlide = () => {
    setDirection(1);
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setDirection(-1);
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const goToSlide = (index: number) => {
    setDirection(index > currentSlide ? 1 : -1);
    setCurrentSlide(index);
  };

  // Preload all slide images on mount to avoid decoding flash/blink during slide change
  useEffect(() => {
    slides.forEach((slide) => {
      const img = new Image();
      img.src = slide.imageUrl;
    });
  }, []);

  // Auto-play timer
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      nextSlide();
    }, SLIDE_DURATION);

    return () => clearInterval(timer);
  }, [currentSlide, isPaused]);

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
        x: { ease: [0.25, 1, 0.35, 1], duration: 0.6 },
        opacity: { duration: 0.4, ease: 'easeInOut' },
      },
    },
    exit: (dir: number) => ({
      x: dir < 0 ? '100%' : '-100%',
      opacity: 0,
      transition: {
        x: { ease: [0.25, 1, 0.35, 1], duration: 0.6 },
        opacity: { duration: 0.4, ease: 'easeInOut' },
      },
    }),
  };

  const current = slides[currentSlide];

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
          src={slides[0].imageUrl}
          className="w-full h-auto block opacity-0 pointer-events-none select-none aria-hidden"
          alt=""
          aria-hidden="true"
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
              className="carousel-item active absolute inset-0 w-full h-full cursor-pointer transform-gpu"
              onClick={() => setTab('lowongan')}
            >
              <img
                src={current.imageUrl}
                className="w-full h-full object-cover block m-0 p-0"
                alt={current.alt}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* FLOATING PREVIOUS CONTROL */}
        <button
          onClick={prevSlide}
          aria-label="Previous Slide"
          className="carousel-control-prev absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 p-2.5 sm:p-3.5 rounded-full bg-transparent hover:bg-white/20 text-white transition-all hover:scale-110 active:scale-95 drop-shadow-lg"
        >
          <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8 drop-shadow-md" />
          <span className="sr-only">Previous</span>
        </button>

        {/* FLOATING NEXT CONTROL */}
        <button
          onClick={nextSlide}
          aria-label="Next Slide"
          className="carousel-control-next absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 p-2.5 sm:p-3.5 rounded-full bg-transparent hover:bg-white/20 text-white transition-all hover:scale-110 active:scale-95 drop-shadow-lg"
        >
          <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8 drop-shadow-md" />
          <span className="sr-only">Next</span>
        </button>

        {/* FLOATING SLIDE INDICATORS */}
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
      </div>
    </section>
  );
}
