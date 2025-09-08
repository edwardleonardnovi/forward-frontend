import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { AuthContext } from './AuthContext';

const RunContext = createContext();

function normalizeRun(r) {
    return {
        id: r.id,
        distanceKm:
            r.distanceKm != null
                ? r.distanceKm
                : (r.distance ?? r.distance_m ?? r.distanceMeters ?? 0) / 1000,
        durationSec: r.durationSec ?? r.duration ?? r.duration_s ?? r.durationSeconds ?? 0,
        startIso: r.startIso ?? r.startTime ?? r.start_time ?? null,
        filename: r.filename ?? null,
        pace: r.pace ?? null,
    };
}

export function RunProvider({ children }) {
    const { token, isAuthenticated, role } = useContext(AuthContext);
    const [runs, setRuns] = useState([]);

    const fetchRuns = useCallback(async () => {
        if (!token || role !== 'USER') { setRuns([]); return; }
        try {
            const res = await fetch('/api/runs', { headers: { Authorization: `Bearer ${token}` } });
            if (res.status === 401) throw new Error('Niet ingelogd');
            if (res.status === 403) { setRuns([]); return; }
            if (!res.ok) throw new Error('Fout bij ophalen runs');
            const data = await res.json();
            setRuns(Array.isArray(data) ? data.map(normalizeRun) : []);
        } catch (err) {
            console.error(`[RunProvider] fetchRuns error (role=${role})`, err);
        }
    }, [token, role]);

    function addRun(r) { setRuns(prev => [normalizeRun(r), ...prev]); }
    function removeRun(id) { setRuns(prev => prev.filter(x => x.id !== id)); }

    useEffect(() => {
        if (isAuthenticated && role === 'USER') fetchRuns();
        else setRuns([]);
    }, [isAuthenticated, role, fetchRuns]); // ✅ fetchRuns toegevoegd

    return (
        <RunContext.Provider value={{ runs, setRuns, fetchRuns, addRun, removeRun }}>
            {children}
        </RunContext.Provider>
    );
}

export function useRuns() { return useContext(RunContext); }
