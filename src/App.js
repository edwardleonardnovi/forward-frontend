import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './routes/PrivateRoute';
import Home from "./pages/Home";
import Login from './pages/Login';
import Register from './pages/Register';
import { RunProvider } from "./context/RunContext";

function App() {
    return (
        <div className={"app-container"}>
            <AuthProvider>
                <RunProvider>
                    <Router>
                        <Routes>
                            <Route path="/login" element={<Login />} />
                            <Route path="" element={<Login />} />

                            <Route path="/register" element={<Register />} />
                            <Route path="/home" element={
                                <PrivateRoute>
                                    <Home />
                                </PrivateRoute>
                            } />
                        </Routes>
                    </Router>
                </RunProvider>
            </AuthProvider>
        </div>
    );
}

export default App;
