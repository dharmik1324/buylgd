import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import {
    UserPlus, Search, ShieldCheck, Star, Gem, Filter,
    Heart, Phone, ArrowRight, ChevronLeft, ChevronRight,
    X, Check, Sparkles, BookOpen, Zap
} from "lucide-react";

/* ─── Step Data ────────────────────────────────────────────────── */
const STEPS = [
    {
        id: 0,
        type: "cover",
        icon: Gem,
        tag: "BUYLGD Platform",
        title: "Your Diamond\nJourney Starts Here",
        subtitle: "A step-by-step guide to finding, filtering, and reserving your perfect diamond.",
        gradient: "from-[#1a3a6b] to-[#0f2347]",
        accentColor: "#3b82f6",
        lightColor: "#dbeafe",
    },
    {
        id: 1,
        type: "step",
        stepNum: "01",
        icon: UserPlus,
        tag: "Getting Started",
        title: "Create Your Account",
        body: "Register with your business details and wait for admin approval. Once approved you'll receive a confirmation email and can log in immediately.",
        tips: [
            "Use your official business email address",
            "Add your company name for a branded inventory link",
            "Approval typically takes under 24 hours",
        ],
        accentColor: "#6366f1",
        lightColor: "#ede9fe",
        gradient: "from-indigo-500 to-indigo-700",
    },
    {
        id: 2,
        type: "step",
        stepNum: "02",
        icon: Filter,
        tag: "Selection Page",
        title: "Set Your Preferences",
        body: "Before entering the inventory, select your preferred shape, carat range, color, and clarity to narrow down thousands of options instantly.",
        tips: [
            "Filters are saved automatically for next time",
            "Watch the live count update as you adjust",
            "You can always change filters inside the inventory",
        ],
        accentColor: "#0ea5e9",
        lightColor: "#e0f2fe",
        gradient: "from-sky-500 to-sky-700",
    },
    {
        id: 3,
        type: "step",
        stepNum: "03",
        icon: Search,
        tag: "Inventory",
        title: "Browse the Inventory",
        body: "Explore our full diamond catalog with advanced filters — cut, polish, symmetry, fluorescence, and price per carat. Click any card for full details.",
        tips: [
            "Click a card to open the full detail view",
            "Sort and filter using the sidebar controls",
            "GIA report number links to the official cert",
        ],
        accentColor: "#10b981",
        lightColor: "#d1fae5",
        gradient: "from-emerald-500 to-emerald-700",
    },
    {
        id: 4,
        type: "step",
        stepNum: "04",
        icon: Heart,
        tag: "Wishlist",
        title: "Save Your Favourites",
        body: "Tap the heart icon on any diamond card or detail page to save it to your wishlist. Access all saved stones from your Profile page anytime.",
        tips: [
            "Wishlist persists across sessions automatically",
            "View full specs of saved diamonds from Profile",
            "Remove items with one tap — no confirmation needed",
        ],
        accentColor: "#ef4444",
        lightColor: "#fee2e2",
        gradient: "from-red-500 to-rose-700",
    },
    {
        id: 5,
        type: "step",
        stepNum: "05",
        icon: ShieldCheck,
        tag: "Reservation",
        title: "Reserve a Diamond",
        body: "Open any diamond's detail page and click 'Reserve This Diamond'. Select your hold duration in days and hours to lock it exclusively for you.",
        tips: [
            "You must be logged in to place a reservation",
            "Reserved diamonds appear in your cart",
            "Contact support to extend or cancel a hold",
        ],
        accentColor: "#f59e0b",
        lightColor: "#fef3c7",
        gradient: "from-amber-500 to-amber-700",
    },
    {
        id: 6,
        type: "step",
        stepNum: "06",
        icon: Phone,
        tag: "Support",
        title: "Need Help? Ask Us",
        body: "Use the 'Inquire with a Specialist' button on any diamond page, or visit the Support section to message our team directly via the chatbox.",
        tips: [
            "Typical response time is under 2 hours",
            "Available for pricing, custom orders & queries",
            "Use the Chatbox for real-time assistance",
        ],
        accentColor: "#8b5cf6",
        lightColor: "#ede9fe",
        gradient: "from-violet-500 to-violet-700",
    },
    {
        id: 7,
        type: "end",
        icon: Star,
        tag: "You're All Set",
        title: "Happy Diamond\nHunting!",
        subtitle: "You now have everything you need to navigate BUYLGD like a pro. Start exploring the inventory today.",
        cta: "Browse Inventory",
        accentColor: "#3b82f6",
        lightColor: "#dbeafe",
        gradient: "from-blue-600 to-blue-800",
    },
];

