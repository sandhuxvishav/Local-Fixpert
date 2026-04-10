import { useState, useEffect } from "react";
import { CheckCircle, Clock, Pencil, Star, LogOut, Bell, ChevronRight, MapPin, Calendar, Menu, X } from "lucide-react";

// ─── Mock Backend API ────────────────────────────────────────────────────────
const mockDB = {
  user: {
    id: "exp_001",
    name: "Jaskerat",
    email: "jaskerat@localfixperts.com",
    profilePhoto: null,
    rating: 4.6,
    totalReviews: 33,
    availability: true,
    completedJobs: 23,
    skills: ["Plumbing", "Pipe Fixing", "Bathroom Repair"],
    location: "Ludhiana, Punjab",
  },
  pendingRequests: [
    { id: "req_1", name: "Muskan", location: "Tarn-Taran", note: "Kitchen sink repair", service: "Plumbing", scheduledDate: "April 14", status: "pending" },
    { id: "req_2", name: "Harkirat", location: "Amritsar", note: "Shower repair", service: "Plumbing", scheduledDate: "April 15", status: "pending" },
    { id: "req_3", name: "Yugraj Singh", location: "Sarhali", note: "Whole bathroom repair", service: "Bathroom Repair", scheduledDate: "April 16", status: "pending" },
  ],
  activeJobs: [
    { id: "job_1", name: "Jaideep Singh", service: "Pipe fixing", scheduledDate: "April 12", status: "active", location: "Ludhiana" },
    { id: "job_2", name: "Harkirat", service: "Pipe fixing", scheduledDate: "April 12", status: "active", location: "Amritsar" },
    { id: "job_3", name: "Vishav Singh", service: "Pipe fixing", scheduledDate: "April 12", status: "active", location: "Patiala" },
  ],
  notifications: [
    { id: "n1", message: "New booking request from Muskan", time: "2 min ago", read: false },
    { id: "n2", message: "Job with Jaideep confirmed for April 12", time: "1 hr ago", read: false },
    { id: "n3", message: "You received a 5-star review!", time: "3 hrs ago", read: true },
  ],
};

const api = {
  getUser: () => Promise.resolve({ ...mockDB.user }),
  getPendingRequests: () => Promise.resolve([...mockDB.pendingRequests]),
  getActiveJobs: () => Promise.resolve([...mockDB.activeJobs]),
  getNotifications: () => Promise.resolve([...mockDB.notifications]),
  acceptRequest: (id) => {
    const req = mockDB.pendingRequests.find((r) => r.id === id);
    if (req) {
      mockDB.pendingRequests = mockDB.pendingRequests.filter((r) => r.id !== id);
      mockDB.activeJobs.unshift({ ...req, id: `job_${Date.now()}`, status: "active" });
      mockDB.user.pendingJobs = mockDB.pendingRequests.length;
    }
    return Promise.resolve({ success: true });
  },
  declineRequest: (id) => {
    mockDB.pendingRequests = mockDB.pendingRequests.filter((r) => r.id !== id);
    return Promise.resolve({ success: true });
  },
  toggleAvailability: (val) => {
    mockDB.user.availability = val;
    return Promise.resolve({ success: true, availability: val });
  },
  markNotificationsRead: () => {
    mockDB.notifications = mockDB.notifications.map((n) => ({ ...n, read: true }));
    return Promise.resolve({ success: true });
  },
};

// ─── Sub-components ──────────────────────────────────────────────────────────

const Avatar = ({ name, photo, size = 96 }) => {
  const initials = name?.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  if (photo) return <img src={photo} alt={name} style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", border: "3px solid #2563eb" }} />;
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: "linear-gradient(135deg,#2563eb,#3b82f6)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 600, fontSize: size * 0.3, border: "3px solid #fff", boxShadow: "0 4px 16px rgba(37,99,235,0.25)" }}>
      {initials}
    </div>
  );
};

const Badge = ({ count }) =>
  count > 0 ? (
    <span style={{ position: "absolute", top: -4, right: -4, background: "#ef4444", color: "#fff", borderRadius: "50%", width: 18, height: 18, fontSize: 11, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1 }}>
      {count}
    </span>
  ) : null;

