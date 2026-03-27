import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { registerUser } from "../../store/authSlice";
import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, Lock, CheckCircle2, Loader2, Building2, UserPlus, Globe, MapPin, Map } from "lucide-react";
import Select from "react-select";
import { getCountryOptions, getStateOptions, getCityOptions } from "../../utils/locationHelper";
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
const logo = "/N6yun2CMI33J3R5MVpHWql06P0E.png";
import luxuryBg from "../../assets/luxury-bg.png";
import emerald from "../../assets/Emerald.webp";
import pear from "../../assets/Pear.webp";
import marquise from "../../assets/Marquise.webp";
import cushion from "../../assets/Cushion.webp";
import heart from "../../assets/Heart.webp";

const customSelectStyles = {
    control: (base, state) => ({
        ...base,
        backgroundColor: state.isFocused ? "#ffffff" : "#f8fafc",
        borderColor: state.isFocused ? "#3b82f6" : "#e2e8f0",
        borderRadius: "1rem",
        paddingLeft: "2.5rem",
        minHeight: "56px",
        boxShadow: "none",
        "&:hover": {
            borderColor: state.isFocused ? "#3b82f6" : "#e2e8f0",
        },
        fontSize: "0.875rem",
        fontFamily: "inherit",
    }),
    valueContainer: (base) => ({
        ...base,
        padding: "0 8px 0 0",
    }),
    singleValue: (base) => ({
        ...base,
        color: "#0f172a",
    }),
    placeholder: (base) => ({
        ...base,
        color: "#94a3b8",
    }),
    menu: (base) => ({
        ...base,
        borderRadius: "1rem",
        overflow: "hidden",
        border: "1px solid #e2e8f0",
        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
        zIndex: 9999,
    }),
    option: (base, state) => ({
        ...base,
        backgroundColor: state.isSelected ? "#3b82f6" : state.isFocused ? "#eff6ff" : "white",
        color: state.isSelected ? "white" : "#0f172a",
        padding: "10px 16px",
    }),
    indicatorSeparator: () => ({ display: "none" }),
};

