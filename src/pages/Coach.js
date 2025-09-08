import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styling/Coach.css';

export default function Coach() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState('');
    const [athletes, setAthletes] = useState([]);
    const [q, setQ] = useState('');

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                setLoading(true);
                setErr('');
                const res = await fetch('http://localhost:8080/api/coach/athletes', {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });
                if (res.status === 401) {
                    localStorage.removeItem('token');
                    navigate('/login');
                    return;
                }
                if (!res.ok) throw new Error('Kon atleten niet ophalen');
                const data = await res.json();
                if (!mounted) return;
                setAthletes(Array.isArray(data) ? data : []);
            } catch (e) {
                if (!mounted) return;
                setErr(e.message || 'Er ging iets mis.');
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => (mounted = false);
    }, [navigate]);

    const filtered = athletes.filter(a =>
        !q ? true : (a.email || '').toLowerCase().includes(q.toLowerCase())
    );

    if (loading) return <div className="coach-wrap"><div className="loading">Atleten laden…</div></div>;
    if (err) return <div className="coach-wrap"><div className="error-banner">{err}</div></div>;

    return (
        <div className="coach-wrap">
            <div className="card coach-card">
                <div className="coach-header">
                    <h2>Coach · Atleten</h2>
                    <input
                        type="search"
                        placeholder="Zoek op e-mail…"
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        className="coach-search"
                    />
                </div>

                <div className="coach-list">
                    {filtered.length === 0 ? (
                        <div className="muted">Geen atleten gevonden.</div>
                    ) : (
                        filtered.map(a => (
                            <button
                                key={a.id}
                                className="coach-row"
                                onClick={() => navigate(`/coach/athletes/${a.id}`)}
                                title={a.email}
                            >
                                <div className="coach-row-main">
                                    <div className="coach-row-title">{a.email}</div>
                                    <div className="coach-row-sub">ID: {a.id}</div>
                                </div>
                                <div className="coach-row-cta">Bekijken →</div>
                            </button>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