/* ─── Main Component ────────────────────────────────────────────── */
export const GuidePage = () => {
    const navigate = useNavigate();
    const [current, setCurrent] = useState(0);
    const [direction, setDirection] = useState(1);
    const [animating, setAnimating] = useState(false);
    const touchStartX = useRef(null);
    const total = STEPS.length;

    const goTo = (next) => {
        if (animating || next < 0 || next >= total) return;
        setDirection(next > current ? 1 : -1);
        setAnimating(true);
        setTimeout(() => {
            setCurrent(next);
            setAnimating(false);
        }, 350);
    };

    // Keyboard navigation
    useEffect(() => {
        const onKey = (e) => {
            if (e.key === "ArrowRight") goTo(current + 1);
            if (e.key === "ArrowLeft")  goTo(current - 1);
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [current, animating]);

    // Touch/swipe
    const onTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
    const onTouchEnd   = (e) => {
        if (touchStartX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchStartX.current;
        if (Math.abs(dx) > 50) dx < 0 ? goTo(current + 1) : goTo(current - 1);
        touchStartX.current = null;
    };

    const step = STEPS[current];
    const progress = ((current) / (total - 1)) * 100;

    /* page variants */
    const variants = {
        enter:  (d) => ({ x: d > 0 ? "100%" : "-100%", opacity: 0 }),
        center: { x: 0, opacity: 1, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] } },
        exit:   (d) => ({ x: d > 0 ? "-60%" : "60%", opacity: 0, transition: { duration: 0.28, ease: [0.55, 0, 1, 0.45] } }),
    };

    return (
        <div
            className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/30 flex flex-col select-none"
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
        >
            {/* ── Top Bar ─────────────────────────────────────── */}
            <div className="flex items-center justify-between px-4 sm:px-8 py-4 sm:py-5">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30">
                        <BookOpen size={15} className="text-white" />
                    </div>
                    <span className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-600">
                        Sign-Up Guide
                    </span>
                </div>

                {/* Progress bar */}
                <div className="hidden sm:flex items-center gap-3 flex-1 mx-8">
                    <div className="flex-1 h-1.5 bg-blue-100 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                        />
                    </div>
                    <span className="text-xs font-bold text-blue-400 whitespace-nowrap">
                        {current + 1} / {total}
                    </span>
                </div>

                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-slate-800 hover:border-slate-300 transition-all shadow-sm"
                >
                    <X size={13} /> Close
                </button>
            </div>

            {/* Mobile progress */}
            <div className="sm:hidden px-4 mb-2">
                <div className="flex items-center gap-3">
                    <div className="flex-1 h-1.5 bg-blue-100 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                        />
                    </div>
                    <span className="text-[10px] font-bold text-blue-400">{current + 1}/{total}</span>
                </div>
            </div>

            {/* ── Card Stage ──────────────────────────────────── */}
            <div className="flex-1 flex items-center justify-center px-4 sm:px-8 pb-2">
                <div className="w-full max-w-3xl relative">
                    {/* Card shadow layers for depth */}
                    <div className="absolute inset-x-4 bottom-0 h-6 bg-blue-200/40 blur-xl rounded-b-3xl translate-y-3" />
                    <div className="absolute inset-x-8 bottom-0 h-4 bg-blue-300/20 blur-lg rounded-b-3xl translate-y-5" />

                    {/* Main card */}
                    <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl shadow-2xl shadow-blue-900/10 border border-white/80 bg-white"
                        style={{ minHeight: "clamp(440px, 60vh, 560px)" }}>

                        {/* Decorative top gradient stripe */}
                        <div className={`h-1.5 w-full bg-gradient-to-r ${step.gradient}`} />

                        <AnimatePresence mode="wait" custom={direction}>
                            <motion.div
                                key={current}
                                custom={direction}
                                variants={variants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                className="absolute inset-0 flex flex-col sm:flex-row"
                                style={{ top: "6px" }} /* offset for the stripe */
                            >
                                {step.type === "cover" || step.type === "end"
                                    ? <CoverPage step={step} navigate={navigate} />
                                    : <StepPage step={step} />
                                }
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* ── Bottom Nav ──────────────────────────────────── */}
            <div className="px-4 sm:px-8 py-4 sm:py-6">
                <div className="w-full max-w-3xl mx-auto flex items-center justify-between gap-4">

                    {/* Prev button */}
                    <button
                        onClick={() => goTo(current - 1)}
                        disabled={current === 0}
                        className={`flex items-center gap-2 px-5 sm:px-6 py-3 rounded-2xl font-bold text-[11px] uppercase tracking-wider transition-all active:scale-95 border ${
                            current === 0
                                ? "border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed"
                                : "border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-600 shadow-sm hover:shadow-blue-100 hover:shadow-md"
                        }`}
                    >
                        <ChevronLeft size={15} />
                        <span className="hidden sm:inline">Previous</span>
                        <span className="sm:hidden">Prev</span>
                    </button>

                    {/* Dot indicators */}
                    <div className="flex items-center gap-1.5 sm:gap-2">
                        {STEPS.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => goTo(i)}
                                className={`rounded-full transition-all duration-300 ${
                                    i === current
                                        ? "w-6 h-2.5 bg-blue-600 shadow-lg shadow-blue-600/30"
                                        : i < current
                                            ? "w-2.5 h-2.5 bg-blue-300 hover:bg-blue-400"
                                            : "w-2.5 h-2.5 bg-slate-200 hover:bg-slate-300"
                                }`}
                            />
                        ))}
                    </div>

                    {/* Next button */}
                    {current < total - 1 ? (
                        <button
                            onClick={() => goTo(current + 1)}
                            className="flex items-center gap-2 px-5 sm:px-6 py-3 rounded-2xl font-bold text-[11px] uppercase tracking-wider text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 shadow-lg shadow-blue-600/25 transition-all active:scale-95"
                        >
                            <span className="hidden sm:inline">Next</span>
                            <span className="sm:hidden">Next</span>
                            <ChevronRight size={15} />
                        </button>
                    ) : (
                        <button
                            onClick={() => navigate("/diamonds")}
                            className="flex items-center gap-2 px-5 sm:px-6 py-3 rounded-2xl font-bold text-[11px] uppercase tracking-wider text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 shadow-lg shadow-blue-600/25 transition-all active:scale-95"
                        >
                            Start <ArrowRight size={15} />
                        </button>
                    )}
                </div>

                {/* Swipe hint on mobile */}
                <p className="sm:hidden text-center text-[10px] uppercase tracking-widest text-slate-300 mt-3 font-semibold">
                    Swipe to flip pages
                </p>
                <p className="hidden sm:block text-center text-[10px] uppercase tracking-widest text-slate-300 mt-2 font-semibold">
                    Use ← → arrow keys to navigate
                </p>
            </div>
        </div>
    );
};

