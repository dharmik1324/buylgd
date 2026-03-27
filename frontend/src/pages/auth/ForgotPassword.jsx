import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, Loader2, KeyRound, ShieldCheck, Lock } from "lucide-react";
import { toast } from "react-toastify";
import { forgotPassword, resetPassword } from "../../services/authService";
const logo = "/N6yun2CMI33J3R5MVpHWql06P0E.png";
import luxuryBg from "../../assets/luxury-bg.png";

export const ForgotPassword = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1); // 1: Email, 2: Reset

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await forgotPassword(email);
            toast.success("OTP sent to your email!");
            setStep(2);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to send OTP");
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            return toast.error("Passwords do not match");
        }

        setLoading(true);
        try {
            await resetPassword({ email, otp, newPassword, confirmPassword });
            toast.success("Password reset successfully!");
            setTimeout(() => {
                navigate("/login");
            }, 2000);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to reset password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 font-sans relative overflow-hidden bg-white">
            {/* Background */}
            <div 
                className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat scale-110"
                style={{ backgroundImage: `url(${luxuryBg})` }}
            />

            <div className="w-full max-w-[500px] z-10">
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center mb-12"
                >
                    <img src={logo} alt="BUYLGD" className="w-64 h-auto object-contain drop-shadow-xl mix-blend-screen" />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-[#D4D4D4] p-10 md:p-12 rounded-[50px] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.2)]"
                >
                    {step === 1 ? (
                        <div className="space-y-8">
                            <div className="text-center space-y-2">
                                <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-500/20">
                                    <KeyRound className="text-blue-600" size={32} />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Forgot Password?</h2>
                                <p className="text-slate-500 text-sm">Enter your email and we'll send you a 6-digit OTP to reset your password.</p>
                            </div>

                            <form onSubmit={handleSendOTP} className="space-y-6">
                                <div className="relative">
                                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                    <input
                                        type="email"
                                        placeholder="Email Address"
                                        className="w-full bg-white border border-transparent rounded-3xl py-5 pl-14 pr-4 text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-400"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-[#25397C] hover:bg-[#1e2e65] text-white font-bold py-5 rounded-3xl text-[17px] transition-all flex items-center justify-center gap-2 active:scale-95 shadow-lg"
                                >
                                    {loading ? <Loader2 className="animate-spin" size={20} /> : "Send OTP Code"}
                                </button>
                            </form>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            <div className="text-center space-y-2">
                                <div className="w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-green-500/20">
                                    <ShieldCheck className="text-green-600" size={32} />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Verify & Reset</h2>
                                <p className="text-slate-500 text-sm">We've sent a code to <span className="font-bold text-slate-900">{email}</span></p>
                            </div>

                            <form onSubmit={handleResetPassword} className="space-y-5">
                                <div className="relative">
                                    <KeyRound className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                    <input
                                        type="text"
                                        placeholder="6-Digit OTP"
                                        maxLength={6}
                                        className="w-full bg-white border border-transparent rounded-3xl py-5 pl-14 pr-4 text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-400 font-mono tracking-[0.5em]"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="relative">
                                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                    <input
                                        type="password"
                                        placeholder="New Password"
                                        className="w-full bg-white border border-transparent rounded-3xl py-5 pl-14 pr-4 text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-400"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="relative">
                                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                    <input
                                        type="password"
                                        placeholder="Confirm New Password"
                                        className="w-full bg-white border border-transparent rounded-3xl py-5 pl-14 pr-4 text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-400"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-[#25397C] hover:bg-[#1e2e65] text-white font-bold py-5 rounded-3xl text-[17px] transition-all flex items-center justify-center gap-2 active:scale-95 shadow-lg mt-4"
                                >
                                    {loading ? <Loader2 className="animate-spin" size={20} /> : "Reset My Password"}
                                </button>
                                
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="w-full text-slate-500 text-sm hover:text-slate-700 transition-colors py-2"
                                >
                                    Didn't get the code? Try again
                                </button>
                            </form>
                        </div>
                    )}

                    <div className="mt-10 pt-8 border-t border-slate-200/50 flex justify-center">
                        <Link 
                            to="/login" 
                            className="flex items-center gap-2 text-[15px] font-medium text-[#25397C] hover:underline transition-colors"
                        >
                            <ArrowLeft size={16} /> Back to Sign In
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};
