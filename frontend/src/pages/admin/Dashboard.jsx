import { useEffect, useState, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchDiamonds } from "../../store/diamondSlice";
import { TrendingUp, Award, Banknote, Search, Bell, ArrowUpRight, ListFilter, X, UserPlus, Mail, ShieldAlert, Info, Clock, RefreshCw } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { socket } from "../../socket";
import { fetchUsers } from "../../store/userSlice";
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  addRealtimeNotification
} from "../../store/notificationSlice";

const typeConfig = {
  registration: { icon: UserPlus, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  contact: { icon: Mail, color: "text-blue-400", bg: "bg-blue-500/10" },
  alert: { icon: ShieldAlert, color: "text-red-400", bg: "bg-red-500/10" },
  system: { icon: Bell, color: "text-amber-400", bg: "bg-amber-500/10" },
  login: { icon: Info, color: "text-cyan-400", bg: "bg-cyan-500/10" },
};

const formatTime = (dateStr) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

export const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, metadata, totalDiamonds } = useSelector(state => state.diamonds);
  const { users } = useSelector((state) => state.users);
  const { notifications, unreadCount } = useSelector((state) => state.notifications);
  const isDarkMode = useSelector((state) => state.theme?.isDarkMode ?? true);

  // Theme classes
  const pageBg = isDarkMode ? "bg-[#0F171F] text-slate-300" : "bg-slate-50 text-slate-700";
  const cardBg = isDarkMode ? "bg-[#111922] border-slate-800" : "bg-white border-slate-200";
  const cardHighlight = isDarkMode ? "bg-[#15202B] border-blue-500/30" : "bg-blue-50 border-blue-200";
  const inputBg = isDarkMode ? "bg-[#15202B] border-slate-800 text-white" : "bg-white border-slate-300 text-slate-900";
  const notifBg = isDarkMode ? "bg-[#111922] border-slate-800" : "bg-white border-slate-200";
  const notifHover = isDarkMode ? "hover:bg-[#15202B]/50" : "hover:bg-slate-50";
  const headText = isDarkMode ? "text-white" : "text-slate-900";
  const tooltipStyle = isDarkMode
    ? { backgroundColor: '#15202B', border: '1px solid #334155', borderRadius: '12px', fontSize: '12px' }
    : { backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '12px' };

  useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchNotifications({ page: 1, limit: 10 }));
  }, [dispatch]);

  const [selectedShape, setSelectedShape] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);

  const markAllAsRead = () => {
    dispatch(markAllNotificationsRead());
  };

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    socket.on("connect", () => {
      socket.emit("join-admin");
    });

    socket.on("notification", (data) => {
      dispatch(addRealtimeNotification(data));
    });

    return () => {
      socket.off("connect");
      socket.off("notification");
    };
  }, [dispatch]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(e.target)
      ) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    dispatch(fetchDiamonds({
      page: 1,
      limit: 12,
      search: searchQuery,
      includeStats: true,
    }));
  }, [dispatch, searchQuery]);

  const shapeDataProfiles = useMemo(() => {
    const profiles = {};
    const colors = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#0ea5e9", "#ef4444", "#06b6d2"];

    (metadata.shapeStats || []).forEach((stat, index) => {
      const avgPrice = Math.round(stat.avgPrice || 0);
      profiles[stat._id] = {
        avgPrice: avgPrice,
        count: stat.count,
        prices: [
          Math.round(avgPrice * 0.92),
          Math.round(avgPrice * 0.95),
          Math.round(avgPrice * 0.94),
          Math.round(avgPrice * 0.98),
          avgPrice,
          Math.round(avgPrice * 0.99),
          Math.round(avgPrice * 1.05)
        ],
        color: colors[index % colors.length],
        trend: "+3.8%"
      };
    });
    return profiles;
  }, [metadata.shapeStats]);

  // Auto-select first available shape when data loads
  useEffect(() => {
    const shapes = Object.keys(shapeDataProfiles);
    if (shapes.length > 0 && (!selectedShape || !shapeDataProfiles[selectedShape])) {
      setSelectedShape(shapes[0]);
    }
  }, [shapeDataProfiles]);

  const activeProfile = useMemo(() => {
    const profile = shapeDataProfiles[selectedShape] || Object.values(shapeDataProfiles)[0] || { prices: [0, 0, 0, 0, 0, 0, 0], color: "#3b82f6" };
    console.log("[DASHBOARD] Metadata:", metadata);
    console.log("[DASHBOARD] Active Profile for", selectedShape, ":", profile);
    return profile;
  }, [shapeDataProfiles, selectedShape, metadata]);

  const chartData = useMemo(() => {
    const months = ["Jan", "Mar", "May", "Jul", "Sep", "Nov", "Dec"];
    return months.map((month, i) => ({
      name: month,
      price: activeProfile.prices[i] || 0,
    }));
  }, [activeProfile]);

  const activeColor = activeProfile.color;
  const totalValue = metadata.totalValue || 0;

  const recentNotifications = notifications.slice(0, 8);

  return (
    <div className={`flex-1 min-h-screen p-8 font-sans transition-colors duration-300 ${pageBg}`}>

      <header className="flex justify-between items-center mb-10">
        <div>
          <h1 className={`text-3xl font-normal ${headText}`}>
            Market Overview
          </h1>
          <p className="text-sm text-slate-500 uppercase tracking-widest mt-2">
            Diamond Analytics Portal
          </p>
        </div>

        <div className="flex items-center space-x-6">
          <div className="relative w-64 hidden lg:block">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              size={16}
            />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search assets..."
              className={`w-full border rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500 ${inputBg}`}
            />
          </div>

          <button
            onClick={() => {
              dispatch(fetchDiamonds({ page: 1, limit: 12, includeStats: true }));
              dispatch(fetchUsers());
              dispatch(fetchNotifications({ page: 1, limit: 10 }));
            }}
            className={`p-2 rounded-xl transition-all border ${isDarkMode ? 'bg-[#15202B] border-slate-800 text-slate-400 hover:text-white hover:border-slate-600' : 'bg-white border-slate-200 text-slate-500 hover:text-slate-900 hover:border-slate-400'}`}
            title="Refresh Dashboard"
          >
            <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
          </button>

          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 hover:bg-slate-800 rounded-xl"
            >
              <Bell size={20} className="text-slate-400 hover:text-white cursor-pointer" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-400 rounded-full animate-pulse" />
              )}
            </button>

            {showNotifications && (
              <div className={`absolute right-0 mt-4 w-96 border rounded-2xl shadow-2xl z-50 ${notifBg}`}>
                <div className={`flex justify-between items-center px-5 py-4 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                  <h4 className={`text-sm font-normal ${headText} uppercase tracking-widest`}>
                    Notifications
                  </h4>
                  <div className="flex items-center gap-3">
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-[12px] text-blue-400 font-normal"
                      >
                        Mark all read
                      </button>
                    )}
                    <X
                      size={16}
                      onClick={() => setShowNotifications(false)}
                      className={`${isDarkMode ? 'text-slate-500 hover:text-white' : 'text-slate-400 hover:text-slate-900'} cursor-pointer`}
                    />
                  </div>
                </div>

                {/* List */}
                <div className="max-h-80 overflow-y-auto">
                  {recentNotifications.length === 0 ? (
                    <div className="flex flex-col items-center py-10">
                      <Bell size={24} className="text-slate-600 mb-3" />
                      <p className="text-xs text-slate-500">No notifications yet</p>
                    </div>
                  ) : (
                    recentNotifications.map((n) => {
                      const config = typeConfig[n.type] || typeConfig.system;
                      const IconComp = config.icon;
                      return (
                        <div
                          key={n._id}
                          onClick={() => !n.read && dispatch(markNotificationRead(n._id))}
                          className={`px-5 py-4 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-100'} cursor-pointer ${notifHover} transition-colors ${!n.read ? (isDarkMode ? "bg-blue-500/5" : "bg-blue-50") : ""}`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-8 h-8 rounded-lg ${config.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                              <IconComp size={14} className={config.color} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start">
                                <p className={`text-xs font-normal ${isDarkMode ? 'text-white' : 'text-slate-900'} truncate`}>
                                  {n.title}
                                </p>
                                {!n.read && (
                                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-1 flex-shrink-0 ml-2" />
                                )}
                              </div>
                              <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                                {n.message}
                              </p>
                              <div className="flex items-center gap-1 mt-2">
                                <Clock size={10} className="text-slate-600" />
                                <p className="text-[10px] text-slate-500">
                                  {formatTime(n.createdAt)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <button
                  onClick={() => {
                    setShowNotifications(false);
                    navigate("/admin/notifications");
                  }}
                  className="w-full py-4 text-xs font-normal uppercase tracking-widest text-blue-400 hover:bg-blue-500/10 transition-colors"
                >
                  View All Notifications
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className={`p-8 rounded-2xl border hover:border-slate-700 transition-colors ${cardBg}`}>
          <div className="flex justify-between items-start mb-6">
            <p className="text-xs font-normal text-slate-500 uppercase tracking-widest">Inventory Value</p>
            <Banknote size={20} className="text-slate-500" />
          </div>
          <h2 className={`text-4xl font-normal tracking-tighter ${headText}`}>${totalValue.toLocaleString()}</h2>
          <p className="text-sm text-emerald-400 mt-4 flex items-center font-normal">
            <ArrowUpRight size={16} className="mr-1" /> +5.2% <span className="text-slate-500 font-normal ml-1">vs last month</span>
          </p>
        </div>

        <div className={`p-8 rounded-2xl border relative overflow-hidden ${cardHighlight}`}>
          <div className="flex justify-between items-start mb-6">
            <p className="text-xs font-normal text-blue-500 uppercase tracking-widest">Focused Shape</p>
            <Award size={20} className="text-blue-400" />
          </div>
          <h2 className={`text-4xl font-normal tracking-tighter ${headText}`}>{selectedShape}</h2>
          <p className="text-sm text-slate-400 mt-4 font-normal">Market Trend: <span className="text-blue-400 font-normal">{shapeDataProfiles[selectedShape]?.trend || "Stable"}</span></p>
          <div className="absolute -right-4 -bottom-4 opacity-5">
            <TrendingUp size={100} className="text-white" />
          </div>
        </div>

        <div className={`p-8 rounded-2xl border ${cardBg}`}>
          <div className="flex justify-between items-start mb-6">
            <p className="text-xs font-normal text-slate-500 uppercase tracking-widest">Inventory Status</p>
            <ListFilter size={20} className="text-slate-500" />
          </div>
          <h2 className={`text-4xl font-normal tracking-tighter ${headText}`}>{totalDiamonds} <span className="text-xl text-slate-500 font-normal tracking-normal">Assets</span></h2>
          <div className="mt-4 flex gap-1">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <div key={i} className={`h-1 flex-1 rounded-full ${i < (totalDiamonds > 0 ? 7 : 1) ? 'bg-blue-600' : 'bg-slate-800'}`} />)}
          </div>
        </div>
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Chart View */}
        <div className={`lg:col-span-2 border rounded-3xl p-8 relative ${cardBg}`}>
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className={`text-xl font-normal ${headText}`}>{selectedShape} Price Index</h3>
              <p className="text-xs text-slate-500 mt-1">Real-time performance tracking based on GIA certification standards</p>
            </div>
            <div className={`flex p-1 rounded-xl border ${isDarkMode ? 'bg-[#0F171F] border-slate-800' : 'bg-slate-100 border-slate-200'}`}>
              {['1M', '6M', '1Y', 'ALL'].map(t => (
                <button key={t} className={`px-4 py-1.5 text-[10px] font-normal rounded-lg transition-all ${t === '1Y'
                  ? isDarkMode ? 'bg-slate-800 text-white shadow-lg' : 'bg-white text-slate-900 shadow-lg'
                  : isDarkMode ? 'text-slate-500 hover:text-white' : 'text-slate-500 hover:text-blue-600'
                  }`}>{t}</button>
              ))}
            </div>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={activeColor} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={activeColor} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} opacity={0.4} />
                <XAxis
                  dataKey="name"
                  stroke="#475569"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis hide />
                <Tooltip
                  contentStyle={tooltipStyle}
                  itemStyle={{ color: isDarkMode ? '#fff' : '#1e293b', fontWeight: 'normal' }}
                />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke={activeColor}
                  strokeWidth={4}
                  fillOpacity={1}
                  fill="url(#colorPrice)"
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Shape Selection List */}
        <div className={`border rounded-3xl p-6 ${cardBg}`}>
          <div className="flex justify-between items-center mb-8">
            <h3 className={`text-base font-normal uppercase tracking-widest ${headText}`}>Market Analysis</h3>
            <span className="text-xs text-blue-500 font-normal bg-blue-500/10 px-3 py-1.5 rounded ">Live Update</span>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-[420px] pr-2 no-scrollbar">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-16 w-full animate-pulse rounded-xl" style={{backgroundColor: isDarkMode ? '#1e293b' : '#f1f5f9'}} />)}
              </div>
            ) : Object.keys(shapeDataProfiles).length === 0 ? (
              <div className="flex flex-col items-center py-12 text-center">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                  <Award size={24} className="text-slate-500" />
                </div>
                <p className={`text-sm font-normal ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>No shape data available</p>
                <p className="text-xs text-slate-500 mt-1">Sync or import inventory to populate analytics</p>
                <button
                  onClick={() => dispatch(fetchDiamonds({ page: 1, limit: 12, includeStats: true }))}
                  className="mt-4 text-xs text-blue-400 border border-blue-500/30 px-4 py-2 rounded-lg hover:bg-blue-500/10 transition-colors"
                >
                  Refresh Data
                </button>
              </div>
            ) : (
              Object.entries(shapeDataProfiles).map(([shape, profile]) => {
                const isSelected = selectedShape === shape;
                return (
                  <button
                    key={shape}
                    onClick={() => setSelectedShape(shape)}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all group ${isSelected
                      ? isDarkMode
                        ? "bg-white/5 border-blue-500/40 shadow-xl shadow-blue-500/5"
                        : "bg-blue-50 border-blue-400/50 shadow-xl shadow-blue-500/10"
                      : isDarkMode
                        ? "bg-[#15202B] border-slate-800/50 hover:border-slate-700"
                        : "bg-slate-50 border-slate-200 hover:border-blue-300"
                      }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-normal text-sm transition-colors ${isSelected
                        ? "bg-blue-600 text-white"
                        : isDarkMode
                          ? "bg-slate-800 text-slate-500 group-hover:bg-slate-700"
                          : "bg-slate-200 text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-600"
                        }`}>
                        {shape.charAt(0)}
                      </div>
                      <div className="text-left">
                        <p className={`text-sm font-normal tracking-tight ${isSelected
                          ? "text-blue-400"
                          : isDarkMode ? "text-white" : "text-slate-800"
                          } group-hover:text-blue-500 transition-colors`}>
                          {shape}
                        </p>
                        <p className="text-[10px] text-slate-500 font-normal mt-0.5">{profile.count} Units • Market Avg</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-normal ${isSelected
                        ? isDarkMode ? "text-white" : "text-slate-900"
                        : isDarkMode ? "text-slate-300" : "text-slate-700"
                        }`}>${profile.avgPrice.toLocaleString()}</p>
                      <div className={`h-1 w-full mt-1.5 rounded-full ${isSelected ? "bg-blue-500/50" : isDarkMode ? "bg-slate-800" : "bg-slate-200"}`} />
                    </div>
                  </button>
                );
              })
            )}
          </div>

          <button className={`w-full mt-6 py-4 rounded-xl border text-xs font-normal uppercase tracking-widest text-slate-400 Transition-all ${isDarkMode ? 'bg-[#0F171F] border-slate-800 hover:text-white hover:border-slate-600' : 'bg-slate-50 border-slate-200 hover:text-slate-700 hover:border-slate-400'}`}>
            Generate Comprehensive Report
          </button>
        </div>
      </div>
    </div>
  );
};

