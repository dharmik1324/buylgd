import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout, logoutUser, updateProfile } from "../../store/authSlice";
import { removeFromCart } from "../../store/cartSlice";
import { releaseHold } from "../../store/diamondSlice";
import { toggleWishlist, removeFromWishlist } from "../../store/wishlistSlice";
import { EditProfileModal } from "../../components/common/EditProfileModal";
import { ShapeIcon } from "../../components/diamond/DiamondShapeIcons";
import { clearSessions } from "../../store/userSlice";
import {
    User, Mail, Phone, Building2, MapPin, Globe, Key,
    ShieldCheck, ShieldAlert, LogOut, Edit3, Camera,
    CheckCircle2, Clock, Trash2, Gem, ExternalLink, Copy,
    Heart, Eye, X, ChevronDown, ChevronUp, RefreshCcw, 
    Settings2, SlidersVertical, Search, Globe2, ShieldCheck as VerifiedIcon
} from "lucide-react";
import Select from "react-select";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";

export const Profile = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const cartItems = useSelector((state) => state.cart.items);
    const wishlistItems = useSelector((state) => state.wishlist.items);
    const isDarkMode = useSelector((state) => state.theme.isDarkMode);
    const [editOpen, setEditOpen] = useState(false);
    const [wishlistOpen, setWishlistOpen] = useState(false);
    const [selectedDiamond, setSelectedDiamond] = useState(null);

    if (!user) {
        navigate("/login");
        return null;
    }

    const handleFilterUpdate = (field, value) => {
        dispatch(updateProfile({
            id: user._id || user.id,
            apiFilters: { ...user.apiFilters, [field]: value }
        }));
    };

    const handleLogout = async () => {
        try {
            await dispatch(logoutUser());
            navigate("/login", { replace: true });
        } catch (err) {
            console.error("Logout failed", err);
            navigate("/login", { replace: true });
        }
    };

    const handleRemoveHold = async (id) => {
        try {
            await dispatch(releaseHold(id)).unwrap();
            dispatch(removeFromCart(id));
            toast.success("Diamond released from hold");
        } catch (err) {
            dispatch(removeFromCart(id));
        }
    };

    const bgMain = isDarkMode ? "bg-[#070B0F]" : "bg-slate-50";
    const cardBg = isDarkMode ? "bg-[#111922]" : "bg-white";
    const borderColor = isDarkMode ? "border-slate-800" : "border-slate-200";
    const textMain = isDarkMode ? "text-white" : "text-slate-900";
    const textSub = isDarkMode ? "text-slate-400" : "text-slate-500";

    const InfoItem = ({ icon: Icon, label, value }) => (
        <div className={`flex items-center gap-4 p-4 rounded-2xl border ${borderColor} ${isDarkMode ? "bg-slate-950/20" : "bg-slate-50/50"} transition-all hover:scale-[1.01]`}>
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-500">
                <Icon size={18} />
            </div>
            <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-normal">{label}</p>
                <p className={`text-sm font-normal ${textMain}`}>{value || "Not Set"}</p>
            </div>
        </div>
    );

    return (
        <div className={`min-h-screen ${bgMain} p-6 md:p-12 font-sans`}>
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left Column: Avatar and Status */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="w-full lg:w-80 flex-shrink-0 space-y-6"
                    >
                        <div className={`p-8 rounded-[40px] border ${borderColor} ${cardBg} shadow-2xl flex flex-col items-center text-center`}>
                            <div className="relative group mb-6">
                                <div className="w-32 h-32 rounded-[48px] bg-blue-600/10 border-4 border-blue-600/20 flex items-center justify-center text-blue-500 overflow-hidden shadow-2xl">
                                    {user.image ? (
                                        <img src={user.image} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="text-4xl font-normal">{user?.name?.charAt(0)?.toUpperCase()}</div>
                                    )}
                                </div>
                                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white dark:bg-[#111922] rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-center text-blue-500 shadow-xl cursor-default" title="Verified Member">
                                    <CheckCircle2 size={20} />
                                </div>
                            </div>

                            <h2 className={`text-2xl font-normal  uppercase tracking-tighter ${textMain}`}>{user.name}</h2>
                            <p className="text-[10px] text-blue-500 uppercase tracking-[0.2em] mt-1 font-normal ">Authorized Business Partner</p>

                            <div className="w-full h-px bg-slate-800/10 my-6" />

                            <div className="w-full space-y-4">
                                <button
                                    onClick={() => setEditOpen(true)}
                                    className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-2xl py-4 flex items-center justify-center gap-2 text-xs font-normal uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20 active:scale-95"
                                >
                                    <Edit3 size={16} /> Edit Profile
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className={`w-full border ${borderColor} ${isDarkMode ? "hover:bg-red-500/10 text-red-500" : "hover:bg-red-50 text-red-600"} rounded-2xl py-4 flex items-center justify-center gap-2 text-xs font-normal uppercase tracking-widest transition-all active:scale-95`}
                                >
                                    <LogOut size={16} /> Sign Out
                                </button>
                            </div>
                        </div>

                        {/* System Status Card */}
                        <div className={`p-6 rounded-[32px] border ${borderColor} ${cardBg} shadow-xl`}>
                            <h3 className="text-[10px] uppercase text-slate-500 tracking-widest mb-4 font-normal">Terminal Protocol</h3>
                            <div className="space-y-3">
                                <div className={`p-4 rounded-2xl border ${user.isApiOpen ? "bg-emerald-500/5 border-emerald-500/20" : "bg-amber-500/5 border-amber-500/20"} flex items-center gap-4`}>
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${user.isApiOpen ? "text-emerald-500 bg-emerald-500/10" : "text-amber-500 bg-amber-500/10"}`}>
                                        {user.isApiOpen ? <ShieldCheck size={20} /> : <ShieldAlert size={20} />}
                                    </div>
                                    <div>
                                        <p className={`text-xs font-normal ${user.isApiOpen ? "text-emerald-500" : "text-amber-500"}`}>
                                            {user.isApiOpen ? "API Sync Active" : "Access Restricted"}
                                        </p>
                                        <p className="text-[9px] text-slate-500 uppercase tracking-tighter mt-0.5">
                                            {user.isApiOpen ? "Authorized Node" : "Clearance Required"}
                                        </p>
                                    </div>
                                </div>

                                {/* User Self-Service Session Control */}
                                {user.role !== 'admin' && (
                                    <div className={`p-4 rounded-2xl border ${borderColor} ${isDarkMode ? "bg-slate-900/40" : "bg-slate-50/50"} flex flex-col gap-3`}>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-blue-600/10 flex items-center justify-center text-blue-500">
                                                <RefreshCcw size={14} />
                                            </div>
                                            <div>
                                                <p className={`text-xs font-normal ${textMain}`}>Active Sessions</p>
                                                <p className="text-[9px] text-slate-500 mt-0.5">{user.sessions?.length || 1} Device(s) connected</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                if (window.confirm("This will log you out from all other devices. Continue?")) {
                                                    dispatch(clearSessions(user._id || user.id));
                                                }
                                            }}
                                            className="w-full py-2 rounded-xl border border-blue-500/20 text-[10px] font-normal uppercase tracking-widest text-blue-500 hover:bg-blue-500 hover:text-white transition-all"
                                        >
                                            Sign out of all devices
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Column: Corporate Info & Holds */}
                    <div className="flex-1 space-y-8">
                        {/* Corporate Node Details */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`p-8 md:p-10 rounded-[40px] border ${borderColor} ${cardBg} shadow-2xl relative overflow-hidden`}
                        >
                            <div className="absolute top-0 right-0 p-8 opacity-5">
                                <Building2 size={120} className={textMain} />
                            </div>

                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-2 h-8 bg-blue-600 rounded-full" />
                                <h2 className={`text-xl font-normal uppercase tracking-tighter ${textMain}`}>Corporate Registry</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InfoItem icon={Building2} label="Registered Entity" value={user.companyName} />
                                <InfoItem icon={Mail} label="Secure Communication" value={user.email} />
                                <InfoItem icon={Phone} label="Direct Line" value={user.contact} />
                                <InfoItem icon={MapPin} label="Territory / City" value={user.city} />
                                <InfoItem icon={Globe} label="Region (Country)" value={user.country} />
                                <InfoItem icon={ShieldCheck} label="Partner Role" value={user.role === 'admin' ? 'Terminal Operator' : 'Wholesale Member'} />
                            </div>
                        </motion.div>

                        {/* Holding Assets (RE-INTEGRATED FROM OLD UI PATTERN) */}
                        {/* <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className={`p-8 md:p-10 rounded-[40px] border ${borderColor} ${cardBg} shadow-2xl`}
                        >
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-8 bg-blue-500 rounded-full" />
                                    <h2 className={`text-xl font-normal uppercase tracking-tighter ${textMain}`}>Held Inventory</h2>
                                </div>
                                <div className="px-4 py-1.5 rounded-full bg-blue-500/10 text-blue-500 text-[10px] uppercase font-normal tracking-widest border border-blue-500/20">
                                    {cartItems.length} Reserved
                                </div>
                            </div>

                            {cartItems.length === 0 ? (
                                <div className={`p-12 rounded-3xl border-2 border-dashed ${borderColor} flex flex-col items-center text-center`}>
                                    <Clock size={40} className="text-slate-700 opacity-20 mb-4" />
                                    <p className="text-xs text-slate-500 uppercase tracking-widest">No active holds in session</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {cartItems.map((item) => (
                                        <div key={item._id} className={`p-4 rounded-3xl border ${borderColor} ${isDarkMode ? "bg-slate-950/20 hover:bg-slate-900/40" : "bg-slate-50 hover:bg-white"} transition-all group flex flex-col md:flex-row items-center gap-6`}>
                                            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center overflow-hidden border ${isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}>
                                                {item.Diamond_Image ? (
                                                    <img src={item.Diamond_Image} className="w-full h-full object-cover p-1" alt="" />
                                                ) : (
                                                    <ShapeIcon shape={item.Shape} className="w-10 h-10 text-slate-700 opacity-20" />
                                                )}
                                            </div>

                                            <div className="flex-1 text-center md:text-left">
                                                <h4 className={`text-sm font-normal ${textMain}  transition-colors group-hover:text-blue-500`}>
                                                    {item.Weight} ct {item.Shape}
                                                </h4>
                                                <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-1 text-[10px] text-slate-500 uppercase tracking-tighter">
                                                    <span>{item.Color}</span>
                                                    <span>•</span>
                                                    <span>{item.Clarity}</span>
                                                    <span>•</span>
                                                    <span>{item.Lab}</span>
                                                </div>
                                                <p className={`text-base font-normal mt-1 ${isDarkMode ? "text-blue-500" : "text-blue-600"}`}>
                                                    ${Number(item.Final_Price).toLocaleString()}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => navigate(`/diamonds/diamond-details`, { state: { diamond: item } })}
                                                    className={`p-3 rounded-xl border ${borderColor} ${textSub} hover:text-blue-500 hover:bg-blue-500/10 transition-all`}
                                                    title="View Specifications"
                                                >
                                                    <ExternalLink size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleRemoveHold(item._id)}
                                                    className={`p-3 rounded-xl border ${borderColor} text-red-400 hover:text-red-500 hover:bg-red-500/10 transition-all`}
                                                    title="Release Asset"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div> */}

                        {/* ── Saved Diamonds (Wishlist) ── */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 }}
                            className={`rounded-[40px] border ${borderColor} ${cardBg} shadow-2xl overflow-hidden`}
                        >
                            {/* Toggle Header Button */}
                            <button
                                onClick={() => setWishlistOpen((o) => !o)}
                                className={`w-full p-8 md:px-10 md:py-8 flex items-center justify-between transition-colors ${isDarkMode ? "hover:bg-white/5" : "hover:bg-slate-50"
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500">
                                        <Heart size={18} fill={wishlistItems.length > 0 ? "currentColor" : "none"} />
                                    </div>
                                    <div className="text-left">
                                        <h2 className={`text-lg font-normal uppercase tracking-tighter ${textMain}`}>Saved Diamonds</h2>
                                        <p className={`text-[10px] uppercase tracking-widest mt-0.5 ${textSub}`}>
                                            {wishlistItems.length === 0 ? "No diamonds saved yet" : `${wishlistItems.length} diamond${wishlistItems.length > 1 ? "s" : ""} saved`}
                                        </p>
                                    </div>
                                </div>
                                <div className={`flex items-center gap-3`}>
                                    {wishlistItems.length > 0 && (
                                        <span className="px-3 py-1 rounded-full bg-red-500/10 text-red-500 text-[10px] font-bold uppercase tracking-widest border border-red-500/20">
                                            {wishlistItems.length}
                                        </span>
                                    )}
                                    <div className={`p-2 rounded-xl ${isDarkMode ? "bg-slate-800" : "bg-slate-100"} ${textSub}`}>
                                        {wishlistOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                    </div>
                                </div>
                            </button>

                            {/* Collapsible Content */}
                            <AnimatePresence>
                                {wishlistOpen && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: "easeInOut" }}
                                        className="overflow-hidden"
                                    >
                                        <div className={`px-8 md:px-10 pb-8 border-t ${borderColor}`}>
                                            {wishlistItems.length === 0 ? (
                                                <div className={`mt-6 p-10 rounded-3xl border-2 border-dashed ${borderColor} flex flex-col items-center text-center`}>
                                                    <Heart size={36} className="text-slate-700 opacity-20 mb-3" />
                                                    <p className="text-xs text-slate-500 uppercase tracking-widest">No saved diamonds</p>
                                                    <p className={`text-xs mt-1 ${textSub}`}>Tap ♥ on any diamond card to save it</p>
                                                </div>
                                            ) : (
                                                <div className="space-y-3 mt-6">
                                                    {wishlistItems.map((item) => (
                                                        <div
                                                            key={item._id}
                                                            className={`p-4 rounded-3xl border ${borderColor} ${isDarkMode ? "bg-slate-950/20" : "bg-slate-50"
                                                                } flex flex-col sm:flex-row items-center gap-4 group`}
                                                        >
                                                            {/* Thumbnail */}
                                                            <div className={`w-16 h-16 rounded-2xl flex-shrink-0 flex items-center justify-center overflow-hidden border ${isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
                                                                }`}>
                                                                {item.Diamond_Image
                                                                    ? <img src={item.Diamond_Image} className="w-full h-full object-contain p-1" alt="" />
                                                                    : <ShapeIcon shape={item.Shape} className="w-8 h-8 text-slate-400 opacity-40" />}
                                                            </div>

                                                            {/* Info */}
                                                            <div className="flex-1 text-center sm:text-left">
                                                                <p className={`text-sm font-normal ${textMain} group-hover:text-red-500 transition-colors`}>
                                                                    {item.Weight} ct {item.Shape}
                                                                </p>
                                                                <p className={`text-[10px] uppercase tracking-widest mt-0.5 ${textSub}`}>
                                                                    {item.Color} · {item.Clarity} · {item.Lab}
                                                                </p>
                                                                <p className={`text-sm font-bold mt-1 ${isDarkMode ? "text-blue-400" : "text-blue-600"}`}>
                                                                    ${Number(item.Final_Price).toLocaleString()}
                                                                </p>
                                                            </div>

                                                            {/* Actions */}
                                                            <div className="flex items-center gap-2">
                                                                <button
                                                                    onClick={() => setSelectedDiamond(item)}
                                                                    title="View Details"
                                                                    className={`p-2.5 rounded-xl border ${borderColor} ${isDarkMode ? "text-blue-400 hover:bg-blue-500/10" : "text-blue-500 hover:bg-blue-50"
                                                                        } transition-all`}
                                                                >
                                                                    <Eye size={15} />
                                                                </button>
                                                                <button
                                                                    onClick={() => dispatch(removeFromWishlist(item._id))}
                                                                    title="Remove"
                                                                    className={`p-2.5 rounded-xl border ${borderColor} text-red-400 hover:bg-red-500/10 transition-all`}
                                                                >
                                                                    <Trash2 size={15} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>

                        {/* Security Token Node */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className={`p-8 md:p-10 rounded-[40px] border ${borderColor} ${cardBg} shadow-2xl overflow-hidden`}
                        >
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-2 h-8 bg-amber-500 rounded-full" />
                                <h2 className={`text-xl font-normal uppercase tracking-tighter ${textMain}`}>Authentication & API</h2>
                            </div>

                            <div className={`p-6 rounded-3xl border ${borderColor} ${isDarkMode ? "bg-black/40" : "bg-slate-50"}`}>
                                <div className="space-y-6">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                                                <Key size={18} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] uppercase text-amber-500 tracking-[0.2em] font-normal">Authorization Token</p>
                                                <p className={`text-xs ${textSub} lowercase tracking-tighter`}>Keep this Terminal Key confidential</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`font-mono text-xs p-4 rounded-xl ${isDarkMode ? "bg-slate-900" : "bg-white"} border ${borderColor} break-all flex items-center justify-between group`}>
                                        <span className={user.apiKey ? "text-emerald-500" : "text-slate-600"}>
                                            {user.apiKey || "NO_ACTIVE_TOKEN_FOUND"}
                                        </span>
                                        {user.apiKey && (
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText(user.apiKey);
                                                    toast.success("Identity Token copied to clipboard");
                                                }}
                                                className="text-slate-600 hover:text-blue-500 transition-colors"
                                            >
                                                <Copy size={16} />
                                            </button>
                                        )}
                                    </div>

                                    {user.isApiOpen && user.companyName && (
                                        <div className="pt-4 border-t border-slate-800/10 space-y-6">
                                            <div>
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                                                        <Globe size={18} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] uppercase text-blue-500 tracking-[0.2em] font-normal">API Endpoint URL</p>
                                                        <p className={`text-xs ${textSub} lowercase tracking-tighter`}>Your unique inventory access point</p>
                                                    </div>
                                                </div>
                                                <div className={`font-mono text-[10px] p-4 rounded-xl ${isDarkMode ? "bg-slate-900" : "bg-white"} border ${borderColor} break-all flex items-center justify-between group`}>
                                                    <span className="text-blue-400">
                                                        {`${import.meta.env.VITE_API_BASE_URL}/inventory/${user.companyName.toLowerCase().replace(/\s+/g, '-')}`}
                                                    </span>
                                                    <button
                                                        onClick={() => {
                                                            const url = `${import.meta.env.VITE_API_BASE_URL}/inventory/${user.companyName.toLowerCase().replace(/\s+/g, '-')}`;
                                                            navigator.clipboard.writeText(url);
                                                            toast.success("API Endpoint URL copied to clipboard");
                                                        }}
                                                        className="text-slate-600 hover:text-blue-500 transition-colors"
                                                    >
                                                        <Copy size={16} />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* API CONFIGURATION SUB-SECTION */}
                                            <div className={`p-6 rounded-3xl border border-blue-500/20 ${isDarkMode ? "bg-blue-500/[0.03]" : "bg-blue-50/30"}`}>
                                                <div className="flex items-center justify-between mb-6">
                                                    <div>
                                                        <h4 className={`text-xs font-normal uppercase tracking-widest ${textMain}`}>External API Configuration</h4>
                                                        <p className="text-[9px] text-slate-500 uppercase mt-1">Define data feed behavior</p>
                                                    </div>
                                                    <div className="flex bg-slate-900/50 p-1 rounded-xl border border-white/5">
                                                        <button 
                                                            disabled={!user.isApiOpen}
                                                            onClick={() => dispatch(updateProfile({ id: user._id || user.id, apiFilterMode: 'all' }))}
                                                            className={`px-3 py-1.5 text-[9px] uppercase rounded-lg transition-all ${user.apiFilterMode === 'all' || !user.apiFilterMode ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-500'} disabled:opacity-50 disabled:cursor-not-allowed`}
                                                        >
                                                            All Data
                                                        </button>
                                                        <button 
                                                            disabled={!user.isApiOpen}
                                                            onClick={() => dispatch(updateProfile({ id: user._id || user.id, apiFilterMode: 'specific' }))}
                                                            className={`px-3 py-1.5 text-[9px] uppercase rounded-lg transition-all ${user.apiFilterMode === 'specific' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-500'} disabled:opacity-50 disabled:cursor-not-allowed`}
                                                        >
                                                            Specific
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* API PRICE ADJUSTMENT */}
                                                <div className="mb-8 p-6 rounded-3xl border border-blue-500/10 bg-slate-900/20">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <SlidersVertical size={14} className="text-blue-500/70" />
                                                                <h4 className={`text-[10px] font-normal uppercase tracking-widest ${textMain}`}>Global Price Adjustment</h4>
                                                            </div>
                                                            <p className="text-[9px] text-slate-500 uppercase mt-0.5">Applied to all diamonds in the feed</p>
                                                        </div>
                                                        <div className={`text-xs font-mono font-bold px-3 py-1 rounded-lg ${user.apiPriceAdjustment >= 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-400'}`}>
                                                            {user.apiPriceAdjustment > 0 ? '+' : ''}{user.apiPriceAdjustment || 0}%
                                                        </div>
                                                    </div>
                                                    <input 
                                                        disabled={!user.isApiOpen}
                                                        type="range" 
                                                        min="-50" 
                                                        max="100" 
                                                        step="1"
                                                        value={user.apiPriceAdjustment || 0}
                                                        onChange={(e) => dispatch(updateProfile({ id: user._id || user.id, apiPriceAdjustment: Number(e.target.value) }))}
                                                        className="w-full h-1.5 bg-slate-800 rounded-full appearance-none cursor-pointer accent-blue-600 outline-none transition-all hover:accent-blue-500"
                                                    />
                                                    <div className="flex justify-between mt-2 px-1 text-[8px] text-slate-600/80 font-normal uppercase tracking-widest">
                                                        <span>-50% (Disc)</span>
                                                        <span>Base (0)</span>
                                                        <span>+100% (Inc)</span>
                                                    </div>
                                                </div>

                                                {user.apiFilterMode === 'specific' && (
                                                    <div className="space-y-6 animate-in fade-in slide-in-from-top-1 duration-500">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                            {/* Shape Selector */}
                                                            <div className="space-y-2">
                                                                <label className="text-[9px] text-slate-500 uppercase tracking-widest ml-1 font-bold">Shapes Eligibility</label>
                                                                <MultiSelector 
                                                                    placeholder="All Shapes Targeted..."
                                                                    options={["Round", "Princess", "Emerald", "Pear", "Oval", "Radiant", "Marquise", "Cushion", "Heart", "Asscher", "Square Radiant"]}
                                                                    value={user.apiFilters?.shapes}
                                                                    onChange={(val) => handleFilterUpdate('shapes', val)}
                                                                    isDarkMode={isDarkMode}
                                                                />
                                                            </div>

                                                            {/* Color Selector */}
                                                            <div className="space-y-2">
                                                                <label className="text-[9px] text-slate-500 uppercase tracking-widest ml-1 font-bold">Color Hierarchy</label>
                                                                <MultiSelector 
                                                                    placeholder="All Colors Targeted..."
                                                                    options={["D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N"]}
                                                                    value={user.apiFilters?.colors}
                                                                    onChange={(val) => handleFilterUpdate('colors', val)}
                                                                    isDarkMode={isDarkMode}
                                                                />
                                                            </div>

                                                            {/* Clarity Selector */}
                                                            <div className="space-y-2">
                                                                <label className="text-[9px] text-slate-500 uppercase tracking-widest ml-1 font-bold">Clarity Spectrum</label>
                                                                <MultiSelector 
                                                                    placeholder="All Clarities Targeted..."
                                                                    options={["FL", "IF", "VVS1", "VVS2", "VS1", "VS2", "SI1", "SI2", "I1"]}
                                                                    value={user.apiFilters?.clarities}
                                                                    onChange={(val) => handleFilterUpdate('clarities', val)}
                                                                    isDarkMode={isDarkMode}
                                                                />
                                                            </div>

                                                            {/* Cut Selector */}
                                                            <div className="space-y-2">
                                                                <label className="text-[9px] text-slate-500 uppercase tracking-widest ml-1 font-bold">Cut Grading</label>
                                                                <MultiSelector 
                                                                    placeholder="All Cut Grades Targeted..."
                                                                    options={["Ideal", "EX", "VG", "G", "F", "P"]}
                                                                    value={user.apiFilters?.cuts}
                                                                    onChange={(val) => handleFilterUpdate('cuts', val)}
                                                                    isDarkMode={isDarkMode}
                                                                />
                                                            </div>

                                                            {/* Polish Selector */}
                                                            <div className="space-y-2">
                                                                <label className="text-[9px] text-slate-500 uppercase tracking-widest ml-1 font-bold">Polish Standard</label>
                                                                <MultiSelector 
                                                                    placeholder="All Polish Grades Targeted..."
                                                                    options={["EX", "VG", "G", "F", "P"]}
                                                                    value={user.apiFilters?.polish}
                                                                    onChange={(val) => handleFilterUpdate('polish', val)}
                                                                    isDarkMode={isDarkMode}
                                                                />
                                                            </div>

                                                            {/* Symmetry Selector */}
                                                            <div className="space-y-2">
                                                                <label className="text-[9px] text-slate-500 uppercase tracking-widest ml-1 font-bold">Symmetry Level</label>
                                                                <MultiSelector 
                                                                    placeholder="All Symmetry Grades Targeted..."
                                                                    options={["EX", "VG", "G", "F", "P"]}
                                                                    value={user.apiFilters?.symmetry}
                                                                    onChange={(val) => handleFilterUpdate('symmetry', val)}
                                                                    isDarkMode={isDarkMode}
                                                                />
                                                            </div>

                                                            {/* Location Selector */}
                                                            <div className="space-y-2 md:col-span-2">
                                                                <label className="text-[9px] text-slate-500 uppercase tracking-widest ml-1 font-bold">Distribution Centers (Locations)</label>
                                                                <MultiSelector 
                                                                    placeholder="All Regional Nodes..."
                                                                    options={["India", "USA", "Belgium", "Hong Kong", "Israel", "Dubai", "UK"]}
                                                                    value={user.apiFilters?.location}
                                                                    onChange={(val) => handleFilterUpdate('location', val)}
                                                                    isDarkMode={isDarkMode}
                                                                />
                                                            </div>
                                                        </div>

                                                        {/* RANGE FILTERS */}
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
                                                            <RangeInput label="Carat Range" minKey="caratMin" maxKey="caratMax" step="0.01" filters={user.apiFilters} update={handleFilterUpdate} />
                                                            <RangeInput label="Price Range ($)" minKey="priceMin" maxKey="priceMax" step="1" filters={user.apiFilters} update={handleFilterUpdate} />
                                                            <RangeInput label="Table %" minKey="tableMin" maxKey="tableMax" step="0.1" filters={user.apiFilters} update={handleFilterUpdate} />
                                                            <RangeInput label="Depth %" minKey="depthMin" maxKey="depthMax" step="0.1" filters={user.apiFilters} update={handleFilterUpdate} />
                                                        </div>

                                                        <div className="pt-6 border-t border-slate-800/10 text-center">
                                                            <p className="text-[8px] text-slate-600 uppercase tracking-widest font-mono">
                                                                <Settings2 size={10} className="inline mr-1 -mt-0.5" /> 
                                                                Protocol: Settings are synchronized to terminal core automatically upon state change.
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            <EditProfileModal open={editOpen} onClose={() => setEditOpen(false)} />

            {/* Diamond Detail Modal */}
            <AnimatePresence>
                {selectedDiamond && (
                    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedDiamond(null)}
                            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ y: 60, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 60, opacity: 0 }}
                            transition={{ type: "spring", damping: 28, stiffness: 300 }}
                            className={`relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-t-[32px] sm:rounded-[32px] shadow-2xl ${isDarkMode ? "bg-[#111922] border border-slate-800" : "bg-white"}`}
                        >
                            {/* Mobile drag indicator */}
                            <div className="flex justify-center pt-4 sm:hidden">
                                <div className={`w-10 h-1 rounded-full ${isDarkMode ? "bg-slate-700" : "bg-slate-300"}`} />
                            </div>

                            {/* Header */}
                            <div className={`flex items-center justify-between px-6 pt-6 pb-4 border-b ${isDarkMode ? "border-slate-800" : "border-slate-100"}`}>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                                        <Gem size={18} />
                                    </div>
                                    <div>
                                        <h3 className={`text-base font-normal uppercase tracking-tight ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                                            {selectedDiamond.Weight} ct {selectedDiamond.Shape}
                                        </h3>
                                        <p className="text-[10px] uppercase tracking-widest text-blue-500">
                                            {selectedDiamond.Stock ? `Stock #${selectedDiamond.Stock}` : selectedDiamond.Lab}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedDiamond(null)}
                                    className={`p-2 rounded-xl ${isDarkMode ? "hover:bg-slate-800 text-slate-400" : "hover:bg-slate-100 text-slate-500"} transition-all`}
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="p-6 space-y-5">
                                {/* Image + Price */}
                                <div className="flex gap-5 items-center">
                                    <div className={`w-24 h-24 rounded-2xl flex-shrink-0 flex items-center justify-center overflow-hidden border ${isDarkMode ? "bg-slate-900 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
                                        {selectedDiamond.Diamond_Image
                                            ? <img src={selectedDiamond.Diamond_Image} className="w-full h-full object-contain p-2" alt="" />
                                            : <ShapeIcon shape={selectedDiamond.Shape} className="w-10 h-10 text-slate-400 opacity-40" />}
                                    </div>
                                    <div className="flex-1">
                                        <p className={`text-[10px] uppercase tracking-widest ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}>Total Price</p>
                                        <p className={`text-3xl font-bold ${isDarkMode ? "text-blue-400" : "text-blue-600"}`}>
                                            ${Number(selectedDiamond.Final_Price).toLocaleString()}
                                        </p>
                                        {selectedDiamond.Price_Per_Carat && (
                                            <p className={`text-xs mt-0.5 ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}>
                                                ${Number(selectedDiamond.Price_Per_Carat).toFixed(2)} / ct
                                            </p>
                                        )}
                                        <div className="flex gap-2 mt-2">
                                            <span className={`text-[9px] font-bold px-3 py-1 rounded-full uppercase ${selectedDiamond.onHold ? "bg-orange-500/10 text-orange-400 border border-orange-500/20" : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"}`}>
                                                {selectedDiamond.onHold ? "On Hold" : "In Stock"}
                                            </span>
                                            {selectedDiamond.Lab && (
                                                <span className="text-[9px] font-bold px-3 py-1 rounded-full uppercase bg-blue-500/10 text-blue-500 border border-blue-500/20">
                                                    {selectedDiamond.Lab}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Specs Grid */}
                                <div className={`rounded-2xl border overflow-hidden ${isDarkMode ? "border-slate-800" : "border-slate-100"}`}>
                                    <div className={`px-4 py-2.5 border-b ${isDarkMode ? "border-slate-800 bg-slate-900/40" : "border-slate-100 bg-slate-50"}`}>
                                        <span className={`text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>Specifications</span>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-3">
                                        {[
                                            { label: "Shape", value: selectedDiamond.Shape },
                                            { label: "Carat", value: `${selectedDiamond.Weight} ct` },
                                            { label: "Color", value: selectedDiamond.Color },
                                            { label: "Clarity", value: selectedDiamond.Clarity },
                                            { label: "Cut", value: selectedDiamond.Cut },
                                            { label: "Polish", value: selectedDiamond.Polish },
                                            { label: "Symmetry", value: selectedDiamond.Symmetry },
                                            { label: "Table %", value: selectedDiamond.table_name },
                                            { label: "Depth %", value: selectedDiamond.Depth },
                                            { label: "Girdle", value: selectedDiamond.Girdle },
                                            { label: "Report", value: selectedDiamond.Report },
                                            { label: "Location", value: selectedDiamond.Location },
                                        ].map(({ label, value }) => (
                                            <div key={label} className={`px-4 py-3 border-b border-r last:border-r-0 ${isDarkMode ? "border-slate-800" : "border-slate-100"}`}>
                                                <p className={`text-[9px] uppercase tracking-widest font-bold mb-0.5 ${isDarkMode ? "text-slate-600" : "text-slate-400"}`}>{label}</p>
                                                <p className={`text-xs ${isDarkMode ? "text-white" : "text-slate-800"}`}>{value || "—"}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Action row */}
                                <div className="flex gap-3 pt-1">
                                    <button
                                        onClick={() => { dispatch(removeFromWishlist(selectedDiamond._id)); setSelectedDiamond(null); }}
                                        className={`flex-1 py-3 rounded-2xl border text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${isDarkMode ? "border-red-500/30 text-red-400 hover:bg-red-500/10" : "border-red-200 text-red-500 hover:bg-red-50"}`}
                                    >
                                        <Trash2 size={14} /> Remove from Saved
                                    </button>
                                    <button
                                        onClick={() => setSelectedDiamond(null)}
                                        className={`flex-1 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${isDarkMode ? "bg-blue-600 hover:bg-blue-500 text-white" : "bg-blue-600 text-white hover:bg-blue-700"} shadow-lg shadow-blue-500/20`}
                                    >
                                        <X size={14} /> Close
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

// ── Shared Internal Components ──

const MultiSelector = ({ options, value, onChange, placeholder, isDarkMode }) => {
    const selectedValues = value ? value.split(',').filter(Boolean).map(v => ({ value: v, label: v })) : [];
    const selectOptions = options.map(o => ({ value: o, label: o }));

    const customStyles = {
        control: (base) => ({
            ...base,
            backgroundColor: isDarkMode ? "#070B0F" : "#ffffff",
            borderColor: isDarkMode ? "#1e293b" : "#e2e8f0",
            borderRadius: "0.85rem",
            padding: "2px",
            fontSize: "12px",
            boxShadow: "none",
            "&:hover": { borderColor: "#3b82f6" }
        }),
        menu: (base) => ({
            ...base,
            backgroundColor: isDarkMode ? "#111922" : "white",
            border: isDarkMode ? "1px solid #1e293b" : "1px solid #e2e8f0",
            borderRadius: "0.85rem",
            zIndex: 50
        }),
        option: (base, state) => ({
            ...base,
            backgroundColor: state.isSelected ? "#2563eb" : state.isFocused ? (isDarkMode ? "#1e293b" : "#f1f5f9") : "transparent",
            color: state.isSelected ? "white" : isDarkMode ? "#cbd5e1" : "#0f172a",
        }),
        multiValue: (base) => ({
            ...base,
            backgroundColor: isDarkMode ? "#1e293b" : "#f1f5f9",
            borderRadius: "6px",
        }),
        multiValueLabel: (base) => ({
            ...base,
            color: isDarkMode ? "#3b82f6" : "#2563eb",
            fontWeight: "normal",
        }),
        multiValueRemove: (base) => ({
            ...base,
            color: "#64748b",
            "&:hover": { color: "#ef4444", backgroundColor: "transparent" }
        }),
        placeholder: (base) => ({ ...base, color: isDarkMode ? "#334155" : "#94a3b8" }),
        input: (base) => ({ ...base, color: isDarkMode ? "white" : "black" })
    };

    return (
        <Select
            isMulti
            placeholder={placeholder}
            options={selectOptions}
            value={selectedValues}
            onChange={(selected) => onChange(selected ? selected.map(s => s.value).join(',') : "")}
            styles={customStyles}
        />
    );
};

const RangeInput = ({ label, minKey, maxKey, filters, update, step }) => {
    const isDarkMode = useSelector((state) => state.theme.isDarkMode);
    return (
        <div className="space-y-2">
            <label className="text-[9px] text-slate-500 uppercase tracking-widest ml-1 font-bold">{label}</label>
            <div className="flex items-center gap-2">
                <input 
                    type="number" 
                    step={step}
                    placeholder="Min"
                    className={`w-full ${isDarkMode ? "bg-slate-950/50 border-slate-800 text-white" : "bg-white border-slate-200"} rounded-[0.85rem] px-3 py-2 text-xs outline-none focus:border-blue-500 transition-all font-mono`}
                    value={filters?.[minKey] || ""}
                    onBlur={(e) => update(minKey, e.target.value)}
                    onChange={(e) => {
                        // local update if we want, but using onBlur for persistence
                    }}
                />
                <span className="text-slate-600">—</span>
                <input 
                    type="number" 
                    step={step}
                    placeholder="Max"
                    className={`w-full ${isDarkMode ? "bg-slate-950/50 border-slate-800 text-white" : "bg-white border-slate-200"} rounded-[0.85rem] px-3 py-2 text-xs outline-none focus:border-blue-500 transition-all font-mono`}
                    value={filters?.[maxKey] || ""}
                    onBlur={(e) => update(maxKey, e.target.value)}
                />
            </div>
        </div>
    );
};

