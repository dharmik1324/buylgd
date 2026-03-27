import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchAllTickets,
    replyToTicket,
    deleteTicket,
    updateTicketStatus
} from "../../store/supportSlice";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import {
    MessageSquare,
    Send,
    Trash2,
    Search,
    Mail,
    CheckCircle2,
    AlertCircle,
    ArrowRight,
    X,
    Filter,
    ExternalLink,
    Lock,
    Unlock,
    Clock,
    User,
    Shield,
    RefreshCcw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";

export const Inquiries = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { tickets, loading } = useSelector((state) => state.support);
    const isDarkMode = useSelector((state) => state.theme?.isDarkMode ?? true);

    const [selectedTicket, setSelectedTicket] = useState(null);
    const [replyModalOpen, setReplyModalOpen] = useState(false);
    const [replyText, setReplyText] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [filter, setFilter] = useState("all");
    const chatEndRef = useRef(null);

    useEffect(() => {
        dispatch(fetchAllTickets());
    }, [dispatch]);

    useEffect(() => {
        if (replyModalOpen) {
            scrollToBottom();
        }
    }, [replyModalOpen, selectedTicket]);

    const scrollToBottom = () => {
        setTimeout(() => {
            chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
    };

    const handleReply = async (e) => {
        e.preventDefault();
        if (!replyText.trim() || !selectedTicket) return;

        try {
            const res = await dispatch(
                replyToTicket({
                    id: selectedTicket._id,
                    adminReply: replyText,
                })
            ).unwrap();
            setReplyText("");
            // Update local selected ticket for immediate feedback if modal stays open
            if (res.data) {
                setSelectedTicket(res.data);
                scrollToBottom();
            } else {
                setReplyModalOpen(false);
                setSelectedTicket(null);
            }
            dispatch(fetchAllTickets());
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteInquiry = (id) => {
        if (window.confirm("Are you sure you want to delete this inquiry?")) {
            dispatch(deleteTicket(id));
        }
    };

    const handleToggleStatus = (ticket) => {
        const newStatus = ticket.status === "closed" ? "pending" : "closed";
        dispatch(updateTicketStatus({ id: ticket._id, status: newStatus }));
    };

    const filteredTickets = tickets.filter(t => {
        const matchesSearch =
            t.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.subject?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesFilter = filter === "all" || t.status === filter;

        return matchesSearch && matchesFilter;
    });

    const bgMain = isDarkMode ? "bg-[#070B0F]" : "bg-slate-50";
    const cardBg = isDarkMode ? "bg-[#111922]" : "bg-white";
    const borderColor = isDarkMode ? "border-slate-800" : "border-slate-200";
    const textMain = isDarkMode ? "text-white" : "text-slate-900";
    const textSub = isDarkMode ? "text-slate-400" : "text-slate-500";

    return (
        <div className={`min-h-screen ${bgMain} p-6 font-sans`}>
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className={`text-2xl font-normal ${textMain}  uppercase tracking-tighter`}>Diamond Concierge Terminal</h1>
                        <p className={`${textSub} text-[10px] uppercase tracking-widest mt-1`}>Transmission Monitoring & Response</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                            <input
                                type="text"
                                placeholder="Search by name, email..."
                                className={`pl-10 pr-4 py-3 rounded-2xl border ${borderColor} ${cardBg} ${textMain} text-xs focus:ring-1 focus:ring-blue-500 outline-none transition-all w-64`}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <select
                            className={`px-4 py-3 rounded-2xl border ${borderColor} ${cardBg} ${textMain} text-xs outline-none transition-all appearance-none cursor-pointer pr-10 bg-[url('https://cdn-icons-png.flaticon.com/512/60/60995.png')] bg-[length:10px] bg-[right_15px_center] bg-no-repeat`}
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                        >
                            <option value="all">All Channels</option>
                            <option value="pending">Encrypted</option>
                            <option value="replied">Transmitted</option>
                            <option value="closed">Archived</option>
                        </select>
                        <button
                            onClick={() => dispatch(fetchAllTickets())}
                            className={`flex items-center justify-center gap-2 px-6 py-3 rounded-2xl border ${borderColor} ${cardBg} ${textMain} text-xs hover:border-blue-500 transition-all active:scale-95`}
                        >
                            <RefreshCcw size={16} className={loading && "animate-spin"} />
                            REFRESH
                        </button>
                    </div>
                </div>

                <div className={`rounded-[32px] border ${borderColor} ${cardBg} overflow-hidden shadow-2xl`}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[1000px]">
                            <thead>
                                <tr className={`border-b ${borderColor} bg-slate-500/5`}>
                                    <th className={`px-6 py-5 text-[10px] font-normal uppercase tracking-[0.2em] ${textSub}`}>Transmission Agent</th>
                                    <th className={`px-6 py-5 text-[10px] font-normal uppercase tracking-[0.2em] ${textSub}`}>Protocol Subject</th>
                                    <th className={`px-6 py-5 text-[10px] font-normal uppercase tracking-[0.2em] ${textSub}`}>Status</th>
                                    <th className={`px-6 py-5 text-[10px] font-normal uppercase tracking-[0.2em] ${textSub}`}>Sync Time</th>
                                    <th className={`px-6 py-5 text-[10px] font-normal uppercase tracking-[0.2em] ${textSub} text-right`}>Execution</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/10">
                                {filteredTickets.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-24 text-center">
                                            <div className="flex flex-col items-center gap-4 opacity-10">
                                                <Shield size={64} className="text-blue-500" />
                                                <p className={`text-2xl font-normal  ${textMain} uppercase tracking-tighter`}>Signal Lost: No Data Packets Found</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredTickets.map((ticket) => (
                                        <tr key={ticket._id} className={`hover:bg-blue-600/5 transition-colors group`}>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-500 font-normal overflow-hidden border border-blue-500/20 shadow-xl">
                                                        {ticket.user?.image ? (
                                                            <img src={ticket.user.image} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            ticket.user?.name?.charAt(0) || "U"
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className={`text-xs font-normal ${textMain}  transition-all group-hover:text-blue-400`}>{ticket.user?.name || "N/A"}</p>
                                                        <p className="text-[10px] font-normal text-slate-500 uppercase tracking-tighter">{ticket.user?.email || "N/A"}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 max-w-xs">
                                                <div className="flex flex-col gap-1.5">
                                                    <p className={`text-xs font-normal ${textMain} truncate`}>{ticket.subject}</p>
                                                    <p className={`text-[10px] ${textSub} line-clamp-1 opacity-70`}>
                                                        {ticket.messages?.[ticket.messages?.length - 1]?.text || ticket.message}
                                                    </p>
                                                    {ticket.appliedFilters && Object.keys(ticket.appliedFilters).length > 0 && (
                                                        <button
                                                            onClick={() => {
                                                                const slug = ticket.user?.companyName?.toLowerCase().replace(/\s+/g, '-') || "user";
                                                                navigate(`/${slug}/inventory`, { state: { filters: ticket.appliedFilters } });
                                                            }}
                                                            className="w-fit flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 text-[8px] font-normal uppercase tracking-wider border border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-all mt-1"
                                                        >
                                                            <ExternalLink size={10} /> Sync Intent to Inventory
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                {ticket.status === "pending" ? (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/5 text-amber-500 text-[9px] font-normal uppercase tracking-[0.1em] border border-amber-500/20">
                                                        <AlertCircle size={10} /> Pending
                                                    </span>
                                                ) : ticket.status === "replied" ? (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/5 text-emerald-500 text-[9px] font-normal uppercase tracking-[0.1em] border border-emerald-500/20">
                                                        <CheckCircle2 size={10} /> Transmitted
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-500/5 text-slate-500 text-[9px] font-normal uppercase tracking-[0.1em] border border-slate-500/20">
                                                        <Lock size={10} /> Archived
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className={`flex flex-col ${textSub} text-[10px] font-normal uppercase tracking-widest`}>
                                                    <span className="flex items-center gap-1.5"><Clock size={10} /> {new Date(ticket.createdAt).toLocaleDateString()}</span>
                                                    <span className="opacity-50">{new Date(ticket.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleToggleStatus(ticket)}
                                                        className={`p-2.5 rounded-xl transition-all border ${ticket.status === 'closed' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500 hover:bg-amber-500' : 'bg-slate-500/10 border-slate-500/20 text-slate-500 hover:bg-slate-500'} hover:text-white group-hover:scale-105`}
                                                        title={ticket.status === 'closed' ? 'Decrypt Payload' : 'Encrypt Source'}
                                                    >
                                                        {ticket.status === 'closed' ? <Unlock size={14} /> : <Lock size={14} />}
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedTicket(ticket);
                                                            setReplyModalOpen(true);
                                                            setReplyText("");
                                                        }}
                                                        className="p-2.5 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-500 hover:bg-blue-600 hover:text-white transition-all shadow-xl group-hover:scale-110"
                                                        title="Open Secure Channel"
                                                    >
                                                        <MessageSquare size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteInquiry(ticket._id)}
                                                        className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all group-hover:scale-105"
                                                        title="Purge Logs"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Secure Channel Modal (Reply Modal) */}
            <AnimatePresence>
                {replyModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setReplyModalOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 30 }}
                            className={`relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-[40px] border ${borderColor} ${cardBg} shadow-2xl overflow-hidden`}
                        >
                            <div className={`p-8 border-b ${borderColor} flex justify-between items-center bg-slate-500/5`}>
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-3xl bg-blue-600/10 flex items-center justify-center text-blue-500 border border-blue-500/20 shadow-xl overflow-hidden">
                                        {selectedTicket?.user?.image ? (
                                            <img src={selectedTicket.user.image} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <User size={28} />
                                        )}
                                    </div>
                                    <div>
                                        <h2 className={`text-xl font-normal ${textMain}  transition-all uppercase tracking-tighter`}>{selectedTicket?.user?.name}</h2>
                                        <p className="text-[10px] font-normal text-blue-500 uppercase tracking-[0.2em] mt-1 flex items-center gap-2">
                                            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" /> Secure Connection Established
                                        </p>
                                    </div>
                                </div>
                                <button onClick={() => setReplyModalOpen(false)} className={`p-3 rounded-2xl border ${borderColor} ${textSub} hover:text-red-500 transition-all hover:bg-red-500/10`}>
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-opacity-20 no-scrollbar">
                                {/* Message History */}
                                {selectedTicket?.messages?.map((msg, i) => (
                                    <div key={i} className={`flex gap-4 ${msg.sender === 'admin' ? 'flex-row-reverse' : ''}`}>
                                        <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center ${msg.sender === 'admin' ? 'bg-blue-600 shadow-lg shadow-blue-500/30' : 'bg-slate-800 border border-slate-700'}`}>
                                            {msg.sender === 'admin' ? <Shield size={20} className="text-white" /> : <User size={20} className="text-blue-400" />}
                                        </div>
                                        <div className={`flex flex-col max-w-[75%] ${msg.sender === 'admin' ? 'items-end' : ''}`}>
                                            <div className={`p-5 rounded-[28px] ${msg.sender === 'admin'
                                                ? 'bg-blue-600 text-white shadow-2xl'
                                                : isDarkMode ? 'bg-[#0B1219] border border-slate-800 text-slate-200' : 'bg-white border border-slate-200 shadow-xl'
                                                }`}>
                                                <p className="text-xs font-normal leading-relaxed">{msg.text}</p>
                                            </div>
                                            <span className="text-[9px] text-slate-500 mt-2 font-normal uppercase tracking-widest px-2">
                                                {new Date(msg.createdAt).toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                                <div ref={chatEndRef} />
                            </div>

                            {selectedTicket?.status !== 'closed' && (
                                <div className={`p-8 border-t ${borderColor} bg-slate-500/5`}>
                                    <form onSubmit={handleReply} className="relative group">
                                        <textarea
                                            rows="3"
                                            placeholder="Transmit terminal response..."
                                            className={`w-full p-6 pr-24 rounded-[32px] border ${borderColor} ${isDarkMode ? "bg-slate-950" : "bg-white"} ${textMain} text-xs focus:ring-1 focus:ring-blue-500 outline-none transition-all resize-none shadow-inner lowercase tracking-tight placeholder:`}
                                            value={replyText}
                                            onChange={(e) => setReplyText(e.target.value)}
                                        />
                                        <button
                                            type="submit"
                                            disabled={!replyText.trim() || loading}
                                            className="absolute right-4 bottom-4 bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-3xl shadow-2xl shadow-blue-600/30 active:scale-95 transition-all disabled:opacity-50"
                                        >
                                            <Send size={20} />
                                        </button>
                                    </form>
                                    <p className="text-center text-[8px] text-slate-600 uppercase tracking-[0.3em] mt-4">
                                        Authorized Concierge Protocol strictly enforced
                                    </p>
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style>{`.custom-scrollbar::-webkit-scrollbar { width: 4px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }`}</style>
        </div>
    );
};

