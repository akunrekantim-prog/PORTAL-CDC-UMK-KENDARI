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
      imageUrl: '/Poster%20CDC%20WEB%20UMK.svg',
      alt: 'Poster CDC WEB UMK - Slide 1',
    },
    {
      id: 'slide-2',
      imageUrl: '/Poster%20CDC%20WEB%20UMK.svg',
      alt: 'Poster CDC WEB UMK - Slide 2',
    },
    {
      id: 'slide-3',
      imageUrl: '/Poster%20CDC%20WEB%20UMK.svg',
      alt: 'Poster CDC WEB UMK - Slide 3',
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

  // Auto-play timer
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      nextSlide();
    }, SLIDE_DURATION);

    return () => clearInterval(timer);
  }, [currentSlide, isPaused]);

  // Framer Motion slide variants
  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? '100%' : '-100%',
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: {
        x: { type: 'spring', stiffness: 260, damping: 28 },
        opacity: { duration: 0.3 },
      },
    },
    exit: (dir: number) => ({
      x: dir < 0 ? '100%' : '-100%',
      opacity: 0,
      transition: {
        x: { type: 'spring', stiffness: 260, damping: 28 },
        opacity: { duration: 0.3 },
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
      {/* 100% EDGE-TO-EDGE CAROUSEL CONTAINER */}
      <div className="carousel-inner w-full relative overflow-hidden">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={current.id}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="carousel-item active w-full block cursor-pointer"
            onClick={() => setTab('lowongan')}
          >
            <img
              src={current.imageUrl}
              className="d-block w-100 w-full h-auto block object-cover m-0 p-0"
              alt={current.alt}
            />
          </motion.div>
        </AnimatePresence>

        {/* FLOATING PREVIOUS CONTROL */}
        <button
          onClick={prevSlide}
          aria-label="Previous Slide"
          className="carousel-control-prev absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 p-2.5 sm:p-3.5 rounded-full bg-slate-900/70 hover:bg-slate-900/90 border border-white/20 text-white backdrop-blur-md transition-all hover:scale-110 active:scale-95 shadow-2xl"
        >
          <ChevronLeft className="w-5 h-5 sm:w-7 sm:h-7" />
          <span className="sr-only">Previous</span>
        </button>

        {/* FLOATING NEXT CONTROL */}
        <button
          onClick={nextSlide}
          aria-label="Next Slide"
          className="carousel-control-next absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 p-2.5 sm:p-3.5 rounded-full bg-slate-900/70 hover:bg-slate-900/90 border border-white/20 text-white backdrop-blur-md transition-all hover:scale-110 active:scale-95 shadow-2xl"
        >
          <ChevronRight className="w-5 h-5 sm:w-7 sm:h-7" />
          <span className="sr-only">Next</span>
        </button>

        {/* FLOATING SLIDE INDICATORS */}
        <div className="absolute bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-slate-950/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 shadow-lg">
          {slides.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => goToSlide(idx)}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                idx === currentSlide
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
