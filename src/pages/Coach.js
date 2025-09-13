import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styling/Coach.css';
import { LogOut } from 'lucide-react';

export default function Coach() {
    const navigate = useNavigate();

    // lijst & zoek
    const [athletes, setAthletes] = useState([]);
    const [q, setQ] = useState('');

    // algemene status
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState('');

    // toevoegen-formulier
    const [addEmail, setAddEmail] = useState('');
    const [addBusy, setAddBusy] = useState(false);
    const [addMsg, setAddMsg] = useState('');

    const token = useMemo(() => localStorage.getItem('token'), []);

    // Helper: refetch alle atleten
    const refetchAthletes = async () => {
        const res = await fetch('http://localhost:8080/api/coach/athletes', {
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
        if (!res.ok) throw new Error('Kon atleten niet ophalen.');

        const data = await res.json();
        setAthletes(Array.isArray(data) ? data : []);
    };

    // Eerste load
    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                setLoading(true);
                setErr('');
                await refetchAthletes();
            } catch (e) {
                if (!mounted) return;
                setErr(e.message || 'Er ging iets mis.');
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => {
            mounted = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [navigate, token]);

    // Zoeken (client-side op e-mail)
    const filtered = useMemo(() => {
        const qq = (q || '').toLowerCase();
        return athletes.filter((a) =>
            !qq ? true : (a.email || '').toLowerCase().includes(qq)
        );
    }, [athletes, q]);

    // Toevoegen van atleet via e-mail
    async function handleAddAthlete(e) {
        e.preventDefault();
        if (!addEmail.trim()) return;

        try {
            setAddBusy(true);
            setAddMsg('');

            const res = await fetch('http://localhost:8080/api/coach/athletes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ email: addEmail.trim() }),
            });

            if (res.status === 401) {
                localStorage.removeItem('token');
                navigate('/login');
                return;
            }
            if (res.status === 403) throw new Error('Geen toestemming om atleten toe te voegen.');
            if (res.status === 404) throw new Error('Gebruiker niet gevonden.');
            if (!res.ok) {
                const t = await res.text().catch(() => '');
                throw new Error(t || 'Kon atleet niet toevoegen.');
            }

            // Probeer de response te lezen (kan ook 204 zijn)
            let created = null;
            try {
                created = await res.json();
            } catch (_) {
                // ignore
            }

            // Optimistisch toevoegen als hij nog niet bestaat; anders refetch
            if (created && created.id && !athletes.some((a) => a.id === created.id)) {
                setAthletes((prev) => [created, ...prev]);
            } else {
                await refetchAthletes();
            }

            setAddEmail('');
            setAddMsg('Atleet toegevoegd.');
        } catch (e) {
            setAddMsg(e.message || 'Er ging iets mis.');
        } finally {
            setAddBusy(false);
        }
    }

    // Terugknop (logout-achtig naar home)
    const handleBack = () => {
        navigate('/home');
    };

    if (loading) {
        return (
            <div className="coach-wrap">
                <div className="loading">Atleten laden…</div>
            </div>
        );
    }

    if (err) {
        return (
            <div className="coach-wrap">
                <div className="error-banner">{err}</div>
            </div>
        );
    }

    return (
        <div className="coach-wrap">
            <button onClick={handleBack} className="back-button">
                <LogOut className="w-4 h-4" />
                <span>Terug</span>
            </button>

            <div className="card coach-card">
                <div className="coach-header">
                    <h2>Coach · Atleten</h2>

                    {/* Atleet toevoegen */}
                    <form onSubmit={handleAddAthlete} className="coach-add">
                        <input
                            type="email"
                            placeholder="Atleet e-mail"
                            value={addEmail}
                            onChange={(e) => setAddEmail(e.target.value)}
                            className="coach-input"
                            required
                        />
                        <button className="btn-primary" disabled={addBusy}>
                            {addBusy ? 'Toevoegen…' : 'Toevoegen'}
                        </button>
                    </form>

                    {/* Zoeken */}
                    <input
                        type="search"
                        placeholder="Zoek op e-mail…"
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        className="coach-search"
                    />
                </div>

                {addMsg && (
                    <div className={/toegevoegd/i.test(addMsg) ? 'success-banner' : 'error-banner'}>
                        {addMsg}
                    </div>
                )}

                <div className="coach-list">
                    {filtered.length === 0 ? (
                        <div className="muted">Geen atleten gevonden.</div>
                    ) : (
                        filtered.map((a) => (
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
