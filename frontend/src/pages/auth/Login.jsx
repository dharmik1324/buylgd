import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../../store/authSlice";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, LogIn, ShieldCheck, ArrowRight, Loader2, QrCode, Apple, Play } from "lucide-react";
const logo = "/N6yun2CMI33J3R5MVpHWql06P0E.png";
import luxuryBg from "../../assets/luxury-bg.png";

export const Login = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { loading, error, token, user } = useSelector((state) => state.auth);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch(loginUser({ email, password }));
    };

    useEffect(() => {
        if (token && user) {
            if (user.role === 'admin') {
                navigate("/admin/dashboard", { replace: true });
            } else {
                const companySlug = user.companyName?.toLowerCase().replace(/\s+/g, '-') || "user";
                navigate(`/${companySlug}/selection`, { replace: true });
            }
        }
    }, [token, user, navigate]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-between font-sans selection:bg-blue-100 relative overflow-hidden">
            {/* Same Sharp Diamond Facet Background */}
            <div
                className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat scale-110 opacity-90 blur-[2px]"
                style={{ backgroundImage: `url(${luxuryBg})` }}
            />
            <div className="absolute inset-0 z-0 bg-white/20" /> {/* Soft Overlay */}
            {/* Removed Blur Overlay */}

            {/* Top Brand Area */}
            <div className="w-full flex justify-center items-start z-10 pt-8 px-8">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center"
                >
                    <img onClick={() => window.location.href = "https://buylgd.in"} src={logo} alt="BUYLGD" className="w-80 h-auto object-contain drop-shadow-xl mix-blend-screen" />
                </motion.div>
            </div>

            {/* Central Login Area */}
            <div className="w-full flex items-center justify-center z-10 py-20 px-4 md:px-8">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-[620px]"
                >
                    <div className="bg-[#D4D4D4] p-12 md:p-16 rounded-[60px] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.2)]">
                        <AnimatePresence mode="wait">
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="bg-red-50/80 backdrop-blur-sm border border-red-100 text-red-600 p-4 rounded-2xl mb-6 text-[11px] font-medium flex items-center gap-3"
                                >
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                    {error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="space-y-3">
                                <div className="flex justify-center mb-8">
                                    <span className="text-[12px] font-bold text-slate-400 uppercase tracking-[0.5em]">Sign In</span>
                                </div>
                                <div className="relative">
                                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                    <input
                                        type="email"
                                        placeholder="Enter your email..."
                                        className="w-full bg-white border border-transparent rounded-3xl py-5 pl-14 pr-4 text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-400"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="relative">
                                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                    <input
                                        type="password"
                                        placeholder="Enter your password..."
                                        className="w-full bg-white border border-transparent rounded-3xl py-5 pl-14 pr-4 text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-400"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4 mt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 bg-[#25397C] hover:bg-[#1e2e65] text-white font-bold py-5 rounded-3xl text-[17px] transition-all flex items-center justify-center gap-2 active:scale-95 shadow-lg"
                                >
                                    {loading ? <Loader2 className="animate-spin" size={20} /> : "Sign In"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => navigate("/register")}
                                    className="flex-1 bg-[#232F3E] hover:bg-[#1a2430] text-white font-bold py-5 rounded-3xl text-[17px] transition-all flex items-center justify-center gap-2 active:scale-95 shadow-lg"
                                >
                                    Sign Up
                                </button>
                            </div>

                            <div className="flex justify-between px-2 text-[15px] font-medium text-[#25397C]">
                                <Link to="/forgot-password" title="Under Construction" className="hover:underline transition-colors">Reset Password?</Link>
                                <Link to="/guide" className="hover:underline transition-colors">Sign Up Guide</Link>
                            </div>
                        </form>
                    </div>
                </motion.div>
            </div>

            {/* Bottom Luxury Footer Area - Blur Removed */}
            <div className="w-full z-10 pb-8 mt-12 border-t border-white/20">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 text-center px-12 md:px-24 w-full pb-16">
                    <div className="space-y-1 group cursor-default">
                        <h4 className="text-[24px] md:text-[28px] font-medium text-slate-900 tracking-[0.2em] font-serif group-hover:text-[#25397C] transition-colors">MUMBAI</h4>
                        <p className="text-[14px] text-slate-700">+91 2249590000</p>
                        <p className="text-[13px] text-slate-800 font-bold tracking-[0.25em]">app.buylgd.in</p>
                    </div>
                    <div className="space-y-1 group cursor-default">
                        <h4 className="text-[24px] md:text-[28px] font-medium text-slate-900 tracking-[0.2em] font-serif group-hover:text-[#25397C] transition-colors">NEW YORK</h4>
                        <p className="text-[14px] text-slate-700">+1 646 346 6610</p>
                        <p className="text-[13px] text-slate-800 font-bold tracking-[0.25em]">app.buylgd.in</p>
                    </div>
                    <div className="space-y-1 group cursor-default">
                        <h4 className="text-[24px] md:text-[28px] font-medium text-slate-900 tracking-[0.2em] font-serif group-hover:text-[#25397C] transition-colors">SURAT</h4>
                        <p className="text-[14px] text-slate-700">+91 2616914500</p>
                        <p className="text-[13px] text-slate-800 font-bold tracking-[0.25em]">app.buylgd.in</p>
                    </div>
                    <div className="space-y-1 group cursor-default">
                        <h4 className="text-[24px] md:text-[28px] font-medium text-slate-900 tracking-[0.2em] font-serif group-hover:text-[#25397C] transition-colors">HONG KONG</h4>
                        <p className="text-[14px] text-slate-700">+852 23662488</p>
                        <p className="text-[13px] text-slate-800 font-bold tracking-[0.25em]">app.buylgd.in</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

