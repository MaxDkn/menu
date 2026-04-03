"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Slider from "react-slick";
import Navbar from "./navbar";
import {
  fetchMenu,
  fetchUserVotes,
  saveVote,
  deleteVote,
  getOrCreateUserId,
  toItemKey,
  type MenuData,
} from "@/lib/db";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

type Category = "starter" | "dish" | "dessert";

const FALLBACK_MENU: MenuData = {
  starter: ["Salade de tomates", "Soupe de légumes", "Carottes râpées", "Betteraves"],
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

type MenuCardProps = {
  item: string;
  rating: number;
  voted: boolean;
  onRate: (value: number) => void;
};

function MenuCard({ item, rating, voted, onRate }: MenuCardProps) {
  return (
    <div className="w-full rounded-2xl px-3 py-4 flex flex-col gap-3 transition-all duration-200 bg-white border border-neutral-100 shadow-sm dark:bg-zinc-800 dark:border-zinc-700 dark:shadow-none">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-base">{item}</span>
        {voted && (
          <span className="text-xs font-semibold text-emerald-500 tracking-wide">
            ✓ Voté
          </span>
        )}
      </div>

      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => onRate(star)}
            className={`text-4xl leading-none transition-transform active:scale-90
              ${rating >= star ? "text-amber-400" : "text-black/10 dark:text-white/15"}
            `}
          >
            ★
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Page() {
  const [menu, setMenu] = useState<MenuData | null>(null);
  const [offline, setOffline] = useState(false);
  const [loading, setLoading] = useState(true);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [voted, setVoted] = useState<Record<string, boolean>>({});
  const [userId, setUserId] = useState("");
  const sliderRef = useRef<Slider>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    async function init() {
      try {
        const uid = getOrCreateUserId();
        setUserId(uid);

        const [menuData, existingVotes] = await Promise.all([
          fetchMenu(),
          fetchUserVotes(uid),
        ]);

        if (!menuData) {
          setMenu(FALLBACK_MENU);
          setOffline(true);
        } else {
          setMenu(menuData);
        }

        const initialRatings: Record<string, number> = {};
        const initialVoted: Record<string, boolean> = {};
        for (const [key, rating] of Object.entries(existingVotes)) {
          initialRatings[key] = rating;
          initialVoted[key] = true;
        }
        setRatings(initialRatings);
        setVoted(initialVoted);
      } catch (e) {
        console.error("Erreur init:", e);
        setMenu(FALLBACK_MENU);
        setOffline(true);
      } finally {
        setLoading(false);
      }
    }

    init();
  }, []);

  const handleRate = async (item: string, value: number) => {
    const key = toItemKey(item);
    const isSameStar = ratings[key] === value;

    setRatings((prev) => ({ ...prev, [key]: isSameStar ? 0 : value }));
    setVoted((prev) => ({ ...prev, [key]: !isSameStar }));

    if (!offline && userId) {
      if (isSameStar) {
        await deleteVote(userId, item);
      } else {
        await saveVote(userId, item, value);
      }
    }
  };

  const sliderSettings = {
    dots: false,
    infinite: false,
    speed: 400,
    slidesToShow: 1,
    slidesToScroll: 1,
    swipeToSlide: true,
    arrows: false,
    beforeChange: (_: number, next: number) => setCurrentIndex(next),
  };

  const activeMenu = menu ?? FALLBACK_MENU;

  return (
    <main className="h-[100dvh] w-screen flex flex-col bg-neutral-50 text-zinc-900 dark:bg-zinc-900 dark:text-white">
      <div className="pt-12 pb-3 px-6">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
            Menu du jour
          </p>
          <div className="flex items-center gap-2">
            {offline && (
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-neutral-200 text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400">
                ⚠ hors ligne
              </span>
            )}
            <Link
              href="/stats"
              className="text-xs px-2 py-0.5 rounded-full font-medium transition-colors bg-neutral-200 text-zinc-500 hover:bg-neutral-300 dark:bg-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-600"
            >
              Stats →
            </Link>
          </div>
        </div>
        <h1 className="text-xl font-bold capitalize mt-1">{getTodayDate()}</h1>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-zinc-400 dark:text-zinc-500">Chargement…</p>
        </div>
      ) : (
        <div className="flex-1 overflow-hidden px-5 pb-28 pt-2">
          <Slider ref={sliderRef} {...sliderSettings}>
            {categories.map((cat) => (
              <div key={cat} className="px-2">
                <div className="flex flex-col gap-3">
                  {activeMenu[cat].map((item) => {
                    const key = toItemKey(item);
                    return (
                      <MenuCard
                        key={item}
                        item={item}
                        rating={ratings[key] || 0}
                        voted={voted[key] || false}
                        onRate={(value) => handleRate(item, value)}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </Slider>
        </div>
      )}

      <Navbar sliderRef={sliderRef} currentIndex={currentIndex} />
    </main>
  );
}
