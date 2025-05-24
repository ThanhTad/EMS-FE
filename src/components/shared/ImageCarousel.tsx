// components/shared/ImageCarousel.tsx
"use client";

import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ImageCarouselProps {
  images: string[];
  alt: string;
}

export default function ImageCarousel({ images, alt }: ImageCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>({
    loop: true,
    slides: { perView: 1 },
    slideChanged(slider) {
      setCurrentSlide(slider.track.details.rel);
    },
  });

  // Autoplay effect
  useEffect(() => {
    timerRef.current = setInterval(() => {
      instanceRef.current?.next();
    }, 3000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [instanceRef]);

  return (
    <div className="relative">
      {/* Slider */}
      <div
        ref={sliderRef}
        className="keen-slider overflow-hidden rounded-lg shadow-lg mb-6 bg-gray-200 dark:bg-gray-700"
      >
        {images.map((src, index) => (
          <div
            key={index}
            className="keen-slider__slide relative aspect-[16/9] transition-transform duration-700 ease-in-out"
          >
            <Image
              src={src}
              alt={`${alt} ${index + 1}`}
              fill
              className="object-cover"
              priority={index === 0}
            />
          </div>
        ))}
      </div>

      {/* Arrow Navigation */}
      <button
        className="absolute top-1/2 left-3 -translate-y-1/2 z-10 bg-black/50 dark:bg-white/20 hover:bg-black/70 dark:hover:bg-white/40 text-white dark:text-gray-900 p-2 rounded-full"
        onClick={() => instanceRef.current?.prev()}
        aria-label="Previous Slide"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        className="absolute top-1/2 right-3 -translate-y-1/2 z-10 bg-black/50 dark:bg-white/20 hover:bg-black/70 dark:hover:bg-white/40 text-white dark:text-gray-900 p-2 rounded-full"
        onClick={() => instanceRef.current?.next()}
        aria-label="Next Slide"
      >
        <ChevronRight size={20} />
      </button>

      {/* Dot Navigation */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {images.map((_, idx) => (
          <button
            key={idx}
            className={clsx(
              "h-2 w-2 rounded-full",
              currentSlide === idx
                ? "bg-white dark:bg-gray-300"
                : "bg-white/50 dark:bg-white/30"
            )}
            onClick={() => instanceRef.current?.moveToIdx(idx)}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
