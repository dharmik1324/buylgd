import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { askSupplier } from "../../store/supportSlice";
import {
    Plus,
    History,
    Shield,
    Building2,
    Mail,
    Phone,
    Globe,
    CheckCircle2
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export const Support = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const isDarkMode = useSelector((state) => state.theme.isDarkMode);

    const [newTicketData, setNewTicketData] = useState({ subject: "", message: "" });

    const handleStartNewChat = async (e) => {
        e.preventDefault();
        if (!newTicketData.subject || !newTicketData.message) return;

        try {
            await dispatch(askSupplier(newTicketData)).unwrap();
            setNewTicketData({ subject: "", message: "" });
            toast.success("Priority inquiry submitted successfully");

            const chatboxPath = user?.companyName
                ? `/${user.companyName.toLowerCase().replace(/\s+/g, '-')}/chatbox`
                : "/chatbox";
            navigate(chatboxPath);
        } catch (err) {
            console.error(err);
            toast.error("Failed to submit inquiry");
        }
    };

    const bgMain = isDarkMode ? "bg-[#070B0F]" : "bg-slate-50";
    const cardBg = isDarkMode ? "bg-[#111922]" : "bg-white";
    const borderColor = isDarkMode ? "border-slate-800" : "border-slate-200";
    const textMain = isDarkMode ? "text-white" : "text-slate-900";
    const textSub = isDarkMode ? "text-slate-400" : "text-slate-500";

    const UserInfoItem = ({ icon: Icon, label, value }) => (
        <div className={`flex items-center gap-3 p-4 rounded-2xl border ${borderColor} ${isDarkMode ? "bg-slate-950/20" : "bg-slate-50/50"} transition-all`}>
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-500">
                <Icon size={18} />
            </div>
            <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-normal">{label}</p>
                <p className={`text-sm font-normal ${textMain} break-all`}>{value || "Not Set"}</p>
            </div>
        </div>
    );

    return (
        <div className={`min-h-[calc(100vh-70px)] ${bgMain} overflow-hidden font-sans relative`}>
            <div className="max-w-7xl mx-auto p-6 lg:p-12">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                    <div>
                        <h1 className={`text-4xl font-normal tracking-tighter ${textMain} flex items-center gap-3`}>
                            <Shield className="text-blue-600" size={32} />
                            Executive Support Terminal
                        </h1>
                        <p className="text-xs text-slate-500 uppercase tracking-widest mt-2">Personal Concierge for Authorized Business Partners</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => {
                                const chatboxPath = user?.companyName
                                    ? `/${user.companyName.toLowerCase().replace(/\s+/g, '-')}/chatbox`
                                    : "/chatbox";
                                navigate(chatboxPath);
                            }}
                            className={`border ${borderColor} ${cardBg} ${textMain} rounded-2xl px-6 py-4 flex items-center gap-2 text-xs font-normal uppercase tracking-widest transition-all active:scale-95 hover:bg-blue-600/10`}
                        >
                            <History size={18} /> View Transmission History
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* User Profile Summary */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-4 space-y-6"
                    >
                        <div className={`p-8 rounded-[40px] border ${borderColor} ${cardBg} shadow-2xl relative overflow-hidden group`}>
                            <div className="absolute -top-10 -right-10 opacity-[0.03] group-hover:rotate-12 transition-transform duration-700">
                                <Shield size={200} className={textMain} />
                            </div>

                            <div className="flex items-center gap-5 mb-8">
                                <div className="w-20 h-20 rounded-[28px] bg-blue-600/10 border-4 border-blue-600/5 flex items-center justify-center text-blue-500 overflow-hidden shadow-2xl">
                                    {user?.image ? (
                                        <img src={user.image} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="text-2xl font-normal">{user?.name?.charAt(0)?.toUpperCase()}</div>
                                    )}
                                </div>
                                <div>
                                    <h2 className={`text-xl font-normal tracking-tighter ${textMain}`}>{user?.name}</h2>
                                    <div className="flex items-center gap-2 mt-1">
                                        <CheckCircle2 size={12} className="text-emerald-500" />
                                        <span className="text-[10px] text-emerald-500 uppercase tracking-widest">Verified Identity</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <UserInfoItem icon={Building2} label="Entity" value={user?.companyName} />
                                <UserInfoItem icon={Mail} label="Secure Mail" value={user?.email} />
                                <UserInfoItem icon={Phone} label="Direct Line" value={user?.contact} />
                                <UserInfoItem icon={Globe} label="Registry Node" value={user?.city + ", " + user?.country} />
                            </div>
                        </div>

                        <div className={`p-6 rounded-[32px] border ${borderColor} bg-blue-600/5 text-center`}>
                            <p className="text-[10px] text-blue-500 uppercase tracking-widest">Typical Response Protocol</p>
                            <p className={`text-xs ${textSub} mt-1`}>Authorized specialist responds within 60-120 mins</p>
                        </div>
                    </motion.div>

                    {/* Main Workspace */}
                    <div className="lg:col-span-8">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={`p-10 lg:p-14 rounded-[40px] border ${borderColor} ${cardBg} shadow-2xl relative overflow-hidden`}
                        >
                            <div className="absolute top-0 right-0 p-10 opacity-[0.03] rotate-45">
                                <Plus size={150} className={textMain} />
                            </div>

                            <div className="mb-10">
                                <h2 className={`text-3xl font-normal tracking-tighter ${textMain} mb-2`}>Registry Inquiry Request</h2>
                                <p className="text-xs text-slate-500 uppercase tracking-widest font-normal">Fields strictly required for priority processing.</p>
                            </div>

                            <form onSubmit={handleStartNewChat} className="space-y-8 max-w-2xl">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase text-slate-500 ml-1 font-bold tracking-widest">Protocol Type / Subject</label>
                                        <input
                                            required
                                            value={newTicketData.subject}
                                            onChange={e => setNewTicketData({ ...newTicketData, subject: e.target.value })}
                                            className={`w-full ${isDarkMode ? "bg-black/50" : "bg-slate-50"} border border-slate-800/10 focus:border-blue-500 rounded-2xl p-4 text-sm ${textMain} focus:outline-none transition-all font-normal placeholder:text-slate-600`}
                                            placeholder="e.g. Rare Gemstone Verification"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase text-slate-500 ml-1 font-bold tracking-widest">Corporate Access Code</label>
                                        <input
                                            disabled
                                            value={user?.apiKey ? (user.apiKey.slice(0, 15) + "...") : "AUTO-DETECTION-ACTIVE"}
                                            className={`w-full ${isDarkMode ? "bg-slate-900/40" : "bg-slate-100/50"} border border-slate-800/10 rounded-2xl p-4 text-sm text-slate-500 cursor-not-allowed font-mono`}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase text-slate-500 ml-1 font-bold tracking-widest">Inquiry Content / Required Option Details</label>
                                    <textarea
                                        required
                                        rows="8"
                                        value={newTicketData.message}
                                        onChange={e => setNewTicketData({ ...newTicketData, message: e.target.value })}
                                        className={`w-full ${isDarkMode ? "bg-black/50" : "bg-slate-50"} border border-slate-800/10 focus:border-blue-500 rounded-3xl p-6 text-sm ${textMain} focus:outline-none transition-all font-normal resize-none placeholder:text-slate-600 leading-relaxed`}
                                        placeholder="Provide exhaustive details regarding your requirement to facilitate accurate specialist assessment..."
                                    />
                                </div>

                                <div className="flex items-center gap-6 pt-4">
                                    <button
                                        type="submit"
                                        className="flex-1 bg-white text-black hover:bg-blue-600 hover:text-white rounded-2xl py-6 text-[10px] font-normal uppercase tracking-[0.2em] transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-3"
                                    >
                                        Establish Priority Connection <Plus size={16} />
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Support;

