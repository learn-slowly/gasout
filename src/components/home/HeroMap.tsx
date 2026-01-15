"use client";

import dynamic from "next/dynamic";
import { useGasData } from "@/hooks/useGasData";
import StatsOverlay from "./StatsOverlay";

// Dynamic import for Leaflet map
const IntegratedGasMap = dynamic(() => import("@/components/gas/IntegratedGasMap"), {
    ssr: false,
    loading: () => <div className="w-full h-full bg-slate-950 animate-pulse" />,
});

export default function HeroMap() {
    const {
        loading,
        stats
    } = useGasData();

    return (
        <div className="relative w-full h-[calc(100vh-theme(spacing.20))] md:h-screen overflow-hidden">
            {/* Background Map */}
            <div className="absolute inset-0 z-0">
                <IntegratedGasMap
                    showPlants={true}
                    showTerminals={true}
                    plantTypeFilter="all"
                    terminalCategoryFilter="all"
                    statusFilter="all"
                    onPlantClick={(plant) => console.log(plant)}
                    onTerminalClick={(terminal) => console.log(terminal)}
                />
                {/* Gradient Overlay for integration with theme */}
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-background/20 pointer-events-none z-[400]" />
            </div>

            {/* Overlays */}
            <div className="absolute inset-0 z-10 pointer-events-none">
                <StatsOverlay stats={stats} isLoading={loading} />
            </div>
        </div>
    );
}
