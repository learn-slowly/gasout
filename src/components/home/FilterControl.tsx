"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Filter, X, MapPin, Zap, Database } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { KOREAN_REGIONS } from "@/lib/regions";

interface FilterControlProps {
    showPlants: boolean;
    setShowPlants: (show: boolean) => void;
    showTerminals: boolean;
    setShowTerminals: (show: boolean) => void;
    plantTypeFilter: '복합발전' | '열병합발전' | 'all';
    setPlantTypeFilter: (type: '복합발전' | '열병합발전' | 'all') => void;
    terminalCategoryFilter: '가스공사' | '민간' | 'all';
    setTerminalCategoryFilter: (category: '가스공사' | '민간' | 'all') => void;
    statusFilter: '운영' | '건설' | '계획' | 'all';
    setStatusFilter: (status: '운영' | '건설' | '계획' | 'all') => void;
    regionFilter: string;
    setRegionFilter: (region: string) => void;
    regionStats?: Record<string, number>;
}

export default function FilterControl({
    showPlants,
    setShowPlants,
    showTerminals,
    setShowTerminals,
    plantTypeFilter,
    setPlantTypeFilter,
    terminalCategoryFilter,
    setTerminalCategoryFilter,
    statusFilter,
    setStatusFilter,
    regionFilter,
    setRegionFilter,
    regionStats,
}: FilterControlProps) {
    const [isOpen, setIsOpen] = useState(false);
    const selectedRegionLabel = regionFilter === 'all' ? null : KOREAN_REGIONS[regionFilter]?.label;

    return (
        <>
            {/* Filter Button + Region Badge */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="fixed bottom-6 right-6 z-50 md:top-6 md:right-6 md:bottom-auto flex items-center gap-2"
            >
                <AnimatePresence>
                    {selectedRegionLabel && !isOpen && (
                        <motion.div
                            initial={{ opacity: 0, x: 20, scale: 0.8 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 20, scale: 0.8 }}
                            className="bg-blue-500/90 backdrop-blur-sm text-white text-sm font-medium px-3 py-2 rounded-full shadow-lg border border-blue-400/30"
                        >
                            <span className="flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5" />
                                {selectedRegionLabel}
                            </span>
                        </motion.div>
                    )}
                </AnimatePresence>

                <Button
                    onClick={() => setIsOpen(!isOpen)}
                    className="h-12 w-12 rounded-full bg-slate-800/90 hover:bg-slate-700 text-white shadow-lg shadow-black/20 backdrop-blur-sm border border-white/10"
                    size="icon"
                >
                    {isOpen ? <X className="h-5 w-5" /> : <Filter className="h-5 w-5" />}
                </Button>
            </motion.div>

            {/* Filter Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="fixed bottom-20 right-6 w-[calc(100vw-3rem)] max-w-sm z-40 md:top-20 md:right-6 md:bottom-auto bg-slate-900/95 backdrop-blur-xl rounded-2xl p-5 border border-slate-700/50 shadow-2xl shadow-black/40"
                    >
                        <div className="space-y-5">
                            <div className="flex items-center justify-between pb-3 border-b border-slate-700/50">
                                <h3 className="font-semibold text-base text-white">필터</h3>
                                <span className="text-xs text-slate-400">지도 표시 옵션</span>
                            </div>

                            {/* Toggles */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/30">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-7 h-7 rounded-lg bg-blue-500/20 flex items-center justify-center">
                                            <Zap className="w-4 h-4 text-blue-400" />
                                        </div>
                                        <Label htmlFor="show-plants" className="text-sm font-medium text-slate-200">발전소</Label>
                                    </div>
                                    <div
                                        className={`w-11 h-6 rounded-full p-1 cursor-pointer transition-colors ${showPlants ? 'bg-blue-500' : 'bg-slate-600'}`}
                                        onClick={() => setShowPlants(!showPlants)}
                                    >
                                        <motion.div
                                            className="w-4 h-4 rounded-full bg-white shadow-sm"
                                            animate={{ x: showPlants ? 20 : 0 }}
                                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/30">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-7 h-7 rounded-lg bg-orange-500/20 flex items-center justify-center">
                                            <Database className="w-4 h-4 text-orange-400" />
                                        </div>
                                        <Label htmlFor="show-terminals" className="text-sm font-medium text-slate-200">LNG 터미널</Label>
                                    </div>
                                    <div
                                        className={`w-11 h-6 rounded-full p-1 cursor-pointer transition-colors ${showTerminals ? 'bg-orange-500' : 'bg-slate-600'}`}
                                        onClick={() => setShowTerminals(!showTerminals)}
                                    >
                                        <motion.div
                                            className="w-4 h-4 rounded-full bg-white shadow-sm"
                                            animate={{ x: showTerminals ? 20 : 0 }}
                                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Region Filter */}
                            <div>
                                <Label className="text-xs text-slate-400 mb-1.5 flex items-center gap-1.5">
                                    <MapPin className="w-3 h-3" />
                                    지역 선택
                                </Label>
                                <Select value={regionFilter} onValueChange={setRegionFilter}>
                                    <SelectTrigger className="w-full bg-slate-800/50 border-slate-700/50 text-slate-200 hover:bg-slate-800">
                                        <SelectValue placeholder="전국" />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-[300px] bg-slate-900 border-slate-700">
                                        <SelectItem value="all">전국</SelectItem>
                                        {Object.entries(KOREAN_REGIONS).map(([key, { label }]) => (
                                            <SelectItem key={key} value={key}>
                                                {label}
                                                {regionStats && regionStats[key] > 0 && (
                                                    <span className="ml-2 text-xs text-slate-400">
                                                        ({regionStats[key]})
                                                    </span>
                                                )}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Detail Filters */}
                            <div className="space-y-3 pt-1">
                                {showPlants && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                                        <Label className="text-xs text-slate-400 mb-1.5 block">발전 유형</Label>
                                        <Select value={plantTypeFilter} onValueChange={(v: any) => setPlantTypeFilter(v)}>
                                            <SelectTrigger className="w-full bg-slate-800/50 border-slate-700/50 text-slate-200 hover:bg-slate-800">
                                                <SelectValue placeholder="전체" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-slate-900 border-slate-700">
                                                <SelectItem value="all">전체</SelectItem>
                                                <SelectItem value="복합발전">복합발전</SelectItem>
                                                <SelectItem value="열병합발전">열병합발전</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </motion.div>
                                )}

                                {showTerminals && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                                        <Label className="text-xs text-slate-400 mb-1.5 block">터미널 분류</Label>
                                        <Select value={terminalCategoryFilter} onValueChange={(v: any) => setTerminalCategoryFilter(v)}>
                                            <SelectTrigger className="w-full bg-slate-800/50 border-slate-700/50 text-slate-200 hover:bg-slate-800">
                                                <SelectValue placeholder="전체" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-slate-900 border-slate-700">
                                                <SelectItem value="all">전체</SelectItem>
                                                <SelectItem value="가스공사">가스공사</SelectItem>
                                                <SelectItem value="민간">민간</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </motion.div>
                                )}

                                <div>
                                    <Label className="text-xs text-slate-400 mb-1.5 block">운영 상태</Label>
                                    <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
                                        <SelectTrigger className="w-full bg-slate-800/50 border-slate-700/50 text-slate-200 hover:bg-slate-800">
                                            <SelectValue placeholder="전체" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-900 border-slate-700">
                                            <SelectItem value="all">전체</SelectItem>
                                            <SelectItem value="운영">운영</SelectItem>
                                            <SelectItem value="건설">건설 중</SelectItem>
                                            <SelectItem value="계획">계획</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
