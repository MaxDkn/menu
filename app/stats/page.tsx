"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { fetchStats, type ItemStats, type StatsData } from "@/lib/db";

const CATEGORIES = [
  { key: "starter", label: "Entrée",  icon: "🥗" },
  { key: "dish",    label: "Plat",    icon: "🍽️" },
  { key: "dessert", label: "Dessert", icon: "🍰" },
] as const;

function getTodayDate() {
  return new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function StarBar({ average }: { average: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => {
        const fill = Math.min(1, Math.max(0, average - (s - 1)));
        return (
          <div key={s} className="relative text-2xl leading-none">
            <span className="text-black/[0.08] dark:text-white/10">★</span>
            <span
              className="absolute inset-0 overflow-hidden text-amber-400"
              style={{ width: `${fill * 100}%` }}
            >
              ★
            </span>
          </div>
        );
      })}
    </div>
  );
}

function ItemRow({ item, rank }: { item: ItemStats; rank: number }) {
  const pct = (item.average / 5) * 100;

  return (
    <div className="rounded-2xl px-4 py-3 flex flex-col gap-2 bg-white border border-neutral-100 shadow-sm dark:bg-zinc-800 dark:border-zinc-700 dark:shadow-none">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold w-5 text-center text-zinc-400 dark:text-zinc-500">
            #{rank}
          </span>
          <span className="font-semibold text-sm">{item.name}</span>
        </div>
        <span className="text-xs text-zinc-400 dark:text-zinc-500">
          {item.count} vote{item.count !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="flex items-center gap-3 pl-7">
        <StarBar average={item.average} />
        <span className={`text-xs font-semibold tabular-nums ${item.average > 0 ? "text-amber-500" : "text-zinc-300 dark:text-zinc-600"}`}>
          {item.average > 0 ? item.average.toFixed(1) : "—"}
        </span>
      </div>

      <div className="ml-7 h-1.5 rounded-full overflow-hidden bg-neutral-100 dark:bg-zinc-700">
        <div
          className="h-full rounded-full bg-amber-400 transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function StatsPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"starter" | "dish" | "dessert">("starter");

  useEffect(() => {
    fetchStats().then((data) => {
      setStats(data);
      setLoading(false);
    });
  }, []);

  const activeItems: ItemStats[] = stats ? stats[activeTab] : [];

  return (
    <main className="min-h-[100dvh] w-screen flex flex-col bg-neutral-50 text-zinc-900 dark:bg-zinc-900 dark:text-white">
      <div className="pt-12 pb-4 px-6 flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
            Statistiques
          </p>
          <h1 className="text-xl font-bold capitalize mt-1">{getTodayDate()}</h1>
          {stats && (
            <p className="text-sm mt-0.5 text-zinc-500 dark:text-zinc-400">
              {stats.totalVoters} votant{stats.totalVoters !== 1 ? "s" : ""} aujourd'hui
            </p>
          )}
        </div>
        <Link
          href="/"
          className="mt-1 text-sm font-medium px-3 py-1.5 rounded-xl transition-colors bg-white text-zinc-600 border border-neutral-200 hover:bg-neutral-100 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700 dark:hover:bg-zinc-700"
        >
          ← Menu
        </Link>
      </div>

      <div className="px-6 mb-4">
        <div className="flex rounded-2xl p-1.5 gap-1 bg-neutral-100 dark:bg-zinc-800">
          {CATEGORIES.map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex-1 py-2 rounded-xl text-sm font-medium flex items-center justify-center gap-1.5 transition-all
                ${activeTab === key
                  ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-white"
                  : "text-zinc-400 dark:text-zinc-500"
                }
              `}
            >
              <span>{icon}</span>
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 px-4 pb-8">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <p className="text-sm text-zinc-400 dark:text-zinc-500">Chargement…</p>
          </div>
        ) : !stats ? (
          <div className="flex items-center justify-center h-40">
            <p className="text-sm text-zinc-400 dark:text-zinc-500">Aucun menu disponible aujourd'hui.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {activeItems.map((item, i) => (
              <ItemRow key={item.name} item={item} rank={i + 1} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
