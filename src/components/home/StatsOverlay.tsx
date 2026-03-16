"use client";

import { motion } from "framer-motion";
import { Zap, Database } from "lucide-react";
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
    regionLabel?: string | null;
}

const CountUp = ({ end, duration = 1.5 }: { end: number, duration?: number }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let startTime: number;
        let animationFrame: number;

        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            const percentage = Math.min(progress / (duration * 1000), 1);
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

export default function StatsOverlay({ stats, isLoading, regionLabel }: StatsOverlayProps) {
    if (isLoading) return null;

    return (
        <>
            {/* Desktop: 좌측 카드 */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="absolute top-24 left-6 z-10 hidden lg:flex flex-col gap-3 pointer-events-none"
            >
                {regionLabel && (
                    <motion.div
                        key={regionLabel}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-slate-900/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-slate-700/50 pointer-events-auto"
                    >
                        <span className="text-sm font-semibold text-white">{regionLabel}</span>
                    </motion.div>
                )}

                <div className="bg-slate-900/80 backdrop-blur-sm p-4 rounded-xl border-l-4 border-blue-500 min-w-[200px] pointer-events-auto border border-slate-700/50">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="p-2 rounded-lg bg-blue-500/20">
                            <Zap className="w-4 h-4 text-blue-400" />
                        </div>
                        <span className="text-sm text-slate-400 font-medium">발전소</span>
                    </div>
                    <div className="pl-1">
                        <div className="text-2xl font-bold tracking-tight text-white">
                            <CountUp end={stats.plants.total} /> <span className="text-sm font-normal text-slate-400">개소</span>
                        </div>
                        <div className="text-xs text-slate-400 mt-1">
                            총 용량 <span className="text-slate-200 font-semibold"><CountUp end={Math.round(stats.plants.totalCapacity)} /> MW</span>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-900/80 backdrop-blur-sm p-4 rounded-xl border-l-4 border-orange-500 min-w-[200px] pointer-events-auto border border-slate-700/50">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="p-2 rounded-lg bg-orange-500/20">
                            <Database className="w-4 h-4 text-orange-400" />
                        </div>
                        <span className="text-sm text-slate-400 font-medium">LNG 터미널</span>
                    </div>
                    <div className="pl-1">
                        <div className="text-2xl font-bold tracking-tight text-white">
                            <CountUp end={stats.terminals.total} /> <span className="text-sm font-normal text-slate-400">개소</span>
                        </div>
                        <div className="text-xs text-slate-400 mt-1">
                            저장 용량 <span className="text-slate-200 font-semibold"><CountUp end={Math.round(stats.terminals.totalCapacity)} /> kL</span>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Mobile: 상단 요약 바 */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="absolute top-20 left-3 right-3 z-10 flex lg:hidden pointer-events-none"
            >
                <div className="bg-slate-900/85 backdrop-blur-sm rounded-xl px-4 py-2.5 flex items-center gap-4 border border-slate-700/50 pointer-events-auto w-full">
                    {regionLabel && (
                        <span className="text-xs font-semibold text-blue-400 border-r border-slate-700 pr-3">{regionLabel}</span>
                    )}
                    <div className="flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-blue-400" />
                        <span className="text-sm font-bold text-white">{stats.plants.total}</span>
                        <span className="text-xs text-slate-400">발전소</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Database className="w-3.5 h-3.5 text-orange-400" />
                        <span className="text-sm font-bold text-white">{stats.terminals.total}</span>
                        <span className="text-xs text-slate-400">터미널</span>
                    </div>
                </div>
            </motion.div>
        </>
    );
}
