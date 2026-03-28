import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout, logoutUser } from "../../store/authSlice";
import { Menu, LogOut, Bell, Search, User } from "lucide-react";

export const Header = ({ onToggleSidebar }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const isDarkMode = useSelector(state => state.theme?.isDarkMode ?? true);
    const { user } = useSelector(state => state.auth);
    const unreadCount = useSelector(state => state.notifications?.unreadCount || 0);

    const handleLogout = async () => {
        try {
            await dispatch(logoutUser());
            navigate("/login", { replace: true });
        } catch (err) {
            console.error("Logout failed", err);
            navigate("/login", { replace: true });
        }
    };

    const headerBg = isDarkMode ? "bg-[#111922] border-slate-800" : "bg-white border-slate-200";
    const iconColor = isDarkMode ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-900";

    return (
        <header className={`h-16 flex items-center justify-between px-4 sm:px-6 border-b transition-colors duration-300 ${headerBg} sticky top-0 z-50`}>
            <div className="flex items-center gap-4">
                <button
                    onClick={onToggleSidebar}
                    className={`lg:hidden p-2 rounded-lg hover:bg-slate-800/50 transition-colors ${iconColor}`}
                >
                    <Menu size={20} />
                </button>
                <div className="hidden sm:flex items-center relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input
                        type="text"
                        placeholder="Search..."
                        className={`pl-10 pr-4 py-2 rounded-xl text-xs focus:outline-none transition-all w-48 md:w-64 ${isDarkMode ? "bg-slate-900 border-slate-800 text-white focus:border-blue-500" : "bg-slate-100 border-slate-200 text-slate-900 focus:border-blue-400"
                            } border`}
                    />
                </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
                <button
                    onClick={() => navigate("/admin/notifications")}
                    className={`relative p-2 rounded-xl hover:bg-slate-800/50 transition-colors ${iconColor}`}
                >
                    <Bell size={20} />
                    {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    )}
                </button>

                <div className="h-8 w-[1px] bg-slate-800 mx-1 hidden sm:block" />

                <div className="flex items-center gap-3">
                    <div className="hidden md:block text-right">
                        <p className={`text-xs font-normal leading-none ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                            {user?.name || "Admin"}
                        </p>
                        <p className="text-[10px] text-slate-500 font-normal uppercase tracking-widest mt-1">
                            {user?.role || "Manager"}
                        </p>
                    </div>
                    {user?.image ? (
                        <img src={user.image} alt="Avatar" className="w-8 h-8 rounded-lg object-cover border border-slate-700" />
                    ) : (
                        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-normal text-xs">
                            {user?.name?.charAt(0) || "A"}
                        </div>
                    )}
                </div>

                <button
                    onClick={handleLogout}
                    className={`p-2 rounded-xl hover:bg-red-500/10 text-red-500 transition-colors`}
                    title="Sign Out"
                >
                    <LogOut size={20} />
                </button>
            </div>
        </header>
    );
};

