"use client";

import { useState, useEffect, useRef } from "react";
import Slider from "react-slick";
import { motion, useMotionValue, useTransform } from "framer-motion";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

type Category = "starter" | "dish" | "dessert";

const MENU = {
  starter: ["Salade de tomates", "Soupe de légumes", "Carottes râpées", "Betraves"],
  dish: ["Poulet rôti", "Pâtes bolognaise"],
  dessert: ["Yaourt", "Tarte aux pommes"],
};

const categories: Category[] = ["starter", "dish", "dessert"];

function getTodayDate() {
  return new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

// -------------------- MenuCard Component --------------------
type MenuCardProps = {
  item: string;
  rating: number;
  locked: boolean;
  onRate: (value: number) => void;
  onToggle: () => void;
  dark: boolean;
};

function MenuCard({ item, rating, locked, onRate, onToggle, dark }: MenuCardProps) {
  return (
    <div
      onClick={onToggle}
      className={`
        w-full flex-1
        rounded-[28px]
        flex flex-col justify-center items-center
        transition-all duration-300
        p-6
        ${locked ? "bg-white/10 opacity-40" : "bg-white/30 backdrop-blur-xl shadow-lg border border-white/30"}
      `}
    >
      <h2 className="text-xl font-medium mb-3 text-center px-4">{item}</h2>

      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={(e) => {
              e.stopPropagation();
              onRate(star);
            }}
            className={`text-2xl ${
              rating >= star ? "text-yellow-400" : dark ? "text-white/30" : "text-black/30"
            }`}
          >
            ★
          </button>
        ))}
      </div>

      {locked && <p className="mt-2 text-xs opacity-70">Cliquer pour modifier</p>}
    </div>
  );
}

// -------------------- Page Component --------------------
export default function Page() {
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [locked, setLocked] = useState<Record<string, boolean>>({});

  const prefersDark =
    typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
  const [dark, setDark] = useState(prefersDark);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => setDark(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    // Bloque le scroll vertical pour effet app
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleRate = (item: string, value: number) => {
    if (locked[item]) return;
    setRatings((prev) => ({ ...prev, [item]: value }));
    setLocked((prev) => ({ ...prev, [item]: true }));
  };

  const toggleUnlock = (item: string) => {
    if (locked[item]) setLocked((prev) => ({ ...prev, [item]: false }));
  };

  const bg = dark ? "bg-[#0f0f0f]" : "bg-[#e6e4d1]";
  const text = dark ? "text-white" : "text-black";

  const sliderRef = useRef<Slider>(null);

  // Motion value pour bulle liquid glass
  const x = useMotionValue(0);
  const [currentIndex, setCurrentIndex] = useState(0);

  const sliderSettings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    swipeToSlide: true,
    arrows: false,
    afterChange: (index: number) => setCurrentIndex(index),
    beforeChange: (oldIndex: number, newIndex: number) => setCurrentIndex(newIndex),
    onSwipe: () => {
      // Pas nécessaire, le motion value suit l'index
    },
  };

  // On calcule la position de la bulle en % selon index
  const bubbleX = useTransform(x, [0, 1], [0, 100 / 3]); // 3 boutons, largeur 33.33%

  return (
    <main className={`h-[100dvh] w-screen ${bg} ${text} transition-colors duration-500 flex flex-col font-[Inter]`}>

      {/* HEADER */}
      <div className="pt-10 pb-2 flex justify-center items-center relative">
        <h1 className="text-2xl font-semibold capitalize">Menu du {getTodayDate()}</h1>
      </div>

      {/* SLIDER */}
      <div className="flex-1 px-4 pb-28 pt-4">
        <Slider ref={sliderRef} {...sliderSettings}>
          {categories.map((cat) => (
            <div key={cat} className="flex flex-col gap-4">
              {MENU[cat].map((item) => (
                <MenuCard
                  key={item}
                  item={item}
                  rating={ratings[item] || 0}
                  locked={locked[item] || false}
                  onRate={(value) => handleRate(item, value)}
                  onToggle={() => toggleUnlock(item)}
                  dark={dark}
                />
              ))}
            </div>
          ))}
        </Slider>
      </div>

      {/* NAVBAR LIQUID GLASS */}
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
          {/* BULLE ANIMÉE FLUIDE */}
          <motion.div
            className="absolute top-1 left-1 h-[calc(100%-0.5rem)] w-[calc(33.33%-0.25rem)] rounded-xl bg-white/40 shadow-sm"
            animate={{ x: `${currentIndex * 100}%` }}
            transition={{ type: "spring", stiffness: 250, damping: 35 }}
          />

          {["Entrée", "Plat", "Dessert"].map((label, i) => (
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
    </main>
  );
}