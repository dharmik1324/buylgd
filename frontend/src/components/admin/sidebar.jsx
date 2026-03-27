import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout, logoutUser } from "../../store/authSlice";
import {
    LayoutDashboard, Box, Users, BarChart3,
    Settings, LifeBuoy, Diamond, LogOut, FileText, Bell,
    Clock, MessagesSquare
} from "lucide-react";
import { IoDiamond } from "react-icons/io5";
import { useEffect } from "react";
import { fetchAllTickets } from "../../store/supportSlice";

export const Sidebar = ({ setSidebarOpen }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useSelector(state => state.auth);
    const unreadCount = useSelector(state => state.notifications?.unreadCount || 0);
    const isDarkMode = useSelector(state => state.theme?.isDarkMode ?? true);

    const { tickets } = useSelector(state => state.support);
    const inquiryCount = tickets.filter(t => t.status === "pending").length;

    useEffect(() => {
        if (user?.role === "admin") {
            dispatch(fetchAllTickets());
        }
    }, [dispatch, user]);

    const sideBg = isDarkMode ? "bg-[#0B1219]" : "bg-white";
    const borderCol = isDarkMode ? "border-slate-800" : "border-slate-200";
    const logoText = isDarkMode ? "text-white" : "text-slate-900";
    const subText = isDarkMode ? "text-slate-500" : "text-slate-400";
    const navInactive = isDarkMode ? "text-slate-500 hover:text-white hover:bg-slate-800/40" : "text-slate-500 hover:text-slate-900 hover:bg-slate-100";
    const userCardBg = isDarkMode ? "bg-[#15202B]" : "bg-slate-50";
    const userCardBorder = isDarkMode ? "border-slate-800" : "border-slate-200";
    const userNameText = isDarkMode ? "text-white" : "text-slate-900";
    const onlineIndicator = isDarkMode ? "border-[#15202B]" : "border-slate-50";

    const menu = [
        { name: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
        { name: "Inventory", path: "/admin/diamonds", icon: Box },
        { name: "Users", path: "/admin/users", icon: Users },
        { name: "Hold Orders", path: "/admin/orders", icon: Clock },
        { name: "Notifications", path: "/admin/notifications", icon: Bell },
        { name: "Logs", path: "/admin/logs", icon: FileText },
        { name: "Reports", path: "/admin/reports", icon: BarChart3 },
        { name: "Inquiries", path: "/admin/inquiries", icon: MessagesSquare },
    ];
    const handleLogout = () => {
        dispatch(logoutUser());
        navigate("/login");
    };

    return (
        <aside className={`w-64 ${sideBg} h-[100vh] flex flex-col p-6 border-r ${borderCol} sticky top-0 transition-colors duration-300`}>
            <div className="space-x-3 mb-12">
                <div>
                    {isDarkMode ? (
                        <img src="/bg-removed-Gemini_Generated_Image_m9e2itm9e2itm9e2.png" alt="" className="w-full h-10" />
                    ) : (
                        <img src="/N6yun2CMI33J3R5MVpHWql06P0E.png" alt="" className="w-full h-10" />
                    )}
                    {/* <p className={`text-[8px] ${subText} font-normal uppercase tracking-[0.4em] opacity-100`}>ADMINISTRATION</p> */}
                </div>
                <div className="pl-17">
                    {isDarkMode ? (
                        <p className="font-semibold text-sm text-gray-500">ADMIN</p>
                    ) : (
                        <p className="font-semibold text-sm text-black">ADMIN</p>
                    )}
                </div>
            </div>

            <nav className="flex-1 space-y-2">
                {menu.map((item) => {
                    const active = location.pathname === item.path;
                    return (
                        <Link
                            key={item.name}
                            to={item.path}
                            onClick={() => {
                                if (window.innerWidth < 1024 && setSidebarOpen) {
                                    setSidebarOpen(false);
                                }
                            }}
                            className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all font-normal text-sm ${active ? "bg-blue-600 text-white shadow-xl shadow-blue-900/40" : navInactive
                                }`}
                        >
                            <item.icon size={18} />
                            <span>{item.name}</span>
                            {item.name === "Notifications" && unreadCount > 0 && (
                                <span className="ml-auto bg-blue-600 text-white text-[9px] font-normal w-5 h-5 rounded-full flex items-center justify-center shadow-lg shadow-blue-600/30 animate-pulse">
                                    {unreadCount > 9 ? "9+" : unreadCount}
                                </span>
                            )}
                            {item.name === "Inquiries" && inquiryCount > 0 && (
                                <span className="ml-auto bg-blue-500 text-white text-[9px] font-normal w-5 h-5 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30 animate-pulse">
                                    {inquiryCount > 9 ? "9+" : inquiryCount}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            <div className={`pt-6 border-t ${borderCol} space-y-1 mb-6`}>
                <Link to="/admin/settings"
                    onClick={() => {
                        if (window.innerWidth < 1024 && setSidebarOpen) {
                            setSidebarOpen(false);
                        }
                    }}
                    className={`flex items-center space-x-3 px-4 py-2 ${subText} hover:text-blue-500 text-xs font-normal transition-colors`}
                >
                    <Settings size={16} /> <span>Settings</span>
                </Link>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-4 py-2 text-red-500 hover:text-red-400 text-xs font-normal transition-colors mt-2"
                >
                    <LogOut size={16} /> <span>Sign Out</span>
                </button>
            </div>

            {/* <div className={`${userCardBg} p-4 rounded-2xl border ${userCardBorder} shadow-inner`}>
                <div className="flex items-center space-x-3 mb-4">
                    <div className="relative">
                        {user?.image ? (
                            <img src={user.image} alt={user.name} className="w-10 h-10 rounded-xl object-cover border border-slate-700" />
                        ) : (
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-400 flex items-center justify-center text-white font-normal text-sm border border-slate-700">
                                {user?.name?.charAt(0)?.toUpperCase() || "A"}
                            </div>
                        )}
                        <div className={`absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 ${onlineIndicator}`} />
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <p className={`${userNameText} text-xs font-normal truncate leading-none`}>{user?.name || "Administrator"}</p>
                        <p className={`text-[9px] ${subText} font-normal uppercase tracking-widest mt-1 truncate`}>{user?.role || "Manager"}</p>
                    </div>
                </div>

                <div className="flex justify-between items-center mb-2">
                    <p className="text-[9px] font-normal text-blue-500 uppercase tracking-widest">Enterprise Status</p>
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                </div>
                <div className={`h-1 w-full ${isDarkMode ? "bg-slate-800" : "bg-slate-200"} rounded-full mb-1 overflow-hidden`}>
                    <div className="bg-gradient-to-r from-blue-600 to-blue-400 h-full w-[72%]" />
                </div>
                <p className={`text-[8px] ${subText} font-normal uppercase  tracking-tighter text-right tracking-[0.1em]`}>Verified Session</p>
            </div> */}
        </aside>
    );
};

