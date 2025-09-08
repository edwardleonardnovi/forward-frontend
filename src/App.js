import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { AuthProvider } from './context/AuthContext';
import { RunProvider } from './context/RunContext';

import PrivateRoute from './routes/PrivateRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';

import Coach from './pages/Coach';
import CoachAthlete from './pages/CoachAthlete';

function App() {
    return (
        <div className="app-container">
            <AuthProvider>
                <RunProvider>
                    <Router>
                        <Routes>
                            <Route path="/login" element={<Login />} />
                            <Route path="" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route
                                path="/home"
                                element={
                                    <PrivateRoute>
                                        <Home />
                                    </PrivateRoute>
                                }
                            />
                            <Route
                                path="/coach"
                                element={
                                    <PrivateRoute>
                                        <Coach />
                                    </PrivateRoute>
                                }
                            />
                            <Route
                                path="/coach/athletes/:id"
                                element={
                                    <PrivateRoute>
                                        <CoachAthlete />
                                    </PrivateRoute>
                                }
                            />
                            <Route path="*" element={<Navigate to="/home" replace />} />
                        </Routes>
                    </Router>
                </RunProvider>
            </AuthProvider>
        </div>
    );
}

export default App;
