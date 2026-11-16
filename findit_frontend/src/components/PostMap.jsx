import { useEffect, useMemo } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import { Link } from "react-router-dom";
import { formatDate } from "../lib/format.js";
import { TypeChip } from "./Chips.jsx";
import "./PostMap.css";

const DEFAULT_CENTER = [41.2995, 69.2401]; // Toshkent

const iconCache = {};
function pinIcon(type) {
  if (iconCache[type]) return iconCache[type];
  const color = type === "found" ? "#3DDC97" : "#B8A7FF";
  iconCache[type] = L.divIcon({
    className: "pin",
    html: `<svg width="34" height="42" viewBox="0 0 34 42" aria-hidden="true">
      <path d="M17 40C17 40 3 26 3 15a14 14 0 0 1 28 0c0 11-14 25-14 25z" fill="${color}" stroke="#0A0B0E" stroke-width="2"/>
      <circle cx="17" cy="15" r="5" fill="#0A0B0E"/></svg>`,
    iconSize: [34, 42],
    iconAnchor: [17, 40],
    popupAnchor: [0, -36],
  });
  return iconCache[type];
}

function FitBounds({ points }) {
  const map = useMap();
  useEffect(() => {
    if (!points.length) return;
    if (points.length === 1) {
      map.setView(points[0], 15);
      return;
    }
    map.fitBounds(L.latLngBounds(points), { padding: [40, 40], maxZoom: 16 });
  }, [points, map]);
  return null;
}

export default function PostMap({ posts, height = 480, zoom = 12 }) {
  const items = useMemo(
    () =>
      (posts || [])
        .filter((p) => p.latitude != null && p.longitude != null)
        .map((p) => ({ post: p, pos: [Number(p.latitude), Number(p.longitude)] })),
    [posts]
  );
  const points = useMemo(() => items.map((i) => i.pos), [items]);

  return (
    <div className="pmap" style={{ height }}>
      <MapContainer center={points[0] || DEFAULT_CENTER} zoom={zoom} scrollWheelZoom style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds points={points} />
        {items.map(({ post, pos }) => (
          <Marker key={post.id} position={pos} icon={pinIcon(post.type)}>
            <Popup>
              <div className="pop">
                <TypeChip type={post.type} />
                <strong>{post.title}</strong>
                <span>{post.place_name || post.location_detail || ""} · {formatDate(post.event_date)}</span>
                <Link to={`/posts/${post.id}`}>Batafsil →</Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      {items.length === 0 && <div className="pmap-empty">Xaritada ko'rsatish uchun joyi belgilangan e'lon yo'q</div>}
    </div>
  );
}