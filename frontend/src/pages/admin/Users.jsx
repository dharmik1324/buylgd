import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search, Plus, MoreVertical, Trash2, Edit3,
    Eye, UserCheck, Users as UsersIcon, ShieldCheck, Camera,
    Globe, Key, Lock, Unlock, Copy, Check, Clock, RefreshCcw
} from "lucide-react";
import { toast } from "react-toastify";
import { fetchUsers, deleteUser, updateUser, createUser, approveUser, toggleApiAccess, clearSessions, addRealtimeUser } from "../../store/userSlice";
import { RxCross2 } from "react-icons/rx";
import Select from "react-select";
import { fetchInventoryApis } from "../../store/inventoryApiSlice";
import { getCountryOptions, getStateOptions, getCityOptions } from "../../utils/locationHelper";
import { socket } from "../../socket";

const adminSelectStyles = (isDarkMode) => ({
    control: (base, state) => ({
        ...base,
        backgroundColor: isDarkMode ? "#0B1219" : "#ffffff",
        borderColor: state.isFocused ? "#3b82f6" : isDarkMode ? "#1e293b" : "#e2e8f0",
        borderRadius: "0.75rem",
        minHeight: "48px",
        boxShadow: "none",
        "&:hover": {
            borderColor: state.isFocused ? "#3b82f6" : isDarkMode ? "#334155" : "#cbd5e1",
        },
        fontSize: "0.875rem",
    }),
    placeholder: (base) => ({
        ...base,
        color: isDarkMode ? "#475569" : "#94a3b8",
    }),
    singleValue: (base) => ({
        ...base,
        color: isDarkMode ? "#ffffff" : "#0f172a",
    }),
    menu: (base) => ({
        ...base,
        backgroundColor: isDarkMode ? "#111922" : "white",
        borderRadius: "0.75rem",
        border: isDarkMode ? "1px solid #1e293b" : "1px solid #e2e8f0",
        zIndex: 9999,
    }),
    option: (base, state) => ({
        ...base,
        backgroundColor: state.isSelected ? "#2563eb" : state.isFocused ? (isDarkMode ? "#1e293b" : "#f1f5f9") : "transparent",
        color: state.isSelected ? "white" : isDarkMode ? "#cbd5e1" : "#0f172a",
        cursor: "pointer",
        "&:active": {
            backgroundColor: "#2563eb",
        }
    }),
    input: (base) => ({
        ...base,
        color: isDarkMode ? "white" : "black",
    })
});

