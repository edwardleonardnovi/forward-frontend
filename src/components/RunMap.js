import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";


delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function FitBounds({ bbox, coords }) {
    const map = useMap();
    useEffect(() => {
        if (bbox && bbox.length === 4) {
            const [minLon, minLat, maxLon, maxLat] = bbox;
            map.fitBounds([[minLat, minLon], [maxLat, maxLon]]);
        } else if (coords && coords.length) {
            map.fitBounds(L.latLngBounds(coords));
        }
    }, [bbox, coords, map]);
    return null;
}

export function RunMap({ runId }) {
    const [feature, setFeature] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        let aborted = false;
        (async () => {
            setError(null);
            setFeature(null);

            const token = localStorage.getItem("token");
            if (!token) {
                setError("Geen token gevonden. Log opnieuw in.");
                return;
            }

            try {
                const res = await fetch(`/api/runs/${runId}/route`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!res.ok) {
                    const bodyText = await res.text().catch(() => "");
                    if (aborted) return;
                    console.error("Route fetch failed", res.status, bodyText);
                    setError(`Kon route niet laden (${res.status}). ${bodyText || ""}`);
                    return;
                }

                const json = await res.json();
                if (!json || !json.geometry || !Array.isArray(json.geometry.coordinates) || !json.geometry.coordinates.length) {
                    if (aborted) return;
                    setError("Route bevat geen coördinaten.");
                    return;
                }

                if (aborted) return;
                setFeature(json);
            } catch (e) {
                if (aborted) return;
                console.error(e);
                setError("Netwerkfout bij het laden van de route.");
            }
        })();
        return () => { aborted = true; };
    }, [runId]);

    if (error) return <div style={{ color: "crimson" }}>{error}</div>;
    if (!feature) return <div>Route laden…</div>;

    const coords = feature.geometry.coordinates.map(([lon, lat]) => [lat, lon]);
    const start = coords[0];
    const end = coords[coords.length - 1];

    return (
        <MapContainer
            style={{ height: "100%", width: "100%", borderRadius: 12 }}
            center={start || [52.37, 4.9]}
            zoom={13}
            scrollWheelZoom
        >
            <TileLayer
                attribution="© OpenStreetMap"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <FitBounds bbox={feature.bbox} coords={coords} />
            <Polyline positions={coords} weight={4} />
            {start && <Marker position={start}><Popup>Start</Popup></Marker>}
            {end && <Marker position={end}><Popup>Einde</Popup></Marker>}
        </MapContainer>
    );
}
