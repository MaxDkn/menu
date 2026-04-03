"use client";

import { motion } from "framer-motion";
import { RefObject } from "react";
import Slider from "react-slick";

type NavbarProps = {
  sliderRef: RefObject<Slider | null>;
  currentIndex: number;
};

const tabs = [
  { label: "Entrée",  icon: "🥗" },
  { label: "Plat",    icon: "🍽️" },
  { label: "Dessert", icon: "🍰" },
];

export default function Navbar({ sliderRef, currentIndex }: NavbarProps) {
  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[88%] max-w-sm">
      <div className="relative flex justify-between gap-1.5 rounded-2xl px-2 py-2 bg-white border border-neutral-100 shadow-lg dark:bg-zinc-800 dark:border-zinc-700 dark:shadow-none">
        <motion.div
          className="absolute top-2 left-2 h-[calc(100%-16px)] w-[calc(33.33%-8px)] rounded-xl bg-neutral-100 dark:bg-zinc-700"
          animate={{ x: `calc(${currentIndex} * (100% + 6px))` }}
          transition={{ type: "spring", stiffness: 300, damping: 35 }}
        />

        {tabs.map(({ label, icon }, i) => (
          <button
            key={label}
            onClick={() => sliderRef.current?.slickGoTo(i)}
            className="relative flex-1 py-2 flex flex-col items-center gap-0.5 z-10"
          >
            <span className="text-xl leading-none">{icon}</span>
            <span
              className={`text-xs font-medium transition-opacity duration-200
                ${currentIndex === i ? "opacity-100" : "opacity-35"}
              `}
            >
              {label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
