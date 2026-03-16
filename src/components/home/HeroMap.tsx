"use client";

import dynamic from "next/dynamic";
import { useState, useMemo } from "react";
import { useGasData } from "@/hooks/useGasData";
import StatsOverlay from "./StatsOverlay";
import FilterControl from "./FilterControl";
import { extractRegion, KOREAN_REGIONS } from "@/lib/regions";

// Dynamic import for Leaflet map
const IntegratedGasMap = dynamic(() => import("@/components/gas/IntegratedGasMap"), {
    ssr: false,
    loading: () => <div className="w-full h-full bg-slate-950 animate-pulse" />,
});

export default function HeroMap() {
    const { plants, terminals, loading } = useGasData();

    // Filter state
    const [showPlants, setShowPlants] = useState(true);
    const [showTerminals, setShowTerminals] = useState(true);
    const [plantTypeFilter, setPlantTypeFilter] = useState<'복합발전' | '열병합발전' | 'all'>('all');
    const [terminalCategoryFilter, setTerminalCategoryFilter] = useState<'가스공사' | '민간' | 'all'>('all');
    const [statusFilter, setStatusFilter] = useState<'운영' | '건설' | '계획' | 'all'>('all');
    const [regionFilter, setRegionFilter] = useState<string>('all');

    // 지역별 시설 수 계산 (발전소 사이트 + 터미널) - 유닛이 아닌 사이트 기준
    const regionStats = useMemo(() => {
        const counts: Record<string, number> = {};
        // 발전소: plant_name 기준 unique 사이트만 카운트
        const seenPlants = new Set<string>();
        for (const plant of plants) {
            if (seenPlants.has(plant.plant_name)) continue;
            seenPlants.add(plant.plant_name);
            const region = extractRegion(plant.location);
            if (region) counts[region] = (counts[region] || 0) + 1;
        }
        for (const terminal of terminals) {
            const region = extractRegion(terminal.location);
            if (region) counts[region] = (counts[region] || 0) + 1;
        }
        return counts;
    }, [plants, terminals]);

    // 필터링된 통계 (발전소는 사이트 기준)
    const stats = useMemo(() => {
        const filteredPlants = plants.filter(p => {
            if (!showPlants) return false;
            const typeMatch = plantTypeFilter === 'all' || p.type === plantTypeFilter;
            const statusMatch = statusFilter === 'all' || p.status === statusFilter;
            const regionMatch = regionFilter === 'all' || extractRegion(p.location) === regionFilter;
            return typeMatch && statusMatch && regionMatch;
        });
        // plant_name 기준으로 사이트 수와 총 용량 계산
        const siteMap = new Map<string, number>();
        for (const p of filteredPlants) {
            siteMap.set(p.plant_name, (siteMap.get(p.plant_name) || 0) + (p.capacity_mw || 0));
        }
        const filteredTerminals = terminals.filter(t => {
            if (!showTerminals) return false;
            const categoryMatch = terminalCategoryFilter === 'all' || t.category === terminalCategoryFilter;
            const statusMatch = statusFilter === 'all' || t.status === statusFilter;
            const regionMatch = regionFilter === 'all' || extractRegion(t.location) === regionFilter;
            return categoryMatch && statusMatch && regionMatch;
        });
        return {
            plants: {
                total: siteMap.size,
                totalCapacity: Array.from(siteMap.values()).reduce((sum, cap) => sum + cap, 0),
            },
            terminals: {
                total: filteredTerminals.length,
                totalCapacity: filteredTerminals.reduce((sum, t) => sum + (t.capacity_kl || 0), 0),
            },
        };
    }, [plants, terminals, showPlants, showTerminals, plantTypeFilter, terminalCategoryFilter, statusFilter, regionFilter]);

    return (
        <div className="relative w-full h-[calc(100vh-theme(spacing.20))] md:h-screen overflow-hidden">
            {/* Background Map */}
            <div className="absolute inset-0 z-0">
                <IntegratedGasMap
                    showPlants={showPlants}
                    showTerminals={showTerminals}
                    plantTypeFilter={plantTypeFilter}
                    terminalCategoryFilter={terminalCategoryFilter}
                    statusFilter={statusFilter}
                    regionFilter={regionFilter}
                    onPlantClick={(plant) => console.log(plant)}
                    onTerminalClick={(terminal) => console.log(terminal)}
                />
                {/* Gradient Overlay for integration with theme */}
                <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent pointer-events-none z-[400]" />
            </div>

            {/* Overlays */}
            <div className="absolute inset-0 z-10 pointer-events-none">
                <StatsOverlay
                    stats={stats}
                    isLoading={loading}
                    regionLabel={regionFilter !== 'all' ? KOREAN_REGIONS[regionFilter]?.label : null}
                />
            </div>

            {/* Filter Control */}
            <FilterControl
                showPlants={showPlants}
                setShowPlants={setShowPlants}
                showTerminals={showTerminals}
                setShowTerminals={setShowTerminals}
                plantTypeFilter={plantTypeFilter}
                setPlantTypeFilter={setPlantTypeFilter}
                terminalCategoryFilter={terminalCategoryFilter}
                setTerminalCategoryFilter={setTerminalCategoryFilter}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                regionFilter={regionFilter}
                setRegionFilter={setRegionFilter}
                regionStats={regionStats}
            />
        </div>
    );
}
