// src/pages/IssuesMap.jsx
import { useEffect, useState, useRef, useContext } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { Loader2, MapPin, RefreshCw, Filter, X, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { PRIORITY_CONFIG, STATUS_CONFIG } from "../services/api";
import { AppContext } from "../context/AppContext";
import toast from "react-hot-toast";

// Fix Leaflet default marker icons in Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Custom colored circle marker
const makeIcon = (color, emoji) =>
  L.divIcon({
    className: "",
    html: `
      <div style="
        width:38px;height:38px;
        background:${color}20;
        border:2px solid ${color};
        border-radius:50%;
        display:flex;align-items:center;justify-content:center;
        font-size:16px;
        box-shadow:0 0 12px ${color}40;
        cursor:pointer;
        transition:transform 0.2s;
      ">${emoji}</div>`,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    popupAnchor: [0, -22],
  });

const PRIORITY_COLORS = {
  Critical: "#388bfd",
  High:     "#f85149",
  Medium:   "#d29922",
  Low:      "#3fb950",
};

function FitBounds({ reports }) {
  const map = useMap();
  useEffect(() => {
    if (!reports.length) return;
    const bounds = reports
      .filter((r) => r.location && r.location.includes(","))
      .map((r) => {
          const [lat, lng] = r.location.split(",").map(Number);
          return [lat, lng];
      });
    if (bounds.length) map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
  }, [reports, map]);
  return null;
}

export default function IssuesMap() {
  const { issues, getIssues } = useContext(AppContext);
  const [loading, setLoading]   = useState(false);
  const [filter, setFilter]     = useState("All");
  const [selected, setSelected] = useState(null);

  const fetchReports = async () => {
    setLoading(true);
    await getIssues();
    setLoading(false);
  };

  useEffect(() => { fetchReports(); }, []);

  const withCoords = issues.filter((r) => r.location && r.location.includes(","));
  const filtered   = filter === "All"
    ? withCoords
    : withCoords.filter((r) => r.priority === filter);

  const defaultCenter = withCoords.length
    ? withCoords[0].location.split(",").map(Number)
    : [10.8505, 76.2711]; // Kerala default

  const priorities = ["All", "Critical", "High", "Medium", "Low"];

  return (
    <div className="page-container pb-24 md:pb-0 flex flex-col">
      {/* Header */}
      <div className="px-4 pt-6 pb-4 max-w-6xl mx-auto w-full">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-white">Live Issue Map</h1>
            <p className="text-muted text-xs mt-0.5">
              {withCoords.length} issues with location data
            </p>
          </div>
          <button
            onClick={fetchReports}
            className="flex items-center gap-2 btn-ghost text-sm py-2 px-3"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        {/* Priority filter pills */}
        <div className="flex gap-2 mt-4 overflow-x-auto pb-1 no-scrollbar">
          {priorities.map((p) => (
            <button
              key={p}
              onClick={() => setFilter(p)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold border transition-all no-tap-highlight ${
                filter === p
                  ? "bg-accent text-white border-accent shadow-glow"
                  : "bg-surface2 text-muted border-border/60 hover:border-accent/40"
              }`}
            >
              {p}
              {p !== "All" && (
                <span className="ml-1.5 opacity-60">
                  {withCoords.filter((r) => r.priority === p).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Map container */}
      <div className="flex-1 relative mx-4 mb-4 rounded-2xl overflow-hidden border border-border/60" style={{ minHeight: "55vh" }}>
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-surface z-10">
            <div className="text-center">
              <Loader2 size={32} className="animate-spin text-accent mx-auto mb-3" />
              <p className="text-muted text-sm">Loading map data…</p>
            </div>
          </div>
        ) : (
          <MapContainer
            center={defaultCenter}
            zoom={12}
            style={{ height: "100%", width: "100%", minHeight: "55vh" }}
            zoomControl={false}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap contributors'
            />
            <FitBounds reports={filtered} />
            {filtered.map((r) => {
              const [lat, lng] = r.location.split(",").map(Number);
              return (
                <Marker
                  key={r._id}
                  position={[lat, lng]}
                  icon={makeIcon(PRIORITY_COLORS[r.priority] || "#388bfd", r.icon || "⚠️")}
                  eventHandlers={{ click: () => setSelected(r) }}
                >
                  <Popup>
                    <div className="min-w-[160px]">
                      <p className="font-semibold text-sm mb-1">{r.title}</p>
                      <p className="text-xs text-gray-400 mb-2 line-clamp-2">{r.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium" style={{ color: PRIORITY_COLORS[r.priority] }}>
                          {r.priority || "Medium"}
                        </span>
                        <span className="text-xs text-gray-400">{r.status}</span>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        )}

        {/* No location data fallback */}
        {!loading && withCoords.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            <div className="card p-6 text-center max-w-xs pointer-events-auto">
              <MapPin size={32} className="text-muted mx-auto mb-3" />
              <p className="text-white font-medium mb-1">No geotagged issues</p>
              <p className="text-muted text-xs mb-4">Reports without GPS coordinates won't appear on the map.</p>
              <Link to="/report" className="btn-primary text-sm py-2 px-4 inline-flex items-center gap-2">
                Report with GPS
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Selected issue detail panel */}
      {selected && (
        <div className="fixed bottom-20 md:bottom-6 left-4 right-4 z-50 max-w-md mx-auto animate-fade-up">
          <div className="card p-4 shadow-glow-lg">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{selected.icon || "⚠️"}</span>
                <div>
                  <p className="text-white font-semibold font-display text-sm">{selected.title}</p>
                  <p className="text-muted text-xs">{selected.location}</p>
                </div>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="text-muted hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors flex-shrink-0"
              >
                <X size={16} />
              </button>
            </div>

            {selected.image && (
              <img
                src={selected.image}
                alt="Issue"
                className="w-full h-28 object-cover rounded-xl mt-3 border border-border/40"
              />
            )}

            <p className="text-muted text-xs mt-3 line-clamp-2">{selected.description}</p>

            <div className="flex items-center gap-2 mt-3">
              <span className={`badge ${PRIORITY_CONFIG[selected.priority || 'Medium']?.bg} ${PRIORITY_CONFIG[selected.priority || 'Medium']?.text} ${PRIORITY_CONFIG[selected.priority || 'Medium']?.border} border`}>
                <span className={`w-1.5 h-1.5 rounded-full ${PRIORITY_CONFIG[selected.priority || 'Medium']?.dot}`} />
                {selected.priority || "Medium"}
              </span>
              <span className={`badge ${STATUS_CONFIG[selected.status]?.bg} ${STATUS_CONFIG[selected.status]?.text}`}>
                {selected.status}
              </span>
              {selected.upvotes > 0 && (
                <span className="badge bg-white/5 text-muted ml-auto">
                  👍 {selected.upvotes}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
