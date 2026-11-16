import { useEffect } from "react";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "./PostMap.css";

const DEFAULT_CENTER = [41.2995, 69.2401];

const icon = L.divIcon({
  className: "pin",
  html: `<svg width="34" height="42" viewBox="0 0 34 42" aria-hidden="true">
    <path d="M17 40C17 40 3 26 3 15a14 14 0 0 1 28 0c0 11-14 25-14 25z" fill="#6BA7FF" stroke="#0A0B0E" stroke-width="2"/>
    <circle cx="17" cy="15" r="5" fill="#0A0B0E"/></svg>`,
  iconSize: [34, 42],
  iconAnchor: [17, 40],
});

function Clicks({ onPick }) {
  useMapEvents({ click: (e) => onPick(e.latlng.lat, e.latlng.lng) });
  return null;
}

function Recenter({ center }) {
  const map = useMap();
  const lat = center?.[0];
  const lng = center?.[1];
  useEffect(() => {
    if (lat != null && lng != null) map.setView([lat, lng], Math.max(map.getZoom(), 15));
  }, [lat, lng, map]);
  return null;
}

export default function LocationPicker({ value, onChange, center, height = 320 }) {
  const has = value && value.lat !== "" && value.lng !== "";
  const pos = has ? [Number(value.lat), Number(value.lng)] : null;
  const start = pos || center || DEFAULT_CENTER;

  return (
    <div className="pmap" style={{ height }}>
      <MapContainer center={start} zoom={pos || center ? 15 : 12} scrollWheelZoom style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Clicks onPick={(lat, lng) => onChange({ lat: lat.toFixed(6), lng: lng.toFixed(6) })} />
        <Recenter center={center} />
        {pos && <Marker position={pos} icon={icon} />}
      </MapContainer>
    </div>
  );
}