import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import {Link, useNavigate} from 'react-router-dom';
import '../styling/Login.css';

function Login() {
    const { login } = useContext(AuthContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = await login(email, password);
        if (success) {
            setError('');
            navigate('/home');
        } else {
            setError('Ongeldige gebruikersnaam of wachtwoord.');
            setTimeout(() => setError(''), 3000);
        }
    };

    return (
        <div className="login-container">
            <form onSubmit={handleSubmit} className="form-container">
                <h2 className="login-title">Inloggen</h2>

                <input
                    type="text"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Email"
                    className="login-input"
                />

                <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Wachtwoord"
                    className="login-input"
                />

                <button type="submit" className="login-button">
                    Login
                </button>

                <div className="forgot-password">Wachtwoord vergeten?</div>

                <div className={`error-message ${error ? 'visible' : ''}`}>
                    Ongeldige gebruikersnaam of wachtwoord.
                </div>


                <p className="form-hint">
                    Nog geen account? <Link to="/register">Registreer hier</Link>
                </p>
            </form>
        </div>
    );
}

export default Login;
