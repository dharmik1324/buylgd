import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchAllTickets,
    replyToTicket,
    deleteTicket,
} from "../../store/supportSlice";
import { CircleLoader } from "react-spinners";
import { motion, AnimatePresence } from "framer-motion";
import {
    User,
    MessageSquare,
    Send,
    Trash2,
    CheckCircle2,
    Search,
    Mail,
    Phone,
    ChevronRight,
    RefreshCw,
} from "lucide-react";

export const HelpSupport = () => {
    const dispatch = useDispatch();
    const { tickets, loading } = useSelector((state) => state.support);
    const isDarkMode = useSelector((state) => state.theme?.isDarkMode ?? true);

    const [selectedId, setSelectedId] = useState(null);
    const [replyText, setReplyText] = useState("");
    const [filterBy, setFilterBy] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");

    const selectedTicket = tickets.find((t) => t._id === selectedId);

    useEffect(() => {
        dispatch(fetchAllTickets());
    }, [dispatch]);

    const handleReply = async (e) => {
        e.preventDefault();
        if (!replyText.trim() || !selectedTicket) return;

        try {
            await dispatch(
                replyToTicket({
                    id: selectedTicket._id,
                    adminReply: replyText,
                })
            ).unwrap();
            setReplyText("");
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this query?")) {
            dispatch(deleteTicket(id));
            if (selectedId === id) setSelectedId(null);
        }
    };

    const filteredTickets = tickets.filter((t) => {
        const matchesFilter = filterBy === "all" || t.status === filterBy;
        const matchesSearch =
            t.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.user?.name?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const cardBg = isDarkMode
        ? "bg-[#111922] border-slate-800"
        : "bg-white border-slate-200 shadow-sm";

    const headText = isDarkMode ? "text-white" : "text-slate-900";
    const subText = isDarkMode ? "text-slate-400" : "text-slate-500";

    if (loading && tickets.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <CircleLoader color="#3b82f6" size={50} />
            </div>
        );
    }

    return (
        <div className="min-h-screen lg:h-[calc(100vh-80px)] flex flex-col p-4 sm:p-6 overflow-hidden">

            {/* Header */}
            <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
                <div>
                    <h1 className={`text-2xl sm:text-3xl font-normal ${headText}`}>
                        Help & Support
                    </h1>
                    <p className={subText}>
                        Manage user queries and supplier assistance requests
                    </p>
                </div>

                <div className="flex gap-3 flex-wrap">
                    <button
                        onClick={() => dispatch(fetchAllTickets())}
                        className={`flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-normal text-xs`}
                    >
                        <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                        Refresh
                    </button>

                    <div className="relative">
                        <Search
                            size={16}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                        />
                        <input
                            type="text"
                            placeholder="Search..."
                            className={`pl-9 pr-3 py-2 text-sm rounded-xl border ${isDarkMode
                                ? "bg-slate-900 border-slate-800 text-white"
                                : "bg-white border-slate-200"
                                }`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Layout */}
            <div className="flex flex-col lg:flex-row flex-1 gap-4 lg:gap-6 overflow-hidden">

                {/* LEFT PANEL */}
                <div
                    className={`w-full lg:w-1/3 flex flex-col rounded-2xl border overflow-hidden ${cardBg}`}
                >
                    <div className="p-4 border-b flex gap-2 overflow-x-auto">
                        {["all", "pending", "replied"].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilterBy(f)}
                                className={`px-4 py-1.5 rounded-full text-xs font-normal ${filterBy === f
                                    ? "bg-blue-600 text-white"
                                    : "bg-slate-200 text-slate-600"
                                    }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {filteredTickets.map((ticket) => (
                            <div
                                key={ticket._id}
                                onClick={() => setSelectedId(ticket._id)}
                                className={`p-4 rounded-xl border cursor-pointer transition ${selectedId === ticket._id
                                    ? "border-blue-500 bg-blue-500/10"
                                    : "border-slate-200"
                                    }`}
                            >
                                <h3 className={`font-normal ${headText}`}>
                                    {ticket.subject}
                                </h3>
                                <p className={`text-xs ${subText}`}>
                                    {ticket.user?.name || "Unknown User"}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* RIGHT PANEL */}
                <div
                    className={`flex-1 rounded-2xl border flex flex-col overflow-hidden relative ${cardBg} ${selectedId ? "block" : "hidden lg:flex"
                        }`}
                >
                    {selectedTicket ? (
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={selectedTicket._id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex flex-col h-full"
                            >
                                {/* Header */}
                                <div className="p-4 sm:p-6 border-b flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        {/* Mobile Back */}
                                        <button
                                            onClick={() => setSelectedId(null)}
                                            className="lg:hidden p-2 rounded-lg bg-slate-800/50"
                                        >
                                            <ChevronRight
                                                size={18}
                                                className="rotate-180 text-white"
                                            />
                                        </button>

                                        <div>
                                            <h2 className={`text-lg sm:text-xl font-normal ${headText}`}>
                                                {selectedTicket.subject}
                                            </h2>
                                            <p className="text-xs text-slate-500">
                                                {selectedTicket.user?.email}
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleDelete(selectedTicket._id)}
                                        className="p-2 rounded-lg bg-red-500/10 text-red-500"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>

                                {/* Messages */}
                                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
                                    {/* User Message */}
                                    <div className="max-w-[95%] sm:max-w-[80%]">
                                        <div className="p-4 rounded-2xl bg-slate-100 text-slate-800">
                                            {selectedTicket.message}
                                        </div>
                                    </div>

                                    {/* Admin Reply */}
                                    {selectedTicket.adminReply && (
                                        <div className="max-w-[95%] sm:max-w-[80%] ml-auto">
                                            <div className="p-4 rounded-2xl bg-blue-600 text-white">
                                                {selectedTicket.adminReply}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Reply Box */}
                                <div className="p-4 sm:p-6 border-t">
                                    <form onSubmit={handleReply} className="relative">
                                        <textarea
                                            rows="3"
                                            placeholder="Write reply..."
                                            className="w-full p-4 pr-16 rounded-2xl border resize-none"
                                            value={replyText}
                                            onChange={(e) => setReplyText(e.target.value)}
                                        />
                                        <button
                                            type="submit"
                                            disabled={!replyText.trim() || loading}
                                            className="absolute right-3 bottom-3 bg-blue-600 text-white p-3 rounded-xl"
                                        >
                                            {loading ? (
                                                <CircleLoader size={16} color="#fff" />
                                            ) : (
                                                <Send size={18} />
                                            )}
                                        </button>
                                    </form>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40 p-10">
                            <MessageSquare size={50} className="text-blue-600 mb-4" />
                            <h2 className={`text-xl font-normal ${headText}`}>
                                Select a Ticket
                            </h2>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

