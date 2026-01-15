"use client";

import dynamic from "next/dynamic";
import { useGasData } from "@/hooks/useGasData"; // We will create this hook
import StatsOverlay from "./StatsOverlay";
import FilterControl from "./FilterControl";
import NewsFeed from "./NewsFeed";
import { useState } from "react";
import type { GasPlant } from "@/types/gasPlant";
import type { GasTerminal } from "@/types/gasTerminal";

// Dynamic import for Leaflet map
const IntegratedGasMap = dynamic(() => import("@/components/gas/IntegratedGasMap"), {
    ssr: false,
    loading: () => <div className="w-full h-full bg-slate-950 animate-pulse" />,
});

export default function HeroMap() {
    // We'll manage state here or lift it up. 
    // For now, let's duplicate some state logic or assume we will refactor page.tsx to use this.
    // Actually, let's make this component accept props or use a hook.
    // Using a hook is cleaner for the refactor.

    const {
        plants,
        terminals,
        loading,
        filters,
        setFilters,
        stats,
        news
    } = useGasData();

    return (
        <div className="relative w-full h-[calc(100vh-theme(spacing.20))] md:h-screen overflow-hidden">
            {/* Background Map */}
            <div className="absolute inset-0 z-0">
                <IntegratedGasMap
                    showPlants={filters.showPlants}
                    showTerminals={filters.showTerminals}
                    plantTypeFilter={filters.plantType}
                    terminalCategoryFilter={filters.terminalCategory}
                    statusFilter={filters.status}
                    onPlantClick={(plant) => console.log(plant)}
                    onTerminalClick={(terminal) => console.log(terminal)}
                />
                {/* Gradient Overlay for integration with theme */}
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-background/20 pointer-events-none z-[400]" />
            </div>

            {/* Overlays */}
            <div className="absolute inset-0 z-10 pointer-events-none">
                <StatsOverlay stats={stats} isLoading={loading} />
                <FilterControl
                    showPlants={filters.showPlants}
                    setShowPlants={(v) => setFilters(prev => ({ ...prev, showPlants: v }))}
                    showTerminals={filters.showTerminals}
                    setShowTerminals={(v) => setFilters(prev => ({ ...prev, showTerminals: v }))}
                    plantTypeFilter={filters.plantType}
                    setPlantTypeFilter={(v) => setFilters(prev => ({ ...prev, plantType: v }))}
                    terminalCategoryFilter={filters.terminalCategory}
                    setTerminalCategoryFilter={(v) => setFilters(prev => ({ ...prev, terminalCategory: v }))}
                    statusFilter={filters.status}
                    setStatusFilter={(v) => setFilters(prev => ({ ...prev, status: v }))}
                />
                <NewsFeed initialNews={news} />
            </div>
        </div>
    );
}
