"use client";

import { motion } from "framer-motion";
import { Newspaper } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface NewsFeedProps {
    initialNews?: any[];
}

export default function NewsFeed({ initialNews = [] }: NewsFeedProps) {
    const [news, setNews] = useState<any[]>(initialNews);
    const [activeIndex, setActiveIndex] = useState(0);

    // Auto scroll
    useEffect(() => {
        if (news.length <= 1) return;
        const interval = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % news.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [news.length]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="absolute bottom-6 left-6 right-20 z-10 hidden md:block pointer-events-none max-w-2xl"
        >
            <div className="glass-card rounded-full pl-2 pr-6 py-2 flex items-center gap-4 pointer-events-auto overflow-hidden">
                <div className="bg-destructive text-destructive-foreground px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap animate-pulse">
                    LIVE NEWS
                </div>

                <div className="h-6 relative flex-1 overflow-hidden">
                    {news.length > 0 ? (
                        <motion.div
                            key={activeIndex}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -20, opacity: 0 }}
                            className="absolute w-full truncate text-sm font-medium"
                        >
                            <span className="text-muted-foreground mr-2">[{news[activeIndex]?.location_type || 'General'}]</span>
                            {news[activeIndex]?.title}
                        </motion.div>
                    ) : (
                        <div className="text-xs text-muted-foreground flex items-center">
                            <span className="animate-spin mr-2">⏳</span> Waiting for updates...
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
