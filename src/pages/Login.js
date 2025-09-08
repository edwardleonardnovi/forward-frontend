import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import '../styling/Login.css';

function Login() {
    const { login } = useContext(AuthContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (loading) return;
        setError('');
        setLoading(true);

        const ok = await login(email.trim(), password);
        if (ok) {
            navigate('/home');
        } else {
            setError('Ongeldige gebruikersnaam of wachtwoord.');
            setTimeout(() => setError(''), 3000);
        }

        setLoading(false);
    };

    return (
        <div className="login-container">
            <form onSubmit={handleSubmit} className="form-container">
                <h2 className="login-title">Inloggen</h2>

                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="E-mail"
                    className="login-input"
                    autoComplete="username"
                    required
                />

                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Wachtwoord"
                    className="login-input"
                    autoComplete="current-password"
                    required
                />

                <button type="submit" className="login-button" disabled={loading}>
                    {loading ? 'Bezig…' : 'Login'}
                </button>

                <div className="forgot-password">Wachtwoord vergeten?</div>

                <div className={`error-message ${error ? 'visible' : ''}`}>
                    {error || ' '}
                </div>

                <p className="form-hint">
                    Nog geen account? <Link to="/register">Registreer hier</Link>
                </p>
            </form>
        </div>
    );
}

export default Login;
