import { db } from "./firebase";
import { ref, get, set, remove } from "firebase/database";

export type MenuData = {
  starter: string[];
  dish: string[];
  dessert: string[];
};

function todayKey(): string {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

/** Transforme un nom de plat en clé Firebase valide (sans accents ni caractères spéciaux). */
export function toItemKey(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]/g, "_")
    .toLowerCase();
}

/** Récupère ou génère un UUID anonyme persisté dans localStorage. */
export function getOrCreateUserId(): string {
  const KEY = "menu_uid";
  let uid = localStorage.getItem(KEY);
  if (!uid) {
    uid = typeof crypto?.randomUUID === "function"
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem(KEY, uid);
  }
  return uid;
}

function withTimeout<T>(promise: Promise<T>, ms = 5000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("timeout")), ms)
    ),
  ]);
}

/** Charge le menu du jour depuis Firebase. Retourne null si absent ou en cas d'erreur. */
export async function fetchMenu(): Promise<MenuData | null> {
  try {
    const snap = await withTimeout(get(ref(db, `menu/${todayKey()}`)));
    return snap.exists() ? (snap.val() as MenuData) : null;
  } catch {
    return null;
  }
}

/** Charge les votes existants de l'utilisateur pour aujourd'hui (clés = toItemKey). */
export async function fetchUserVotes(
  userId: string
): Promise<Record<string, number>> {
  try {
    const snap = await withTimeout(get(ref(db, `votes/${todayKey()}/${userId}`)));
    return snap.exists() ? (snap.val() as Record<string, number>) : {};
  } catch {
    return {};
  }
}

/** Enregistre ou met à jour un vote. */
export async function saveVote(
  userId: string,
  item: string,
  rating: number
): Promise<void> {
  await set(
    ref(db, `votes/${todayKey()}/${userId}/${toItemKey(item)}`),
    rating
  );
}

/** Supprime un vote (quand l'utilisateur reclique la même étoile). */
export async function deleteVote(userId: string, item: string): Promise<void> {
  await remove(ref(db, `votes/${todayKey()}/${userId}/${toItemKey(item)}`));
}

export type ItemStats = {
  name: string;
  average: number;
  count: number;
};

export type StatsData = {
  starter: ItemStats[];
  dish: ItemStats[];
  dessert: ItemStats[];
  totalVoters: number;
};

/** Agrège tous les votes du jour pour produire les statistiques par plat. */
export async function fetchStats(): Promise<StatsData | null> {
  try {
    const date = todayKey();
    const [menuSnap, votesSnap] = await Promise.all([
      withTimeout(get(ref(db, `menu/${date}`))),
      withTimeout(get(ref(db, `votes/${date}`))),
    ]);

    if (!menuSnap.exists()) return null;

    const menu = menuSnap.val() as MenuData;
    const allVotes = votesSnap.exists()
      ? (votesSnap.val() as Record<string, Record<string, number>>)
      : {};

    // Agrégation par itemKey
    const agg: Record<string, { total: number; count: number }> = {};
    for (const userVotes of Object.values(allVotes)) {
      for (const [key, rating] of Object.entries(userVotes)) {
        if (!agg[key]) agg[key] = { total: 0, count: 0 };
        agg[key].total += rating;
        agg[key].count += 1;
      }
    }

    const toStats = (items: string[]): ItemStats[] =>
      items
        .map((name) => {
          const { total = 0, count = 0 } = agg[toItemKey(name)] ?? {};
          return { name, average: count > 0 ? total / count : 0, count };
        })
        .sort((a, b) => b.average - a.average || b.count - a.count);

    return {
      starter: toStats(menu.starter),
      dish: toStats(menu.dish),
      dessert: toStats(menu.dessert),
      totalVoters: Object.keys(allVotes).length,
    };
  } catch {
    return null;
  }
}
