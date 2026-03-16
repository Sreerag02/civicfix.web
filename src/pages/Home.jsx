// src/pages/Home.jsx
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  MapPin, Zap, Shield, TrendingUp, ArrowRight,
  Camera, Brain, CheckCircle, ChevronDown, Users, AlertTriangle,
} from "lucide-react";

/* ── Animated counter ── */
function Counter({ to, suffix = "" }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      let start = 0;
      const step = Math.ceil(to / 60);
      const timer = setInterval(() => {
        start += step;
        if (start >= to) { setCount(to); clearInterval(timer); }
        else setCount(start);
      }, 20);
    });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [to]);

  return <span ref={ref}>{count}{suffix}</span>;
}

/* ── Step card ── */
function Step({ num, icon: Icon, title, desc, delay }) {
  return (
    <div
      className="relative flex gap-4 animate-fade-up"
      style={{ animationDelay: `${delay}ms`, animationFillMode: "both" }}
    >
      <div className="flex flex-col items-center">
        <div className="w-10 h-10 rounded-xl bg-accent/15 border border-accent/30 flex items-center justify-center text-accent font-bold text-sm flex-shrink-0">
          {num}
        </div>
        {num < 4 && <div className="w-px flex-1 bg-gradient-to-b from-accent/30 to-transparent mt-2" />}
      </div>
      <div className="pb-8">
        <div className="flex items-center gap-2 mb-1">
          <Icon size={15} className="text-accent" />
          <h3 className="font-display font-semibold text-white text-sm">{title}</h3>
        </div>
        <p className="text-muted text-sm leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

/* ── Feature card ── */
function Feature({ icon, title, desc, color, delay }) {
  return (
    <div
      className="card p-5 hover:border-accent/30 hover:shadow-glow transition-all duration-300 group animate-fade-up"
      style={{ animationDelay: `${delay}ms`, animationFillMode: "both" }}
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 text-xl`}
           style={{ background: `${color}18`, boxShadow: `0 0 12px ${color}20` }}>
        {icon}
      </div>
      <h3 className="font-display font-semibold text-white mb-1.5 group-hover:text-accent transition-colors">{title}</h3>
      <p className="text-muted text-sm leading-relaxed">{desc}</p>
    </div>
  );
}

export default function Home() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="page-container pb-24 md:pb-0">
      {/* ── Hero ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 text-center overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-dots opacity-60 pointer-events-none" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-accent/10 rounded-full blur-[120px] pointer-events-none opacity-50" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />

        {/* Floating badge */}
        <div
          className={`inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-6 text-sm text-accent border border-accent/20 transition-all duration-700 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-green-400 animate-ping-slow" />
          AI-Powered Civic Reporting • Live Now
        </div>

        {/* Headline */}
        <h1
          className={`font-display text-4xl sm:text-5xl md:text-7xl font-bold text-white mb-5 text-balance leading-tight transition-all duration-700 delay-100 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          Fix Your City
          <br />
          <span className="gradient-text">Powered by AI</span>
        </h1>

        <p
          className={`text-muted text-lg max-w-xl mb-8 leading-relaxed transition-all duration-700 delay-200 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          Report civic issues with one photo. Our AI automatically detects,
          classifies, and routes your complaint — no forms, no guesswork.
        </p>

        {/* CTA buttons */}
        <div
          className={`flex flex-col sm:flex-row gap-3 transition-all duration-700 delay-300 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <Link to="/report" className="btn-primary flex items-center justify-center gap-2 text-base">
            <Camera size={18} />
            Report an Issue
            <ArrowRight size={16} />
          </Link>
          <Link to="/map" className="btn-ghost flex items-center justify-center gap-2 text-base">
            <MapPin size={18} />
            View Live Map
          </Link>
        </div>

        {/* Stats row */}
        <div
          className={`grid grid-cols-3 gap-4 mt-14 w-full max-w-md transition-all duration-700 delay-500 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          {[
            { val: 1240, suffix: "+", label: "Issues Reported" },
            { val: 89,   suffix: "%", label: "AI Accuracy" },
            { val: 47,   suffix: "h", label: "Avg. Resolution" },
          ].map(({ val, suffix, label }) => (
            <div key={label} className="card py-4 px-3 text-center">
              <div className="font-display text-2xl font-bold text-accent">
                <Counter to={val} suffix={suffix} />
              </div>
              <div className="text-muted text-xs mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* Scroll cue */}
        <a href="#how" className="absolute bottom-10 left-1/2 -translate-x-1/2 text-muted hover:text-white transition-colors animate-float">
          <ChevronDown size={24} />
        </a>
      </section>

      {/* ── How it works ── */}
      <section id="how" className="px-4 py-16 max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <span className="badge bg-accent/10 text-accent border border-accent/20 mb-3">How It Works</span>
          <h2 className="section-title">Report in 3 steps</h2>
        </div>
        <div>
          {[
            { icon: Camera, title: "Snap a photo",        desc: "Take a photo of the civic issue — pothole, garbage, broken light, or anything else." },
            { icon: Brain,  title: "AI detects the issue",desc: "Our AI analyzes the image and automatically classifies the issue type and priority level." },
            { icon: CheckCircle, title: "Gets reported & tracked", desc: "Your report is geotagged, stored in our database, and shown on the live city map for authorities." },
          ].map((s, i) => (
            <Step key={s.title} num={i + 1} {...s} delay={i * 100} />
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="px-4 py-16 max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <span className="badge bg-accent/10 text-accent border border-accent/20 mb-3">Features</span>
          <h2 className="section-title">Why CivicFix?</h2>
          <p className="text-muted mt-2 max-w-md mx-auto text-sm">Everything your city needs to manage civic issues intelligently.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { icon: "🧠", color: "#10b981", title: "AI Auto-Detection",   desc: "No manual category selection. AI reads your photo and classifies instantly.", delay: 0   },
            { icon: "🗺️", color: "#34d399", title: "Real-Time Map",       desc: "See all issues on a live interactive map. Click any pin for full details.",  delay: 80  },
            { icon: "🔥", color: "#059669", title: "Priority Scoring",    desc: "Critical issues are automatically flagged for immediate authority action.",   delay: 160 },
            { icon: "📊", color: "#10b981", title: "Status Tracking",     desc: "Follow your complaint from 'Reported' to 'In Progress' to 'Resolved'.",      delay: 240 },
            { icon: "👥", color: "#34d399", title: "Community Upvotes",   desc: "Upvote issues to show importance. Crowd wisdom helps prioritize fixes.",     delay: 320 },
            { icon: "🌊", color: "#10b981", title: "Emergency Mode",      desc: "During disasters, report blocked roads and flooded areas on a crisis map.",  delay: 400 },
          ].map((f) => <Feature key={f.title} {...f} />)}
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="px-4 py-12 max-w-3xl mx-auto">
        <div className="card p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-emerald-500/5 pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center justify-center gap-2 mb-3">
              <AlertTriangle size={18} className="text-yellow-400" />
              <span className="text-yellow-400 text-sm font-medium">See a problem?</span>
            </div>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-white mb-3">
              Be the change your city needs
            </h2>
            <p className="text-muted text-sm mb-6 max-w-sm mx-auto">
              Every report helps authorities respond faster. It takes less than 30 seconds.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/report" className="btn-primary flex items-center justify-center gap-2">
                <Camera size={16} /> Report Now
              </Link>
              <Link to="/issues" className="btn-ghost flex items-center justify-center gap-2">
                <Users size={16} /> View All Issues
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
