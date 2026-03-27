import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateProfile } from "../../store/authSlice";
import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, Lock, Gem, Camera, X, Loader2, Save, Globe, Copy, Key, Building2, Phone, MapPin, Map } from "lucide-react";
import { toast } from "react-toastify";
import api from "../../services/api";
import Select from "react-select";
import { getCountryOptions, getStateOptions, getCityOptions } from "../../utils/locationHelper";

export const EditProfileModal = ({ open, onClose }) => {
    const dispatch = useDispatch();
    const { user, loading: authLoading } = useSelector((state) => state.auth);
    const isDarkMode = useSelector((state) => state.theme?.isDarkMode ?? true);

    const [form, setForm] = useState({
        image: "",
        name: "",
        email: "",
        password: "",
        companyName: "",
        contact: "",
        country: "",
        state: "",
        city: "",
        preferredDiamondType: "All Diamonds",
    });

    const [countryCode, setCountryCode] = useState("");
    const [stateCode, setStateCode] = useState("");
    const [shapes, setShapes] = useState(["All Diamonds"]);
    const [loadingShapes, setLoadingShapes] = useState(true);
    const [error, setError] = useState(null);

    const countryOptions = useMemo(() => getCountryOptions(), []);
    const stateOptions = useMemo(() => getStateOptions(countryCode), [countryCode]);
    const cityOptions = useMemo(() => getCityOptions(countryCode, stateCode), [countryCode, stateCode]);

    useEffect(() => {
        if (open && user) {
            setForm({
                image: user.image || "",
                name: user.name || "",
                email: user.email || "",
                password: "",
                companyName: user.companyName || "",
                contact: user.contact || "",
                country: user.country || "",
                state: user.state || "",
                city: user.city || "",
                preferredDiamondType: user.preferredDiamondType || "All Diamonds",
            });

            if (user.country && countryOptions.length > 0) {
                const country = countryOptions.find(c => c.name === user.country);
                if (country) setCountryCode(country.value);
            }
        }
    }, [open, user, countryOptions]);

    useEffect(() => {
        if (countryCode && form.state) {
            const states = getStateOptions(countryCode);
            const state = states.find(s => s.name === form.state);
            if (state) setStateCode(state.value);
        }
    }, [countryCode, form.state]);

    useEffect(() => {
        let mounted = true;
        api.get("/admin/diamonds", { params: { page: 1, limit: 100 } })
            .then(res => {
                if (!mounted) return;
                const list = res.data?.data || res.data || [];
                const uniq = Array.from(new Set(list.map(d => d.Shape).filter(Boolean))).sort();
                setShapes(["All Diamonds", ...uniq]);
            })
            .catch(() => {
                setShapes(["All Diamonds", "Round", "Princess", "Emerald", "Oval", "Cushion", "Pear", "Marquise", "Heart"]);
            })
            .finally(() => mounted && setLoadingShapes(false));
        return () => { mounted = false; };
    }, []);

    const onChange = (k, v) => setForm((s) => ({ ...s, [k]: v }));

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                toast.error("Image size should be less than 2MB");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setForm(prev => ({ ...prev, image: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCountryChange = (selectedOption) => {
        if (selectedOption) {
            setForm({ ...form, country: selectedOption.name, state: "", city: "" });
            setCountryCode(selectedOption.value);
            setStateCode("");
        } else {
            setForm({ ...form, country: "", state: "", city: "" });
            setCountryCode("");
            setStateCode("");
        }
    };

    const handleStateChange = (selectedOption) => {
        if (selectedOption) {
            setForm({ ...form, state: selectedOption.name, city: "" });
            setStateCode(selectedOption.value);
        } else {
            setForm({ ...form, state: "", city: "" });
            setStateCode("");
        }
    };

    const handleCityChange = (selectedOption) => {
        setForm({ ...form, city: selectedOption ? selectedOption.name : "" });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            const userId = user?._id || user?.id;
            const payload = { ...form, _id: userId };
            if (!payload.password) delete payload.password;

            await dispatch(updateProfile(payload)).unwrap();
            onClose();
        } catch (err) {
            setError(err?.message || "Failed to update profile");
        }
    };

    const headerBg = isDarkMode ? "bg-[#161F29]" : "bg-slate-50";
    const headerText = isDarkMode ? "text-white" : "text-slate-900";
    const subText = isDarkMode ? "text-slate-400" : "text-slate-500";
    const inputCls = isDarkMode ? "bg-[#0B1219] border-slate-800 text-white placeholder:text-slate-700" : "bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400";

    const customSelectStyles = {
        control: (base, state) => ({
            ...base,
            backgroundColor: isDarkMode ? "#0B1219" : "#f8fafc",
            borderColor: state.isFocused ? "#3b82f6" : (isDarkMode ? "#1e293b" : "#e2e8f0"),
            borderRadius: "1rem",
            minHeight: "44px",
            boxShadow: "none",
            "&:hover": { borderColor: "#3b82f6" },
            fontSize: "12px",
            color: isDarkMode ? "white" : "#0f172a"
        }),
        singleValue: (base) => ({ ...base, color: isDarkMode ? "white" : "#0f172a" }),
        menu: (base) => ({ ...base, backgroundColor: isDarkMode ? "#111922" : "#ffffff", border: `1px solid ${isDarkMode ? "#1e293b" : "#e2e8f0"}` }),
        option: (base, state) => ({
            ...base,
            backgroundColor: state.isSelected ? "#3b82f6" : state.isFocused ? (isDarkMode ? "#1e293b" : "#f1f5f9") : "transparent",
            color: state.isSelected ? "white" : (isDarkMode ? "#cbd5e1" : "#1e293b"),
            fontSize: "12px"
        }),
        input: (base) => ({ ...base, color: isDarkMode ? "white" : "#0f172a" })
    };

    return (
        <AnimatePresence>
            {open && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-md" />

                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className={`relative w-full max-w-[650px] ${isDarkMode ? 'bg-[#111922] border-slate-800' : 'bg-white border-slate-200 shadow-xl'} rounded-[32px] p-6 sm:p-8 shadow-2xl font-sans max-h-[90vh] overflow-y-auto`}
                    >
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h3 className={`text-2xl font-normal ${isDarkMode ? 'text-white' : 'text-slate-900'}  uppercase tracking-tighter`}>My Account</h3>
                                <p className="text-[10px] font-normal text-slate-500 uppercase tracking-widest mt-1">Profile & Preferences</p>
                            </div>
                            <button onClick={onClose} className={`p-2 hover:${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'} rounded-xl text-slate-500 transition-all`}><X size={20} /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="flex flex-col items-center gap-4 mb-6">
                                <div className="relative group">
                                    <div className={`w-24 h-24 rounded-3xl ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'} border flex items-center justify-center overflow-hidden shadow-xl`}>
                                        {form.image ? (
                                            <img src={form.image} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className={`${isDarkMode ? 'text-white' : 'text-slate-900'} text-3xl `}>{user?.name?.charAt(0)}</div>
                                        )}
                                    </div>
                                    <label className="absolute -bottom-2 -right-2 bg-blue-600 p-2 rounded-xl text-white shadow-xl cursor-pointer hover:bg-blue-500 transition-colors">
                                        <Camera size={14} />
                                        <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                                    </label>
                                </div>
                                <p className="text-[10px] text-slate-500 uppercase">Click icon to upload photo</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] text-slate-500 uppercase ml-1">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                        <input value={form.name} onChange={(e) => onChange("name", e.target.value)} className={`w-full ${isDarkMode ? 'bg-[#0B1219] border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'} rounded-2xl py-3 pl-12 pr-4 text-xs focus:outline-none focus:border-blue-500`} required />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] text-slate-500 uppercase ml-1">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                        <input value={form.email} onChange={(e) => onChange("email", e.target.value)} className={`w-full ${isDarkMode ? 'bg-[#0B1219] border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'} rounded-2xl py-3 pl-12 pr-4 text-xs focus:outline-none focus:border-blue-500`} required />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] text-slate-500 uppercase ml-1">Company Name</label>
                                    <div className="relative">
                                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                        <input value={form.companyName} onChange={(e) => onChange("companyName", e.target.value)} className={`w-full ${isDarkMode ? 'bg-[#0B1219] border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'} rounded-2xl py-3 pl-12 pr-4 text-xs focus:outline-none focus:border-blue-500`} />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] text-slate-500 uppercase ml-1">Contact Number</label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                        <input value={form.contact} onChange={(e) => onChange("contact", e.target.value)} className={`w-full ${isDarkMode ? 'bg-[#0B1219] border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'} rounded-2xl py-3 pl-12 pr-4 text-xs focus:outline-none focus:border-blue-500`} />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] text-slate-500 uppercase ml-1">Country</label>
                                    <Select options={countryOptions} styles={customSelectStyles} value={countryOptions.find(c => c.value === countryCode) || null} onChange={handleCountryChange} isSearchable />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] text-slate-500 uppercase ml-1">State</label>
                                    <Select options={stateOptions} styles={customSelectStyles} value={stateOptions.find(s => s.value === stateCode) || null} onChange={handleStateChange} isSearchable isDisabled={!countryCode} />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] text-slate-500 uppercase ml-1">City</label>
                                    <Select options={cityOptions} styles={customSelectStyles} value={cityOptions.find(c => c.name === form.city) || null} onChange={handleCityChange} isSearchable isDisabled={!stateCode} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] text-slate-500 uppercase ml-1">New Password (Optional)</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                        <input type="password" value={form.password} onChange={(e) => onChange("password", e.target.value)} placeholder="Leave blank to keep" className={`w-full ${isDarkMode ? 'bg-[#0B1219] border-slate-800 text-white placeholder:text-slate-700' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'} rounded-2xl py-3 pl-12 pr-4 text-xs focus:outline-none focus:border-blue-500`} />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] text-slate-500 uppercase ml-1">Asset Specialization</label>
                                    <div className="relative">
                                        <Gem className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                        <select value={form.preferredDiamondType} onChange={(e) => onChange("preferredDiamondType", e.target.value)} className={`w-full ${inputCls} rounded-2xl py-3 pl-12 pr-4 text-xs focus:outline-none focus:border-blue-500 appearance-none`}>
                                            {loadingShapes ? <option>Loading...</option> : shapes.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>
                            {error && <p className="text-[10px] text-red-500 font-bold uppercase  text-center">{error}</p>}

                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={onClose} className={`flex-1 ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'} py-4 rounded-2xl text-[10px] uppercase transition-all`}>Cancel</button>
                                <button type="submit" disabled={authLoading} className={`flex-1 ${isDarkMode ? 'bg-white text-black hover:bg-blue-600 hover:text-white' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/20'} py-4 rounded-2xl text-[10px] uppercase transition-all flex items-center justify-center gap-2`}>
                                    {authLoading ? <Loader2 className="animate-spin" size={16} /> : <><Save size={16} /> Update Details</>}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

