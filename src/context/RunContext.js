import React, { createContext, useContext, useEffect, useState } from 'react';

const RunContext = createContext();

function normalizeRun(r) {
    return {
        id: r.id,
        distanceKm: (r.distanceKm ?? r.distance ?? r.distance_m ?? r.distanceMeters ?? 0) / (r.distanceKm ? 1 : 1000), // pas evt. aan als je backend al km levert
        durationSec: r.durationSec ?? r.duration ?? r.duration_s ?? r.durationSeconds ?? 0,
        startIso: r.startIso ?? r.startTime ?? r.start_time ?? null,
        filename: r.filename ?? null,
        pace: r.pace ?? null, // optioneel
    };
}

export function RunProvider({ children }) {
    const [runs, setRuns] = useState([]);

    async function fetchRuns() {
        try {
            const res = await fetch('/api/runs', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (!res.ok) throw new Error('Fout bij ophalen runs');
            const data = await res.json();
            setRuns(data.map(normalizeRun));
        } catch (err) {
            console.error('Netwerkfout bij ophalen runs', err);
        }
    }

    function addRun(r) {
        setRuns(prev => [normalizeRun(r), ...prev]);
    }

    function removeRun(id) {
        setRuns(prev => prev.filter(x => x.id !== id));
    }

    useEffect(() => { fetchRuns(); }, []);

    return (
        <RunContext.Provider value={{ runs, setRuns, fetchRuns, addRun, removeRun }}>
            {children}
        </RunContext.Provider>
    );
}

export function useRuns() {
    return useContext(RunContext);
}
