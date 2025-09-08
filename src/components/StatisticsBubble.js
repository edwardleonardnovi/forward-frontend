import React, { useMemo } from 'react';
import {
    LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import '../styling/StatisticsBubble.css';
import { useRuns } from "../context/RunContext";

function StatisticsBubble() {
    const { runs } = useRuns();

    // Totals
    const { totalDistance, totalDuration } = useMemo(() => {
        const td = runs.reduce((acc, r) => acc + (Number(r.distanceKm) || 0), 0);
        const tt = runs.reduce((acc, r) => acc + (Number(r.durationSec) || 0), 0);
        return { totalDistance: td, totalDuration: tt };
    }, [runs]);

    const averagePace = useMemo(() => {
        if (!totalDistance) return "-";
        const paceSec = totalDuration / totalDistance; // sec per km
        const min = Math.floor(paceSec / 60);
        const sec = Math.round(paceSec % 60);
        return `${min}:${String(sec).padStart(2, '0')} /km`;
    }, [totalDistance, totalDuration]);

    const formatDuration = (totalSeconds = 0) => {
        const t = Math.max(0, Number(totalSeconds) || 0);
        const hrs = Math.floor(t / 3600);
        const mins = Math.floor((t % 3600) / 60);
        const secs = t % 60;
        return `${hrs}hr ${mins}m ${secs}s`;
    };

    // Chart data: sorteer op tijd en filter runs zonder startIso of distance
    const chartData = useMemo(() => {
        return runs
            .filter(r => r.startIso && Number.isFinite(Number(r.distanceKm)))
            .map(r => ({
                ts: new Date(r.startIso).getTime(),
                date: new Date(r.startIso).toLocaleDateString('nl-NL', { day: '2-digit', month: 'short' }),
                distance: Number(r.distanceKm),
            }))
            .sort((a, b) => a.ts - b.ts);
    }, [runs]);

    return (
        <div className="bubble stats">
            <h3 className="stats-header">Statistieken</h3>

            <div className="stats-content">
                <div className="chart-container">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="distance" stroke="#20cfcf" strokeWidth={2} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div className="stats-summary">
                    <div className="stat-block">
                        <div className="stat-label">Totaal afstand</div>
                        <div className="stat-value">{totalDistance.toFixed(2)} km</div>
                    </div>
                    <div className="stat-block">
                        <div className="stat-label">Aantal runs</div>
                        <div className="stat-value">{runs.length}</div>
                    </div>
                </div>

                <div className="stats-summary">
                    <div className="stat-block">
                        <div className="stat-label">Gemiddelde pace</div>
                        <div className="stat-value">{averagePace}</div>
                    </div>
                    <div className="stat-block">
                        <div className="stat-label">Totale tijd</div>
                        <div className="stat-value">{formatDuration(totalDuration)}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default StatisticsBubble;
