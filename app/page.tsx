"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button, Card, CardContent } from "@/components/ui";

// -----------------------------
// Données MOCK (JSON en dur)
// -----------------------------
const menu = [
  {
    id: "entree",
    title: "Entrée",
    image: "/entree.jpg",
    items: ["Salade de thon", "Tomates séchées", "Œuf dur"],
  },
  {
    id: "plat",
    title: "Plat",
    image: "/plat.jpg",
    items: ["Poulet rôti", "Pommes de terre", "Sauce moutarde"],
  },
  {
    id: "dessert",
    title: "Dessert",
    image: "/dessert.jpg",
    items: ["Yaourt", "Pomme", "Biscuit"],
  },
];

const votes = [
  { key: "adore", label: "😍" },
  { key: "aime_bien", label: "🙂" },
  { key: "sans_plus", label: "😐" },
  { key: "naime_pas", label: "🙁" },
];

export default function Page() {
  const [step, setStep] = useState<"start" | "cards" | "done">("start");
  const [index, setIndex] = useState(0);

  const current = menu[index];

  function next() {
    if (index + 1 >= menu.length) setStep("done");
    else setIndex(index + 1);
  }

  return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        {step === "start" && (
            <div
                className="text-center cursor-pointer"
                onClick={() => setStep("cards")}
            >
              <h1 className="text-3xl font-bold">Que pensez-vous du menu aujourd’hui ?</h1>
              <p className="mt-4 text-gray-500">Cliquez n’importe où pour commencer</p>
            </div>
        )}

        {step === "cards" && current && (
            <AnimatePresence>
              <motion.div
                  key={current.id}
                  className="w-full max-w-sm"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
              >
                <h2 className="text-xl font-bold mb-2 text-center">{current.title}</h2>

                <motion.div
                    drag
                    dragConstraints={{ top: 0, bottom: 0, left: 0, right: 0 }}
                    onDragEnd={(_, info) => {
                      if (Math.abs(info.offset.x) > 120 || Math.abs(info.offset.y) > 120) {
                        next();
                      }
                    }}
                >
                  <Card className="rounded-2xl shadow-xl">
                    <CardContent className="p-4">
                      <div className="h-40 bg-gray-200 rounded-xl mb-4 flex items-center justify-center text-gray-400">
                        Photo
                      </div>

                      <ul className="text-center space-y-1">
                        {current.items.map((item) => (
                            <li key={item}>– {item}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>

                <div className="flex justify-between mt-4">
                  {votes.map((v) => (
                      <Button
                          key={v.key}
                          variant="outline"
                          className="text-xl"
                          onClick={next}
                      >
                        {v.label}
                      </Button>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
        )}

        {step === "done" && (
            <div className="text-center">
              <h2 className="text-2xl font-bold">Merci pour votre avis !</h2>
              <p className="mt-2 text-gray-500">Votre réponse a bien été enregistrée.</p>
            </div>
        )}
      </main>
  );
}
