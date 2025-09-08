import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styling/Register.css';

function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [showError, setShowError] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError("Wachtwoorden komen niet overeen");
            setShowError(true);
            return;
        }

        try {
            const response = await fetch('http://localhost:8080/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: name,
                    email: email,
                    password: password,
                    role: "USER"
                }),
            });

            if (response.ok) {
                setError('');
                setShowError(false);
                navigate('/login');
            } else {
                const data = await response.json();
                setError(data.message || "Registratie mislukt");
                setShowError(true);
            }
        } catch (err) {
            console.error("Registratiefout:", err);
            setError("Er is iets misgegaan bij het registreren");
            setShowError(true);
        }
    };

    useEffect(() => {
        if (showError) {
            const timer = setTimeout(() => setShowError(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [showError]);

    return (
        <div className="register-container">
            <form onSubmit={handleSubmit} className="form-container">
                <h2 className="register-title">Account aanmaken</h2>

                <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Naam"
                    className="register-input"
                />

                <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Email"
                    className="register-input"
                />

                <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Wachtwoord"
                    className="register-input"
                />

                <input
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Herhaal wachtwoord"
                    className="register-input"
                />

                <button type="submit" className="register-button">
                    Aanmelden
                </button>

                <div className={`error-message ${showError ? 'visible' : ''}`}>
                    {error}
                </div>

                <p className="form-hint">
                    Al een account? <Link to="/login">Log in</Link>
                </p>
            </form>
        </div>
    );
}

export default Register;
