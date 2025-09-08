import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import '../styling/Coach.css';

function fmtDuration(sec) {
    if (sec == null) return '—';
    const s = Math.max(0, Number(sec));
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const r = Math.floor(s % 60);
    return h > 0 ? `${h}:${String(m).padStart(2,'0')}:${String(r).padStart(2,'0')}` : `${m}:${String(r).padStart(2,'0')}`;
}

export default function CoachAthlete() {
    const { id } = useParams();
    const navigate = useNavigate();
    const token = useMemo(() => localStorage.getItem('token'), []);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState('');
    const [runs, setRuns] = useState([]);

    // detail modal
    const [detail, setDetail] = useState(null);
    const [detailErr, setDetailErr] = useState('');
    const [detailLoading, setDetailLoading] = useState(false);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                setLoading(true);
                setErr('');
                const res = await fetch(`http://localhost:8080//api/coach/athletes/${id}/runs`, {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (res.status === 401) {
                    localStorage.removeItem('token');
                    navigate('/login');
                    return;
                }
                if (res.status === 403) {
                    throw new Error('Geen toegang tot deze atleet.');
                }
                if (!res.ok) throw new Error('Kon runs niet ophalen.');
                const data = await res.json();
                if (!mounted) return;
                setRuns(Array.isArray(data) ? data : []);
            } catch (e) {
                if (!mounted) return;
                setErr(e.message || 'Er ging iets mis.');
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => (mounted = false);
    }, [id, token, navigate]);

    const openDetail = async (gpxId) => {
        try {
            setDetailLoading(true);
            setDetailErr('');
            setDetail(null);
            const res = await fetch(`http://localhost:8080/api/coach/athletes/${id}/runs/${gpxId}`, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });
            if (res.status === 401) {
                localStorage.removeItem('token');
                navigate('/login');
                return;
            }
            if (res.status === 404) {
                throw new Error('Run niet gevonden.');
            }
            if (!res.ok) throw new Error('Kon run-details niet ophalen.');
            const data = await res.json();
            setDetail(data);
        } catch (e) {
            setDetailErr(e.message || 'Er ging iets mis.');
        } finally {
            setDetailLoading(false);
        }
    };

    if (loading) return <div className="coach-wrap"><div className="loading">Runs laden…</div></div>;
    if (err) return <div className="coach-wrap"><div className="error-banner">{err}</div></div>;

    return (
        <div className="coach-wrap">
            <div className="card coach-card">
                <div className="coach-header">
                    <h2>Atleet · Runs</h2>
                    <Link to="/coach" className="btn-secondary">← Terug</Link>
                </div>

                {runs.length === 0 ? (
                    <div className="muted">Nog geen runs voor deze atleet.</div>
                ) : (
                    <div className="runs-table">
                        <div className="runs-head">
                            <div>Datum</div>
                            <div>Tijd</div>
                            <div>Bestand</div>
                            <div>Afstand</div>
                            <div>Duur</div>
                            <div>Pace</div>
                            <div></div>
                        </div>
                        {runs.map(r => (
                            <div className="runs-row" key={r.id}>
                                <div>{r.startDate ?? '—'}</div>
                                <div>{r.startTime ?? '—'}</div>
                                <div title={r.filename}>{r.filename ?? '—'}</div>
                                <div>{r.distanceKm != null ? `${r.distanceKm.toFixed(2)} km` : '—'}</div>
                                <div>{fmtDuration(r.durationSec)}</div>
                                <div>{r.pace ?? '—'}</div>
                                <div>
                                    <button className="btn-link" onClick={() => openDetail(r.id)}>Details</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Detail modal */}
            {(detailLoading || detail || detailErr) && (
                <div className="modal-backdrop" onClick={() => { setDetail(null); setDetailErr(''); }}>
                    <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Run-details</h3>
                            <button className="btn-icon" onClick={() => { setDetail(null); setDetailErr(''); }}>✕</button>
                        </div>
                        <div className="modal-body">
                            {detailLoading && <div className="loading">Details laden…</div>}
                            {detailErr && <div className="error-banner">{detailErr}</div>}
                            {detail && (
                                <div className="detail-grid">
                                    <div><span className="label">ID</span><span>{detail.id}</span></div>
                                    <div><span className="label">Bestand</span><span title={detail.filename}>{detail.filename ?? '—'}</span></div>
                                    <div><span className="label">Datum</span><span>{detail.startDate ?? '—'}</span></div>
                                    <div><span className="label">Tijd</span><span>{detail.startTime ?? '—'}</span></div>
                                    <div><span className="label">ISO</span><span>{detail.startIso ?? '—'}</span></div>
                                    <div><span className="label">Afstand</span><span>{detail.distanceKm != null ? `${detail.distanceKm.toFixed(2)} km` : '—'}</span></div>
                                    <div><span className="label">Duur</span><span>{fmtDuration(detail.durationSec)}</span></div>
                                    <div><span className="label">Pace</span><span>{detail.pace ?? '—'}</span></div>
                                    <div><span className="label">Meters</span><span>{detail.distanceMeters ?? '—'}</span></div>
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button className="btn-secondary" onClick={() => { setDetail(null); setDetailErr(''); }}>Sluiten</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
