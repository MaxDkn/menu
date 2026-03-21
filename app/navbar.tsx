"use client";

import { motion } from "framer-motion";
import { RefObject } from "react";
import Slider from "react-slick";

type NavbarProps = {
  sliderRef: RefObject<Slider>;
  dark: boolean;
  currentIndex: number;
};

export default function Navbar({ sliderRef, dark, currentIndex }: NavbarProps) {
  const labels = ["Entrée", "Plat", "Dessert"];

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md">
      <div
        className={`
          relative
          backdrop-blur-xl
          bg-white/25
          border border-white/30
          shadow-lg
          rounded-2xl
          px-2 py-2
          flex justify-between
        `}
      >
        {/* BULLE ANIMÉE */}
        <motion.div
          className="absolute top-1 left-1 h-[calc(100%-0.5rem)] w-[calc(33.33%-0.25rem)] rounded-xl bg-white/40 shadow-sm"
          animate={{ x: `${currentIndex * 100}%` }}
          transition={{ type: "spring", stiffness: 250, damping: 35 }}
        />

        {labels.map((label, i) => (
          <button
            key={label}
            onClick={() => sliderRef.current?.slickGoTo(i)}
            className="relative flex-1 py-2 text-center z-10"
          >
            <span className="relative z-10 font-medium">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}