import React from 'react';
import '../styling/RoutesBubble.css';
import { MapContainer, TileLayer, Polyline } from 'react-leaflet';

function ExampleMap() {
    const exampleRoute = [
        [52.0907, 5.1214], // Utrecht
        [52.0929, 5.1045],
        [52.1000, 5.1200],
    ];

    return (
        <MapContainer center={exampleRoute[0]} zoom={14} style={{ height: "120px", width: "100%" }} scrollWheelZoom={false}>
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="© OpenStreetMap"
            />
            <Polyline positions={exampleRoute} color="teal" />
        </MapContainer>
    );
}

function RoutesBubble() {
    return (
        <div className="bubble routes">
            <h3>Populaire Routes</h3>
            <p>Verken nieuwe paden</p>
            <div className="routes-container">
                <div className="example-routes"><ExampleMap /></div>
                <div className="example-routes"><ExampleMap /></div>
                <div className="example-routes"><ExampleMap /></div>
            </div>
        </div>
    );
}

export default RoutesBubble;
