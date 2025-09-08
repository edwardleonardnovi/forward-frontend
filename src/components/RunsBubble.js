import React from 'react';
import { MapPin, Timer, Activity, MessageSquare, Edit, Trash } from 'lucide-react';
import '../styling/RunsBubble.css';
import { useRuns } from "../context/RunContext";
import { RunMap } from "./RunMap";

function RunsBubble() {
    const { runs, setRuns, removeRun } = useRuns();

    function formatDuration(totalSeconds = 0) {
        const t = Math.max(0, Number(totalSeconds) || 0);
        const hrs = Math.floor(t / 3600);
        const mins = Math.floor((t % 3600) / 60);
        const secs = t % 60;
        return `${hrs}hr ${mins}m ${secs}s`;
    }

    const handleComment = (run) => {
        alert(`Commentaar voor run: ${run.title || 'Run'}`);
    };

    const handleEdit = (run) => {
        alert(`Bewerken van run: ${run.title || 'Run'}`);
    };

    const handleDelete = async (run) => {
        if (!window.confirm(`Weet je zeker dat je deze run wilt verwijderen?`)) return;
        try {
            const res = await fetch(`/api/runs/${run.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (res.ok) {
                if (typeof removeRun === 'function') removeRun(run.id);
                else setRuns?.(prev => prev.filter(r => r.id !== run.id));
            } else {
                alert("Verwijderen mislukt.");
            }
        } catch {
            alert("Netwerkfout bij verwijderen.");
        }
    };

    return (
        <div className="bubble runs">
            <h3>Mijn Runs</h3>

            {runs.length === 0 ? (
                <p className="text-muted">Geen sessies gevonden.</p>
            ) : (
                <div className="run-meta-list">
                    {runs.map((run) => {
                        const dateTime = run.startIso ? new Date(run.startIso) : null;

                        const defaultTitle = (() => {
                            if (!dateTime) return "Run";
                            const hour = dateTime.getHours();
                            if (hour < 12) return "Ochtendrun";
                            if (hour < 18) return "Middagrun";
                            return "Avondrun";
                        })();

                        const displayTitle = run.title || defaultTitle;
                        const displayDate = dateTime
                            ? dateTime.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
                            : 'Geen tijd';
                        const displayTime = dateTime
                            ? `om ${dateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                            : '';

                        const distanceKm = Number(run.distanceKm);
                        const pace = run.pace ?? '—';

                        return (
                            <div key={run.id} className="run-row">
                                <div className="run-header-full">
                                    <div className="run-title">
                                        <div className="run-header">{displayTitle}</div>
                                        <div className="run-subheader">{displayDate} {displayTime}</div>
                                    </div>

                                    <div className="run-map">
                                        <RunMap runId={run.id} />
                                    </div>

                                    <div className="run-actions">
                                        <button title="Comment" onClick={() => handleComment(run)}>
                                            <MessageSquare size={16} />
                                        </button>
                                        <button title="Edit" onClick={() => handleEdit(run)}>
                                            <Edit size={16} />
                                        </button>
                                        <button title="Delete" onClick={() => handleDelete(run)}>
                                            <Trash size={16} />
                                        </button>
                                    </div>
                                </div>

                                <div className="run-row-data">
                                    <div className="run-label-block">
                                        <div className="label-row">
                                            <MapPin size={14} />
                                            <span>Distance</span>
                                        </div>
                                        <div className="label-value">
                                            {Number.isFinite(distanceKm) ? distanceKm.toFixed(2) : '0.00'} km
                                        </div>
                                    </div>

                                    <div className="run-label-block">
                                        <div className="label-row">
                                            <Activity size={14} />
                                            <span>Pace</span>
                                        </div>
                                        <div className="label-value">{pace}</div>
                                    </div>

                                    <div className="run-label-block">
                                        <div className="label-row">
                                            <Timer size={14} />
                                            <span>Time</span>
                                        </div>
                                        <div className="label-value-time">{formatDuration(run.durationSec)}</div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default RunsBubble;
