import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const slides = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=80',
    title: 'THE GRAND FASHION SALE',
    subtitle: 'Unbelievable Style Deals',
    tagline: '50% - 80% OFF',
    actionText: 'Shop New Season',
    link: '/catalog?discount=30'
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1600&q=80',
    title: 'STREET STYLE REVOLUTION',
    subtitle: 'Chic Denim & Sneakers',
    tagline: 'UP TO 40% OFF',
    actionText: 'Explore Trends',
    link: '/catalog?keyword=sneakers'
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1600&q=80',
    title: 'ELEGANT LUXURY WEAR',
    subtitle: 'Designer Brands & Watches',
    tagline: 'FLAT 30% OFF',
    actionText: 'View Collections',
    link: '/catalog?category=Accessories'
  }
];

const HeroCarousel = () => {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);

  // Auto-slide loop
  useEffect(() => {
    const timer = setInterval(() => {
      handleNext();
    }, 6000);
    return () => clearInterval(timer);
  }, [current]);

  const handlePrev = () => {
    setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const slideVariants = {
    initial: { opacity: 0, scale: 1.02 },
    animate: { opacity: 1, scale: 1, transition: { duration: 0.8, ease: 'easeInOut' } },
    exit: { opacity: 0, scale: 0.98, transition: { duration: 0.8, ease: 'easeInOut' } }
  };

  return (
    <div className="relative w-full h-[300px] md:h-[500px] lg:h-[580px] bg-gray-100 dark:bg-gray-950 overflow-hidden select-none">
      
      {/* Slides view wrapper */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          variants={slideVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="absolute inset-0 w-full h-full"
        >
          {/* Background image */}
          <div className="absolute inset-0 bg-black/35 z-10" />
          <img
            src={slides[current].image}
            alt={slides[current].title}
            className="w-full h-full object-cover object-center"
          />

          {/* Slide Text Content overlay */}
          <div className="absolute inset-0 z-20 flex flex-col justify-center px-8 md:px-20 text-white">
            <div className="max-w-[700px] space-y-3 md:space-y-5">
              <motion.span 
                initial={{ opacity: 0, y: 15 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.3 }}
                className="inline-block text-[11px] md:text-sm font-extrabold uppercase tracking-widest bg-myntra-pink text-white px-3 py-1 rounded shadow-sm self-start"
              >
                {slides[current].tagline}
              </motion.span>
              
              <motion.h1 
                initial={{ opacity: 0, y: 25 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.4 }}
                className="text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight drop-shadow-md"
              >
                {slides[current].title}
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.5 }}
                className="text-sm md:text-xl font-medium text-gray-200 drop-shadow-sm"
              >
                {slides[current].subtitle}
              </motion.p>
              
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
                onClick={() => navigate(slides[current].link)}
                className="px-6 py-2.5 md:px-8 md:py-3.5 bg-white text-myntra-dark font-extrabold text-xs uppercase tracking-wider rounded shadow-md hover:bg-myntra-pink hover:text-white transition-all duration-300"
              >
                {slides[current].actionText}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Control Buttons */}
      <button
        onClick={handlePrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/20 hover:bg-black/50 text-white transition-colors z-30"
        aria-label="Previous Slide"
      >
        <ChevronLeft size={20} />
      </button>

      <button
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/20 hover:bg-black/50 text-white transition-colors z-30"
        aria-label="Next Slide"
      >
        <ChevronRight size={20} />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-30">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              index === current ? 'bg-myntra-pink w-6 shadow-sm' : 'bg-white/50 hover:bg-white'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroCarousel;
