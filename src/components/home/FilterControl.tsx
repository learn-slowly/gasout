"use client";

import { motion } from "framer-motion";
import { Filter, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch"; // We might need to ensure Switch exists or use custom toggle
import { Label } from "@/components/ui/label";

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
    setStatusFilter
}: FilterControlProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Mobile/Desktop Trigger Button */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="fixed bottom-6 right-6 z-50 md:top-6 md:right-6 md:bottom-auto"
            >
                <Button
                    onClick={() => setIsOpen(!isOpen)}
                    className="h-12 w-12 rounded-full bg-primary/90 hover:bg-primary text-primary-foreground shadow-lg shadow-primary/20 backdrop-blur-sm border border-white/10"
                    size="icon"
                >
                    {isOpen ? <X className="h-5 w-5" /> : <Filter className="h-5 w-5" />}
                </Button>
            </motion.div>

            {/* Filter Panel */}
            <motion.div
                initial={false}
                animate={isOpen ? { opacity: 1, scale: 1, display: "block" } : { opacity: 0, scale: 0.95, transitionEnd: { display: "none" } }}
                transition={{ duration: 0.2 }}
                className="fixed bottom-20 right-6 w-[calc(100vw-3rem)] max-w-sm z-40 md:top-20 md:right-6 md:bottom-auto glass-card rounded-2xl p-5 border border-white/10"
            >
                <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                        <h3 className="font-semibold text-lg text-foreground">Filters</h3>
                        <span className="text-xs text-muted-foreground">Map display options</span>
                    </div>

                    {/* Toggles */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="show-plants" className="text-sm font-medium">Power Plants</Label>
                            <div
                                className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${showPlants ? 'bg-primary' : 'bg-muted'}`}
                                onClick={() => setShowPlants(!showPlants)}
                            >
                                <motion.div
                                    className="w-4 h-4 rounded-full bg-white shadow-sm"
                                    animate={{ x: showPlants ? 24 : 0 }}
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <Label htmlFor="show-terminals" className="text-sm font-medium">LNG Terminals</Label>
                            <div
                                className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${showTerminals ? 'bg-secondary' : 'bg-muted'}`}
                                onClick={() => setShowTerminals(!showTerminals)}
                            >
                                <motion.div
                                    className="w-4 h-4 rounded-full bg-white shadow-sm"
                                    animate={{ x: showTerminals ? 24 : 0 }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Detailed Filters */}
                    <div className="space-y-4 pt-2">
                        {showPlants && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                                <Label className="text-xs text-muted-foreground mb-1.5 block">Plant Type</Label>
                                <Select value={plantTypeFilter} onValueChange={(v: any) => setPlantTypeFilter(v)}>
                                    <SelectTrigger className="w-full bg-background/50 border-white/10">
                                        <SelectValue placeholder="All Types" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Types</SelectItem>
                                        <SelectItem value="복합발전">복합발전 (Complex)</SelectItem>
                                        <SelectItem value="열병합발전">열병합발전 (Cogen)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </motion.div>
                        )}

                        {showTerminals && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                                <Label className="text-xs text-muted-foreground mb-1.5 block">Terminal Category</Label>
                                <Select value={terminalCategoryFilter} onValueChange={(v: any) => setTerminalCategoryFilter(v)}>
                                    <SelectTrigger className="w-full bg-background/50 border-white/10">
                                        <SelectValue placeholder="All Categories" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Categories</SelectItem>
                                        <SelectItem value="가스공사">KOGAS</SelectItem>
                                        <SelectItem value="민간">Private</SelectItem>
                                    </SelectContent>
                                </Select>
                            </motion.div>
                        )}

                        <div>
                            <Label className="text-xs text-muted-foreground mb-1.5 block">Operation Status</Label>
                            <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
                                <SelectTrigger className="w-full bg-background/50 border-white/10">
                                    <SelectValue placeholder="All Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="운영">Operating</SelectItem>
                                    <SelectItem value="건설">Under Construction</SelectItem>
                                    <SelectItem value="계획">Planned</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
            </motion.div>
        </>
    );
}
