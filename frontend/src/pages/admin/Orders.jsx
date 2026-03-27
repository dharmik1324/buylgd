import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchHeldDiamonds, releaseHold } from "../../store/diamondSlice";
import { CircleLoader } from "react-spinners";
import { motion } from "framer-motion";
import {
    Package,
    User,
    Clock,
    Phone,
    Mail,
    Building2,
    Trash2,
    ExternalLink,
    RefreshCcw
} from "lucide-react";
import { ShapeIcon } from "../../components/diamond/DiamondShapeIcons";

export const Orders = () => {
    const dispatch = useDispatch();
    const { heldDiamonds, loading } = useSelector((state) => state.diamonds);
    const isDarkMode = useSelector((state) => state.theme?.isDarkMode ?? true);

    useEffect(() => {
        dispatch(fetchHeldDiamonds());
    }, [dispatch]);

    const handleRelease = (id) => {
        if (window.confirm("Are you sure you want to release this hold? The diamond will be marked as In Stock.")) {
            dispatch(releaseHold(id));
        }
    };

    const formatTimeLeft = (expiry) => {
        const diff = new Date(expiry) - new Date();
        if (diff <= 0) return "Expired";

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        return `${days}d ${hours}h left`;
    };

    const cardBg = isDarkMode ? "bg-[#111922] border-slate-800" : "bg-white border-slate-200 shadow-sm";
    const headText = isDarkMode ? "text-white" : "text-slate-900";
    const subText = isDarkMode ? "text-slate-400" : "text-slate-500";
    const accentColor = "text-blue-500";

    if (loading && heldDiamonds.length === 0) {
        return (
            <div className="flex items-center justify-center p-20">
                <CircleLoader color="#3b82f6" size={50} />
            </div>
        );
    }

    return (
        <div className="p-6 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className={`text-3xl font-normal ${headText}`}>Hold Orders</h1>
                    <p className={subText}>Manage current diamond reservations and user requests</p>
                </div>
                <button
                    onClick={() => dispatch(fetchHeldDiamonds())}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-normal text-sm"
                >
                    <RefreshCcw size={16} />
                    Refresh
                </button>
            </div>

            {heldDiamonds.length === 0 ? (
                <div className={`flex flex-col items-center justify-center p-20 rounded-2xl border-2 border-dashed ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                    <Package size={48} className="text-slate-600 mb-4 opacity-20" />
                    <p className={`text-lg font-normal ${subText}`}>No active hold orders found</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {heldDiamonds.map((item, index) => (
                        <motion.div
                            key={item._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`rounded-2xl border ${cardBg} p-6 overflow-hidden relative group`}
                        >
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                                {/* Diamond Section */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Package className={accentColor} size={20} />
                                        <h3 className={`font-normal uppercase tracking-wider ${headText}`}>Diamond Details</h3>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className={`w-24 h-24 rounded-xl overflow-hidden border ${isDarkMode ? 'border-slate-800 bg-slate-900 text-slate-700' : 'border-slate-100 bg-slate-50 text-slate-200'} flex items-center justify-center p-2`}>
                                            {item.Diamond_Image ? (
                                                <img
                                                    src={item.Diamond_Image}
                                                    alt={item.Shape}
                                                    className="max-w-full max-h-full object-contain"
                                                />
                                            ) : (
                                                <ShapeIcon shape={item.Shape} className="w-1/2 h-1/2" />
                                            )}
                                        </div>
                                        <div className="space-y-1">
                                            <p className={`text-lg font-normal ${headText}`}>{item.Shape}</p>
                                            <p className={`text-sm font-normal ${subText}`}>Stock: <span className="text-blue-400">{item.Stock_ID}</span></p>
                                            <p className={`text-base font-normal ${accentColor}`}>${item.Final_Price?.toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-slate-800/50' : 'bg-slate-50 border border-slate-100'}`}>
                                            <p className={subText}>Weight</p>
                                            <p className={`font-normal ${headText}`}>{item.Weight} ct</p>
                                        </div>
                                        <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-slate-800/50' : 'bg-slate-50 border border-slate-100'}`}>
                                            <p className={subText}>Color/Clarity</p>
                                            <p className={`font-normal ${headText}`}>{item.Color} / {item.Clarity}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* User Section */}
                                <div className="space-y-4 md:border-x px-0 md:px-8 border-slate-800/50">
                                    <div className="flex items-center gap-2 mb-2">
                                        <User className={accentColor} size={20} />
                                        <h3 className={`font-normal uppercase tracking-wider ${headText}`}>Customer Details</h3>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-start gap-3">
                                            <div className="mt-1"><Building2 size={16} className="text-blue-500/60" /></div>
                                            <div>
                                                <p className={`font-normal text-sm ${headText}`}>{item.holdBy?.name || "N/A"}</p>
                                                <p className={`text-xs ${subText}`}>{item.holdBy?.companyName || "Private Buyer"}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Mail size={16} className="text-blue-500/60" />
                                            <p className={`text-xs text-blue-400 hover:underline cursor-pointer`}>{item.holdBy?.email || "N/A"}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Phone size={16} className="text-blue-500/60" />
                                            <p className={`text-xs font-normal ${headText}`}>{item.holdBy?.contact || "N/A"}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Status & Actions */}
                                <div className="space-y-4 flex flex-col justify-between h-full">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Clock className={accentColor} size={20} />
                                            <h3 className={`font-normal uppercase tracking-wider ${headText}`}>Reservation Info</h3>
                                        </div>
                                        <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-amber-500/5 border-amber-500/20' : 'bg-amber-50 border-amber-200'}`}>
                                            <p className={`text-xs font-normal uppercase tracking-widest text-amber-500 mb-1`}>Hold Duration</p>
                                            <p className={`text-xl font-normal ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`}>
                                                {formatTimeLeft(item.holdExpiresAt)}
                                            </p>
                                            <p className={`text-[10px] mt-1 ${subText}`}>Expires: {new Date(item.holdExpiresAt).toLocaleString()}</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 pt-4">
                                        <button
                                            onClick={() => handleRelease(item._id)}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-all text-xs font-normal uppercase"
                                        >
                                            <Trash2 size={14} />
                                            Release Hold
                                        </button>
                                        <button className={`p-2 rounded-lg border ${isDarkMode ? 'border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800' : 'border-slate-200 text-slate-500 hover:bg-slate-100'} transition-all`}>
                                            <ExternalLink size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Corner Badge */}
                            <div className="absolute top-0 right-0">
                                <div className="bg-blue-600 text-white text-[10px] font-normal px-4 py-1 rounded-bl-xl uppercase tracking-tighter">
                                    Active Hold
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

