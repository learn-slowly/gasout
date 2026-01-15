"use client";

import { motion } from "framer-motion";
import { Zap, Factory, Database } from "lucide-react";
import { useEffect, useState } from "react";

interface StatsOverlayProps {
    stats: {
        plants: {
            total: number;
            totalCapacity: number;
        };
        terminals: {
            total: number;
            totalCapacity: number;
        };
    };
    isLoading?: boolean;
}

const CountUp = ({ end, duration = 2 }: { end: number, duration?: number }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let startTime: number;
        let animationFrame: number;

        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            const percentage = Math.min(progress / (duration * 1000), 1);

            // Ease out quart
            const ease = 1 - Math.pow(1 - percentage, 4);

            setCount(Math.floor(ease * end));

            if (percentage < 1) {
                animationFrame = requestAnimationFrame(animate);
            }
        };

        animationFrame = requestAnimationFrame(animate);

        return () => cancelAnimationFrame(animationFrame);
    }, [end, duration]);

    return <>{count.toLocaleString()}</>;
};

export default function StatsOverlay({ stats, isLoading }: StatsOverlayProps) {
    if (isLoading) return null;

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="absolute top-24 left-6 z-10 hidden lg:flex flex-col gap-4 pointer-events-none"
        >
            <div className="glass-card p-4 rounded-xl border-l-4 border-primary min-w-[200px] pointer-events-auto">
                <div className="flex items-center gap-3 mb-1">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        <Zap className="w-5 h-5" />
                    </div>
                    <span className="text-sm text-muted-foreground font-medium">Power Plants</span>
                </div>
                <div className="pl-1">
                    <div className="text-2xl font-bold tracking-tight text-glow">
                        <CountUp end={stats.plants.total} /> <span className="text-sm font-normal text-muted-foreground">sites</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                        Total Cap: <span className="text-foreground font-semibold"><CountUp end={Math.round(stats.plants.totalCapacity)} /> MW</span>
                    </div>
                </div>
            </div>

            <div className="glass-card p-4 rounded-xl border-l-4 border-secondary min-w-[200px] pointer-events-auto">
                <div className="flex items-center gap-3 mb-1">
                    <div className="p-2 rounded-lg bg-secondary/10 text-secondary">
                        <Database className="w-5 h-5" />
                    </div>
                    <span className="text-sm text-muted-foreground font-medium">LNG Terminals</span>
                </div>
                <div className="pl-1">
                    <div className="text-2xl font-bold tracking-tight text-white/90">
                        <CountUp end={stats.terminals.total} /> <span className="text-sm font-normal text-muted-foreground">sites</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                        Storage: <span className="text-foreground font-semibold"><CountUp end={Math.round(stats.terminals.totalCapacity)} /> kL</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
