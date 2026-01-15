import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { GasPlant } from '@/types/gasPlant';
import type { GasTerminal } from '@/types/gasTerminal';

export interface GasDataFilters {
    showPlants: boolean;
    showTerminals: boolean;
    plantType: '복합발전' | '열병합발전' | 'all';
    terminalCategory: '가스공사' | '민간' | 'all';
    status: '운영' | '건설' | '계획' | 'all';
}

export function useGasData() {
    const [plants, setPlants] = useState<GasPlant[]>([]);
    const [terminals, setTerminals] = useState<GasTerminal[]>([]);
    const [loading, setLoading] = useState(true);
    const [news, setNews] = useState<any[]>([]);

    const [filters, setFilters] = useState<GasDataFilters>({
        showPlants: true,
        showTerminals: true,
        plantType: 'all',
        terminalCategory: 'all',
        status: 'all',
    });

    useEffect(() => {
        async function loadData() {
            try {
                if (!supabase) {
                    setLoading(false);
                    return;
                }

                const [plantRes, terminalRes, newsRes] = await Promise.all([
                    supabase.from('gas_plants').select('*').order('plant_name'),
                    supabase.from('gas_terminals').select('*').order('terminal_name'),
                    supabase.from('articles').select('*').eq('status', 'approved').order('published_at', { ascending: false }).limit(10)
                ]);

                if (plantRes.data) setPlants(plantRes.data as GasPlant[]);
                if (terminalRes.data) setTerminals(terminalRes.data as GasTerminal[]);
                if (newsRes.data) setNews(newsRes.data);
            } catch (error) {
                console.error('Error loading data:', error);
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, []);

    const stats = {
        plants: {
            total: plants.length,
            totalCapacity: plants.reduce((sum, p) => sum + (p.capacity_mw || 0), 0),
        },
        terminals: {
            total: terminals.length,
            totalCapacity: terminals.reduce((sum, t) => sum + (t.capacity_kl || 0), 0),
        },
    };

    return {
        plants,
        terminals,
        loading,
        filters,
        setFilters,
        stats,
        news
    };
}
