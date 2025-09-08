import React, { useRef, useState } from "react";
import "../styling/UploadBubble.css";
import { useRuns } from "../context/RunContext";

/**
 * Lightweight GPX parser that supports both <trkpt> and <wpt>.
 * If a file only contains <wpt>, we can (optionally) convert them
 * to a minimal track (<trk><trkseg><trkpt>) before uploading.
 */
function parseGpxXml(text) {
    const doc = new DOMParser().parseFromString(text, "application/xml");

    // Prefer <trkpt>, fallback to <wpt>
    const trkpts = Array.from(doc.getElementsByTagName("trkpt"));
    const wpts = Array.from(doc.getElementsByTagName("wpt"));
    const nodes = trkpts.length ? trkpts : wpts;

    const points = nodes
        .map((el) => {
            const lat = parseFloat(el.getAttribute("lat") || "NaN");
            const lon = parseFloat(el.getAttribute("lon") || "NaN");
            const eleEl = el.getElementsByTagName("ele")[0];
            const timeEl = el.getElementsByTagName("time")[0];
            return {
                lat,
                lon,
                ele: eleEl ? parseFloat(eleEl.textContent || "") : null,
                time: timeEl ? new Date(timeEl.textContent || "") : null,
            };
        })
        .filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lon));

    let distanceMeters = 0;
    for (let i = 1; i < points.length; i++) distanceMeters += haversine(points[i - 1], points[i]);

    const firstWithTime = points.find((p) => p.time instanceof Date && !isNaN(p.time));
    const lastWithTime = [...points].reverse().find((p) => p.time instanceof Date && !isNaN(p.time));
    const durationSeconds =
        firstWithTime && lastWithTime ? Math.max(0, Math.round((+lastWithTime.time - +firstWithTime.time) / 1000)) : 0;

    return { points, distanceMeters, durationSeconds, containsTrack: trkpts.length > 0 };
}

function toRad(v) { return (v * Math.PI) / 180; }
function haversine(a, b) {
    const R = 6371000; // meters
    const dLat = toRad(b.lat - a.lat);
    const dLon = toRad(b.lon - a.lon);
    const la1 = toRad(a.lat), la2 = toRad(b.lat);
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

/** Convert a list of points to a minimal GPX track document. */
function pointsToTrackGpx(points, creator = "Forward") {
    const trkpts = points
        .map((p) => {
            const ele = p.ele != null ? `<ele>${p.ele}</ele>` : "";
            const time = p.time instanceof Date && !isNaN(p.time) ? `<time>${p.time.toISOString()}</time>` : "";
            return `<trkpt lat="${p.lat}" lon="${p.lon}">${ele}${time}</trkpt>`;
        })
        .join("");

    // Use the official GPX 1.1 namespace so libraries parse it correctly
    return `<?xml version="1.0" encoding="UTF-8"?>\n` +
        `<gpx version="1.1" creator="${creator}" xmlns="http://www.topografix.com/GPX/1/1">\n` +
        `  <trk><name>Converted Waypoints</name><trkseg>${trkpts}</trkseg></trk>\n` +
        `</gpx>`;
}

function humanKm(meters) { return (meters / 1000).toFixed(2); }

export default function UploadRunBubble() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [convertToTrack, setConvertToTrack] = useState(true); // auto-convert <wpt> → <trkpt>
    const [busy, setBusy] = useState(false);
    const fileInputRef = useRef();

    // Pak shared state tools uit context
    const { addRun, setRuns } = useRuns() || {};

    const handleUploadClick = () => fileInputRef.current?.click();

    const handleFileChange = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        setSelectedFile(file);

        try {
            setBusy(true);

            // 1) Read & parse for on-the-fly preview
            const text = await file.text();
            const parsed = parseGpxXml(text);
            setPreview({
                points: parsed.points.length,
                distanceKm: humanKm(parsed.distanceMeters),
                durationMin: parsed.durationSeconds ? Math.round(parsed.durationSeconds / 60) : null,
                containsTrack: parsed.containsTrack,
            });

            // 2) Prepare payload: convert to <trkpt> if needed and opted-in
            const shouldConvert = convertToTrack && !parsed.containsTrack;
            const payloadText = shouldConvert ? pointsToTrackGpx(parsed.points) : text;

            const payloadName = shouldConvert
                ? file.name.replace(/\.gpx$/i, "") + "_track.gpx"
                : file.name;

            const payloadFile = new File([payloadText], payloadName, { type: "application/gpx+xml" });

            const formData = new FormData();
            formData.append("file", payloadFile);

            // 3) Upload to backend
            const res = await fetch("/api/runs/upload", {
                method: "POST",
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                body: formData,
            });

            if (!res.ok) {
                alert("Upload mislukt.");
                return;
            }

            // 4) Normaliseer server-respons naar UI-shape en push naar context
            const r = await res.json();
            const normalized = {
                id: r.id,
                // afstand -> km
                distanceKm:
                    r.distanceKm ?? // als backend al km geeft
                    (r.distance ?? r.distance_m ?? r.distanceMeters ?? 0) / 1000,
                // duur -> seconden
                durationSec: r.durationSec ?? r.duration ?? r.duration_s ?? r.durationSeconds ?? 0,
                // starttijd -> ISO string
                startIso: r.startIso ?? r.startTime ?? r.start_time ?? null,
                // optioneel
                pace: r.pace ?? null,
                filename: r.filename ?? null,
            };

            if (typeof addRun === "function") {
                addRun(normalized);
            } else if (typeof setRuns === "function") {
                setRuns((prev) => [normalized, ...(prev || [])]);
            }

            alert("Upload gelukt!");
        } catch (e) {
            console.error(e);
            alert("Fout bij uploaden.");
        } finally {
            setBusy(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    return (
        <div className={`bubble upload dropzone${busy ? " is-busy" : ""}`}>
            <h3>Upload Run</h3>
            <p className="text-muted">Sleep een GPX-bestand hierheen of</p>

            <label className="upload-button" onClick={handleUploadClick} aria-disabled={busy}>
                {busy ? "Bezig..." : "Kies bestand"}
            </label>

            <input
                type="file"
                ref={fileInputRef}
                accept=".gpx,application/gpx+xml,text/xml,application/xml"
                onChange={handleFileChange}
                style={{ display: "none" }}
            />

            {selectedFile && (
                <p className="upload-feedback">Geselecteerd: {selectedFile.name}</p>
            )}

            <label style={{ display: "block", marginTop: 8 }}>
                <input
                    type="checkbox"
                    checked={convertToTrack}
                    onChange={(e) => setConvertToTrack(e.target.checked)}
                    disabled={busy}
                />
                {" "}Waypoints automatisch omzetten naar track bij upload
            </label>

            {preview && (
                <p className="text-muted" style={{ marginTop: 8 }}>
                    ⚡ Voorbeeld: {preview.points} punten • {preview.distanceKm} km
                    {preview.durationMin != null ? ` • ${preview.durationMin} min` : ""}
                    {preview.containsTrack ? " • bevat track" : " • waypoints gedetecteerd"}
                </p>
            )}
        </div>
    );
}