/* ─── Cover / End Page ──────────────────────────────────────────── */
const CoverPage = ({ step, navigate }) => {
    const Icon = step.icon;
    return (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-8 sm:px-16 py-10 gap-6 relative overflow-hidden">
            {/* Background blobs */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-blue-50 blur-3xl opacity-80" />
                <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-indigo-50 blur-3xl opacity-80" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-blue-100/40 blur-2xl" />

                {/* Dot grid */}
                <div className="absolute inset-0" style={{
                    backgroundImage: "radial-gradient(#3b82f610 1.5px, transparent 1.5px)",
                    backgroundSize: "22px 22px",
                }} />
            </div>

            {/* Icon */}
            <motion.div
                initial={{ scale: 0, rotate: -15 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 260, damping: 18 }}
                className="relative z-10"
            >
                <div className={`w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-br ${step.gradient} flex items-center justify-center shadow-2xl`}
                    style={{ boxShadow: `0 20px 60px ${step.accentColor}40` }}>
                    <Icon size={44} className="text-white drop-shadow" />
                </div>
                {/* Sparkle badge */}
                <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-amber-400 border-2 border-white flex items-center justify-center shadow-lg">
                    <Sparkles size={12} className="text-white" />
                </div>
            </motion.div>

            {/* Tag */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="relative z-10"
            >
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] bg-blue-50 text-blue-600 border border-blue-100">
                    <Zap size={10} fill="currentColor" /> {step.tag}
                </span>
            </motion.div>

            {/* Title */}
            <motion.h1
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="relative z-10 text-3xl sm:text-5xl font-black tracking-tight leading-[1.05] text-slate-900 whitespace-pre-line"
            >
                {step.title}
            </motion.h1>

            {/* Subtitle */}
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.32 }}
                className="relative z-10 text-sm sm:text-base text-slate-500 max-w-sm leading-relaxed"
            >
                {step.subtitle}
            </motion.p>

            {/* CTA (end page only) */}
            {step.type === "end" && (
                <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4, type: "spring", stiffness: 260 }}
                    onClick={() => navigate("/diamonds")}
                    className="relative z-10 flex items-center gap-2.5 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-wider text-white bg-gradient-to-r from-blue-600 to-blue-700 shadow-2xl hover:from-blue-500 hover:to-blue-600 active:scale-95 transition-all"
                    style={{ boxShadow: "0 12px 40px #3b82f640" }}
                >
                    {step.cta} <ArrowRight size={17} />
                </motion.button>
            )}
        </div>
    );
};

