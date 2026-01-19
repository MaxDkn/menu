"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import {motion, MotionValue, PanInfo, useMotionValue, useTransform} from "framer-motion";

const DATABASE_URL = "https://commission-menu-default-rtdb.europe-west1.firebasedatabase.app";

type Vote = "😍" | "🙂" | "😐" | "🙁";
type Category = "starter" | "dish" | "dessert";

interface MenuData {
    starter: string[];
    dish: string[];
    dessert: string[];
}

interface FirebaseVotes {
    like: number;
    dislike: number;
    bof: number;
    excellent: number;
}

const voteMap: Record<Vote, keyof FirebaseVotes> = {
    "😍": "excellent",
    "🙂": "like",
    "😐": "bof",
    "🙁": "dislike",
};

function getTodayKey() {
    const d = new Date();
    return d.toLocaleDateString("fr-FR").replaceAll("/", "-");
}

function hasVotedToday(): boolean {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(`voted-${getTodayKey()}`) === "true";
}

function markVotedToday() {
    if (typeof window === "undefined") return;
    localStorage.setItem(`voted-${getTodayKey()}`, "true");
}

async function fetchMenu(): Promise<MenuData> {
    const dateKey = getTodayKey();
    const cacheKey = `menu-${dateKey}`;

    const cached = localStorage.getItem(cacheKey);
    if (cached) {
        return JSON.parse(cached);
    }

    const res = await fetch(
        `${DATABASE_URL}/${dateKey}.json`
    );

    if (!res.ok) {
        throw new Error("Erreur lors du chargement du menu");
    }

    const data = await res.json();
    localStorage.setItem(cacheKey, JSON.stringify(data));

    return data;
}

async function sendVote(category: Category, emoji: Vote) {
    const dateKey = getTodayKey();
    const voteKey = voteMap[emoji];

    await fetch(
        `${DATABASE_URL}/${dateKey}/data/${category}/${voteKey}.json`,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                ".sv": { increment: 1 },
            }),
        }
    );
}

function EmojiBalloons({ emoji }: { emoji: string }) {
    const balloons = Array.from({ length: 24 });

    return (
        <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden">
            {balloons.map((_, i) => {
                // eslint-disable-next-line react-hooks/purity
                const size = 32 + Math.random() * 32;
                // eslint-disable-next-line react-hooks/purity
                const xStart = Math.random() * window.innerWidth;
                // eslint-disable-next-line react-hooks/purity
                const sway = Math.random() * 80 - 40;
                // eslint-disable-next-line react-hooks/purity
                const duration = 0.75 + Math.random() * 2;

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

function EdgeIndicator({emoji, label, opacity, position}: {
    emoji: string;
    label: string;
    opacity: MotionValue<number>;
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

function DraggableCard({children, onVote}: {
    children: React.ReactNode;
    onVote: (emoji: Vote) => void;
}) {
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const rotate = useTransform(x, [-200, 200], [-10, 10]);

    const rightOpacity = useTransform(x, [20, 80], [0, 1]);
    const leftOpacity = useTransform(x, [-80, -20], [1, 0]);
    const topOpacity = useTransform(y, [-80, -20], [1, 0]);
    const bottomOpacity = useTransform(y, [20, 80], [0, 1]);

    const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        const { x, y } = info.offset;
        const threshold = 120;

        if (x > threshold) onVote("😍");
        else if (x < -threshold) onVote("🙁");
        else if (y < -threshold) onVote("🙂");
        else if (y > threshold) onVote("😐");
    };

    return (
        <>
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

function VotePage() {
    const [menu, setMenu] = useState<MenuData | null>(null);
    const [loading, setLoading] = useState(true);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [reaction, setReaction] = useState<Vote | null>(null);

    useEffect(() => {
        fetchMenu()
            .then(setMenu)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <main className="h-screen w-screen bg-[#FBCE9E] flex items-center justify-center">
                <p className="text-xl text-[#1C5588] animate-pulse">
                    Chargement du menu...
                </p>
            </main>
        );
    }

    if (!menu) {
        return (
            <main className="h-screen w-screen bg-[#FBCE9E] flex items-center justify-center">
                <p className="text-xl text-red-600">
                    Impossible de charger le menu
                </p>
            </main>
        );
    }

    const cards = [
        { title: "Entrée", items: menu.starter, category: "starter" as Category },
        { title: "Plat", items: menu.dish, category: "dish" as Category },
        { title: "Dessert", items: menu.dessert, category: "dessert" as Category },
    ];



    const currentCard = cards[currentIndex];

    const handleVote = async (emoji: Vote) => {
        if (hasVotedToday()) return;

        const card = cards[currentIndex];

        await sendVote(card.category, emoji);

        setReaction(emoji);
        setTimeout(() => setReaction(null), 1200);

        if (currentIndex === cards.length - 1) {
            markVotedToday();
            setTimeout(() => {
                window.location.reload();
            }, 1200);
        } else {
            setCurrentIndex((prev) => prev + 1);
        }


    };


    const goBack = () => {
        if (currentIndex > 0) {
            setCurrentIndex((prev) => prev - 1);
        }
    };

    return (
        <main className="h-screen w-screen bg-[#FBCE9E] flex items-center justify-center px-4">
            {reaction && <EmojiBalloons emoji={reaction} />}

            <div className="relative w-full max-w-sm flex flex-col items-center gap-6">
                <button
                    onClick={goBack}
                    disabled={currentIndex === 0}
                    className={`absolute top-0 left-0 p-2 rounded-full shadow-md transition
                        ${
                        currentIndex === 0
                            ? "bg-white/10 text-[#1C5588]/30 cursor-not-allowed"
                            : "bg-white/20 text-[#1C5588]/90 hover:scale-110"
                    }`}
                >
                    <ArrowLeft size={24} strokeWidth={2.5} />
                </button>

                <h2 className="text-xl font-semibold text-[#1C5588]">
                    {currentCard.title}
                </h2>

                <DraggableCard onVote={handleVote}>
                    <div className="h-40 bg-gray-200 rounded-2xl mb-4 flex items-center justify-center text-gray-400">
                        Image
                    </div>

                    <ul className="flex-1 text-center space-y-2 text-[#1C5588] font-medium">
                        {currentCard.items.map((item) => (
                            <li key={item}>– {item}</li>
                        ))}
                    </ul>
                </DraggableCard>

                <div className="w-full flex justify-between px-2">
                    {["🙁", "😐", "🙂", "😍"].map((emoji) => (
                        <button
                            key={emoji}
                            onClick={() => handleVote(emoji as Vote)}
                            className="w-14 h-14 rounded-full bg-[#00BDC8]/40 text-3xl shadow-lg hover:scale-110 transition"
                        >
                            {emoji}
                        </button>
                    ))}
                </div>
            </div>
        </main>
    );
}

export default function Page() {
    const [started, setStarted] = useState(false);

    if (hasVotedToday()) {
        return (
            <main className="h-screen w-screen bg-[#FBCE9E] flex items-center justify-center px-6">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white rounded-3xl shadow-xl p-8 text-center"
                >
                    <h2 className="text-2xl font-semibold text-[#1C5588] mb-4">
                        Merci de votre avis 🙏
                    </h2>
                    <p className="text-[#1C5588]/80 text-lg">
                        N&apos;hésitez pas à revenir demain pour noter le prochain repas !
                    </p>
                </motion.div>
            </main>
        );
    }

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