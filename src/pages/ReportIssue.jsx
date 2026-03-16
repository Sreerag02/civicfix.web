// src/pages/ReportIssue.jsx
import { useState, useRef, useCallback, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  Camera, MapPin, FileText, Loader2, CheckCircle2,
  Upload, X, Zap, AlertTriangle, ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";
import { classifyIssue, PRIORITY_CONFIG } from "../services/api";
import { AppContext } from "../context/AppContext";
import axios from "axios";

/* ── AI Result Card ── */
function AIResult({ result }) {
  const p = PRIORITY_CONFIG[result.priority] || PRIORITY_CONFIG.Medium;
  return (
    <div className="card p-4 border-accent/30 animate-pop-in">
      <div className="flex items-center gap-2 mb-3">
        <Zap size={14} className="text-accent" />
        <span className="text-accent text-xs font-semibold uppercase tracking-wider">AI Detection Result</span>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{result.icon}</span>
          <div>
            <p className="text-white font-semibold font-display">{result.type}</p>
            <p className="text-muted text-xs mt-0.5">Automatically classified</p>
          </div>
        </div>
        <span className={`badge ${p.bg} ${p.text} border ${p.border}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${p.dot}`} />
          {result.priority}
        </span>
      </div>
    </div>
  );
}

/* ── Image Upload zone ── */
function ImageUpload({ preview, onFile, onClear }) {
  const inputRef = useRef();
  const [dragging, setDragging] = useState(false);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) onFile(file);
  }, [onFile]);

  return (
    <div>
      <label className="block text-sm font-medium text-white mb-2">
        Photo <span className="text-red-400">*</span>
      </label>

      {preview ? (
        <div className="relative rounded-2xl overflow-hidden border border-border/60 animate-fade-in">
          <img src={preview} alt="Preview" className="w-full max-h-64 object-cover" />
          <button
            type="button"
            onClick={onClear}
            className="absolute top-3 right-3 w-8 h-8 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-red-500/80 transition-colors"
          >
            <X size={15} />
          </button>
          <div className="absolute bottom-3 left-3">
            <span className="glass rounded-full px-3 py-1 text-xs text-green-400 flex items-center gap-1.5">
              <CheckCircle2 size={12} /> Photo ready
            </span>
          </div>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
            dragging
              ? "border-accent bg-accent/10"
              : "border-border/60 hover:border-accent/50 hover:bg-accent/5"
          }`}
        >
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center">
              <Upload size={24} className="text-accent" />
            </div>
            <div>
              <p className="text-white font-medium text-sm">Tap to upload photo</p>
              <p className="text-muted text-xs mt-0.5">or drag & drop • JPG, PNG, WEBP</p>
            </div>
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files[0];
          if (f) onFile(f);
        }}
      />
    </div>
  );
}

/* ── Main Page ── */
export default function ReportIssue() {
  const navigate = useNavigate();
  const { backendUrl, token, getIssues, loadUserProfileData } = useContext(AppContext);
  const [step, setStep]           = useState(1); // 1=form, 2=success
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview]     = useState(null);
  const [aiResult, setAiResult]   = useState(null);
  const [loading, setLoading]     = useState(false);
  const [form, setForm] = useState({
    title:       "",
    description: "",
    location:    "",
  });

  const handleFile = (file) => {
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
    // Run AI classification from filename + description
    const result = classifyIssue(form.description, file.name);
    setAiResult(result);
  };

  const clearImage = () => {
    setImageFile(null);
    setPreview(null);
    setAiResult(null);
  };

  const handleDescChange = (e) => {
    const val = e.target.value;
    setForm((f) => ({ ...f, description: val }));
    if (imageFile || val.length > 5) {
      setAiResult(classifyIssue(val, imageFile?.name || ""));
    }
  };

  const getLocation = () => {
    if (!navigator.geolocation) return toast.error("Geolocation not supported");
    toast.loading("Getting your location…", { id: "loc" });
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((f) => ({
          ...f,
          location: `${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`,
        }));
        toast.success("Location captured!", { id: "loc" });
      },
      () => toast.error("Could not get location", { id: "loc" })
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return toast.error("Please login to report an issue");
    if (!imageFile) return toast.error("Please upload a photo");
    if (!form.description.trim()) return toast.error("Please add a description");
    if (!form.location.trim()) return toast.error("Please add a location");

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", aiResult?.type || "General Issue");
      formData.append("description", form.description);
      formData.append("category", aiResult?.type || "General");
      formData.append("location", form.location);
      formData.append("image", imageFile);

      const { data } = await axios.post(`${backendUrl}/api/issue/report`, formData, { headers: { token } });

      if (data.success) {
        toast.success(data.message);
        await getIssues();
        await loadUserProfileData();
        setStep(2);
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ── Success screen ── */
  if (step === 2) {
    return (
      <div className="page-container pb-24 md:pb-0 flex items-center justify-center px-4">
        <div className="text-center max-w-sm animate-pop-in">
          <div className="relative inline-block mb-6">
            <div className="w-24 h-24 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mx-auto">
              <CheckCircle2 size={44} className="text-green-400" />
            </div>
            <span className="absolute inset-0 rounded-full bg-green-400/10 animate-ping" />
          </div>
          <h2 className="font-display text-2xl font-bold text-white mb-2">Report Submitted!</h2>
          <p className="text-muted text-sm mb-4 leading-relaxed">
            Your complaint has been logged and will appear on the live map shortly. Authorities have been notified.
          </p>

          <div className="bg-accent/10 border border-accent/30 rounded-2xl p-4 mb-6 animate-fade-up">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Zap size={20} className="text-accent fill-accent" />
              <span className="text-white font-bold text-xl">+50</span>
            </div>
            <p className="text-accent text-xs font-bold uppercase tracking-widest">Reward Points Earned</p>
          </div>

          {aiResult && (
            <div className="card p-3 mb-6 text-left">
              <p className="text-muted text-xs mb-2">AI classified as:</p>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{aiResult.icon}</span>
                <span className="text-white font-medium text-sm">{aiResult.type}</span>
                <span className={`badge ml-auto ${PRIORITY_CONFIG[aiResult.priority]?.bg} ${PRIORITY_CONFIG[aiResult.priority]?.text}`}>
                  {aiResult.priority}
                </span>
              </div>
            </div>
          )}
          <div className="flex flex-col gap-3">
            <button
              onClick={() => { setStep(1); clearImage(); setForm({ title:"", description:"", location:"" }); }}
              className="btn-primary flex items-center justify-center gap-2"
            >
              <Camera size={16} /> Report Another
            </button>
            <button onClick={() => navigate("/map")} className="btn-ghost flex items-center justify-center gap-2">
              <MapPin size={16} /> See on Map <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Form ── */
  return (
    <div className="page-container pb-32 md:pb-8 px-4">
      <div className="max-w-lg mx-auto py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-up">
          <div className="flex items-center gap-2 mb-1">
            <span className="badge bg-accent/10 text-accent border border-accent/20">New Report</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-white mt-2">Report an Issue</h1>
          <p className="text-muted text-sm mt-1">AI will automatically classify your complaint.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Image upload */}
          <div className="animate-fade-up" style={{ animationDelay: "80ms", animationFillMode: "both" }}>
            <ImageUpload preview={preview} onFile={handleFile} onClear={clearImage} />
          </div>

          {/* AI Result */}
          {aiResult && (
            <div style={{ animationDelay: "0ms" }}>
              <AIResult result={aiResult} />
            </div>
          )}

          {/* Description */}
          <div className="animate-fade-up" style={{ animationDelay: "160ms", animationFillMode: "both" }}>
            <label className="block text-sm font-medium text-white mb-2">
              <div className="flex items-center gap-1.5">
                <FileText size={14} className="text-accent" />
                Description <span className="text-red-400">*</span>
              </div>
            </label>
            <textarea
              className="input-field resize-none"
              rows={3}
              placeholder="Describe the issue (e.g. Large pothole causing traffic on main road)"
              value={form.description}
              onChange={handleDescChange}
            />
          </div>

          {/* Location */}
          <div className="animate-fade-up" style={{ animationDelay: "240ms", animationFillMode: "both" }}>
            <label className="block text-sm font-medium text-white mb-2">
              <div className="flex items-center gap-1.5">
                <MapPin size={14} className="text-accent" />
                Location <span className="text-red-400">*</span>
              </div>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                className="input-field flex-1"
                placeholder="Enter location or use GPS"
                value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
              />
              <button
                type="button"
                onClick={getLocation}
                className="flex-shrink-0 px-4 py-3 bg-surface2 border border-border/60 rounded-xl text-accent hover:bg-accent/10 hover:border-accent/40 transition-all text-sm font-medium flex items-center gap-1.5"
              >
                <MapPin size={14} />
                <span className="hidden sm:inline">GPS</span>
              </button>
            </div>
          </div>

          {/* Info note */}
          <div className="flex items-start gap-2 p-3 rounded-xl bg-yellow-500/5 border border-yellow-500/15 animate-fade-up" style={{ animationDelay: "320ms", animationFillMode: "both" }}>
            <AlertTriangle size={15} className="text-yellow-400 mt-0.5 flex-shrink-0" />
            <p className="text-yellow-400/80 text-xs leading-relaxed">
              Your report will be visible to authorities and on the public map. Do not report false issues.
            </p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex items-center justify-center gap-2 py-4 text-base animate-fade-up"
            style={{ animationDelay: "400ms", animationFillMode: "both" }}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Submitting…
              </>
            ) : (
              <>
                <Zap size={18} />
                Submit Report
                <ChevronRight size={16} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