/* ─── Step Page ─────────────────────────────────────────────────── */
const StepPage = ({ step }) => {
    const Icon = step.icon;
    return (
        <div className="flex-1 flex flex-col sm:flex-row overflow-hidden">
            {/* Left accent panel */}
            <div className={`hidden sm:flex w-52 flex-shrink-0 flex-col items-center justify-center gap-6 bg-gradient-to-b ${step.gradient} px-6 py-10 relative overflow-hidden`}>
                {/* Pattern overlay */}
                <div className="absolute inset-0 opacity-10" style={{
                    backgroundImage: "radial-gradient(white 1px, transparent 1px)",
                    backgroundSize: "18px 18px",
                }} />

                <div className="relative z-10 flex flex-col items-center gap-5 text-center">
                    {/* Step number */}
                    <div className="text-white/30 font-black text-7xl leading-none select-none">
                        {step.stepNum}
                    </div>

                    {/* Icon circle */}
                    <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-xl">
                        <Icon size={30} className="text-white drop-shadow" />
                    </div>

                    {/* Tag */}
                    <span className="text-[9px] font-black uppercase tracking-[0.25em] text-white/60 text-center leading-relaxed">
                        {step.tag}
                    </span>
                </div>
            </div>

            {/* Right content */}
            <div className="flex-1 flex flex-col justify-center px-6 sm:px-10 py-8 sm:py-10 gap-5 overflow-y-auto">
                {/* Mobile header */}
                <div className="flex sm:hidden items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center shadow-lg flex-shrink-0`}>
                        <Icon size={22} className="text-white" />
                    </div>
                    <div>
                        <span className="text-[9px] font-black uppercase tracking-[0.2em]"
                            style={{ color: step.accentColor }}>{step.tag} · Step {step.stepNum}</span>
                    </div>
                </div>

                {/* Title */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <p className="hidden sm:block text-[10px] font-black uppercase tracking-[0.25em] mb-2"
                        style={{ color: step.accentColor }}>Step {step.stepNum}</p>
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight tracking-tight">
                        {step.title}
                    </h2>
                </motion.div>

                {/* Body text */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.18 }}
                    className="text-sm sm:text-base text-slate-500 leading-relaxed"
                >
                    {step.body}
                </motion.p>

                {/* Tip cards */}
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.26 }}
                    className="space-y-2.5"
                >
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Quick Tips</p>
                    {step.tips.map((tip, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 + i * 0.07 }}
                            className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50/80 hover:border-blue-100 hover:bg-blue-50/40 transition-colors"
                        >
                            <div className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5 shadow-sm"
                                style={{ background: step.lightColor }}>
                                <Check size={11} style={{ color: step.accentColor }} strokeWidth={3} />
                            </div>
                            <p className="text-xs sm:text-sm text-slate-600 leading-snug">{tip}</p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
};
