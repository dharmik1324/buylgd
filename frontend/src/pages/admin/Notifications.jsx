import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchNotifications,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
    deleteReadNotifications,
} from "../../store/notificationSlice";
import {
    Bell, BellOff, CheckCheck, Trash2, Filter,
    UserPlus, Mail, ShieldAlert, Info,
    ChevronLeft, ChevronRight, Clock, X, RefreshCcw
} from "lucide-react";

const typeConfig = {
    registration: { icon: UserPlus, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", label: "Registration" },
    contact: { icon: Mail, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", label: "Contact" },
    login: { icon: Info, color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20", label: "Login" },
    alert: { icon: ShieldAlert, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20", label: "Alert" },
    system: { icon: Bell, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", label: "System" },
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
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

export const Notifications = () => {
    const dispatch = useDispatch();
    const { notifications, unreadCount, total, page, totalPages, loading } = useSelector(
        (state) => state.notifications
    );
    const isDarkMode = useSelector((state) => state.theme?.isDarkMode ?? true);

    const pageBg = isDarkMode ? "bg-[#0F171F] text-slate-300" : "bg-slate-50 text-slate-700";
    const cardBg = isDarkMode ? "bg-[#111922] border-slate-800" : "bg-white border-slate-200";
    const headText = isDarkMode ? "text-white" : "text-slate-900";
    const btnBase = isDarkMode ? "bg-[#15202B] border-slate-800 text-slate-400 hover:text-white hover:border-slate-600" : "bg-white border-slate-200 text-slate-500 hover:text-slate-900 hover:border-slate-400";
    const paginationBg = isDarkMode ? "bg-[#111922] border-slate-800 text-slate-600 cursor-not-allowed" : "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed";
    const paginationActive = isDarkMode ? "bg-[#15202B] border-slate-800 text-slate-300 hover:text-white hover:border-slate-600" : "bg-white border-slate-200 text-slate-700 hover:text-slate-900 hover:border-slate-400";

    const [activeFilter, setActiveFilter] = useState("all");
    const [readFilter, setReadFilter] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    useEffect(() => {
        dispatch(fetchNotifications({ page: 1, limit: 20, type: activeFilter, read: readFilter }));
    }, [dispatch, activeFilter, readFilter]);

    const handlePageChange = (newPage) => {
        dispatch(fetchNotifications({ page: newPage, limit: 20, type: activeFilter, read: readFilter }));
    };

    const handleMarkRead = (id) => {
        dispatch(markNotificationRead(id));
    };

    const handleMarkAllRead = () => {
        dispatch(markAllNotificationsRead());
    };

    const handleDelete = (id) => {
        setDeletingId(id);
        setTimeout(() => {
            dispatch(deleteNotification(id));
            setDeletingId(null);
        }, 300);
    };

    const handleDeleteAllRead = () => {
        dispatch(deleteReadNotifications());
    };

    const filterTabs = [
        { key: "all", label: "All" },
        { key: "registration", label: "Registration" },
        { key: "contact", label: "Contact" },
        { key: "alert", label: "Alerts" },
        { key: "system", label: "System" },
    ];

    return (
        <div className={`flex-1 min-h-screen p-4 sm:p-6 md:p-8 font-sans transition-colors duration-300 ${pageBg}`}>
            {/* Header */}
            <header className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-10 gap-6">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className={`text-2xl sm:text-3xl font-normal ${headText}`}>Notifications</h1>
                        {unreadCount > 0 && (
                            <span className="bg-blue-600 text-white text-[10px] font-normal px-2.5 py-1 rounded-full animate-pulse">
                                {unreadCount} NEW
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">
                        Activity & Alert Center
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-normal transition-all border ${showFilters
                            ? "bg-blue-600/20 border-blue-500/40 text-blue-400"
                            : btnBase
                            }`}
                    >
                        <Filter size={14} />
                        Filters
                    </button>

                    {unreadCount > 0 && (
                        <button
                            onClick={handleMarkAllRead}
                            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-normal text-blue-400 hover:bg-blue-600/10 hover:border-blue-500/30 transition-all ${isDarkMode ? 'bg-[#15202B] border-slate-800' : 'bg-white border-slate-200'}`}
                        >
                            <CheckCheck size={14} />
                            Mark Read
                        </button>
                    )}

                    <button
                        onClick={() => dispatch(fetchNotifications({ page: 1, limit: 20, type: activeFilter, read: readFilter }))}
                        className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-normal text-emerald-400 hover:bg-emerald-600/10 hover:border-emerald-500/30 transition-all ${isDarkMode ? 'bg-[#15202B] border-slate-800' : 'bg-white border-slate-200'}`}
                    >
                        <RefreshCcw size={14} className={loading ? "animate-spin" : ""} />
                        Refresh
                    </button>
                    <button
                        onClick={handleDeleteAllRead}
                        className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-normal text-red-400 hover:bg-red-600/10 hover:border-red-500/30 transition-all ${isDarkMode ? 'bg-[#15202B] border-slate-800' : 'bg-white border-slate-200'}`}
                    >
                        <Trash2 size={14} />
                        Clear Read
                    </button>
                </div>
            </header>

            {/* Filter Tabs */}
            {showFilters && (
                <div className={`mb-8 border rounded-2xl p-5 animate-in ${cardBg}`}>
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                        <p className="text-[10px] font-normal text-slate-500 uppercase tracking-widest mr-2">Type:</p>
                        {filterTabs.map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveFilter(tab.key)}
                                className={`px-4 py-1.5 rounded-lg text-[11px] font-normal transition-all ${activeFilter === tab.key
                                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                                    : isDarkMode
                                        ? "bg-[#15202B] text-slate-500 hover:text-white border border-slate-800 hover:border-slate-600"
                                        : "bg-white text-slate-500 hover:text-slate-900 border border-slate-200 hover:border-slate-300"
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-3">
                        <p className="text-[10px] font-normal text-slate-500 uppercase tracking-widest mr-2">Status:</p>
                        {[
                            { key: "", label: "All" },
                            { key: "false", label: "Unread" },
                            { key: "true", label: "Read" },
                        ].map((option) => (
                            <button
                                key={option.key}
                                onClick={() => setReadFilter(option.key)}
                                className={`px-4 py-1.5 rounded-lg text-[11px] font-normal transition-all ${readFilter === option.key
                                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                                    : isDarkMode
                                        ? "bg-[#15202B] text-slate-500 hover:text-white border border-slate-800 hover:border-slate-600"
                                        : "bg-white text-slate-500 hover:text-slate-900 border border-slate-200 hover:border-slate-300"
                                    }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className={`p-5 rounded-2xl border ${cardBg}`}>
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-[10px] font-normal text-slate-500 uppercase tracking-widest">Total</p>
                        <Bell size={16} className="text-slate-500" />
                    </div>
                    <h3 className={`text-2xl font-normal ${headText}`}>{total}</h3>
                </div>
                <div className={`p-5 rounded-2xl border border-blue-500/20 ${isDarkMode ? 'bg-[#111922]' : 'bg-blue-50'}`}>
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-[10px] font-normal text-blue-500 uppercase tracking-widest">Unread</p>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                    </div>
                    <h3 className={`text-2xl font-normal ${headText}`}>{unreadCount}</h3>
                </div>
                <div className={`p-5 rounded-2xl border ${cardBg}`}>
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-[10px] font-normal text-slate-500 uppercase tracking-widest">Read</p>
                        <BellOff size={16} className="text-slate-500" />
                    </div>
                    <h3 className={`text-2xl font-normal ${headText}`}>{total - unreadCount}</h3>
                </div>
                <div className={`p-5 rounded-2xl border ${cardBg}`}>
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-[10px] font-normal text-slate-500 uppercase tracking-widest">Page</p>
                        <Info size={16} className="text-slate-500" />
                    </div>
                    <h3 className={`text-2xl font-normal ${headText}`}>{page} <span className="text-sm text-slate-500 font-normal">/ {totalPages}</span></h3>
                </div>
            </div>

            {/* Notification List */}
            <div className={`border rounded-3xl overflow-hidden ${cardBg}`}>
                {/* Responsive header - hidden on mobile */}
                <div className={`hidden md:grid grid-cols-12 gap-4 px-6 py-4 border-b ${isDarkMode ? 'border-slate-800 bg-[#0B1219]' : 'border-slate-200 bg-slate-50'}`}>
                    <div className="col-span-1">
                        <p className="text-[10px] font-normal text-slate-500 uppercase tracking-widest">Status</p>
                    </div>
                    <div className="col-span-1">
                        <p className="text-[10px] font-normal text-slate-500 uppercase tracking-widest">Type</p>
                    </div>
                    <div className="col-span-6">
                        <p className="text-[10px] font-normal text-slate-500 uppercase tracking-widest">Notification</p>
                    </div>
                    <div className="col-span-2">
                        <p className="text-[10px] font-normal text-slate-500 uppercase tracking-widest">Time</p>
                    </div>
                    <div className="col-span-2 text-right">
                        <p className="text-[10px] font-normal text-slate-500 uppercase tracking-widest">Actions</p>
                    </div>
                </div>

                {/* Loading state */}
                {loading && (
                    <div className="p-8 space-y-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="h-16 bg-slate-800/50 rounded-xl animate-pulse" />
                        ))}
                    </div>
                )}

                {/* Empty state */}
                {!loading && notifications.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className={`w-20 h-20 rounded-2xl border flex items-center justify-center mb-6 ${isDarkMode ? 'bg-[#15202B] border-slate-800' : 'bg-slate-100 border-slate-200'}`}>
                            <BellOff size={32} className="text-slate-600" />
                        </div>
                        <h3 className={`text-lg font-normal mb-2 ${headText}`}>No notifications</h3>
                        <p className="text-sm text-slate-500">You're all caught up! Check back later.</p>
                    </div>
                )}

                {/* Notification items */}
                <div className="divide-y divide-slate-800/50">
                    {!loading && notifications.map((notification) => {
                        const config = typeConfig[notification.type] || typeConfig.system;
                        const IconComponent = config.icon;
                        const isDeleting = deletingId === notification._id;

                        return (
                            <div
                                key={notification._id}
                                className={`flex flex-col md:grid md:grid-cols-12 gap-4 px-6 py-5 transition-all duration-300 group ${isDarkMode ? "hover:bg-[#15202B]/50" : "hover:bg-slate-50"} ${!notification.read
                                    ? (isDarkMode ? "bg-blue-500/[0.03] border-l-2 border-l-blue-500" : "bg-blue-50 border-l-2 border-l-blue-600")
                                    : "border-l-2 border-l-transparent text-slate-400"
                                    } ${isDeleting ? "opacity-0 translate-x-4" : "opacity-100"}`}
                            >
                                <div className="flex items-center justify-between md:contents">
                                    <div className="flex items-center gap-3 md:contents">
                                        <div className="md:col-span-1 flex items-center">
                                            {!notification.read ? (
                                                <div className="w-2.5 h-2.5 bg-blue-500 rounded-full shadow-lg shadow-blue-500/30 animate-pulse" />
                                            ) : (
                                                <div className={`w-2.5 h-2.5 rounded-full ${isDarkMode ? "bg-slate-700" : "bg-slate-300"}`} />
                                            )}
                                        </div>

                                        <div className="md:col-span-1 flex items-center">
                                            <div className={`w-9 h-9 rounded-xl ${config.bg} border ${config.border} flex items-center justify-center`}>
                                                <IconComponent size={16} className={config.color} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="md:hidden flex items-center gap-1.5 text-slate-500">
                                        <Clock size={12} />
                                        <span className="text-[11px] font-normal">{formatTime(notification.createdAt)}</span>
                                    </div>
                                </div>

                                <div className="md:col-span-6 flex flex-col justify-center">
                                    <div className="flex items-center gap-2">
                                        <p className={`text-sm font-normal ${!notification.read
                                            ? (isDarkMode ? "text-white" : "text-slate-900")
                                            : (isDarkMode ? "text-slate-300" : "text-slate-600")}`}>
                                            {notification.title}
                                        </p>
                                        <span className={`text-[9px] font-normal uppercase tracking-widest px-2 py-0.5 rounded ${config.bg} ${config.color}`}>
                                            {config.label}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 md:line-clamp-1">
                                        {notification.message}
                                    </p>
                                </div>

                                <div className="hidden md:col-span-2 md:flex items-center">
                                    <div className="flex items-center gap-1.5 text-slate-500">
                                        <Clock size={12} />
                                        <span className="text-[11px] font-normal">{formatTime(notification.createdAt)}</span>
                                    </div>
                                </div>

                                <div className="md:col-span-2 flex items-center justify-start md:justify-end gap-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity mt-2 md:mt-0">
                                    {!notification.read && (
                                        <button
                                            onClick={() => handleMarkRead(notification._id)}
                                            className="flex-1 md:flex-none flex items-center justify-center p-2.5 md:p-2 rounded-lg bg-blue-600/10 text-blue-400 hover:bg-blue-600/20 transition-all border border-blue-500/10"
                                            title="Mark as read"
                                        >
                                            <CheckCheck size={14} />
                                            <span className="ml-2 md:hidden text-[10px] font-normal uppercase">Read</span>
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDelete(notification._id)}
                                        className="flex-1 md:flex-none flex items-center justify-center p-2.5 md:p-2 rounded-lg bg-red-600/10 text-red-400 hover:bg-red-600/20 transition-all border border-red-500/10"
                                        title="Delete"
                                    >
                                        <Trash2 size={14} />
                                        <span className="ml-2 md:hidden text-[10px] font-normal uppercase">Delete</span>
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
                    <p className="text-xs text-slate-500 font-normal order-2 sm:order-1">
                        Showing page <span className={`${headText} font-normal`}>{page}</span> of{" "}
                        <span className={`${headText} font-normal`}>{totalPages}</span> ({total} total)
                    </p>
                    <div className="flex items-center gap-2 order-1 sm:order-2 w-full sm:w-auto">
                        <button
                            onClick={() => handlePageChange(page - 1)}
                            disabled={page <= 1}
                            className={`flex-1 sm:flex-none flex items-center justify-center gap-1 px-4 py-2 rounded-xl text-xs font-normal border transition-all ${page <= 1
                                ? paginationBg
                                : paginationActive
                                }`}
                        >
                            <ChevronLeft size={14} />
                            Prev
                        </button>
                        <button
                            onClick={() => handlePageChange(page + 1)}
                            disabled={page >= totalPages}
                            className={`flex-1 sm:flex-none flex items-center justify-center gap-1 px-4 py-2 rounded-xl text-xs font-normal border transition-all ${page >= totalPages
                                ? paginationBg
                                : paginationActive
                                }`}
                        >
                            Next
                            <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

