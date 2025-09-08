import React, { useEffect, useState } from "react";
import { Play, Pause, Save, Trash } from "lucide-react";
import "../styling/StartBubble.css";

function StartBubble() {
    const [isRunning, setIsRunning] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [time, setTime] = useState(0);

    useEffect(() => {
        let timer;
        if (isRunning && !isPaused) {
            timer = setInterval(() => {
                setTime(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [isRunning, isPaused]);

    const formatTime = (sec) => {
        const h = String(Math.floor(sec / 3600)).padStart(2, '0');
        const m = String(Math.floor((sec % 3600) / 60)).padStart(2, '0');
        const s = String(sec % 60).padStart(2, '0');
        return `${h}:${m}:${s}`;
    };

    const handleStart = () => {
        setIsRunning(true);
        setIsPaused(false);
    };

    const handlePause = () => {
        setIsPaused(true);
    };

    const handleSave = () => {
        alert("Run opgeslagen (simulatie)");
        reset();
    };

    const handleDelete = () => {
        reset();
    };

    const reset = () => {
        setIsRunning(false);
        setIsPaused(false);
        setTime(0);
    };

    return (
        <div className="bubble start">
            <div className="start-header">
                <h3 className="text-cyan-400">Start Run</h3>
                <p className="timer-display">{formatTime(time)}</p>
            </div>

            <div className="start-buttons">
                <button
                    onClick={handleStart}
                    disabled={isRunning && !isPaused}
                    title="Start"
                >
                    <Play />
                </button>
                <button
                    onClick={handlePause}
                    disabled={!isRunning || isPaused}
                    title="Pause"
                >
                    <Pause />
                </button>
                <button
                    onClick={handleSave}
                    disabled={!isPaused}
                    title="Opslaan"
                >
                    <Save />
                </button>
                <button
                    onClick={handleDelete}
                    disabled={!isRunning}
                    title="Verwijderen"
                >
                    <Trash />
                </button>
            </div>
        </div>
    );
}

export default StartBubble;
