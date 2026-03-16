// src/components/Navbar.jsx
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, MapPin, Camera, List, ShieldCheck, LogOut, User } from "lucide-react";
import { useContext } from "react";
import { AppContext } from "../context/AppContext";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { token, setToken, userData } = useContext(AppContext);

  const isActive = (path) => location.pathname === path;

  const logout = () => {
    setToken("");
    localStorage.removeItem("token");
    navigate("/login");
  };

  const navLinks = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/report", icon: Camera, label: "Report" },
    { path: "/map", icon: MapPin, label: "Map" },
    { path: "/issues", icon: List, label: "Issues" },
  ];

  return (
    <>
      {/* ── Desktop Navbar ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 hidden md:block border-b border-border/40 bg-bg/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shadow-glow group-hover:scale-110 transition-transform">
              <ShieldCheck size={20} className="text-white" />
            </div>
            <span className="font-display font-bold text-xl text-white tracking-tight">
              Civic<span className="text-accent">Fix</span>
            </span>
          </Link>

          <div className="flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  isActive(link.path)
                    ? "bg-accent/10 text-accent"
                    : "text-muted hover:text-white hover:bg-white/5"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            {token && userData && (
              <div className="flex items-center gap-2 bg-accent/10 px-3 py-1.5 rounded-full border border-accent/20">
                <span className="text-xs font-bold text-accent uppercase tracking-tighter">Rewards</span>
                <span className="text-sm font-black text-white">{userData.rewards}</span>
              </div>
            )}
            
            {token ? (
              <div className="flex items-center gap-3">
                 <div className="flex items-center gap-2 text-white/80">
                   <User size={18} />
                   <span className="text-sm font-medium">{userData?.name}</span>
                 </div>
                 <button onClick={logout} className="p-2 text-muted hover:text-red-400 transition-colors">
                   <LogOut size={20} />
                 </button>
              </div>
            ) : (
              <Link to="/login" className="btn-primary py-2 px-5 text-sm h-10">
                Login
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* ── Mobile Bottom Tab Bar ── */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-border/40 bg-surface/90 backdrop-blur-lg px-4 pb-safe">
        <div className="flex items-center justify-around h-16">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`flex flex-col items-center gap-1 px-3 transition-colors ${
                isActive(link.path) ? "text-accent" : "text-muted"
              }`}
            >
              <link.icon size={20} strokeWidth={isActive(link.path) ? 2.5 : 2} />
              <span className="text-[10px] font-medium uppercase tracking-wider">
                {link.label}
              </span>
            </Link>
          ))}
          {token ? (
             <button onClick={logout} className="flex flex-col items-center gap-1 px-3 text-muted">
               <LogOut size={20} />
               <span className="text-[10px] font-medium uppercase tracking-wider">Logout</span>
             </button>
          ) : (
            <Link to="/login" className="flex flex-col items-center gap-1 px-3 text-muted">
              <User size={20} />
              <span className="text-[10px] font-medium uppercase tracking-wider">Login</span>
            </Link>
          )}
        </div>
      </nav>
    </>
  );
}
