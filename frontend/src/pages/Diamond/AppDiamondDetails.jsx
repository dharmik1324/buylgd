import { useState } from "react";
import {
    Heart, PlayCircle, FileText, X, HelpCircle,
    Send, ChevronRight, ArrowLeft, Check, MessageSquare, Maximize2,
    Minus,
    Plus
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../../store/cartSlice";
import { holdDiamond } from "../../store/diamondSlice";
import { askSupplier } from "../../store/supportSlice";
import { toggleWishlist } from "../../store/wishlistSlice";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { ShapeIcon } from "../../components/diamond/DiamondShapeIcons";
import { normalizeDiamond } from "../../utils/diamondFields";

export const AppDiamondDetails = ({ onClose, diamond: rawDiamond, isDarkMode }) => {
    // Normalize all field aliases (image, price, cert, etc.) from any API/CSV source
    const diamond = normalizeDiamond(rawDiamond);
    /* ── thumbnail list ─────────────────────────────────── */
    const sanitizeUrl = (url) => {
        if (!url) return "";
        if (url.startsWith("//")) return `https:${url}`;
        return url;
    };

    const getCertificateUrl = (diamond) => {
        if (diamond.Certificate_Image) return sanitizeUrl(diamond.Certificate_Image);

        const lab = (diamond.Lab || "").toUpperCase();
        const reportNo = diamond.Report || diamond.Report_No || diamond.Certificate_No || diamond.Stock_No;

        if (!reportNo || reportNo === "—") return "";

        // Standard Lab Verification Links
        if (lab.includes("GIA")) {
            return `https://www.gia.edu/otpserver/Marketing/ReportCheck?reportno=${reportNo}&qr=false`;
        }
        if (lab.includes("IGI")) {
            return `https://www.igi.org/viewpdf.php?r=${reportNo}`;
        }
        if (lab.includes("HRD")) {
            return `https://my.hrdantwerp.com/?id=34&record_number=${reportNo}`;
        }

        return "";
    };

    const displayThumbs = [
        { type: "image", src: sanitizeUrl(diamond.Diamond_Image) },
        { type: "video", src: sanitizeUrl(diamond.Diamond_Video) },
        { type: "cert", src: getCertificateUrl(diamond) },
    ].filter(t => t.src);

    const videoIndex = displayThumbs.findIndex(t => t.type === 'video');
    const [selectedThumb, setSelectedThumb] = useState(videoIndex !== -1 ? videoIndex : 0);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [zoom, setZoom] = useState(1);

    const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.5, 4));
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.5, 1));

    const handleWheel = (e) => {
        if (!isFullScreen) return;
        if (e.deltaY < 0) handleZoomIn();
        else handleZoomOut();
    };

    const handleCloseFull = () => {
        setIsFullScreen(false);
        setZoom(1);
    };

    const [holdDays, setHoldDays] = useState(0);
    const [holdHours, setHoldHours] = useState(0);
    const [showDurationSelector, setShowDurationSelector] = useState(false);
    const [showSupportModal, setShowSupportModal] = useState(false);
    const [supportForm, setSupportForm] = useState({
        subject: `Query about Diamond #${diamond?.Stock || "New"}`,
        message: "",
    });

    const { user } = useSelector((state) => state.auth);
    const wishlistItems = useSelector((state) => state.wishlist.items);
    const dispatch = useDispatch();

    const isWishlisted = diamond
        ? wishlistItems.some((w) => String(w._id) === String(diamond._id))
        : false;

    const handleWishlistToggle = () => {
        dispatch(toggleWishlist(diamond));
        toast.success(isWishlisted ? "Removed from wishlist" : "Saved to wishlist ♥", {
            autoClose: 1500,
        });
    };

    if (!diamond) return null;

    const isOnHold =
        diamond.onHold &&
        diamond.holdExpiresAt &&
        new Date(diamond.holdExpiresAt) > new Date();
    const isHeldByMe = user && diamond.holdBy === user?._id;

    const handleHoldClick = () => {
        if (!user) { toast.error("Please login to hold diamonds"); return; }
        if (isOnHold && !isHeldByMe) { toast.error("This diamond is already held by another user"); return; }
        setShowDurationSelector(true);
    };

    const confirmHold = async () => {
        if (holdDays === 0 && holdHours === 0) { toast.error("Please select hold duration"); return; }
        try {
            await dispatch(holdDiamond({ id: diamond._id, userId: user._id, days: holdDays, hours: holdHours })).unwrap();
            dispatch(addToCart({ ...diamond, holdDuration: { days: holdDays, hours: holdHours, formatted: `${holdDays}d ${holdHours}h` } }));
            setShowDurationSelector(false);
            setHoldDays(0);
            setHoldHours(0);
            toast.success("Diamond reserved successfully!");
        } catch (err) {
            toast.error("Failed to hold diamond");
        }
    };

    const handleAskSupplier = async (e) => {
        e.preventDefault();
        if (!supportForm.message.trim()) { toast.error("Please enter your message"); return; }
        try {
            await dispatch(askSupplier({ ...supportForm, diamondId: diamond._id })).unwrap();
            setShowSupportModal(false);
            setSupportForm({ ...supportForm, message: "" });
        } catch (err) {
            console.error("Support query failed", err);
        }
    };

    /* ── colors ─────────────────────────────────────────── */
    const bg = isDarkMode ? "bg-[#0B1219]" : "bg-[#f8f8f6]";
    const imgBg = isDarkMode ? "bg-gradient-to-br from-[#141e2a] to-[#060d14]" : "bg-gradient-to-br from-[#e8e8e6] to-[#d4d4d0]";
    const panelBg = isDarkMode ? "bg-[#111922]" : "bg-white";
    const border = isDarkMode ? "border-slate-800" : "border-[#e5e5e3]";
    const textMain = isDarkMode ? "text-white" : "text-[#1a1a1a]";
    const textSub = isDarkMode ? "text-slate-400" : "text-[#888]";
    const specLbl = isDarkMode ? "text-slate-500" : "text-[#999]";
    const specVal = isDarkMode ? "text-slate-200" : "text-[#222]";
    const divider = isDarkMode ? "border-slate-800" : "border-[#ebebea]";

    // Standard Keys we already map to specific labels
    const mappedLabels = {
        Lab: "Lab", Depth: "Depth", Report: "Report#", table_name: "Table",
        Shape: "Shape", Girdle: "Girdle", Weight: "Carat", Crown: "Crown",
        Color: "Color", Pavilion: "Pavilion", Clarity: "Clarity", Culet: "Culet",
        Cut: "Cut", Measurements: "Meas", Polish: "Polish", Ratio: "Ratio",
        Symmetry: "Symmetry", Bgm: "BGM", Fluorescence: "Fluor", Treatment: "Treat",
        Location: "Location", Growth_Type: "Growth Type", Stock_ID: "Stock_ID",
        Stock_No: "Stock_No"
    };

    // Fields to exclude from the dynamic list (already shown elsewhere or internal)
    const excludeFields = [
        "_id", "__v", "createdAt", "updatedAt", "Diamond_Image", "Diamond_Video",
        "Certificate_Image", "Final_Price", "Price_Per_Carat", "source", "onHold",
        "holdBy", "holdExpiresAt", "Availability", "Stock", "Source", "Reports",
        "VideoLink", "ImageLink", "Certificate", "Certificate_Link", "Cert_Link",
        "Video_Link", "Image_Link", "Certificate_file_url", "certiFile", "certi_file",
        "View Certi", "certi_url", "imageLink", "videoLink", "Stone_Img_url", "Image",
        "View Image", "img_url", "photo", "image_url", "img", "Video_url", "video_url",
        "Video Link", "view_video", "Video", "Certificate_URL", "cert_url",
        "certLink", "CertificateLink", "CertLink", "cert_link"
    ];

    const specs = [];

    // 1. Add mapped standard fields in preferred order
    const standardOrder = [
        "Lab", "Depth", "Report", "table_name", "Shape", "Girdle", "Weight", "Crown",
        "Color", "Pavilion", "Clarity", "Culet", "Cut", "Measurements", "Polish",
        "Ratio", "Symmetry", "Bgm", "Fluorescence", "Treatment", "Location", "Growth_Type"
    ];

    standardOrder.forEach(key => {
        if (diamond[key] !== undefined) {
            let val = diamond[key];
            if (key === "Weight") val = (Number(val) || 0).toFixed(2);
            if ((key === "Depth" || key === "table_name") && val) val = `${val}%`;
            specs.push({ label: mappedLabels[key], value: val || "—" });
        }
    });

    // 2. Automatically add ANY other fields that aren't excluded
    Object.keys(diamond).forEach(key => {
        if (!standardOrder.includes(key) && !excludeFields.includes(key) && !mappedLabels[key]) {
            const val = diamond[key];
            if (val !== null && val !== undefined && val !== "" && typeof val !== 'object') {
                // Format key nicely: "Fancy_Color" -> "Fancy Color"
                const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                specs.push({ label, value: String(val) });
            }
        }
    });

    return (
        <>
            <style>
                {`
                    /* Hide scrollbar for Chrome, Safari and Opera */
                    .no-scrollbar::-webkit-scrollbar,
                    *::-webkit-scrollbar {
                        display: none !important;
                    }

                    /* Hide scrollbar for IE, Edge and Firefox */
                    .no-scrollbar,
                    * {
                        -ms-overflow-style: none !important;  /* IE and Edge */
                        scrollbar-width: none !important;  /* Firefox */
                    }
                `}
            </style>
            {/* Full Screen Image/Video Modal */}
            <AnimatePresence>
                {isFullScreen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center overflow-hidden"
                        onWheel={handleWheel}
                    >
                        {/* Fullscreen Controls Header */}
                        <div className="absolute top-0 left-0 w-full p-6 flex items-center justify-between z-[110] bg-gradient-to-b from-black/50 to-transparent">
                            <button
                                onClick={handleCloseFull}
                                className="flex items-center gap-2 text-white/80 hover:text-white transition-colors px-4 py-2 rounded-xl bg-white/10"
                            >
                                <X size={24} /> Close Preview
                            </button>

                            <div className="flex items-center gap-4">
                                <div className="flex items-center bg-white/10 rounded-xl p-1 border border-white/10">
                                    <button onClick={handleZoomOut} className="p-2 text-white hover:bg-white/10 rounded-lg"><Minus size={20} /></button>
                                    <span className="px-4 text-white font-mono text-sm min-w-[60px] text-center">{Math.round(zoom * 100)}%</span>
                                    <button onClick={handleZoomIn} className="p-2 text-white hover:bg-white/10 rounded-lg"><Plus size={20} /></button>
                                </div>
                                <button className="p-3 bg-white text-black rounded-xl hover:scale-105 transition-transform">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" /></svg>
                                </button>
                            </div>
                        </div>

                        <div className="w-full h-full flex items-center justify-center p-4 md:p-12 overflow-auto no-scrollbar">
                            <motion.div
                                className="relative flex items-center justify-center cursor-grab active:cursor-grabbing"
                                animate={{ scale: zoom }}
                                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            >
                                {displayThumbs[selectedThumb]?.type === 'video' ? (() => {
                                    const src = displayThumbs[selectedThumb]?.src;
                                    const isIframe = src.includes('html') || src.includes('?') || !src.match(/\.(mp4|webm|ogg)$/i);
                                    return isIframe ? (
                                        <iframe src={src} className="w-[1000px] h-[90vh] rounded-lg border-none" title="Diamond Video" allowFullScreen />
                                    ) : (
                                        <video src={src} controls autoPlay className="max-w-[90vw] max-h-[85vh] rounded-lg shadow-2xl" />
                                    );
                                })() : (
                                    <img
                                        src={displayThumbs[selectedThumb]?.src || diamond.Diamond_Image}
                                        className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg shadow-2xl"
                                        alt="Fullscreen Diamond"
                                    />
                                )}
                            </motion.div>
                        </div>

                        <p className="absolute bottom-8 text-white/40 text-xs tracking-widest uppercase">Use mouse scroll or buttons to zoom • Drag to inspect</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Ask Supplier Modal ──────────────────────────── */}
            <AnimatePresence>
                {showSupportModal && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.97 }}
                            className={`w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl border ${isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}
                        >
                            <div className="flex items-center justify-between px-6 py-5 bg-[#e5a020]">
                                <div className="flex items-center gap-3 text-white">
                                    <HelpCircle size={22} />
                                    <div>
                                        <h2 className="font-bold text-base tracking-tight">Inquire with a Specialist</h2>
                                        <p className="text-[10px] uppercase tracking-widest opacity-80">Direct inquiry to admin</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowSupportModal(false)} className="text-white/80 hover:text-white hover:rotate-90 transition-all">
                                    <X size={20} />
                                </button>
                            </div>
                            <form onSubmit={handleAskSupplier} className="p-6 space-y-5">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Subject</label>
                                    <input
                                        type="text"
                                        className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:border-[#e5a020] transition-all ${isDarkMode ? "bg-slate-900 border-slate-800 text-white" : "bg-slate-50 border-slate-200"}`}
                                        value={supportForm.subject}
                                        onChange={(e) => setSupportForm({ ...supportForm, subject: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Message</label>
                                    <textarea
                                        rows="4"
                                        placeholder="What would you like to know about this diamond?"
                                        className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:border-[#e5a020] transition-all resize-none ${isDarkMode ? "bg-slate-900 border-slate-800 text-white" : "bg-slate-50 border-slate-200"}`}
                                        value={supportForm.message}
                                        onChange={(e) => setSupportForm({ ...supportForm, message: e.target.value })}
                                    />
                                </div>
                                <button type="submit" className="w-full py-3.5 bg-[#e5a020] hover:bg-[#d49018] text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-[#e5a020]/20">
                                    <Send size={16} /> Send Inquiry
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ── Main Layout (Col on Mobile, Row on Desktop) ─────────────────────────────────── */}
            <div className="w-full h-full flex flex-col md:flex-row bg-[#eff1f4] no-scrollbar overflow-hidden">

                {/* LEFT SIDE — Media & Navigation (45% width on Desktop) */}
                <div className="w-full md:w-[45%] flex-shrink-0 flex flex-col md:flex-row p-4 lg:p-6 gap-4 border-b md:border-b-0 border-gray-200 no-scrollbar overflow-hidden">

                    {/* PC View: Dedicated Sidebar for Go Back & Thumbs */}
                    <div className="hidden md:flex flex-col items-center gap-6 w-20 flex-shrink-0">
                        <button
                            className={`flex items-center gap-1 text-[13px] font-bold text-black hover:text-black transition-colors whitespace-nowrap`} onClick={onClose}
                        >
                            <ArrowLeft size={18} />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Go back</span>
                        </button>

                        <div className="flex flex-col gap-4 overflow-y-auto no-scrollbar pb-6 flex-1">
                            {displayThumbs.map((thumb, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedThumb(idx)}
                                    className={`w-14 h-14 lg:w-16 lg:h-16 flex-shrink-0 rounded-xl border-2 transition-all p-1 bg-white shadow-sm overflow-hidden
                                      ${selectedThumb === idx ? 'border-blue-600 ring-4 ring-blue-600/10' : 'border-gray-200 hover:border-blue-300'}`}
                                >
                                    {thumb.type === 'image' && <img src={thumb.src} alt="View" className="w-full h-full object-contain" />}
                                    {thumb.type === 'video' && <PlayCircle size={24} className="text-gray-500 hover:text-blue-500 transition-colors mx-auto" />}
                                    {thumb.type === 'cert' && <FileText size={22} className="text-gray-500 hover:text-blue-500 transition-colors mx-auto" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Main Viewing Area */}
                    <div className="flex-1 flex flex-col gap-4">
                        {/* Mobile Header: Go Back Box */}
                        <div className="md:hidden flex items-center justify-between bg-white/50 backdrop-blur-md p-3 rounded-2xl border border-white/20 shadow-sm">
                            <button onClick={onClose} className="flex items-center gap-2 font-bold text-sm px-4 py-2 bg-white rounded-xl shadow-sm border border-gray-100">
                                <ArrowLeft size={16} /> Go Back
                            </button>
                        </div>

                        {/* Large Display Container */}
                        <div className="relative w-full aspect-square md:aspect-auto md:flex-1 bg-white/40 rounded-3xl border border-white/50 shadow-inner flex items-center justify-center p-4 md:p-8 min-h-[350px] md:min-h-[500px]">
                            {/* Action Icons Overlay */}
                            <div className="absolute top-4 right-4 flex items-center gap-3 z-10">
                                <button onClick={() => setIsFullScreen(true)} className="p-2.5 bg-white/90 rounded-xl shadow-sm text-gray-600 hover:text-black transition-all hover:scale-110">
                                    <Maximize2 size={18} />
                                </button>
                                <button onClick={handleWishlistToggle} className="p-2.5 bg-white/90 rounded-xl shadow-sm hover:scale-110 transition-all">
                                    <Heart size={18} className={isWishlisted ? "text-red-500 fill-red-500" : "text-gray-600"} />
                                </button>
                            </div>

                            {/* Inner Content Switcher */}
                            <div className="w-full h-full flex items-center justify-center">
                                {(() => {
                                    const activeThumb = displayThumbs[selectedThumb];
                                    if (!activeThumb || !activeThumb.src) {
                                        return <ShapeIcon shape={diamond.Shape} className="w-32 md:w-48 text-gray-300 opacity-20" />;
                                    }

                                    if (activeThumb.type === 'video') {
                                        const isIframe = activeThumb.src.includes('html') || activeThumb.src.includes('?') || !activeThumb.src.match(/\.(mp4|webm|ogg)$/i);
                                        return isIframe ? (
                                            <iframe src={activeThumb.src} className="w-full h-full rounded-2xl border-none" title="Diamond Video" allowFullScreen />
                                        ) : (
                                            <motion.video key={selectedThumb} initial={{ opacity: 0 }} animate={{ opacity: 1 }} src={activeThumb.src} autoPlay loop controls className="max-w-full max-h-full rounded-2xl object-contain" />
                                        );
                                    }

                                    if (activeThumb.type === 'cert') {
                                        return (
                                            <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-[#111111] rounded-3xl border border-[#333333] shadow-xl relative overflow-hidden">
                                                {/* Decorative background glow */}
                                                <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-30 pointer-events-none">
                                                    <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] bg-blue-600 blur-[120px] rounded-full" />
                                                    <div className="absolute -bottom-[20%] -left-[10%] w-[50%] h-[50%] bg-[#e5a020] blur-[120px] rounded-full" />
                                                </div>

                                                <div className="w-20 h-20 bg-[#222222] rounded-full flex items-center justify-center mb-6 text-gray-300 shadow-sm border border-[#444444] relative z-10">
                                                    <FileText size={40} />
                                                </div>
                                                <h3 className="text-2xl font-bold text-white mb-3 relative z-10">Official Lab Certificate</h3>
                                                <p className="text-gray-400 max-w-sm mb-8 relative z-10 text-sm leading-relaxed">
                                                    The official grading report for this diamond is available. Click below to securely view the full document in a new tab.
                                                </p>
                                                <a href={activeThumb.src} target="_blank" rel="noopener noreferrer" className="bg-[#e5a020] text-white px-8 py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-[#e5a020]/20 hover:bg-[#d49018] flex items-center gap-2 hover:scale-105 transition-all relative z-10">
                                                    <FileText size={18} /> Open Official Report
                                                </a>
                                            </div>
                                        );
                                    }

                                    return (
                                        <motion.img
                                            key={selectedThumb}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            src={activeThumb.src}
                                            alt="Diamond"
                                            className="max-w-full max-h-full object-contain drop-shadow-2xl mix-blend-multiply cursor-pointer"
                                            onClick={() => setIsFullScreen(true)}
                                        />
                                    );
                                })()}
                            </div>
                        </div>

                        {/* Mobile View: Horizontal Thumbs at Bottom of Media Area */}
                        <div className="md:hidden flex gap-3 overflow-x-auto no-scrollbar py-2 px-1">
                            {displayThumbs.map((thumb, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedThumb(idx)}
                                    className={`w-16 h-16 flex-shrink-0 rounded-xl border-2 transition-all p-1 bg-white shadow-sm
                                      ${selectedThumb === idx ? 'border-blue-600 ring-2 ring-blue-600/20' : 'border-gray-200'}`}
                                >
                                    {thumb.type === 'image' && <img src={thumb.src} alt="" className="w-full h-full object-contain" />}
                                    {thumb.type === 'video' && <PlayCircle size={22} className="text-gray-400 mx-auto" />}
                                    {thumb.type === 'cert' && <FileText size={20} className="text-gray-400 mx-auto" />}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* RIGHT SIDE — Core Details (55% width on Desktop) */}
                <div className="w-full md:w-[55%] flex flex-col items-center py-6 px-4 lg:px-8 bg-transparent md:overflow-y-auto no-scrollbar">
                    <div className="w-full max-w-[800px] space-y-4">

                        {/* Top Card Replaced with Old UI block */}
                        <div className="flex flex-col gap-1 text-left w-full mb-6 max-w-[500px]">
                            {/* Breadcrumb */}
                            <div className={`flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-medium mb-4 ${textSub}`}>
                                <span className={isDarkMode ? "text-slate-200" : "text-[#333]"}>
                                    {diamond.Shape} {diamond.Cut ? `${diamond.Cut} Cut` : "Brilliant"}
                                </span>
                            </div>

                            {/* Title */}
                            <h1 className={`text-3xl md:text-4xl font-bold tracking-tight leading-[1.1] ${textMain} mb-3`}>
                                {diamond.Shape} Brilliant<br />Diamond
                            </h1>

                            {/* Orange spec pills */}
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-4">
                                <span className="text-[#e5a020] font-semibold text-sm">{(diamond.Weight || 0).toFixed(2)} Carat</span>
                                <span className={`text-sm ${textSub}`}>·</span>
                                <span className="text-[#e5a020] font-semibold text-sm">{diamond.Color} Color</span>
                                <span className={`text-sm ${textSub}`}>·</span>
                                <span className="text-[#e5a020] font-semibold text-sm">{diamond.Clarity} Clarity</span>
                            </div>

                            {/* Stock + Status */}
                            <div className="flex items-center gap-3 mb-6">
                                {diamond.Stock && (
                                    <span className={`text-xs ${textSub}`}>Stock# {diamond.Stock}</span>
                                )}
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${isOnHold && !isHeldByMe
                                    ? "bg-orange-500/10 text-orange-400 border-orange-400/20"
                                    : "bg-emerald-500/10 text-emerald-400 border-emerald-400/20"
                                    }`}>
                                    {isOnHold && !isHeldByMe ? "On Hold" : isHeldByMe ? "Held by You" : "In Stock"}
                                </span>
                            </div>

                            {/* Price */}
                            <div className={`pt-6 border-t ${divider}`}>
                                <div className="flex items-baseline gap-3">
                                    <span className={`text-3xl font-bold ${textMain}`}>
                                        ${Number(diamond.Final_Price || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                    {diamond.Price_Per_Carat && (
                                        <span className={`text-base line-through ${textSub}`}>
                                            ${(Number(diamond.Price_Per_Carat) * Number(diamond.Weight) * 1.28).toFixed(2)}
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-1.5 mt-1.5">
                                    <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                                        <Check size={8} className="text-white" strokeWidth={3} />
                                    </div>
                                    <p className={`text-xs ${textSub}`}>
                                        Price includes VAT · {diamond.Lab || "GIA"} certified · ${Number(diamond.Price_Per_Carat || 0).toFixed(2)}/ct
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Product Details Card */}
                        <div className={`rounded-xl shadow-sm border overflow-hidden text-left ${isDarkMode ? "bg-[#1c1c1c] border-gray-800" : "bg-white border-gray-200"}`}>
                            <div className={`p-4 border-b flex justify-between items-center ${isDarkMode ? "border-gray-800 bg-[#2a2a2a]" : "border-gray-100 bg-gray-50"}`}>
                                <h3 className={`text-sm font-bold ${isDarkMode ? "text-gray-200" : "text-gray-800"}`}>Product Details</h3>
                                <ChevronRight className="rotate-[-90deg] text-gray-400" size={18} />
                            </div>
                            <div className="p-5 grid grid-cols-2 gap-x-6 gap-y-3">
                                {specs.map(({ label, value }) => {
                                    return (
                                        <div key={label} className="grid grid-cols-[1fr_1.5fr] items-baseline text-xs md:text-sm" >
                                            <span className={`font-medium ${isDarkMode ? "text-gray-500" : "text-gray-500"}`}>{label}</span>
                                            <span className={`font-bold pl-2 ${isDarkMode ? "text-gray-200" : "text-gray-900"} break-words`}>{value}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Hold Duration Selector */}
                        <AnimatePresence>
                            {showDurationSelector && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className={`mt-5 p-5 rounded-2xl border ${border} ${isDarkMode ? "bg-slate-900/50" : "bg-white"}`}>
                                        <p className={`text-[10px] uppercase tracking-widest font-bold mb-4 ${specLbl}`}>Select Hold Duration</p>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className={`text-xs mb-1.5 block ${textSub}`}>Days</label>
                                                <select
                                                    value={holdDays}
                                                    onChange={(e) => setHoldDays(Number(e.target.value))}
                                                    className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#e5a020] ${isDarkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-slate-200"}`}
                                                >
                                                    {[...Array(15)].map((_, i) => (
                                                        <option key={i} value={i}>{i} Days</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className={`text-xs mb-1.5 block ${textSub}`}>Hours</label>
                                                <select
                                                    value={holdHours}
                                                    onChange={(e) => setHoldHours(Number(e.target.value))}
                                                    className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#e5a020] ${isDarkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-slate-200"}`}
                                                >
                                                    {[...Array(24)].map((_, i) => (
                                                        <option key={i} value={i}>{i} Hours</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                        {(holdDays > 0 || holdHours > 0) && (
                                            <p className="text-center text-xs text-[#e5a020] font-semibold mt-3">
                                                Hold for: {holdDays}d {holdHours}h
                                            </p>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* CTAs */}
                        <div className="flex flex-col gap-3 mt-4 pt-4">
                            <button
                                onClick={showDurationSelector ? confirmHold : handleHoldClick}
                                disabled={isOnHold && !isHeldByMe}
                                className={`w-full py-4 rounded-xl font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-md ${isOnHold && !isHeldByMe
                                    ? "bg-slate-400 cursor-not-allowed text-white"
                                    : showDurationSelector
                                        ? "bg-emerald-500 hover:bg-emerald-400 text-white"
                                        : "bg-[#e5a020] hover:bg-[#d49018] text-white"
                                    }`}
                            >
                                {isOnHold && !isHeldByMe
                                    ? "Currently On Hold"
                                    : showDurationSelector
                                        ? <><Check size={16} /> Confirm Reservation</>
                                        : isHeldByMe
                                            ? "Update Hold"
                                            : "Reserve This Diamond"}
                            </button>

                            <button
                                onClick={() => setShowSupportModal(true)}
                                className={`w-full py-4 rounded-xl font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all border-2 ${isDarkMode
                                    ? "border-slate-700 text-slate-300 hover:border-slate-500 hover:text-white bg-[#1c1c1c]"
                                    : "border-[#222] text-[#222] bg-white hover:bg-[#222] hover:text-white"
                                    }`}
                            >
                                <MessageSquare size={16} /> Inquire with a Specialist
                            </button>
                        </div>

                    </div>
                </div>
            </div >
        </>
    );
};
