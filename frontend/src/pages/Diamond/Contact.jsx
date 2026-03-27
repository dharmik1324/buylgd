import { motion, AnimatePresence } from "framer-motion";
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaCheckCircle } from "react-icons/fa";
import { useState } from "react";
import api from "../../services/api";
import { useSelector } from "react-redux";

export const Contact = () => {
    const isDarkMode = useSelector((state) => state.theme.isDarkMode);

    const bgMain = isDarkMode ? "bg-black" : "bg-white";
    const bgCard = isDarkMode ? "bg-[#111111]" : "bg-white text-black";
    const textMain = isDarkMode ? "text-white" : "text-[#111111]";
    const textSub = isDarkMode ? "text-gray-400" : "text-gray-600";
    const borderCol = isDarkMode ? "border-[#111111]" : "border-gray-100";
    const accentColor = isDarkMode ? "text-blue-500" : "text-blue-500";
    const accentBg = isDarkMode ? "bg-blue-600" : "bg-blue-500";
    const accentRing = isDarkMode ? "focus:ring-blue-500" : "focus:ring-blue-500";
    const iconBg = isDarkMode ? "bg-[#111111]" : "bg-gray-100";

    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        subject: "",
        message: ""
    });

    const [status, setStatus] = useState({
        loading: false,
        success: false,
        error: null
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ loading: true, success: false, error: null });

        try {
            const response = await api.post("/contact/submit", formData);
            if (response.data.success) {
                setStatus({ loading: false, success: true, error: null });
                setFormData({ fullName: "", email: "", subject: "", message: "" });

                setTimeout(() => setStatus(prev => ({ ...prev, success: false })), 5001);
            }
        } catch (err) {
            console.error("Submission error:", err);
            setStatus({
                loading: false,
                success: false,
                error: err.response?.data?.message || "Something went wrong. Please try again."
            });
        }
    };

    return (
        <section className={`${bgMain} ${textMain} min-h-screen py-24 px-4 md:px-12 relative transition-colors duration-300`}>
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-16"
                >
                    <h4 className={`text-sm font-bold tracking-[0.2em] ${accentColor} uppercase mb-4`}>
                        Contact Us
                    </h4>
                    <h2 className={`text-4xl md:text-5xl font-serif ${textMain} mb-6`}>
                        Get in Touch with <span className={` ${isDarkMode ? "text-blue-400" : "text-gray-600"}`}>Expertise</span>
                    </h2>
                    <p className={`${textSub} text-lg max-w-2xl mx-auto`}>
                        Whether you're looking for the perfect engagement ring or need advice on diamond quality, our team is here to assist you.
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-2 gap-16 items-start">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="space-y-10"
                    >
                        <div className="flex items-start gap-6">
                            <div className={`${iconBg} p-4 rounded-full ${accentColor} shadow-sm`}>
                                <FaMapMarkerAlt size={24} />
                            </div>
                            <div>
                                <h3 className={`text-xl font-semibold ${textMain} mb-2`}>Our Boutique</h3>
                                <p className={`${textSub} leading-relaxed`}>
                                    123 Diamond Avenue, Jewelry District<br />
                                    Surat, Gujarat, 395006
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-6">
                            <div className={`${iconBg} p-4 rounded-full ${accentColor} shadow-sm`}>
                                <FaPhoneAlt size={24} />
                            </div>
                            <div>
                                <h3 className={`text-xl font-semibold ${textMain} mb-2`}>Call Us</h3>
                                <p className={`${textSub} leading-relaxed`}>
                                    +91 98765 43210<br />
                                    Mon - Sat, 10:00 AM - 7:00 PM
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-6">
                            <div className={`${iconBg} p-4 rounded-full ${accentColor} shadow-sm`}>
                                <FaEnvelope size={24} />
                            </div>
                            <div>
                                <h3 className={`text-xl font-semibold ${textMain} mb-2`}>Email Us</h3>
                                <p className={`${textSub} leading-relaxed`}>
                                    inquiry@diamondstore.com<br />
                                    support@diamondstore.com
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className={`${isDarkMode ? "bg-[#111111]" : "bg-gray-50"} p-8 md:p-10 rounded-3xl shadow-xl border ${borderCol} relative overflow-hidden`}
                    >
                        <AnimatePresence>
                            {status.success && (
                                <motion.div
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className={`absolute inset-0 ${isDarkMode ? "bg-[#111111]/95" : "bg-white/90"} z-20 flex flex-col items-center justify-center text-center p-6`}
                                >
                                    <FaCheckCircle className="text-green-500 mb-4" size={60} />
                                    <h3 className={`text-2xl font-bold ${textMain} mb-2`}>Message Sent!</h3>
                                    <p className={textSub}>Thank you for reaching out. We will get back to you soon.</p>
                                    <button
                                        onClick={() => setStatus(prev => ({ ...prev, success: false }))}
                                        className={`mt-6 ${accentColor} font-semibold hover:underline`}
                                    >
                                        Send another message
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className={`text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Full Name</label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        required
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        placeholder="Enter your name ..."
                                        className={`w-full px-5 py-3 rounded-xl border ${isDarkMode ? "border-gray-700 bg-black text-white" : "border-gray-200 bg-white"} focus:outline-none focus:ring-2 ${accentRing} focus:border-transparent transition`}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className={`text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Email Address</label>
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="Enter your email ..."
                                        className={`w-full px-5 py-3 rounded-xl border ${isDarkMode ? "border-gray-700 bg-black text-white" : "border-gray-200 bg-white"} focus:outline-none focus:ring-2 ${accentRing} focus:border-transparent transition`}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className={`text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Subject</label>
                                <input
                                    type="text"
                                    name="subject"
                                    required
                                    value={formData.subject}
                                    onChange={handleChange}
                                    placeholder="Inquiry about Diamonds"
                                    className={`w-full px-5 py-3 rounded-xl border ${isDarkMode ? "border-gray-700 bg-black text-white" : "border-gray-200 bg-white"} focus:outline-none focus:ring-2 ${accentRing} focus:border-transparent transition`}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className={`text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Message</label>
                                <textarea
                                    name="message"
                                    required
                                    value={formData.message}
                                    onChange={handleChange}
                                    rows="5"
                                    placeholder="How can we help you?"
                                    className={`w-full px-5 py-3 rounded-xl border ${isDarkMode ? "border-gray-700 bg-black text-white" : "border-gray-200 bg-white"} focus:outline-none focus:ring-2 ${accentRing} focus:border-transparent transition resize-none`}
                                ></textarea>
                            </div>

                            {status.error && (
                                <p className="text-red-500 text-sm font-medium">{status.error}</p>
                            )}

                            <button
                                disabled={status.loading}
                                className={`w-full ${isDarkMode ? "bg-white text-black hover:bg-gray-200" : "bg-black text-white hover:bg-[#111111]"} py-4 rounded-xl font-bold transition-all duration-300 shadow-lg ${isDarkMode ? "shadow-blue-500/10" : "shadow-gray-200"} uppercase tracking-widest text-sm ${status.loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {status.loading ? "Sending..." : "Send Message"}
                            </button>
                        </form>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};


