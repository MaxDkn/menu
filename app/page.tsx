"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";

const COLORS = ["#F88F52", "#FBCE9E", "#7ACFB0", "#00BDC8", "#1C5588"];

const data = {
    starter: ["Tomate séché", "Carotte", "Betterave"],
    dish: ["Boulette vegan", "Boulette de viande riz"],
    desert: ["Beignet au nutella", "Beignet au framboise", "Éclair au chocolat"],
};

interface CardProps {
    starter: string[];
    dish: string[];
    desert: string[]; // optionnel pour futur ajout d'image
}

function VotePage(data: CardProps) {
    return (
        <main className="h-screen w-screen bg-[#FBCE9E] flex items-center justify-center px-4">
            <div className="relative w-full max-w-sm">
                <button
                    disabled
                    className="absolute top-0 left-0 p-2 rounded-full bg-white/20 text-[#1C5588]/90 shadow-md hover:bg-white/30"
                >
                    <ArrowLeft size={24} strokeWidth={2.5} />
                </button>

                <h2 className="text-xl font-semibold text-[#1C5588] text-center mb-6">
                    Entrée
                </h2>

                <div className="bg-white rounded-3xl shadow-xl p-4 flex flex-col">
                    <div className="h-40 bg-gray-200 rounded-2xl mb-4 flex items-center justify-center text-gray-400">
                        Image
                    </div>

                    <ul className="flex-1 text-center space-y-2 text-[#1C5588] font-medium">
                        {data.starter.map((item) => (
                            <li key={item}>– {item}</li>
                        ))}
                    </ul>

                    <div className="flex justify-between mt-6 text-2xl">
                        <button>🙁</button>
                        <button>😐</button>
                        <button>🙂</button>
                        <button>😍</button>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default function Page() {
    const [started, setStarted] = useState(false);

    if (started) {
        return <VotePage starter={data.starter} dish={data.dish} desert={data.desert} />;
    }

    return (
        <main
            className="h-screen w-screen bg-[#FBCE9E] px-6 relative cursor-pointer"
            onClick={() => setStarted(true)}
        >
            <div className="absolute inset-0 flex items-center justify-center -translate-y-12">
                <h1 className="text-3xl font-bold text-center text-[#1C5588]">
                    Que pensez-vous du repas d&apos;aujourd&apos;hui&nbsp;?
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
