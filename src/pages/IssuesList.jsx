// src/pages/IssuesList.jsx
import { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import {
  Loader2, Search, MapPin, ThumbsUp, RefreshCw,
  Filter, ChevronDown, ExternalLink, Camera, X,
} from "lucide-react";
import { PRIORITY_CONFIG, STATUS_CONFIG } from "../services/api";
import { AppContext } from "../context/AppContext";
import toast from "react-hot-toast";
import axios from "axios";

/* ── Issue card (mobile) ── */
function IssueCard({ report, onUpvote, onSelect }) {
  const p = PRIORITY_CONFIG[report.priority] || PRIORITY_CONFIG.Medium;
  const s = STATUS_CONFIG[report.status]    || STATUS_CONFIG.Reported;

  return (
    <div
      className="card p-4 hover:border-accent/30 transition-all duration-200 cursor-pointer group animate-fade-up"
      onClick={() => onSelect(report)}
    >
      <div className="flex gap-3">
        {/* Thumbnail */}
        {report.image ? (
          <img
            src={report.image}
            alt={report.title}
            className="w-16 h-16 rounded-xl object-cover flex-shrink-0 border border-border/40"
          />
        ) : (
          <div className="w-16 h-16 rounded-xl bg-surface flex items-center justify-center text-3xl flex-shrink-0 border border-border/40">
            {report.icon || "⚠️"}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="text-white font-semibold text-sm font-display truncate group-hover:text-accent transition-colors">
              {report.title}
            </p>
            <span className={`badge flex-shrink-0 ${p.bg} ${p.text} ${p.border} border text-[10px]`}>
              <span className={`w-1 h-1 rounded-full ${p.dot}`} />
              {report.priority || "Medium"}
            </span>
          </div>

          <p className="text-muted text-xs mt-0.5 line-clamp-1">{report.description}</p>

          <div className="flex items-center gap-1.5 mt-1.5">
            <MapPin size={10} className="text-muted flex-shrink-0" />
            <span className="text-muted text-xs truncate">{report.location || "No location"}</span>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <span className={`badge ${s.bg} ${s.text} text-[10px]`}>{s.label || report.status}</span>
            <button
              onClick={(e) => { e.stopPropagation(); onUpvote(report._id); }}
              className="flex items-center gap-1 ml-auto text-muted hover:text-accent transition-colors text-xs"
            >
              <ThumbsUp size={11} />
              {report.upvotes || 0}
            </button>
            <span className="text-muted text-[10px]">
              {report.date
                ? new Date(report.date).toLocaleDateString("en-IN", { day:"numeric", month:"short" })
                : "—"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Detail modal ── */
function IssueModal({ report, onClose }) {
  if (!report) return null;
  const p = PRIORITY_CONFIG[report.priority] || PRIORITY_CONFIG.Medium;
  const s = STATUS_CONFIG[report.status]    || STATUS_CONFIG.Reported;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="card w-full max-w-md max-h-[85vh] overflow-y-auto animate-pop-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/40">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{report.icon || "⚠️"}</span>
            <div>
              <p className="text-white font-semibold font-display text-sm">{report.title}</p>
              <p className="text-muted text-xs">
                {report.date
                  ? new Date(report.date).toLocaleDateString("en-IN", { day:"numeric", month:"long", year:"numeric" })
                  : "—"}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5 text-muted hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Image */}
        {report.image && (
          <img src={report.image} alt="Issue" className="w-full h-52 object-cover" />
        )}

        <div className="p-4 flex flex-col gap-4">
          {/* Status & priority badges */}
          <div className="flex gap-2 flex-wrap">
            <span className={`badge ${p.bg} ${p.text} ${p.border} border`}>
              <span className={`w-1.5 h-1.5 rounded-full ${p.dot}`} />
              {report.priority || "Medium"} Priority
            </span>
            <span className={`badge ${s.bg} ${s.text}`}>{s.label || report.status}</span>
            {report.upvotes > 0 && (
              <span className="badge bg-white/5 text-muted">👍 {report.upvotes} upvotes</span>
            )}
          </div>

          {/* Description */}
          <div>
            <p className="text-muted text-xs uppercase tracking-wider mb-1">Description</p>
            <p className="text-white text-sm leading-relaxed">{report.description || "No description provided."}</p>
          </div>

          {/* Location */}
          {report.location && (
            <div>
              <p className="text-muted text-xs uppercase tracking-wider mb-1">Location</p>
              <div className="flex items-center gap-2">
                <MapPin size={13} className="text-accent flex-shrink-0" />
                <p className="text-white text-sm">{report.location}</p>
              </div>
            </div>
          )}

          {/* View on map */}
          {report.lat && report.lng && (
            <Link
              to="/map"
              onClick={onClose}
              className="btn-ghost flex items-center justify-center gap-2 text-sm py-2.5"
            >
              <MapPin size={14} />
              View on Map
              <ExternalLink size={12} />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Main Page ── */
export default function IssuesList() {
  const { issues, getIssues, backendUrl } = useContext(AppContext);
  const [loading, setLoading]   = useState(false);
  const [search, setSearch]     = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selected, setSelected] = useState(null);

  const fetchReports = async () => {
    setLoading(true);
    await getIssues();
    setLoading(false);
  };

  useEffect(() => { fetchReports(); }, []);

  const handleUpvote = async (id) => {
    toast.error("Upvote backend not yet implemented fully");
  };

  const statuses = ["All", "Reported", "In Progress", "Resolved"];

  const filtered = issues.filter((r) => {
    const matchSearch =
      !search ||
      r.title?.toLowerCase().includes(search.toLowerCase()) ||
      r.description?.toLowerCase().includes(search.toLowerCase()) ||
      r.location?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // Stats summary
  const counts = {
    total:      issues.length,
    resolved:   issues.filter((r) => r.status === "Resolved").length,
    inProgress: issues.filter((r) => r.status === "In Progress").length,
    critical:   issues.filter((r) => r.priority === "Critical").length,
  };

  return (
    <div className="page-container pb-28 md:pb-8 px-4">
      <div className="max-w-2xl mx-auto py-8">

        {/* Header */}
        <div className="mb-6 animate-fade-up">
          <h1 className="font-display text-3xl font-bold text-white">All Issues</h1>
          <p className="text-muted text-sm mt-1">Community-reported civic complaints</p>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-4 gap-3 mb-6 animate-fade-up" style={{ animationDelay: "80ms", animationFillMode: "both" }}>
          {[
            { label: "Total",       val: counts.total,      color: "text-accent"  },
            { label: "Resolved",    val: counts.resolved,   color: "text-green-400" },
            { label: "In Progress", val: counts.inProgress, color: "text-yellow-400" },
            { label: "Critical",    val: counts.critical,   color: "text-red-400" },
          ].map(({ label, val, color }) => (
            <div key={label} className="card p-3 text-center">
              <p className={`font-display text-xl font-bold ${color}`}>{loading ? "…" : val}</p>
              <p className="text-muted text-[10px] mt-0.5 leading-tight">{label}</p>
            </div>
          ))}
        </div>

        {/* Search bar */}
        <div className="relative mb-3 animate-fade-up" style={{ animationDelay: "120ms", animationFillMode: "both" }}>
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="search"
            className="input-field pl-10 pr-4"
            placeholder="Search by type, location, description…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Status filter tabs */}
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1 animate-fade-up" style={{ animationDelay: "160ms", animationFillMode: "both" }}>
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold border transition-all no-tap-highlight ${
                statusFilter === s
                  ? "bg-accent text-white border-accent"
                  : "bg-surface2 text-muted border-border/60 hover:border-accent/40"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Results count */}
        {!loading && (
          <p className="text-muted text-xs mb-3 flex items-center justify-between">
            <span>{filtered.length} result{filtered.length !== 1 ? "s" : ""}</span>
            <button onClick={fetchReports} className="flex items-center gap-1.5 hover:text-white transition-colors">
              <RefreshCw size={12} className={loading ? "animate-spin" : ""} /> Refresh
            </button>
          </p>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center py-16 gap-3">
            <Loader2 size={32} className="animate-spin text-accent" />
            <p className="text-muted text-sm">Loading issues…</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-16 animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-surface2 flex items-center justify-center mx-auto mb-4 text-3xl">
              {search ? "🔍" : "📭"}
            </div>
            <p className="text-white font-medium mb-1">
              {search ? "No results found" : "No issues yet"}
            </p>
            <p className="text-muted text-sm mb-4">
              {search ? "Try a different search term" : "Be the first to report a civic issue!"}
            </p>
            {!search && (
              <Link to="/report" className="btn-primary inline-flex items-center gap-2 text-sm py-2.5 px-5">
                <Camera size={15} /> Report Issue
              </Link>
            )}
          </div>
        )}

        {/* Issue cards */}
        {!loading && filtered.length > 0 && (
          <div className="flex flex-col gap-3">
            {filtered.map((r, i) => (
              <div key={r._id} style={{ animationDelay: `${i * 40}ms` }}>
                <IssueCard
                  report={r}
                  onUpvote={handleUpvote}
                  onSelect={setSelected}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail modal */}
      {selected && <IssueModal report={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