export const Register = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error, user } = useSelector(state => state.auth);

    const [name, setName] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [contact, setContact] = useState("");
    const [country, setCountry] = useState("");
    const [state, setState] = useState("");
    const [city, setCity] = useState("");
    const [countryCode, setCountryCode] = useState("");
    const [stateCode, setStateCode] = useState("");

    const countryOptions = useMemo(() => getCountryOptions(), []);
    const stateOptions = useMemo(() => getStateOptions(countryCode), [countryCode]);
    const cityOptions = useMemo(() => getCityOptions(countryCode, stateCode), [countryCode, stateCode]);

    const handleCountryChange = (selectedOption) => {
        if (selectedOption) {
            setCountry(selectedOption.name);
            setCountryCode(selectedOption.value);
            setState(""); setStateCode(""); setCity("");
        } else {
            setCountry(""); setCountryCode(""); setState(""); setStateCode(""); setCity("");
        }
    };

    const handleStateChange = (selectedOption) => {
        if (selectedOption) {
            setState(selectedOption.name);
            setStateCode(selectedOption.value);
            setCity("");
        } else {
            setState(""); setStateCode(""); setCity("");
        }
    };

    const handleCityChange = (selectedOption) => {
        setCity(selectedOption ? selectedOption.name : "");
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch(registerUser({ name, companyName, email, password, contact, country, state, city }));
    };

    useEffect(() => {
        if (user) navigate("/login");
    }, [user, navigate]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-between font-sans selection:bg-blue-100 relative overflow-hidden">
            <div
                className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat scale-110 opacity-90 blur-[2px]"
                style={{ backgroundImage: `url(${luxuryBg})` }}
            />
            <div className="absolute inset-0 z-0 bg-white/20" /> {/* Soft Overlay */}
            {/* Removed Blur Overlay */}

            <div className="w-full flex justify-center items-start z-10 pt-8 px-8">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                    <img onClick={() => window.location.href = "https://buylgd.in"} src={logo} alt="BUYLGD" className="w-80 h-auto object-contain drop-shadow-xl mix-blend-screen" />
                </motion.div>
            </div>

            <div className="w-full flex items-center justify-center z-10 py-20 px-4 md:px-8">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-[1000px]"
                >
                    <div className="bg-[#D4D4D4] p-10 md:p-14 rounded-[60px] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.2)]">
                        <div className="mb-10 text-center">
                            <span className="text-[12px] font-bold text-slate-500 uppercase tracking-[0.5em] block mb-4">Create Account</span>
                            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Join luxury diamond ecosystem</h1>
                        </div>

                        <AnimatePresence mode="wait">
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                                    className="bg-red-50/80 backdrop-blur-sm border border-red-100 text-red-600 p-4 rounded-2xl mb-8 text-[11px] font-medium flex items-center gap-3"
                                >
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                    {error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold text-slate-400 ml-1 uppercase tracking-widest">Full Name</label>
                                    <div className="relative group">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                                        <input
                                            type="text" placeholder="Enter your name ..."
                                            className="w-full bg-white border border-transparent rounded-3xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                                            value={name} onChange={(e) => setName(e.target.value)} required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold text-slate-400 ml-1 uppercase tracking-widest">Company Name</label>
                                    <div className="relative group">
                                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                                        <input
                                            type="text" placeholder="Diamond Corp Ltd."
                                            className="w-full bg-white border border-transparent rounded-3xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                                            value={companyName} onChange={(e) => setCompanyName(e.target.value)} required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold text-slate-400 ml-1 uppercase tracking-widest">Email Address</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                                        <input
                                            type="email" placeholder="name@company.com"
                                            className="w-full bg-white border border-transparent rounded-3xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                                            value={email} onChange={(e) => setEmail(e.target.value)} required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold text-slate-400 ml-1 uppercase tracking-widest">Password</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                                        <input
                                            type="password" placeholder="Minimum 8 characters"
                                            className="w-full bg-white border border-transparent rounded-3xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                                            value={password} onChange={(e) => setPassword(e.target.value)} required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2 sm:col-span-2">
                                    <label className="text-[11px] font-bold text-slate-400 ml-1 uppercase tracking-widest">Contact Number</label>
                                    <PhoneInput
                                        country={'in'} value={contact} onChange={phone => setContact(phone)}
                                        inputClass="!w-full !bg-white/50 !border !border-slate-200 !rounded-2xl !py-7 !pl-14 !text-sm focus:!border-blue-500 focus:!bg-white"
                                        buttonClass="!bg-transparent !border-none !pl-2"
                                        dropdownClass="!rounded-2xl !shadow-2xl"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold text-slate-400 ml-1 uppercase tracking-widest">Country</label>
                                    <div className="relative group">
                                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors z-10" size={16} />
                                        <Select
                                            options={countryOptions} styles={customSelectStyles} placeholder="Country"
                                            value={countryOptions.find(c => c.value === countryCode) || null}
                                            onChange={handleCountryChange} isSearchable required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold text-slate-400 ml-1 uppercase tracking-widest">State</label>
                                    <div className="relative group">
                                        <Map className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors z-10" size={16} />
                                        <Select
                                            options={stateOptions} styles={customSelectStyles} placeholder="State"
                                            value={stateOptions.find(s => s.value === stateCode) || null}
                                            onChange={handleStateChange} isDisabled={!countryCode} required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold text-slate-400 ml-1 uppercase tracking-widest">City</label>
                                    <div className="relative group">
                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors z-10" size={16} />
                                        <Select
                                            options={cityOptions} styles={customSelectStyles} placeholder="City"
                                            value={cityOptions.find(c => c.value === city) || null}
                                            onChange={handleCityChange} isDisabled={!stateCode} required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-5 bg-blue-50/30 backdrop-blur-sm border border-blue-100 rounded-2xl mb-8 group">
                                <CheckCircle2 className="text-blue-500 mt-1 flex-shrink-0" size={16} />
                                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                                    By creating an account, you agree to our <span className="text-blue-600 cursor-pointer hover:underline">Terms</span> and <span className="text-blue-600 cursor-pointer hover:underline">Privacy Policy</span>.
                                </p>
                            </div>

                            <button
                                type="submit" disabled={loading}
                                className="w-full bg-[#25397C] hover:bg-[#1e2e65] text-white font-bold py-5 rounded-3xl text-[17px] transition-all flex items-center justify-center gap-3 active:scale-95 shadow-lg"
                            >
                                {loading ? <Loader2 className="animate-spin" size={20} /> : <><span className="mr-2">Create Account</span> <UserPlus size={20} /></>}
                            </button>

                            <div className="pt-8 border-t border-slate-200/50 text-center">
                                <p className="text-slate-500 text-[15px] font-medium">
                                    Already have an account? <Link to="/login" className="text-[#25397C] font-bold hover:underline transition-colors ml-1">Sign In</Link>
                                </p>
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

