import { useState, useEffect } from 'react';
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
                const [plantRes, terminalRes] = await Promise.all([
                    fetch('/api/gas-plants'),
                    fetch('/api/gas-terminals'),
                ]);

                if (plantRes.ok) {
                    const { plants } = await plantRes.json();
                    if (plants) setPlants(plants as GasPlant[]);
                }
                if (terminalRes.ok) {
                    const { terminals } = await terminalRes.json();
                    if (terminals) setTerminals(terminals as GasTerminal[]);
                }
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
        stats
    };
}