const StatCard = ({ icon: Icon, label, value, onClick, accent }) => (
  <div onClick={onClick} style={{ background: "#fff", borderRadius: 16, padding: "20px 16px", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, cursor: onClick ? "pointer" : "default", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", border: "1px solid #e5e7eb", transition: "transform 0.15s,box-shadow 0.15s" }}
    onMouseEnter={(e) => { if (onClick) { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(37,99,235,0.15)"; } }}
    onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)"; }}>
    <div style={{ background: accent || "#eff6ff", borderRadius: 12, padding: 10, display: "flex" }}>
      <Icon size={22} color="#2563eb" />
    </div>
    <p style={{ margin: 0, fontSize: 13, color: "#6b7280", fontWeight: 500 }}>{label}</p>
    {value && <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#111827" }}>{value}</p>}
  </div>
);

const RatingCard = ({ rating, reviews }) => (
  <div style={{ background: "#fff", borderRadius: 16, padding: "20px 16px", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", border: "1px solid #e5e7eb" }}>
    <div style={{ display: "flex", gap: 3 }}>
      {[1, 2, 3].map((i) => (
        <Star key={i} size={22} fill={i <= Math.floor(rating) ? "#f59e0b" : (i - 0.5 <= rating ? "#f59e0b" : "none")} color="#f59e0b" />
      ))}
    </div>
    <p style={{ margin: 0, fontSize: 13, color: "#6b7280", fontWeight: 500 }}>Your Rating</p>
    <p style={{ margin: 0, fontSize: 24, fontWeight: 700, color: "#111827" }}>{rating} <span style={{ fontSize: 12, color: "#9ca3af", fontWeight: 400 }}>({reviews} reviews)</span></p>
  </div>
);

const Toast = ({ message, type, onClose }) => (
  <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 1000, background: type === "success" ? "#dcfce7" : "#fee2e2", border: `1px solid ${type === "success" ? "#86efac" : "#fca5a5"}`, color: type === "success" ? "#166534" : "#991b1b", borderRadius: 12, padding: "12px 20px", display: "flex", alignItems: "center", gap: 10, fontSize: 14, fontWeight: 500, boxShadow: "0 4px 16px rgba(0,0,0,0.12)", animation: "fadeIn 0.2s ease" }}>
    {message}
    <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", marginLeft: 4, padding: 0 }}><X size={14} /></button>
  </div>
);

// ─── Main Component ──────────────────────────────────────────────────────────

export default function ExpertDashboard() {
  const [user, setUser] = useState(null);
  const [pending, setPending] = useState([]);
  const [activeJobs, setActiveJobs] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [availability, setAvailability] = useState(true);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [showNotif, setShowNotif] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [actionLoading, setActionLoading] = useState({});

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    Promise.all([api.getUser(), api.getPendingRequests(), api.getActiveJobs(), api.getNotifications()])
      .then(([u, p, a, n]) => {
        setUser(u);
        setPending(p);
        setActiveJobs(a);
        setNotifications(n);
        setAvailability(u.availability);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleAccept = async (id) => {
    setActionLoading((prev) => ({ ...prev, [id]: "accept" }));
    await api.acceptRequest(id);
    const [p, a] = await Promise.all([api.getPendingRequests(), api.getActiveJobs()]);
    setPending(p);
    setActiveJobs(a);
    setActionLoading((prev) => ({ ...prev, [id]: null }));
    showToast("Request accepted! Job added to Active Jobs.", "success");
  };

  const handleDecline = async (id) => {
    setActionLoading((prev) => ({ ...prev, [id]: "decline" }));
    await api.declineRequest(id);
    setPending(await api.getPendingRequests());
    setActionLoading((prev) => ({ ...prev, [id]: null }));
    showToast("Request declined.", "error");
  };

  const handleToggleAvailability = async () => {
    const newVal = !availability;
    setAvailability(newVal);
    await api.toggleAvailability(newVal);
    showToast(`You are now ${newVal ? "Online" : "Offline"}.`, newVal ? "success" : "error");
  };

  const handleNotifOpen = async () => {
    setShowNotif((v) => !v);
    if (!showNotif) {
      await api.markNotificationsRead();
      setNotifications((n) => n.map((x) => ({ ...x, read: true })));
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#eef2f7" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
        <div style={{ width: 40, height: 40, border: "3px solid #2563eb", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <p style={{ color: "#6b7280", fontSize: 15 }}>Loading your dashboard…</p>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#eef2f7", fontFamily: "'Segoe UI', sans-serif" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        * { box-sizing: border-box; }
        .req-card { transition: box-shadow 0.15s; }
        .req-card:hover { box-shadow: 0 4px 16px rgba(37,99,235,0.10); }
      `}</style>

      {/* NAVBAR */}
      <nav style={{ background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.08)", position: "sticky", top: 0, zIndex: 200, padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ background: "#2563eb", borderRadius: 10, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#fff", fontWeight: 700, fontSize: 18 }}>T</span>
          </div>
          <span style={{ fontWeight: 700, fontSize: 18, color: "#1e40af", letterSpacing: -0.5 }}>Local<span style={{ color: "#2563eb" }}>Fixperts</span></span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ position: "relative" }}>
            <button onClick={handleNotifOpen} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", color: "#374151", padding: 6, borderRadius: 8 }}>
              <Bell size={20} />
              <Badge count={unreadCount} />
            </button>
            {showNotif && (
              <div style={{ position: "absolute", right: 0, top: 40, background: "#fff", borderRadius: 14, boxShadow: "0 8px 32px rgba(0,0,0,0.15)", width: 300, zIndex: 500, overflow: "hidden", animation: "fadeIn 0.2s ease" }}>
                <div style={{ padding: "14px 16px", borderBottom: "1px solid #f3f4f6", fontWeight: 600, fontSize: 14, color: "#111827" }}>Notifications</div>
                {notifications.map((n) => (
                  <div key={n.id} style={{ padding: "12px 16px", borderBottom: "1px solid #f9fafb", background: n.read ? "#fff" : "#eff6ff", display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: n.read ? "#d1d5db" : "#2563eb", marginTop: 5, flexShrink: 0 }} />
                    <div>
                      <p style={{ margin: 0, fontSize: 13, color: "#374151" }}>{n.message}</p>
                      <p style={{ margin: 0, fontSize: 11, color: "#9ca3af", marginTop: 2 }}>{n.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <span style={{ fontSize: 14, color: "#374151", fontWeight: 500 }}>{user?.name}</span>
          <Avatar name={user?.name} photo={user?.profilePhoto} size={36} />
        </div>
      </nav>

      {/* HERO */}
      <div style={{ padding: "32px 32px 0", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 24, maxWidth: 1200, margin: "0 auto" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 32, fontWeight: 700, color: "#111827" }}>
            Welcome back, {user?.name} <span style={{ fontSize: 28 }}>👋</span>
          </h1>
          <p style={{ margin: "8px 0 0", fontSize: 16, color: "#6b7280" }}>Here's your latest stats and job updates.</p>
          <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: availability ? "#dcfce7" : "#fee2e2", color: availability ? "#166534" : "#991b1b", borderRadius: 20, padding: "4px 14px", fontSize: 13, fontWeight: 600 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: availability ? "#22c55e" : "#ef4444", display: "inline-block" }} />
              {availability ? "Available" : "Offline"}
            </span>
          </div>
        </div>
        <div style={{ position: "relative" }}>
          <Avatar name={user?.name} photo={user?.profilePhoto} size={110} />
          <div style={{ position: "absolute", bottom: 4, right: 4, background: availability ? "#22c55e" : "#9ca3af", width: 18, height: 18, borderRadius: "50%", border: "2px solid #fff" }} />
        </div>
      </div>

      {/* STATS */}
      <div style={{ padding: "24px 32px 0", maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 16 }}>
        <StatCard icon={CheckCircle} label="Jobs Completed" value={user?.completedJobs} onClick={() => setActiveTab("completed")} />
        <StatCard icon={Clock} label="Pending Requests" value={pending.length} onClick={() => setActiveTab("pending")} />
        <StatCard icon={Pencil} label="Edit Profile" onClick={() => setActiveTab("profile")} />
        <RatingCard rating={user?.rating} reviews={user?.totalReviews} />
      </div>

      {/* MAIN GRID */}
      <div style={{ padding: "24px 32px 40px", maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 380px", gap: 24 }}>

        {/* LEFT — Pending Requests */}
        <div>
          <div style={{ background: "#2563eb", borderRadius: "14px 14px 0 0", padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h2 style={{ margin: 0, color: "#fff", fontSize: 17, fontWeight: 600 }}>Pending Requests</h2>
            <span style={{ background: "#fff", color: "#2563eb", borderRadius: 20, padding: "2px 12px", fontSize: 13, fontWeight: 700 }}>{pending.length}</span>
          </div>
          <div style={{ background: "#fff", borderRadius: "0 0 14px 14px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", overflow: "hidden" }}>
            {pending.length === 0 ? (
              <div style={{ padding: 40, textAlign: "center", color: "#9ca3af" }}>
                <CheckCircle size={40} style={{ margin: "0 auto 12px", opacity: 0.3 }} />
                <p style={{ margin: 0 }}>No pending requests</p>
              </div>
            ) : pending.map((req, i) => (
              <div key={req.id} className="req-card" style={{ padding: "18px 20px", borderBottom: i < pending.length - 1 ? "1px solid #f3f4f6" : "none", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                    <Avatar name={req.name} size={40} />
                    <div>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: 15, color: "#111827" }}>{req.name}</p>
                      <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
                        <MapPin size={12} color="#9ca3af" />
                        <span style={{ fontSize: 12, color: "#6b7280" }}>{req.location}</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <span style={{ background: "#eff6ff", color: "#2563eb", borderRadius: 8, padding: "2px 10px", fontSize: 12, fontWeight: 500 }}>{req.service}</span>
                    <span style={{ background: "#f9fafb", color: "#6b7280", borderRadius: 8, padding: "2px 10px", fontSize: 12 }}>{req.note}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 6 }}>
                    <Calendar size={12} color="#9ca3af" />
                    <span style={{ fontSize: 12, color: "#9ca3af" }}>Scheduled: {req.scheduledDate}</span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                  <button onClick={() => handleAccept(req.id)} disabled={!!actionLoading[req.id]}
                    style={{ background: "#2563eb", color: "#fff", border: "none", borderRadius: 10, padding: "8px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer", opacity: actionLoading[req.id] ? 0.7 : 1, transition: "background 0.15s" }}
                    onMouseEnter={(e) => { e.target.style.background = "#1d4ed8"; }} onMouseLeave={(e) => { e.target.style.background = "#2563eb"; }}>
                    {actionLoading[req.id] === "accept" ? "..." : "Accept"}
                  </button>
                  <button onClick={() => handleDecline(req.id)} disabled={!!actionLoading[req.id]}
                    style={{ background: "#ef4444", color: "#fff", border: "none", borderRadius: 10, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", opacity: actionLoading[req.id] ? 0.7 : 1 }}
                    onMouseEnter={(e) => { e.target.style.background = "#dc2626"; }} onMouseLeave={(e) => { e.target.style.background = "#ef4444"; }}>
                    {actionLoading[req.id] === "decline" ? "..." : "Decline"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* ACTIVE JOBS */}
          <div>
            <div style={{ background: "#2563eb", borderRadius: "14px 14px 0 0", padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h2 style={{ margin: 0, color: "#fff", fontSize: 17, fontWeight: 600 }}>Active Jobs</h2>
              <span style={{ background: "#fff", color: "#2563eb", borderRadius: 20, padding: "2px 10px", fontSize: 13, fontWeight: 700 }}>{activeJobs.length}</span>
            </div>
            <div style={{ background: "#fff", borderRadius: "0 0 14px 14px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", overflow: "hidden" }}>
              {activeJobs.map((job, i) => (
                <div key={job.id} style={{ padding: "14px 18px", borderBottom: i < activeJobs.length - 1 ? "1px solid #f3f4f6" : "none", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: "#111827" }}>{job.name}</p>
                    <p style={{ margin: "3px 0 0", fontSize: 12, color: "#6b7280", display: "flex", gap: 6 }}>
                      <span style={{ color: "#9ca3af" }}>({job.service})</span>
                      <span>Scheduled: {job.scheduledDate}</span>
                    </p>
                  </div>
                  <button style={{ background: "#2563eb", color: "#fff", border: "none", borderRadius: 10, padding: "7px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                    View <ChevronRight size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* MANAGE PROFILE */}
          <div style={{ background: "#fff", borderRadius: 14, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", padding: "18px 20px" }}>
            <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700, color: "#2563eb" }}>Manage Profile</h3>
            <div style={{ borderTop: "1px solid #f3f4f6", paddingTop: 16, display: "flex", flexDirection: "column", gap: 16 }}>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: availability ? "#dcfce7" : "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ width: 10, height: 10, borderRadius: "50%", background: availability ? "#22c55e" : "#9ca3af", display: "block" }} />
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 500, color: "#374151" }}>Availability: <strong style={{ color: availability ? "#166534" : "#6b7280" }}>{availability ? "Online" : "Offline"}</strong></span>
                </div>
                <button onClick={handleToggleAvailability} style={{ width: 46, height: 26, borderRadius: 13, background: availability ? "#22c55e" : "#d1d5db", border: "none", cursor: "pointer", position: "relative", transition: "background 0.2s" }}>
                  <span style={{ position: "absolute", top: 3, left: availability ? 23 : 3, width: 20, height: 20, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.15)", transition: "left 0.2s" }} />
                </button>
              </div>

              <button style={{ display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", cursor: "pointer", padding: "8px 0", fontSize: 14, color: "#374151", fontWeight: 500 }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Pencil size={14} color="#2563eb" />
                </div>
                Edit Profile
              </button>

              <button style={{ display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", cursor: "pointer", padding: "8px 0", fontSize: 14, color: "#ef4444", fontWeight: 500 }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <LogOut size={14} color="#ef4444" />
                </div>
                Log out
              </button>

            </div>
          </div>

        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}