export const Users = () => {
    const dispatch = useDispatch();
    const { users, loading, error } = useSelector((state) => state.users);
    const isDarkMode = useSelector((state) => state.theme?.isDarkMode ?? true);

    const pageBg = isDarkMode ? "bg-[#0B1219] text-slate-300" : "bg-slate-50 text-slate-700";
    const cardBg = isDarkMode ? "bg-[#111922] border-slate-800" : "bg-white border-slate-200";
    const tableHdr = isDarkMode ? "bg-[#0F171F] border-slate-800" : "bg-slate-100 border-slate-200";
    const inputCls = isDarkMode ? "bg-[#111922] border-slate-800 text-white placeholder:text-slate-600" : "bg-white border-slate-300 text-slate-900 placeholder:text-slate-400";
    const headText = isDarkMode ? "text-white" : "text-slate-900";

    const [selectedUser, setSelectedUser] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [activeMenu, setActiveMenu] = useState(null);
    const [isMarkupModalOpen, setIsMarkupModalOpen] = useState(false);
    const [userToApprove, setUserToApprove] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterTab, setFilterTab] = useState("all");

    // Location Filters
    const [countryFilter, setCountryFilter] = useState(null);
    const [stateFilter, setStateFilter] = useState(null);
    const [cityFilter, setCityFilter] = useState(null);
    const [countryCode, setCountryCode] = useState("");
    const [stateCode, setStateCode] = useState("");

    const countryOptions = useMemo(() => getCountryOptions(), []);
    const stateOptions = useMemo(() => getStateOptions(countryCode), [countryCode]);
    const cityOptions = useMemo(() => getCityOptions(countryCode, stateCode), [countryCode, stateCode]);

    const handleCountryChange = (selectedOption) => {
        setCountryFilter(selectedOption);
        setCountryCode(selectedOption?.value || "");
        setStateFilter(null);
        setStateCode("");
        setCityFilter(null);
    };

    const handleStateChange = (selectedOption) => {
        setStateFilter(selectedOption);
        setStateCode(selectedOption?.value || "");
        setCityFilter(null);
    };

    useEffect(() => {
        dispatch(fetchUsers());
    }, [dispatch]);

    // Real-time: listen for newly registered users and add them instantly
    useEffect(() => {
        const handleNewUser = (newUser) => {
            dispatch(addRealtimeUser(newUser));
            toast.info(
                `🆕 New registration: ${newUser.name} (${newUser.email})`,
                { autoClose: 6000 }
            );
        };

        socket.on("new-user", handleNewUser);
        return () => {
            socket.off("new-user", handleNewUser);
        };
    }, [dispatch]);

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this user?")) {
            dispatch(deleteUser(id));
            setActiveMenu(null);
        }
    };

    const handleOpenEdit = (user) => {
        setSelectedUser(user);
        setIsEditModalOpen(true);
        setActiveMenu(null);
    };

    const handleApprove = (user) => {
        setUserToApprove(user);
        setIsMarkupModalOpen(true);
        setActiveMenu(null);
    };

    const confirmApproval = (id, priceMarkup) => {
        dispatch(approveUser({ id, priceMarkup }));
        setIsMarkupModalOpen(false);
        setUserToApprove(null);
    };

    let filteredUsers = users?.filter(u =>
        u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.role?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.country?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.city?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (filterTab === "active") {
        filteredUsers = filteredUsers?.filter(u => u.isApproved);
    } else if (filterTab === "admin") {
        filteredUsers = filteredUsers?.filter(u => u.role === "admin");
    } else if (filterTab === "pending") {
        filteredUsers = filteredUsers?.filter(u => !u.isApproved);
    }
    // "active" could also mean role === 'user' && isApproved
    // If the user wants specific "User" or "Admin" sections:
    else if (filterTab === "user") {
        filteredUsers = filteredUsers?.filter(u => u.role === "user");
    }

    if (countryFilter) {
        filteredUsers = filteredUsers?.filter(u => u.country === countryFilter.name);
    }
    if (stateFilter) {
        filteredUsers = filteredUsers?.filter(u => u.state === stateFilter.name);
    }
    if (cityFilter) {
        filteredUsers = filteredUsers?.filter(u => u.city === cityFilter.name);
    }


    if (loading && users.length === 0) {
        return (
            <div className={`flex-1 min-h-screen p-4 sm:p-6 md:p-8 transition-colors duration-300 ${pageBg}`}>
                <div className="mb-8 sm:mb-10 space-y-3">
                    <div className={`h-8 w-64 rounded animate-pulse ${isDarkMode ? 'bg-blue-500/10' : 'bg-slate-200'}`} />
                    <div className={`h-4 w-96 rounded animate-pulse ${isDarkMode ? 'bg-slate-800/60' : 'bg-slate-200'}`} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className={`p-5 rounded-2xl border ${cardBg}`}>
                            <div className={`h-3 w-24 rounded mb-3 animate-pulse ${isDarkMode ? 'bg-blue-500/10' : 'bg-blue-50'}`} />
                            <div className={`h-6 w-16 rounded animate-pulse ${isDarkMode ? 'bg-blue-500/5' : 'bg-slate-100'}`} />
                        </div>
                    ))}
                </div>
                <div className={`border rounded-3xl p-6 space-y-6 ${cardBg}`}>
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="flex items-center space-x-6">
                            <div className={`w-4 h-4 rounded animate-pulse ${isDarkMode ? 'bg-blue-500/20' : 'bg-blue-100'}`} />
                            <div className={`w-24 h-4 rounded animate-pulse ${isDarkMode ? 'bg-slate-800/60' : 'bg-slate-100'}`} />
                            <div className={`w-12 h-12 rounded-xl animate-pulse ${isDarkMode ? 'bg-blue-500/5' : 'bg-blue-50'}`} />
                            <div className={`flex-1 h-4 rounded animate-pulse ${isDarkMode ? 'bg-slate-800/40' : 'bg-slate-50'}`} />
                            <div className={`w-16 h-4 rounded animate-pulse ${isDarkMode ? 'bg-slate-800/60' : 'bg-slate-100'}`} />
                            <div className={`w-20 h-4 rounded animate-pulse ${isDarkMode ? 'bg-blue-500/10' : 'bg-blue-50'}`} />
                            <div className={`w-24 h-4 rounded animate-pulse ${isDarkMode ? 'bg-slate-800/60' : 'bg-slate-100'}`} />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className={`flex-1 min-h-screen p-4 sm:p-6 md:p-8 font-sans transition-colors duration-300 ${pageBg}`}>
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 sm:mb-10 gap-4">
                <div>
                    <h1 className={`text-2xl sm:text-3xl font-normal tracking-tighter uppercase ${headText}`}>User Directory</h1>
                    <p className="text-[10px] font-normal text-slate-500 uppercase tracking-widest mt-1">Personnel Management Control</p>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={`border rounded-xl py-2.5 pl-10 pr-4 text-xs font-normal focus:outline-none focus:border-blue-500 w-full sm:w-64 transition-all ${inputCls}`}
                        />
                    </div>
                    <button
                        onClick={() => dispatch(fetchUsers())}
                        className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-normal uppercase tracking-widest transition-all border ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                    >
                        <RefreshCcw size={16} className={loading ? "animate-spin" : ""} /> Refresh
                    </button>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-[10px] font-normal uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20 active:scale-95"
                    >
                        <Plus size={16} /> Add User
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <StatCard title="Total Users" value={users?.length || 0} icon={<UsersIcon className="text-blue-500" />} trend="+12.5%" />
                <StatCard title="Activated Users" value={users?.filter(u => u.isApproved).length || 0} icon={<UserCheck className="text-emerald-500" />} trend="Verified" trendColor="text-emerald-500 bg-emerald-500/10" />
                <StatCard title="Active Admins" value={users?.filter(u => u.role === 'admin').length || 0} icon={<ShieldCheck className="text-amber-500" />} trend="Secured" trendColor="text-amber-500 bg-amber-500/10" />
                <StatCard title="Pending Approval" value={users?.filter(u => !u.isApproved).length || 0} icon={<Clock className="text-red-400" />} trend="Action Required" trendColor="text-red-500 bg-red-500/10" />
            </div>

            <div className="flex flex-wrap items-center gap-4 mb-8">
                <div className="flex flex-wrap items-center gap-3">
                    {[
                        { id: "all", label: "All Accounts" },
                        { id: "active", label: "Active Users" },
                        { id: "user", label: "Standard Users" },
                        { id: "admin", label: "Admins" },
                        { id: "pending", label: "Pending Approval" }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setFilterTab(tab.id)}
                            className={`px-6 py-3 rounded-2xl text-[10px] font-normal uppercase tracking-widest transition-all duration-300 border ${filterTab === tab.id
                                ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20"
                                : isDarkMode
                                    ? "bg-[#111922] border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-300"
                                    : "bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50"
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="h-10 w-px bg-slate-800 hidden lg:block" />

                <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3 min-w-[300px] lg:min-w-[600px]">
                    <Select
                        options={countryOptions}
                        styles={adminSelectStyles(isDarkMode)}
                        placeholder="Country"
                        value={countryFilter}
                        onChange={handleCountryChange}
                        isClearable
                    />
                    <Select
                        options={stateOptions}
                        styles={adminSelectStyles(isDarkMode)}
                        placeholder="State"
                        value={stateFilter}
                        onChange={handleStateChange}
                        isClearable
                        isDisabled={!countryCode}
                    />
                    <Select
                        options={cityOptions}
                        styles={adminSelectStyles(isDarkMode)}
                        placeholder="City"
                        value={cityFilter}
                        onChange={setCityFilter}
                        isClearable
                        isDisabled={!stateCode}
                    />
                </div>
            </div>

            <div className={`border rounded-3xl shadow-2xl transition-all duration-500 overflow-visible ${cardBg}`}>
                <div className="overflow-x-auto overflow-y-visible rounded-3xl custom-scrollbar">
                    <table className="w-full text-left border-collapse min-w-[1000px] table-auto">
                        <thead className={`border-b sticky top-0 z-30 transition-colors ${tableHdr}`}>
                            <tr>
                                <th className="px-8 py-6 text-[11px] font-normal uppercase tracking-[0.2em] text-slate-500 font-mono">User Identity</th>
                                <th className="px-8 py-6 text-[11px] font-normal uppercase tracking-[0.2em] text-slate-500 font-mono">Company</th>
                                <th className="px-8 py-6 text-[11px] font-normal uppercase tracking-[0.2em] text-slate-500 font-mono text-center">System Role</th>
                                <th className="px-8 py-6 text-[11px] font-normal uppercase tracking-[0.2em] text-slate-500 font-mono text-center">Access Status</th>
                                <th className="px-8 py-6 text-[11px] font-normal uppercase tracking-[0.2em] text-slate-500 font-mono text-center">Public API</th>
                                <th className="px-8 py-6 text-[11px] font-normal uppercase tracking-[0.2em] text-slate-500 font-mono text-right rounded-tr-3xl">Operations</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/10">
                            <AnimatePresence>
                                {filteredUsers?.map((user, idx) => (
                                    <motion.tr
                                        key={user._id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.03, type: "spring", stiffness: 100 }}
                                        className={`transition-all duration-300 group ${isDarkMode ? 'hover:bg-blue-600/[0.03]' : 'hover:bg-blue-50/50'}`}
                                    >
                                        <td className="px-8 py-7">
                                            <div className="flex items-center gap-4">
                                                <div className="relative group">
                                                    {user.image ? (
                                                        <img src={user.image} alt={user.name} className="w-12 h-12 rounded-2xl object-cover border-2 border-slate-800 group-hover:border-blue-500/50 transition-all duration-500 group-hover:scale-105" />
                                                    ) : (
                                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-800 flex items-center justify-center text-white font-normal text-lg uppercase shadow-lg shadow-blue-900/20 group-hover:scale-105 transition-all">
                                                            {user.name?.charAt(0) || 'U'}
                                                        </div>
                                                    )}
                                                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#111922] ${user.isApproved ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className={`text-sm font-normal tracking-tight group-hover:text-blue-400 transition-colors uppercase ${headText}`}>{user.name}</span>
                                                    <span className={`text-[11px] font-mono ${isDarkMode ? 'text-slate-500' : 'text-slate-600'} flex items-center gap-1.5 mt-0.5`}>
                                                        <span className="w-1 h-1 bg-blue-500 rounded-full" /> {user.email}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-7">
                                            <div className="flex flex-col">
                                                <span className={`text-xs font-normal ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{user.companyName || 'INDEPENDENT'}</span>
                                                <div className="flex items-center gap-1.5 mt-1">
                                                    <Globe size={10} className="text-blue-500" />
                                                    <span className="text-[9px] font-normal text-slate-500 uppercase tracking-widest">
                                                        {user.city && user.country ? `${user.city}, ${user.country}` : user.country || user.city || 'LOCATION UNDEFINED'}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-7 text-center">
                                            <span className={`inline-flex px-3 py-1.5 rounded-lg text-[10px] font-normal uppercase tracking-widest border transition-all shadow-sm ${user.role === 'admin'
                                                ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                                : isDarkMode
                                                    ? 'bg-slate-800/40 text-slate-400 border-slate-700'
                                                    : 'bg-slate-100/50 text-slate-600 border-slate-200'
                                                }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-8 py-7 text-center">
                                             <button
                                                 onClick={() => !user.isApproved && handleApprove(user)}
                                                 className={`mx-auto flex items-center justify-center gap-2 group/status px-3 py-2 rounded-xl transition-all ${user.isApproved
                                                    ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500'
                                                    : 'bg-red-500/10 hover:bg-red-500/20 text-red-500 cursor-pointer'}`}
                                            >
                                                <div className={`w-2 h-2 rounded-full ${user.isApproved ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse' : 'bg-red-500'}`} />
                                                <span className="text-xs font-normal uppercase tracking-widest">{user.isApproved ? 'Authorized' : 'Pending'}</span>
                                            </button>
                                        </td>
                                        <td className="px-8 py-7 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <button
                                                    onClick={() => dispatch(toggleApiAccess({ id: user._id, isApiOpen: !user.isApiOpen }))}
                                                    className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl border transition-all duration-300 transform active:scale-95 ${user.isApiOpen
                                                        ? 'bg-emerald-600/10 text-emerald-500 border-emerald-500/30 hover:bg-emerald-600 hover:text-white'
                                                        : 'bg-slate-800/50 text-slate-500 border-slate-700 hover:bg-slate-700 hover:text-white'}`}
                                                >
                                                    {user.isApiOpen ? (
                                                        <><Globe className="animate-spin-slow" size={12} /> <span className="text-xs font-normal uppercase tracking-widest">Active</span></>
                                                    ) : (
                                                        <><Lock size={12} /> <span className="text-xs font-normal uppercase tracking-widest">Deactive</span></>
                                                    )}
                                                </button>
                                                {user.isApiOpen && user.companyName && (
                                                    <button
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(`${import.meta.env.VITE_API_BASE_URL}/${user.companyName.replace(/\s+/g, '-').toLowerCase()}`);
                                                            toast.info(`API URL for ${user.companyName} copied`);
                                                        }}
                                                        className="text-[10px] font-normal text-blue-500 hover:text-blue-400 transition-colors uppercase tracking-[0.2em]"
                                                    >
                                                        Copy Link
                                                    </button>
                                                )}
                                            </div>
                                        </td>


                                        <td className="px-8 py-7 text-right">
                                            <div className="flex justify-end gap-3">
                                                <button
                                                    onClick={() => { setSelectedUser(user); setIsViewModalOpen(true); }}
                                                    className={`p-2.5 rounded-2xl transition-all duration-300 ${isDarkMode ? 'bg-slate-800/50 text-slate-400 hover:bg-blue-600 hover:text-white' : 'bg-slate-100 text-slate-500 hover:bg-blue-600 hover:text-white hover:shadow-lg hover:shadow-blue-500/20'}`}
                                                    title="View Profile"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                <div className="relative group/menu">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setActiveMenu(activeMenu === user._id ? null : user._id);
                                                        }}
                                                        className={`p-2.5 rounded-2xl transition-all duration-300 shadow-sm ${activeMenu === user._id
                                                            ? 'bg-blue-600 text-white rotate-90 scale-110 shadow-blue-500/40 shadow-lg'
                                                            : isDarkMode ? 'bg-[#111111]/50 text-slate-400 hover:bg-slate-700 hover:text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                                                    >
                                                        <MoreVertical size={18} />
                                                    </button>

                                                    <AnimatePresence>
                                                        {activeMenu === user._id && (() => {
                                                            const isLastFew = idx >= (filteredUsers?.length || 0) - 2 && (filteredUsers?.length || 0) > 3;
                                                            return (
                                                                <div key="menu-wrapper">
                                                                    <div className="fixed inset-0 z-40" onClick={() => setActiveMenu(null)} />
                                                                    <motion.div
                                                                        initial={{ opacity: 0, scale: 0.9, y: isLastFew ? -20 : 20 }}
                                                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                                                        exit={{ opacity: 0, scale: 0.9, y: isLastFew ? -20 : 20 }}
                                                                        className={`absolute right-0 ${isLastFew ? 'bottom-full mb-3' : 'top-full mt-3'} w-56 bg-[#1A242F] border border-slate-700/50 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 py-3 overflow-hidden backdrop-blur-xl`}
                                                                    >
                                                                        <div className="px-4 py-2 border-b border-slate-800/50 mb-2">
                                                                            <p className="text-xs font-normal text-slate-500 uppercase tracking-widest">Command Center</p>
                                                                        </div>
                                                                        {!user.isApproved && (
                                                                            <button onClick={() => handleApprove(user)} className="w-full flex items-center gap-3 px-5 py-3 text-xs font-normal uppercase tracking-widest text-emerald-400 hover:bg-emerald-600 hover:text-white transition-all">
                                                                                 <UserCheck size={14} /> Grant Authority
                                                                             </button>
                                                                         )}
                                                                        <button onClick={() => handleOpenEdit(user)} className="w-full flex items-center gap-3 px-5 py-3 text-xs font-normal uppercase tracking-widest text-slate-300 hover:bg-blue-600 hover:text-white transition-all">
                                                                            <Edit3 size={14} /> Update Access
                                                                        </button>
                                                                        <button 
                                                                            onClick={() => { if(window.confirm("Clear all active sessions for this user?")) dispatch(clearSessions(user._id)); setActiveMenu(null); }} 
                                                                            className="w-full flex items-center gap-3 px-5 py-3 text-xs font-normal uppercase tracking-widest text-amber-400 hover:bg-amber-600 hover:text-white transition-all"
                                                                        >
                                                                            <RefreshCcw size={14} /> Reset Sessions
                                                                        </button>
                                                                        <div className="h-px bg-slate-800/50 my-2" />
                                                                        <button onClick={() => handleDelete(user._id)} className="w-full flex items-center gap-3 px-5 py-3 text-xs font-normal uppercase tracking-widest text-red-400 hover:bg-red-500/10 hover:text-white transition-all">
                                                                            <Trash2 size={14} /> Terminate Root
                                                                        </button>
                                                                    </motion.div>
                                                                </div>
                                                            )
                                                        })()}
                                                    </AnimatePresence>
                                                </div>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </div>

            <AnimatePresence>
                {isAddModalOpen && (
                    <AddUserModal onClose={() => setIsAddModalOpen(false)} />
                )}
                {isMarkupModalOpen && userToApprove && (
                    <MarkupApprovalModal 
                        user={userToApprove} 
                        onClose={() => { setIsMarkupModalOpen(false); setUserToApprove(null); }} 
                        onApprove={confirmApproval} 
                    />
                )}
                {isEditModalOpen && selectedUser && (
                    <EditUserModal user={selectedUser} onClose={() => setIsEditModalOpen(false)} />
                )}
                {isViewModalOpen && selectedUser && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] p-4">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className={`${cardBg} border p-6 sm:p-8 rounded-3xl w-full max-w-[480px] relative shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar`}>
                            <button onClick={() => setIsViewModalOpen(false)} className={`absolute top-6 right-6 text-slate-500 hover:${headText} transition-colors`}><RxCross2 size={24} /></button>

                            <div className="flex flex-col items-center mb-8">
                                {selectedUser.image ? (
                                    <img src={selectedUser.image} alt={selectedUser.name} className={`w-24 h-24 rounded-3xl object-cover border-4 ${isDarkMode ? 'border-slate-800' : 'border-slate-200'} mb-4 shadow-xl shadow-blue-500/10`} />
                                ) : (
                                    <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-normal text-3xl uppercase  mb-4 shadow-xl shadow-blue-500/10">
                                        {selectedUser.name?.charAt(0) || 'U'}
                                    </div>
                                )}
                                <h2 className={`text-2xl font-normal ${headText} text-center`}>{selectedUser.name}</h2>
                                <p className="text-[10px] font-normal text-blue-500 uppercase tracking-widest bg-blue-500/10 px-3 py-1 rounded-full mt-2">{selectedUser.role} Agent</p>
                            </div>

                            <div className="space-y-4">
                                <ProfileRow label="Email Access" value={selectedUser.email} />
                                <ProfileRow label="Company Name" value={selectedUser.companyName || "Not Specified"} />
                                <ProfileRow label="Authority Level" value={selectedUser.role === 'admin' ? 'SYSTEM ADMINISTRATOR' : 'STANDARD USER'} />

                                <ProfileRow label="Contact (Skype/WhatsApp/WeChat)" value={selectedUser.contact || "Not Specified"} />
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <ProfileRow label="Country" value={selectedUser.country || "---"} />
                                    <ProfileRow label="State" value={selectedUser.state || "---"} />
                                    <ProfileRow label="City" value={selectedUser.city || "---"} />
                                </div>
                                <ProfileRow label="Active Sessions" value={`${selectedUser.sessions?.length || 0} active device(s)`} />
                                <ProfileRow label="Internal Signature" value={selectedUser._id} />

                                {selectedUser.companyName && (
                                    <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-[#0B1219]/50 border-blue-500/20' : 'bg-blue-50 border-blue-200'}`}>
                                        <div className="flex items-center gap-2 mb-4">
                                            <Globe className="text-blue-500" size={16} />
                                            <h4 className={`text-xs font-normal uppercase tracking-widest ${headText}`}>Public Developer API</h4>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="space-y-1">
                                                <p className="text-[9px] font-normal text-slate-500 uppercase tracking-widest">Public API Endpoint</p>
                                                <div className="flex items-center gap-2">
                                                    <code className="text-[11px] font-mono text-blue-400 bg-blue-900/20 px-2 py-1 rounded border border-blue-500/30 overflow-x-auto whitespace-nowrap block flex-1">
                                                        {`${import.meta.env.VITE_API_BASE_URL}/${selectedUser.companyName}`}
                                                    </code>
                                                    <button
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(`${import.meta.env.VITE_API_BASE_URL}/${selectedUser.companyName}`);
                                                            toast.info("API URL copied to clipboard");
                                                        }}
                                                        className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                                                    >
                                                        <Copy size={12} />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 p-2 rounded-lg">
                                                <Check className="text-emerald-500" size={12} />
                                                <p className="text-[9px] font-normal text-emerald-500 uppercase">API connection is active via company name</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

const StatCard = ({ title, value, icon, trend, trendColor }) => {
    const isDarkMode = useSelector((state) => state.theme?.isDarkMode ?? true);
    const cardBg = isDarkMode ? "bg-[#111922] border-slate-800 hover:border-slate-700" : "bg-white border-slate-200 hover:border-slate-300";
    const headText = isDarkMode ? "text-white" : "text-slate-900";
    const iconBoxBg = isDarkMode ? "bg-[#0B1219] border-slate-800" : "bg-slate-100 border-slate-200";

    const defaultColor = trend?.includes('+') ? 'text-emerald-500 bg-emerald-500/10' : 'text-blue-500 bg-blue-500/10';
    const activeColor = trendColor || defaultColor;

    return (
        <div className={`border p-6 sm:p-7 rounded-3xl flex justify-between items-start shadow-lg transition-colors ${cardBg}`}>
            <div>
                <p className="text-[10px] font-normal text-slate-500 uppercase tracking-widest mb-1">{title}</p>
                <h3 className={`text-2xl sm:text-3xl font-normal mb-2 tracking-tighter ${headText}`}>{value}</h3>
                <span className={`text-[10px] font-normal px-2 py-0.5 rounded-full ${activeColor}`}>
                    {trend}
                </span>
            </div>
            <div className={`p-4 rounded-2xl border shadow-inner ${iconBoxBg}`}>
                {icon}
            </div>
        </div>
    );
};

const ProfileRow = ({ label, value }) => {
    const isDarkMode = useSelector((state) => state.theme?.isDarkMode ?? true);
    return (
        <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-[#0B1219] border-slate-800/50' : 'bg-slate-50 border-slate-200'}`}>
            <p className="text-[10px] font-normal text-slate-500 uppercase tracking-widest mb-1">{label}</p>
            <p className={`text-sm font-normal break-all tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{value}</p>
        </div>
    );
};

const AddUserModal = ({ onClose }) => {
    const dispatch = useDispatch();
    const { apis } = useSelector((state) => state.inventoryApi);
    const [formData, setFormData] = useState({
        name: "",
        companyName: "",
        email: "",
        password: "",
        contact: "",
        country: "",
        state: "",
        city: "",
        role: "user",
        image: "",
        isApproved: true,
        allowedApis: [],
        apiFilterMode: "all",
        apiFilters: {}
    });
    const [countryCode, setCountryCode] = useState("");
    const [stateCode, setStateCode] = useState("");

    const isDarkMode = useSelector((state) => state.theme?.isDarkMode ?? true);
    
    useEffect(() => {
        dispatch(fetchInventoryApis());
    }, [dispatch]);

    const apiOptions = (apis || []).map(api => ({
        value: api._id,
        label: api.url
    }));

    const cardBg = isDarkMode ? "bg-[#111922] border-slate-800" : "bg-white border-slate-200";
    const headText = isDarkMode ? "text-white" : "text-slate-900";
    const inputCls = isDarkMode ? "bg-[#0B1219] border-slate-800 text-white placeholder:text-slate-700" : "bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400";

    const styles = adminSelectStyles(isDarkMode);

    const countryOptions = useMemo(() => getCountryOptions(), []);
    const stateOptions = useMemo(() => getStateOptions(countryCode), [countryCode]);
    const cityOptions = useMemo(() => getCityOptions(countryCode, stateCode), [countryCode, stateCode]);

    const handleCountryChange = (selectedOption) => {
        if (selectedOption) {
            setFormData({ ...formData, country: selectedOption.name, state: "", city: "" });
            setCountryCode(selectedOption.value);
            setStateCode("");
        } else {
            setFormData({ ...formData, country: "", state: "", city: "" });
            setCountryCode("");
            setStateCode("");
        }
    };

    const handleStateChange = (selectedOption) => {
        if (selectedOption) {
            setFormData({ ...formData, state: selectedOption.name, city: "" });
            setStateCode(selectedOption.value);
        } else {
            setFormData({ ...formData, state: "", city: "" });
            setStateCode("");
        }
    };

    const handleCityChange = (selectedOption) => {
        setFormData({ ...formData, city: selectedOption ? selectedOption.name : "" });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await dispatch(createUser(formData));
        if (!res.error) onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] p-4">
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className={`${cardBg} border w-full max-w-[700px] p-6 sm:p-8 rounded-3xl relative shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar`}>
                <button onClick={onClose} className={`absolute top-6 right-6 text-slate-500 hover:${headText} transition-colors`}><RxCross2 size={24} /></button>
                <div className="mb-8">
                    <h2 className={`text-xl sm:text-2xl font-normal ${headText} uppercase  tracking-tighter`}>Initialize User</h2>
                    <p className="text-[10px] font-normal text-slate-500 uppercase tracking-widest mt-1">Register new system credentials</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="flex flex-col sm:flex-row gap-4 items-center mb-6">
                        <div className={`w-20 h-20 rounded-2xl ${isDarkMode ? 'bg-[#0B1219]' : 'bg-slate-50'} border ${isDarkMode ? 'border-slate-800' : 'border-slate-200'} flex items-center justify-center overflow-hidden shrink-0`}>
                            {formData.image ? <img src={formData.image} className="w-full h-full object-cover" alt="preview" /> : <Camera className="text-slate-600" />}
                        </div>
                        <div className="flex-1 w-full space-y-1.5">
                            <label className="text-[10px] font-normal text-slate-500 uppercase tracking-widest ml-1">Profile Image URL</label>
                            <input
                                type="text"
                                placeholder="Paste URL..."
                                value={formData.image}
                                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                className={`w-full ${inputCls} rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-blue-500`}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-normal text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                            <input required type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={`w-full ${inputCls} rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500`} placeholder="Enter your name ..." />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-normal text-slate-500 uppercase tracking-widest ml-1">Company Name</label>
                            <input required type="text" value={formData.companyName} onChange={(e) => setFormData({ ...formData, companyName: e.target.value })} className={`w-full ${inputCls} rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500`} placeholder="Enter your company name ..." />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-normal text-slate-500 uppercase tracking-widest ml-1">Email Terminal</label>
                            <input required type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className={`w-full ${inputCls} rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500`} placeholder="Enter your email ..." />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-normal text-slate-500 uppercase tracking-widest ml-1">System Cipher</label>
                            <input required type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className={`w-full ${inputCls} rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500`} placeholder="••••••••" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-normal text-slate-500 uppercase tracking-widest ml-1">Contact</label>
                            <input required type="text" value={formData.contact} onChange={(e) => setFormData({ ...formData, contact: e.target.value })} className={`w-full ${inputCls} rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500`} placeholder="Skype / WhatsApp / WeChat ID" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-normal text-slate-500 uppercase tracking-widest ml-1">Country</label>
                            <Select
                                options={countryOptions}
                                styles={styles}
                                placeholder="Country"
                                value={countryOptions.find(c => c.value === countryCode) || null}
                                onChange={handleCountryChange}
                                isSearchable
                                isClearable
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-normal text-slate-500 uppercase tracking-widest ml-1">State</label>
                            <Select
                                options={stateOptions}
                                styles={styles}
                                placeholder="State"
                                value={stateOptions.find(s => s.name === formData.state) || null}
                                onChange={handleStateChange}
                                isSearchable
                                isClearable
                                isDisabled={!countryCode}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-normal text-slate-500 uppercase tracking-widest ml-1">City</label>
                            <Select
                                options={cityOptions}
                                styles={styles}
                                placeholder="City"
                                value={cityOptions.find(c => c.name === formData.city) || null}
                                onChange={handleCityChange}
                                isSearchable
                                isClearable
                                isDisabled={!stateCode}
                            />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-normal text-slate-500 uppercase tracking-widest ml-1">Authority Level</label>
                        <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className={`w-full ${inputCls} rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500`}>
                            <option value="user">Standard User</option>
                            <option value="admin">System Admin</option>
                        </select>
                    </div>

                    <div className="space-y-4 p-4 bg-blue-600/5 border border-blue-500/10 rounded-2xl">
                         <div className="flex items-center justify-between">
                            <div>
                                <p className={`text-[10px] font-normal ${headText} uppercase tracking-widest`}>Authorized APIs</p>
                                <p className="text-[9px] text-slate-500 uppercase mt-1">Select data sources for this user</p>
                            </div>
                            <div className="flex-1 ml-4">
                                <Select
                                    isMulti
                                    options={apiOptions}
                                    styles={styles}
                                    value={apiOptions.filter(opt => formData.allowedApis?.includes(opt.value))}
                                    onChange={(selected) => setFormData({ ...formData, allowedApis: selected.map(s => s.value) })}
                                    placeholder="Select APIs..."
                                />
                            </div>
                        </div>
                    </div>

                    <div className={`flex items-center justify-between p-4 ${isDarkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-slate-50 border-slate-200'} rounded-2xl border`}>
                        <div>
                            <p className={`text-[10px] font-normal ${headText} uppercase tracking-widest`}>Instant Approval</p>
                            <p className="text-[9px] text-slate-500 font-normal uppercase mt-1">Grant immediate access</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, isApproved: !formData.isApproved })}
                            className={`w-12 h-6 rounded-full p-1 transition-all ${formData.isApproved ? 'bg-emerald-600' : 'bg-slate-700'}`}
                        >
                            <div className={`w-4 h-4 bg-white rounded-full transition-transform ${formData.isApproved ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                    </div>
                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-normal py-4 rounded-xl text-xs uppercase tracking-widest transition-all mt-4 shadow-lg shadow-blue-600/20 active:scale-95">
                        Establish Credentials
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

const EditUserModal = ({ user, onClose }) => {
    const dispatch = useDispatch();
    const { apis } = useSelector((state) => state.inventoryApi);
    const [formData, setFormData] = useState({ 
        ...user, 
        password: "",
        allowedApis: user.allowedApis || [],
        apiFilterMode: user.apiFilterMode || "all",
        apiFilters: user.apiFilters || {}
    });

    const [countryCode, setCountryCode] = useState("");
    const [stateCode, setStateCode] = useState("");

    const isDarkMode = useSelector((state) => state.theme?.isDarkMode ?? true);
    
    useEffect(() => {
        dispatch(fetchInventoryApis());
    }, [dispatch]);

    const apiOptions = (apis || []).map(api => ({
        value: api._id,
        label: api.url
    }));

    const cardBg = isDarkMode ? "bg-[#111922] border-slate-800" : "bg-white border-slate-200";
    const headText = isDarkMode ? "text-white" : "text-slate-900";
    const inputCls = isDarkMode ? "bg-[#0B1219] border-slate-800 text-white placeholder:text-slate-700" : "bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400";

    const styles = adminSelectStyles(isDarkMode);

    const countryOptions = useMemo(() => getCountryOptions(), []);

    useEffect(() => {
        if (user.country && countryOptions.length > 0) {
            const country = countryOptions.find(c => c.name === user.country);
            if (country) setCountryCode(country.value);
        }
    }, [user.country, countryOptions]);

    useEffect(() => {
        if (countryCode && user.state) {
            const states = getStateOptions(countryCode);
            const state = states.find(s => s.name === user.state);
            if (state) setStateCode(state.value);
        }
    }, [countryCode, user.state]);

    const stateOptions = useMemo(() => getStateOptions(countryCode), [countryCode]);
    const cityOptions = useMemo(() => getCityOptions(countryCode, stateCode), [countryCode, stateCode]);

    const handleCountryChange = (selectedOption) => {
        if (selectedOption) {
            setFormData({ ...formData, country: selectedOption.name, state: "", city: "" });
            setCountryCode(selectedOption.value);
            setStateCode("");
        } else {
            setFormData({ ...formData, country: "", state: "", city: "" });
            setCountryCode("");
            setStateCode("");
        }
    };

    const handleStateChange = (selectedOption) => {
        if (selectedOption) {
            setFormData({ ...formData, state: selectedOption.name, city: "" });
            setStateCode(selectedOption.value);
        } else {
            setFormData({ ...formData, state: "", city: "" });
            setStateCode("");
        }
    };

    const handleCityChange = (selectedOption) => {
        setFormData({ ...formData, city: selectedOption ? selectedOption.name : "" });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const submitData = { ...formData };
        if (!submitData.password) delete submitData.password;
        const res = await dispatch(updateUser({ id: user._id, ...submitData }));
        if (!res.error) onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] p-4">
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className={`${cardBg} border w-full max-w-[650px] p-6 sm:p-8 rounded-3xl relative shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar`}>
                <button onClick={onClose} className={`absolute top-6 right-6 text-slate-500 hover:${headText} transition-colors`}><RxCross2 size={24} /></button>
                <div className="mb-8">
                    <h2 className={`text-xl sm:text-2xl font-normal ${headText} uppercase tracking-tighter`}>Modify Credentials</h2>
                    <p className="text-[10px] font-normal text-slate-500 uppercase tracking-widest mt-1">Updating system authority levels</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="flex flex-col sm:flex-row gap-4 items-center mb-6">
                        <div className={`w-20 h-20 rounded-2xl ${isDarkMode ? 'bg-[#0B1219]' : 'bg-slate-50'} border ${isDarkMode ? 'border-slate-800' : 'border-slate-200'} flex items-center justify-center overflow-hidden shrink-0`}>
                            {formData.image ? <img src={formData.image} className="w-full h-full object-cover" alt="avatar" /> : <div className={`font-normal text-2xl uppercase  ${headText}`}>{formData.name?.charAt(0) || 'U'}</div>}
                        </div>
                        <div className="flex-1 w-full space-y-1.5">
                            <label className="text-[10px] font-normal text-slate-500 uppercase tracking-widest ml-1">Update Avatar URL</label>
                            <input
                                type="text"
                                value={formData.image || ""}
                                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                className={`w-full ${inputCls} rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-blue-500`}
                                placeholder="Paste new image URL..."
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-normal text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                            <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={`w-full ${inputCls} rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500`} />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-normal text-slate-500 uppercase tracking-widest ml-1">Permissions</label>
                            <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className={`w-full ${inputCls} rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500`}>
                                <option value="user">Standard User</option>
                                <option value="admin">System Admin</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-normal text-slate-500 uppercase tracking-widest ml-1">Email Access</label>
                            <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className={`w-full ${inputCls} rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500`} />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-normal text-slate-500 uppercase tracking-widest ml-1">Company Name</label>
                            <input type="text" value={formData.companyName || ""} onChange={(e) => setFormData({ ...formData, companyName: e.target.value })} className={`w-full ${inputCls} rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500`} placeholder="Company name" />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-normal text-slate-500 uppercase tracking-widest ml-1">Reset Cipher (Optional)</label>
                        <input type="password" placeholder="Leave blank to keep current" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className={`w-full ${inputCls} rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500`} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-normal text-slate-500 uppercase tracking-widest ml-1">Contact</label>
                            <input type="text" value={formData.contact || ""} onChange={(e) => setFormData({ ...formData, contact: e.target.value })} className={`w-full ${inputCls} rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500`} placeholder="Contact info" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-normal text-slate-500 uppercase tracking-widest ml-1">Country</label>
                            <Select
                                options={countryOptions}
                                styles={styles}
                                placeholder="Country"
                                value={countryOptions.find(c => c.value === countryCode) || null}
                                onChange={handleCountryChange}
                                isSearchable
                                isClearable
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-normal text-slate-500 uppercase tracking-widest ml-1">State</label>
                            <Select
                                options={stateOptions}
                                styles={styles}
                                placeholder="State"
                                value={stateOptions.find(s => s.value === stateCode) || null}
                                onChange={handleStateChange}
                                isSearchable
                                isClearable
                                isDisabled={!countryCode}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-normal text-slate-500 uppercase tracking-widest ml-1">City</label>
                            <Select
                                options={cityOptions}
                                styles={styles}
                                placeholder="City"
                                value={cityOptions.find(c => c.name === formData.city) || null}
                                onChange={handleCityChange}
                                isSearchable
                                isClearable
                                isDisabled={!stateCode}
                            />
                        </div>
                    </div>

                    <div className={`flex items-center justify-between p-4 ${isDarkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-slate-50 border-slate-200'} rounded-2xl border`}>
                        <div>
                            <p className={`text-[10px] font-normal ${headText} uppercase tracking-widest`}>Access Permission</p>
                            <p className="text-[9px] text-slate-500 font-normal uppercase mt-1">Toggle user login authority</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, isApproved: !formData.isApproved })}
                            className={`w-12 h-6 rounded-full p-1 transition-all ${formData.isApproved ? 'bg-emerald-600' : 'bg-slate-700'}`}
                        >
                            <div className={`w-4 h-4 bg-white rounded-full transition-transform ${formData.isApproved ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                    </div>

                    <div className={`flex items-center justify-between p-4 ${isDarkMode ? 'bg-amber-500/10 border-amber-500/20' : 'bg-amber-50 border-amber-100'} rounded-2xl border`}>
                        <div>
                            <p className={`text-[10px] font-normal ${isDarkMode ? 'text-amber-500' : 'text-amber-600'} uppercase tracking-widest`}>Active Sessions</p>
                            <p className="text-[9px] text-slate-500 font-normal uppercase mt-1">Current: {user.sessions?.length || 0} active device(s)</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => { if(window.confirm("Clear all active sessions?")) dispatch(clearSessions(user._id)); }}
                            className={`px-4 py-2 rounded-xl text-[10px] font-normal uppercase tracking-widest border border-amber-500/30 text-amber-500 hover:bg-amber-500 hover:text-white transition-all`}
                        >
                            Reset
                        </button>
                    </div>

                    <div className={`flex flex-col space-y-4 p-4 ${isDarkMode ? 'bg-emerald-600/10 border-emerald-500/20' : 'bg-emerald-50 border-emerald-100'} rounded-2xl border transition-all`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className={`text-[10px] font-normal ${isDarkMode ? 'text-emerald-500' : 'text-emerald-600'} uppercase tracking-widest`}>Inventory Management</p>
                                <p className="text-[9px] text-slate-500 font-normal uppercase mt-1">General Price Multiplier</p>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-[10px] font-bold ${formData.priceMarkup >= 0 ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/20 text-red-500'}`}>
                                {formData.priceMarkup > 0 ? '+' : ''}{formData.priceMarkup || 0}%
                            </div>
                        </div>

                        <div className="pt-2 border-t border-emerald-500/20">
                            <label className={`text-[10px] font-normal ${isDarkMode ? 'text-emerald-400' : 'text-emerald-700'} uppercase tracking-widest mb-2 block`}>
                                Inventory Price Adjustment
                            </label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="range"
                                    min="-50"
                                    max="100"
                                    step="1"
                                    value={formData.priceMarkup || 0}
                                    onChange={(e) => setFormData({ ...formData, priceMarkup: Number(e.target.value) })}
                                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                                />
                            </div>
                            <p className="text-[9px] text-slate-500 mt-2 italic text-center">Applied to all inventory prices visible to this user.</p>
                        </div>
                    </div>

                    <div className={`flex flex-col space-y-4 p-4 ${isDarkMode ? 'bg-blue-600/10 border-blue-500/20' : 'bg-blue-50 border-blue-100'} rounded-2xl border transition-all`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className={`text-[10px] font-normal ${isDarkMode ? 'text-blue-500' : 'text-blue-600'} uppercase tracking-widest`}>API Access Status</p>
                                <p className="text-[9px] text-slate-500 font-normal uppercase mt-1">Public API Availability</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, isApiOpen: !formData.isApiOpen })}
                                className={`w-12 h-6 rounded-full p-1 transition-all ${formData.isApiOpen ? 'bg-blue-600' : 'bg-slate-700'}`}
                            >
                                <div className={`w-4 h-4 bg-white rounded-full transition-transform ${formData.isApiOpen ? 'translate-x-6' : 'translate-x-0'}`} />
                            </button>
                        </div>

                        {formData.isApiOpen && (
                            <div className="space-y-4 pt-4 border-t border-blue-500/10">
                                <div className="space-y-1.5">
                                    <label className={`text-[10px] font-normal ${isDarkMode ? 'text-blue-400' : 'text-blue-700'} uppercase tracking-widest block`}>
                                        Allowed APIs (Data Sources)
                                    </label>
                                    <Select
                                        isMulti
                                        options={apiOptions}
                                        styles={styles}
                                        value={apiOptions.filter(opt => formData.allowedApis?.includes(opt.value))}
                                        onChange={(selected) => setFormData({ ...formData, allowedApis: selected.map(s => s.value) })}
                                        placeholder="Select authorized APIs..."
                                    />
                                    <p className="text-[9px] text-slate-500">Only data from these APIs will be served to this user. Leave empty for ALL APIs.</p>
                                </div>

                                <div className="pt-2">
                                    <label className={`text-[10px] font-normal ${isDarkMode ? 'text-blue-400' : 'text-blue-700'} uppercase tracking-widest mb-2 block`}>
                                        API Price Markup/Discount
                                    </label>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="range"
                                            min="-50"
                                            max="50"
                                            value={formData.apiPriceAdjustment || 0}
                                            onChange={(e) => setFormData({ ...formData, apiPriceAdjustment: Number(e.target.value) })}
                                            className="w-full accent-blue-500 h-1.5 bg-blue-900 rounded-lg appearance-none cursor-pointer"
                                        />
                                        <span className={`text-xs font-mono font-bold w-12 text-right ${formData.apiPriceAdjustment >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                            {formData.apiPriceAdjustment > 0 ? '+' : ''}{formData.apiPriceAdjustment || 0}%
                                        </span>
                                    </div>
                                    <p className="text-[9px] text-slate-500 mt-1 italic">Adjust prices exposed via this user's API.</p>
                                </div>

                                <div className="pt-4 border-t border-blue-500/10">
                                    <div className="flex items-center justify-between mb-4">
                                        <label className={`text-[10px] font-normal ${isDarkMode ? 'text-blue-400' : 'text-blue-700'} uppercase tracking-widest block`}>
                                            Data Filtering Mode
                                        </label>
                                        <div className="flex bg-slate-800/80 p-1 rounded-xl">
                                            <button 
                                                type="button" 
                                                onClick={() => setFormData({...formData, apiFilterMode: 'all'})}
                                                className={`px-3 py-1 text-[10px] uppercase rounded-lg transition-all ${formData.apiFilterMode === 'all' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400'}`}
                                            >
                                                All Data
                                            </button>
                                            <button 
                                                type="button" 
                                                onClick={() => setFormData({...formData, apiFilterMode: 'specific'})}
                                                className={`px-3 py-1 text-[10px] uppercase rounded-lg transition-all ${formData.apiFilterMode === 'specific' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400'}`}
                                            >
                                                Specific
                                            </button>
                                        </div>
                                    </div>

                                    {formData.apiFilterMode === 'specific' && (
                                        <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-400">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {/* Shape */}
                                                <div className="space-y-1.5">
                                                    <label className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Shapes Eligibility</label>
                                                    <Select
                                                        isMulti
                                                        options={["Round", "Princess", "Emerald", "Pear", "Oval", "Radiant", "Marquise", "Cushion", "Heart", "Asscher", "Square Radiant"].map(o => ({ value: o, label: o }))}
                                                        styles={styles}
                                                        placeholder="All Shapes..."
                                                        value={formData.apiFilters?.shapes ? formData.apiFilters.shapes.split(',').filter(Boolean).map(v => ({ value: v, label: v })) : []}
                                                        onChange={(selected) => setFormData({
                                                            ...formData,
                                                            apiFilters: { ...formData.apiFilters, shapes: selected ? selected.map(s => s.value).join(',') : "" }
                                                        })}
                                                    />
                                                </div>
                                                {/* Color */}
                                                <div className="space-y-1.5">
                                                    <label className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Color Spectrum</label>
                                                    <Select
                                                        isMulti
                                                        options={["D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N"].map(o => ({ value: o, label: o }))}
                                                        styles={styles}
                                                        placeholder="All Colors..."
                                                        value={formData.apiFilters?.colors ? formData.apiFilters.colors.split(',').filter(Boolean).map(v => ({ value: v, label: v })) : []}
                                                        onChange={(selected) => setFormData({
                                                            ...formData,
                                                            apiFilters: { ...formData.apiFilters, colors: selected ? selected.map(s => s.value).join(',') : "" }
                                                        })}
                                                    />
                                                </div>
                                                {/* Clarity */}
                                                <div className="space-y-1.5">
                                                    <label className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Clarity Grade</label>
                                                    <Select
                                                        isMulti
                                                        options={["FL", "IF", "VVS1", "VVS2", "VS1", "VS2", "SI1", "SI2", "I1"].map(o => ({ value: o, label: o }))}
                                                        styles={styles}
                                                        placeholder="All Clarities..."
                                                        value={formData.apiFilters?.clarities ? formData.apiFilters.clarities.split(',').filter(Boolean).map(v => ({ value: v, label: v })) : []}
                                                        onChange={(selected) => setFormData({
                                                            ...formData,
                                                            apiFilters: { ...formData.apiFilters, clarities: selected ? selected.map(s => s.value).join(',') : "" }
                                                        })}
                                                    />
                                                </div>
                                                {/* Cut */}
                                                <div className="space-y-1.5">
                                                    <label className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Cut Quality</label>
                                                    <Select
                                                        isMulti
                                                        options={["Ideal", "EX", "VG", "G", "F", "P"].map(o => ({ value: o, label: o }))}
                                                        styles={styles}
                                                        placeholder="All Cuts..."
                                                        value={formData.apiFilters?.cuts ? formData.apiFilters.cuts.split(',').filter(Boolean).map(v => ({ value: v, label: v })) : []}
                                                        onChange={(selected) => setFormData({
                                                            ...formData,
                                                            apiFilters: { ...formData.apiFilters, cuts: selected ? selected.map(s => s.value).join(',') : "" }
                                                        })}
                                                    />
                                                </div>
                                            </div>

                                            {/* Advanced Ranges */}
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                <RangeBox label="Carat" minK="caratMin" maxK="caratMax" fd={formData} sfd={setFormData} step="0.01" />
                                                <RangeBox label="Price" minK="priceMin" maxK="priceMax" fd={formData} sfd={setFormData} step="1" />
                                                <RangeBox label="Table" minK="tableMin" maxK="tableMax" fd={formData} sfd={setFormData} step="0.1" />
                                                <RangeBox label="Depth" minK="depthMin" maxK="depthMax" fd={formData} sfd={setFormData} step="0.1" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-normal py-4 rounded-xl text-xs uppercase tracking-widest transition-all mt-4 shadow-lg shadow-blue-600/20 active:scale-95">
                        Commit Modifications
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

const MarkupApprovalModal = ({ user, onClose, onApprove }) => {
    const [priceMarkup, setPriceMarkup] = useState(0);
    const isDarkMode = useSelector((state) => state.theme?.isDarkMode ?? true);
    const cardBg = isDarkMode ? "bg-[#111922] border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.5)]" : "bg-white border-slate-200 shadow-xl";
    const headText = isDarkMode ? "text-white" : "text-slate-900";
    const inputCls = isDarkMode ? "bg-[#0B1219] border-slate-800 text-white" : "bg-slate-50 border-slate-200 text-slate-900";

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4">
            <motion.div 
                initial={{ scale: 0.9, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }} 
                className={`${cardBg} border p-8 rounded-[2.5rem] w-full max-w-[440px] relative transition-all duration-500 overflow-hidden text-center`}
            >
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-emerald-600/5 rounded-full blur-3xl pointer-events-none" />

                <button onClick={onClose} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors cursor-pointer"><RxCross2 size={24} /></button>
                
                <div className="relative z-10">
                    <div className="w-20 h-20 bg-blue-600/10 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-blue-500/20 shadow-inner">
                        <UserCheck className="text-blue-500" size={36} />
                    </div>
                    <h2 className={`text-2xl font-normal ${headText} uppercase tracking-tighter`}>Approve Identity</h2>
                    <p className="text-[10px] font-normal text-slate-500 uppercase tracking-widest mt-2 px-6 leading-relaxed">Set the global inventory price adjustment for <span className="text-blue-500 font-bold">{user.name}</span></p>
                </div>

                <div className="space-y-6 relative mt-8 z-10">
                    <div className={`p-6 rounded-3xl border ${isDarkMode ? 'bg-[#0B1219]/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-[10px] font-normal text-slate-500 uppercase tracking-widest">Price Increment (%)</span>
                            <span className={`text-lg font-mono font-bold ${priceMarkup >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                {priceMarkup > 0 ? '+' : ''}{priceMarkup}%
                            </span>
                        </div>
                        <input
                            type="range"
                            min="-50"
                            max="100"
                            step="1"
                            value={priceMarkup}
                            onChange={(e) => setPriceMarkup(Number(e.target.value))}
                            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600 transition-all hover:accent-blue-400"
                        />
                        <div className="flex justify-between mt-3 px-1 text-[9px] text-slate-600 font-medium uppercase tracking-tighter">
                            <span>-50% (Disc)</span>
                            <span>Base</span>
                            <span>+100% (Inc)</span>
                        </div>
                    </div>

                    <p className="text-[9px] text-slate-500 text-center uppercase tracking-widest px-8 leading-loose opacity-60">
                        This percentage will be automatically applied to all diamond prices visible to this user in their portal.
                    </p>

                    <div className="flex gap-3">
                        <button 
                            onClick={onClose} 
                            className={`flex-1 ${isDarkMode ? 'bg-slate-800/50 hover:bg-slate-800 text-slate-400' : 'bg-slate-100 hover:bg-slate-200 text-slate-500'} font-normal py-4 rounded-2xl text-[10px] uppercase tracking-widest transition-all cursor-pointer`}
                        >
                            Abort
                        </button>
                        <button 
                            onClick={() => onApprove(user._id, priceMarkup)} 
                            className="flex-[2] bg-blue-600 hover:bg-blue-500 text-white font-normal py-4 rounded-2xl text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                        >
                            Confirm & Activate <UserCheck size={14} />
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

const RangeBox = ({ label, minK, maxK, fd, sfd, step }) => (
    <div className="space-y-1">
        <label className="text-[8px] text-slate-500 uppercase tracking-[0.2em] font-bold">{label}</label>
        <div className="flex items-center gap-1">
            <input 
                type="number" 
                placeholder="Min"
                step={step}
                className="w-full bg-[#0B1219] border border-slate-800 rounded-lg px-2 py-1.5 text-[10px] text-white outline-none focus:border-blue-500"
                value={fd.apiFilters?.[minK] || ""}
                onChange={(e) => sfd({ ...fd, apiFilters: { ...fd.apiFilters, [minK]: e.target.value } })}
            />
            <input 
                type="number" 
                placeholder="Max"
                step={step}
                className="w-full bg-[#0B1219] border border-slate-800 rounded-lg px-2 py-1.5 text-[10px] text-white outline-none focus:border-blue-500"
                value={fd.apiFilters?.[maxK] || ""}
                onChange={(e) => sfd({ ...fd, apiFilters: { ...fd.apiFilters, [maxK]: e.target.value } })}
            />
        </div>
    </div>
);

export default Users;

