"use client";

import { useState } from "react";
import { motion } from "framer-motion";

type Category = "starter" | "dish" | "dessert";

const MENU = {
  starter: ["Salade de tomates", "Soupe de légumes", "Carottes râpées","Betraves"],
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

export default function Page() {
  const [index, setIndex] = useState(1);
  const [dark, setDark] = useState(false);

  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [locked, setLocked] = useState<Record<string, boolean>>({});

  const handleRate = (item: string, value: number) => {
    if (locked[item]) return;
    setRatings((prev) => ({ ...prev, [item]: value }));
    setLocked((prev) => ({ ...prev, [item]: true }));
  };

  const toggleUnlock = (item: string) => {
    if (locked[item]) {
      setLocked((prev) => ({ ...prev, [item]: false }));
    }
  };

  const bg = dark
    ? "bg-[#0f0f0f]"
    : "bg-[#e6e4d1]";

  const text = dark ? "text-white" : "text-black";

  return (
    <main className={`h-screen w-screen ${bg} ${text} transition-colors duration-500 flex flex-col font-[Inter]`}>

      {/* HEADER */}
      <div className="pt-10 pb-2 flex justify-center items-center relative">
        <h1 className="text-2xl font-semibold capitalize">
          Menu du {getTodayDate()}
        </h1>

        {/* TOGGLE DARK MODE */}
        <button
          onClick={() => setDark(!dark)}
          className="absolute right-4 top-10 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-sm"
        >
          {dark ? "☀️" : "🌙"}
        </button>
      </div>

      {/* SLIDER */}
      <motion.div
        className="flex flex-1"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={(_, info) => {
          if (info.offset.x < -100 && index < 2) setIndex(index + 1);
          if (info.offset.x > 100 && index > 0) setIndex(index - 1);
        }}
        animate={{ x: `-${index * 100}%` }}
        transition={{ type: "spring", stiffness: 120, damping: 20 }}
      >
        {categories.map((cat) => (
          <div
            key={cat}
            className="min-w-full flex flex-col justify-center gap-4 px-4 pb-28 pt-4"
          >
            {MENU[cat].map((item) => {
              const isLocked = locked[item];

              return (
                <motion.div
                  key={item}
                  onClick={() => toggleUnlock(item)}
                  whileTap={{ scale: 0.98 }}
                  className={`
                    w-full flex-1
                    rounded-[28px]
                    flex flex-col justify-center items-center
                    transition-all duration-300
                    ${
                      isLocked
                        ? "bg-white/10 opacity-40"
                        : "bg-white/30 backdrop-blur-xl shadow-lg border border-white/30"
                    }
                  `}
                >
                  <h2 className="text-xl font-medium mb-3 text-center px-4">
                    {item}
                  </h2>

                  {/* ÉTOILES */}
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <motion.button
                        key={star}
                        whileTap={{ scale: 1.3 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRate(item, star);
                        }}
                        className={`text-2xl ${
                          ratings[item] >= star
                            ? "text-yellow-400"
                            : dark
                            ? "text-white/30"
                            : "text-black/30"
                        }`}
                      >
                        ★
                      </motion.button>
                    ))}
                  </div>

                  {isLocked && (
                    <p className="mt-2 text-xs opacity-70">
                      Cliquer pour modifier
                    </p>
                  )}
                </motion.div>
              );
            })}
          </div>
        ))}
      </motion.div>

      {/* NAVBAR GLASS */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md">
        <div className={`
          backdrop-blur-2xl
          border border-white/20
          shadow-xl
          rounded-2xl
          px-2 py-2
          flex justify-between
          ${dark ? "bg-white/10" : "bg-white/40"}
        `}>
          {["Entrée", "Plat", "Dessert"].map((label, i) => (
            <button
              key={label}
              onClick={() => setIndex(i)}
              className="relative flex-1 py-2 text-center"
            >
              {index === i && (
                <motion.div
                  layoutId="bubble"
                  className={`absolute inset-0 rounded-xl ${
                    dark ? "bg-white/20" : "bg-white"
                  }`}
                />
              )}

              <span className="relative z-10 font-medium">
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}