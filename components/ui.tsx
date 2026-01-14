export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={`bg-white ${className}`}>
    {children}
    </div>
);
}


export function CardContent({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={className}>
            {children}
            </div>
    );
}

export function Button({
                           children,
                           onClick,
                           className = "",
                           variant = "default",
                       }: {
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
    variant?: "default" | "outline";
}) {
    const base = "px-4 py-2 rounded-full font-medium transition active:scale-95";
    const styles =
        variant === "outline"
            ? "border border-gray-300 bg-white hover:bg-gray-100"
            : "bg-black text-white hover:bg-gray-800";


    return (
        <button onClick={onClick} className={`${base} ${styles} ${className}`}>
    {children}
    </button>
);
}