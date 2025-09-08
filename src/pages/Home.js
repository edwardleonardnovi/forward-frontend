// pages/Home.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import '../styling/Home.css';
import RunsBubble from "../components/RunsBubble";
import StatisticsBubble from "../components/StatisticsBubble";
import StartBubble from "../components/StartBubble";
import UploadBubble from "../components/UploadBubble";
import RoutesBubble from "../components/RoutesBubble";

export default function Home() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <div className="home-container">
            <button onClick={handleLogout} className="logout-button">
                <LogOut className="w-4 h-4" />
                <span>Uitloggen</span>
            </button>

            <div className="dashboard-grid">
                <StatisticsBubble />
                <UploadBubble />
                <RunsBubble />
                <StartBubble />

                <div className="bubble friends">
                    <h3>Vrienden</h3>
                    <p>Netwerk</p>
                </div>

                <RoutesBubble />
            </div>
        </div>
    );
}
