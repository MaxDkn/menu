"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { motion, useMotionValue, useTransform } from "framer-motion";

/* ---------------- DATA ---------------- */

const data = {
    starter: ["Tomate séché", "Carotte", "Betterave"],
    dish: ["Boulette vegan", "Boulette de viande riz"],
    desert: ["Beignet au nutella", "Beignet au framboise", "Éclair au chocolat"],
};

/* ---------------- EMOJI RAIN ---------------- */


function EmojiBalloons({ emoji }: { emoji: string }) {
    const balloons = Array.from({ length: 24 });

    return (
        <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden">
            {balloons.map((_, i) => {
                const size = 32 + Math.random() * 32;
                const xStart = Math.random() * window.innerWidth;
                const sway = Math.random() * 80 - 40;
                const duration = 2 + Math.random() * 2;

                return (
                    <motion.span
                        key={i}
                        initial={{
                            x: xStart,
                            y: window.innerHeight + 60,
                            scale: 0.8,
                            opacity: 0,
                        }}
                        animate={{
                            y: -120,
                            x: xStart + sway,
                            opacity: 1,
                        }}
                        transition={{
                            duration,
                            ease: "easeOut",
                        }}
                        className="absolute"
                        style={{ fontSize: size }}
                    >
                        {emoji}
                    </motion.span>
                );
            })}
        </div>
    );
}

/* ---------------- EDGE INDICATOR ---------------- */

function EdgeIndicator({
                           emoji,
                           label,
                           opacity,
                           position,
                       }: {
    emoji: string;
    label: string;
    opacity: any;
    position: string;
}) {
    return (
        <motion.div
            style={{ opacity }}
            className={`fixed ${position} z-40 pointer-events-none`}
        >
            <div className="bg-white/90 backdrop-blur px-4 py-2 rounded-2xl shadow-lg flex items-center gap-2 text-[#1C5588] font-semibold">
                <span className="text-2xl">{emoji}</span>
                <span>{label}</span>
            </div>
        </motion.div>
    );
}

/* ---------------- DRAGGABLE CARD ---------------- */

function DraggableCard({
                           children,
                           onVote,
                       }: {
    children: React.ReactNode;
    onVote: (emoji: string) => void;
}) {
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const rotate = useTransform(x, [-200, 200], [-10, 10]);

    // Apparition rapide des indicateurs
    const rightOpacity = useTransform(x, [20, 80], [0, 1]);
    const leftOpacity = useTransform(x, [-80, -20], [1, 0]);
    const topOpacity = useTransform(y, [-80, -20], [1, 0]);
    const bottomOpacity = useTransform(y, [20, 80], [0, 1]);

    const handleDragEnd = (_: any, info: any) => {
        const { x, y } = info.offset;
        const threshold = 120;

        if (x > threshold) onVote("😍");
        else if (x < -threshold) onVote("🙁");
        else if (y < -threshold) onVote("🙂");
        else if (y > threshold) onVote("😐");
    };

    return (
        <>
            {/* Indicateurs écran */}
            <EdgeIndicator
                emoji="😍"
                label="Excellent"
                opacity={rightOpacity}
                position="top-1/2 right-4 -translate-y-1/2"
            />
            <EdgeIndicator
                emoji="🙁"
                label="Pas bon"
                opacity={leftOpacity}
                position="top-1/2 left-4 -translate-y-1/2"
            />
            <EdgeIndicator
                emoji="🙂"
                label="Bien"
                opacity={topOpacity}
                position="top-6 left-1/2 -translate-x-1/2"
            />
            <EdgeIndicator
                emoji="😐"
                label="Bof"
                opacity={bottomOpacity}
                position="bottom-6 left-1/2 -translate-x-1/2"
            />

            {/* Carte */}
            <motion.div
                drag
                dragConstraints={{ top: 0, bottom: 0, left: 0, right: 0 }}
                style={{ x, y, rotate }}
                onDragEnd={handleDragEnd}
                whileTap={{ scale: 1.03 }}
                className="w-full bg-white rounded-3xl shadow-xl p-4 flex flex-col cursor-grab active:cursor-grabbing"
            >
                {children}
            </motion.div>
        </>
    );
}

/* ---------------- VOTE PAGE ---------------- */

function VotePage() {
    const [reaction, setReaction] = useState<string | null>(null);

    const triggerReaction = (emoji: string) => {
        setReaction(emoji);
        setTimeout(() => setReaction(null), 1600);
        console.log("Vote :", emoji);
    };

    return (
        <main className="h-screen w-screen bg-[#FBCE9E] flex items-center justify-center px-4">
            {reaction && <EmojiBalloons emoji={reaction} />}


            <div className="relative w-full max-w-sm flex flex-col items-center gap-6">
                <button
                    disabled
                    className="absolute top-0 left-0 p-2 rounded-full bg-white/20 text-[#1C5588]/90 shadow-md"
                >
                    <ArrowLeft size={24} strokeWidth={2.5} />
                </button>

                <h2 className="text-xl font-semibold text-[#1C5588]">
                    Entrée
                </h2>

                <DraggableCard onVote={triggerReaction}>
                    <div className="h-40 bg-gray-200 rounded-2xl mb-4 flex items-center justify-center text-gray-400">
                        Image
                    </div>

                    <ul className="flex-1 text-center space-y-2 text-[#1C5588] font-medium">
                        {data.starter.map((item) => (
                            <li key={item}>– {item}</li>
                        ))}
                    </ul>
                </DraggableCard>

                {/* Boutons emoji */}
                <div className="w-full flex justify-between px-2">
                    <button
                        onClick={() => triggerReaction("🙁")}
                        className="w-14 h-14 rounded-full bg-[#00BDC8]/40 text-3xl shadow-lg hover:scale-110 transition"
                    >
                        🙁
                    </button>
                    <button
                        onClick={() => triggerReaction("😐")}
                        className="w-14 h-14 rounded-full bg-[#00BDC8]/40 text-3xl shadow-lg hover:scale-110 transition"
                    >
                        😐
                    </button>
                    <button
                        onClick={() => triggerReaction("🙂")}
                        className="w-14 h-14 rounded-full bg-[#00BDC8]/40 text-3xl shadow-lg hover:scale-110 transition"
                    >
                        🙂
                    </button>
                    <button
                        onClick={() => triggerReaction("😍")}
                        className="w-14 h-14 rounded-full bg-[#00BDC8]/40 text-3xl shadow-lg hover:scale-110 transition"
                    >
                        😍
                    </button>
                </div>
            </div>
        </main>
    );
}

/* ---------------- START PAGE ---------------- */

export default function Page() {
    const [started, setStarted] = useState(false);

    if (started) return <VotePage />;

    return (
        <main
            className="h-screen w-screen bg-[#FBCE9E] relative cursor-pointer"
            onClick={() => setStarted(true)}
        >
            <div className="absolute inset-0 flex items-center justify-center -translate-y-12">
                <h1 className="text-3xl font-bold text-center text-[#1C5588]">
                    Que pensez-vous du repas d&apos;aujourd&apos;hui ?
                </h1>
            </div>

            <div className="absolute inset-0 flex items-center justify-center">
                <h2 className="text-2xl text-[#1C5588]/70 animate-pulse">
                    Cliquez pour commencer
                </h2>
            </div>
        </main>
    );
}
