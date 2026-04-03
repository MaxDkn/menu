/**
 * Pousse les menus définis dans menus.json vers Firebase Realtime Database.
 *
 * Usage :
 *   node scripts/update-menu.mjs          → pousse tous les menus de menus.json
 *   node scripts/update-menu.mjs 2026-04-03  → pousse uniquement cette date
 *
 * Nécessite FIREBASE_SECRET dans .env.local (secret de base de données Firebase).
 */

import { readFileSync } from "fs";
import { resolve } from "path";

// --- Charger .env.local -------------------------------------------------
try {
  const env = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
  for (const line of env.split("\n")) {
    const [key, ...rest] = line.split("=");
    if (key && rest.length) process.env[key.trim()] = rest.join("=").trim();
  }
} catch {
  // pas de .env.local, on continue
}

// --- Config -------------------------------------------------------------
const DATABASE_URL =
  "https://commission-menu-default-rtdb.europe-west1.firebasedatabase.app";

const secret = process.env.FIREBASE_SECRET;
if (!secret) {
  console.error("❌  FIREBASE_SECRET manquant dans .env.local");
  process.exit(1);
}

// --- Charger menus.json -------------------------------------------------
const menus = JSON.parse(
  readFileSync(resolve(process.cwd(), "scripts/menus.json"), "utf8")
);

// --- Filtrer par date si un argument est passé --------------------------
const filterDate = process.argv[2];
if (filterDate && !/^\d{4}-\d{2}-\d{2}$/.test(filterDate)) {
  console.error("❌  Format de date invalide, attendu : YYYY-MM-DD");
  process.exit(1);
}

const entries = Object.entries(menus).filter(
  ([date]) => !filterDate || date === filterDate
);

if (entries.length === 0) {
  console.error(`❌  Aucun menu trouvé${filterDate ? ` pour le ${filterDate}` : ""}`);
  process.exit(1);
}

// --- Envoi --------------------------------------------------------------
const LABELS = { starter: "Entrée", dish: "Plat", dessert: "Dessert" };

for (const [date, menu] of entries) {
  const url = `${DATABASE_URL}/menu/${date}.json?auth=${secret}`;
  const res = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(menu),
  });

  if (!res.ok) {
    console.error(`❌  Erreur Firebase pour le ${date} :`, await res.text());
    continue;
  }

  console.log(`✅  ${date}`);
  for (const [cat, items] of Object.entries(menu)) {
    console.log(`   ${LABELS[cat]} : ${items.join(", ")}`);
  }
}
