import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyTickets, addUserMessage } from "../../store/supportSlice";
import {
    Send,
    MessageSquare,
    History,
    Shield,
    User,
    Loader2,
    Search,
    ChevronRight,
    ArrowLeft
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

export const Chatbox = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const { myTickets, loading } = useSelector((state) => state.support);
    const isDarkMode = useSelector((state) => state.theme.isDarkMode);

    const [selectedTicket, setSelectedTicket] = useState(null);
    const [newMessage, setNewMessage] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const chatEndRef = useRef(null);

    useEffect(() => {
        dispatch(fetchMyTickets());
    }, [dispatch]);

    useEffect(() => {
        if (selectedTicket) scrollToBottom();
    }, [selectedTicket]);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedTicket) return;

        const ticketId = selectedTicket._id;
        const msg = newMessage;
        setNewMessage("");

        try {
            const res = await dispatch(addUserMessage({ id: ticketId, message: msg })).unwrap();
            setSelectedTicket(res);
            setTimeout(scrollToBottom, 100);
        } catch (err) {
            console.error(err);
            setNewMessage(msg);
        }
    };

    const filteredTickets = myTickets.filter(t =>
        t.subject.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const bgMain = isDarkMode ? "bg-[#070B0F]" : "bg-slate-50";
    const sidebarBg = isDarkMode ? "bg-[#0B1219]" : "bg-white";
    const cardBg = isDarkMode ? "bg-[#111922]" : "bg-white";
    const borderColor = isDarkMode ? "border-slate-800" : "border-slate-200";
    const textMain = isDarkMode ? "text-white" : "text-slate-900";
    const textSub = isDarkMode ? "text-slate-500" : "text-slate-500";

    return (
        <div className={`flex h-[calc(100vh-70px)] ${bgMain} overflow-hidden font-sans`}>
            {/* Sidebar - History */}
            <div className={`${selectedTicket ? 'hidden md:flex' : 'flex'} w-full md:w-80 flex-shrink-0 border-r ${borderColor} ${sidebarBg} flex-col`}>
                <div className={`p-6 border-b ${borderColor}`}>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                        <input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search History..."
                            className={`w-full ${isDarkMode ? "bg-[#070B0F] border-slate-800" : "bg-slate-100 border-slate-200"} border rounded-xl py-2 pl-10 pr-4 text-xs ${textMain} outline-none focus:border-blue-500 transition-all`}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2">
                    <div className="flex items-center gap-2 px-2 mb-4 text-[10px] font-normal text-slate-500 uppercase tracking-[0.2em]">
                        <History size={14} /> Recent Transmissions
                    </div>

                    {loading && myTickets.length === 0 ? (
                        <div className="flex justify-center p-8"><Loader2 className="animate-spin text-blue-500" /></div>
                    ) : filteredTickets.length === 0 ? (
                        <div className="text-center p-8 opacity-40">
                            <p className="text-[10px] uppercase tracking-widest text-slate-500">No records found</p>
                        </div>
                    ) : (
                        filteredTickets.map(ticket => (
                            <button
                                key={ticket._id}
                                onClick={() => setSelectedTicket(ticket)}
                                className={`w-full text-left p-4 rounded-2xl transition-all border ${selectedTicket?._id === ticket._id
                                    ? "bg-blue-600/10 border-blue-500/50"
                                    : `border-transparent hover:${isDarkMode ? "bg-slate-800" : "bg-slate-100"}`
                                    }`}
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <span className={`text-[10px] uppercase tracking-widest font-normal ${ticket.status === 'replied' ? 'text-emerald-500' : 'text-blue-500'}`}>
                                        {ticket.status}
                                    </span>
                                    <span className="text-[9px] text-slate-500">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                                </div>
                                <h4 className={`text-xs font-normal truncate uppercase tracking-tight ${selectedTicket?._id === ticket._id ? "text-blue-400" : textMain}`}>
                                    {ticket.subject}
                                </h4>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className={`${!selectedTicket ? 'hidden md:flex' : 'flex'} flex-1 flex flex-col relative overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed`}>
                <AnimatePresence mode="wait">
                    {selectedTicket ? (
                        <motion.div
                            key="chat-session"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex-1 flex flex-col h-full"
                        >
                            {/* Chat Header */}
                            <div className={`p-4 md:p-6 border-b ${borderColor} ${sidebarBg} flex items-center justify-between z-10 shadow-sm`}>
                                <div className="flex items-center gap-3 md:gap-4">
                                    <button onClick={() => setSelectedTicket(null)} className="md:hidden text-slate-400 hover:text-white mr-1 transition-colors">
                                        <ArrowLeft size={20} />
                                    </button>
                                    <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
                                        <Shield size={20} className="md:w-6 md:h-6" />
                                    </div>
                                    <div>
                                        <h3 className={`text-sm md:text-base font-normal tracking-tight ${textMain}`}>{selectedTicket.subject}</h3>
                                        <p className="text-[10px] text-emerald-500 uppercase tracking-widest font-normal flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Active Connection
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Messages Container */}
                            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 md:space-y-8 custom-scrollbar">
                                {selectedTicket.messages && selectedTicket.messages.map((msg, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`flex gap-4 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
                                    >
                                        <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center ${msg.sender === 'user' ? 'bg-blue-600' : 'bg-slate-800'}`}>
                                            {msg.sender === 'user' ? <User size={20} className="text-white" /> : <Shield size={20} className="text-blue-400" />}
                                        </div>
                                        <div className={`flex flex-col max-w-[85%] md:max-w-[70%] ${msg.sender === 'user' ? 'items-end' : ''}`}>
                                            <div className={`p-4 md:p-5 rounded-[20px] md:rounded-[24px] ${msg.sender === 'user'
                                                ? 'bg-blue-600 text-white shadow-xl shadow-blue-900/10'
                                                : isDarkMode ? 'bg-[#111922] border border-slate-800 text-slate-200' : 'bg-white border border-slate-200 shadow-lg'
                                                }`}>
                                                <p className="text-sm font-normal leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                                            </div>
                                            <span className="text-[9px] text-slate-500 mt-2 font-normal uppercase tracking-widest">
                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </motion.div>
                                ))}
                                <div ref={chatEndRef} />
                            </div>

                            {/* Chat Input */}
                            <div className="p-4 md:p-6">
                                <form onSubmit={handleSendMessage} className={`max-w-4xl mx-auto relative group`}>
                                    <input
                                        value={newMessage}
                                        onChange={e => setNewMessage(e.target.value)}
                                        className={`w-full ${sidebarBg} border ${borderColor} focus:border-blue-500 rounded-2xl md:rounded-3xl py-4 md:py-5 pl-4 md:pl-8 pr-16 md:pr-20 text-xs md:text-sm ${textMain} outline-none transition-all shadow-2xl font-normal placeholder:text-slate-600`}
                                        placeholder="Type your message..."
                                    />
                                    <div className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                        <button
                                            type="submit"
                                            disabled={!newMessage.trim()}
                                            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white p-2.5 md:p-3 rounded-xl md:rounded-2xl transition-all active:scale-95 shadow-lg shadow-blue-600/30"
                                        >
                                            <Send size={18} className="md:w-5 md:h-5" />
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="empty-state"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex-1 flex flex-col items-center justify-center p-8 text-center"
                        >
                            <div className="w-24 h-24 bg-blue-600/5 rounded-[40px] flex items-center justify-center text-blue-500/20 mb-8 border border-blue-500/10">
                                <MessageSquare size={48} />
                            </div>
                            <h2 className={`text-4xl font-normal tracking-tighter ${textMain} mb-4 uppercase`}>Transmission Hub</h2>
                            <p className={`text-slate-500 max-w-md text-sm font-normal leading-relaxed mb-10`}>
                                Select a previous transmission node from the sidebar to continue your secure communication stream.
                            </p>
                            <button
                                onClick={() => navigate(-1)}
                                className="flex items-center gap-2 text-[10px] font-normal uppercase tracking-widest text-blue-500 hover:text-blue-400 transition-colors"
                            >
                                <ArrowLeft size={14} /> Back to Support registry
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: ${isDarkMode ? "#1e293b" : "#e2e8f0"};
                    border-radius: 10px;
                }
            `}</style>
        </div>
    );
};

export default Chatbox;

