import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toggleTheme } from '../../store/themeSlice';
import { updateProfile, getUserDetails } from '../../store/authSlice';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Shield, Eye, User, Star, Settings,
    ExternalLink, LogOut, Bell, Moon, Sun,
    Camera, Check, X, Mail, Building2, Phone, Globe, MapPin, RefreshCcw
} from "lucide-react";
import { ToggleRow } from '../../components/common/toggleRow';
import { toast } from 'react-toastify';
import Select from "react-select";
import { getCountryOptions, getStateOptions, getCityOptions } from "../../utils/locationHelper";

const settingSelectStyles = (isDarkMode) => ({
    control: (base, state) => ({
        ...base,
        backgroundColor: isDarkMode ? "#0B1219" : "#f8fafc",
        borderColor: state.isFocused ? "#3b82f6" : (isDarkMode ? "#1e293b" : "#e2e8f0"),
        borderRadius: "0.75rem",
        minHeight: "42px",
        boxShadow: "none",
        "&:hover": {
            borderColor: state.isFocused ? "#3b82f6" : (isDarkMode ? "#334155" : "#cbd5e1"),
        },
        fontSize: "0.875rem",
    }),
    placeholder: (base) => ({
        ...base,
        color: isDarkMode ? "#475569" : "#94a3b8",
    }),
    singleValue: (base) => ({
        ...base,
        color: isDarkMode ? "#ffffff" : "#0f172a",
    }),
    menu: (base) => ({
        ...base,
        backgroundColor: isDarkMode ? "#111922" : "#ffffff",
        borderRadius: "0.75rem",
        border: `1px solid ${isDarkMode ? "#1e293b" : "#e2e8f0"}`,
        zIndex: 9999,
        boxShadow: isDarkMode ? "0 20px 25px -5px rgba(0, 0, 0, 0.5)" : "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
    }),
    option: (base, state) => ({
        ...base,
        backgroundColor: state.isSelected ? "#2563eb" : state.isFocused ? (isDarkMode ? "#1e293b" : "#f1f5f9") : "transparent",
        color: state.isSelected ? "white" : (isDarkMode ? "#cbd5e1" : "#1e293b"),
        cursor: "pointer",
        "&:active": {
            backgroundColor: "#2563eb",
        }
    }),
    input: (base) => ({
        ...base,
        color: isDarkMode ? "white" : "#0f172a",
    })
});

export const Setting = () => {
    const dispatch = useDispatch();
    const isDarkMode = useSelector((state) => state.theme.isDarkMode);
    const { user, loading: authLoading } = useSelector((state) => state.auth);

    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        companyName: '',
        contact: '',
        country: '',
        state: '',
        city: '',
    });

    const [countryCode, setCountryCode] = useState('');
    const [stateCode, setStateCode] = useState('');

    const styles = settingSelectStyles(isDarkMode);
    const countryOptions = useMemo(() => getCountryOptions(), []);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                companyName: user.companyName || '',
                contact: user.contact || '',
                country: user.country || '',
                state: user.state || '',
                city: user.city || '',
            });

            if (user.country && countryOptions.length > 0) {
                const country = countryOptions.find(c => c.name === user.country);
                if (country) setCountryCode(country.value);
            }
        }
    }, [user, countryOptions]);

    useEffect(() => {
        if (countryCode && user?.state) {
            const states = getStateOptions(countryCode);
            const state = states.find(s => s.name === user.state);
            if (state) setStateCode(state.value);
        }
    }, [countryCode, user?.state]);

    const stateOptions = useMemo(() => getStateOptions(countryCode), [countryCode]);
    const cityOptions = useMemo(() => getCityOptions(countryCode, stateCode), [countryCode, stateCode]);

    const handleCountryChange = (selectedOption) => {
        if (selectedOption) {
            setFormData({ ...formData, country: selectedOption.name, state: '', city: '' });
            setCountryCode(selectedOption.value);
            setStateCode('');
        } else {
            setFormData({ ...formData, country: '', state: '', city: '' });
            setCountryCode('');
            setStateCode('');
        }
    };

    const handleStateChange = (selectedOption) => {
        if (selectedOption) {
            setFormData({ ...formData, state: selectedOption.name, city: '' });
            setStateCode(selectedOption.value);
        } else {
            setFormData({ ...formData, state: '', city: '' });
            setStateCode('');
        }
    };

    const handleCityChange = (selectedOption) => {
        setFormData({ ...formData, city: selectedOption ? selectedOption.name : '' });
    };

    // Local states for settings that don't affect other pages
    const [localPrefs, setLocalPrefs] = useState({
        isHighContrast: false,
        isEmailNotifications: true,
    });

    const toggleLocal = (key) => {
        setLocalPrefs(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            await dispatch(updateProfile({ ...formData, id: user._id })).unwrap();
            setIsEditing(false);
        } catch (err) {
            console.error("Failed to update profile", err);
        }
    };

    if (authLoading && !isEditing) {
        return (
            <div className="flex-1 bg-[#0B1219] min-h-screen text-slate-300 p-8">
                <div className="mb-10 space-y-3">
                    <div className="h-8 w-64 bg-slate-800 rounded animate-pulse" />
                    <div className="h-4 w-96 bg-slate-800 rounded animate-pulse" />
                </div>
            </div>
        );
    }

    const cardClasses = isDarkMode
        ? "bg-[#111922] border-slate-800 shadow-xl"
        : "bg-white border-slate-200 shadow-sm";

    const headerText = isDarkMode ? "text-white" : "text-slate-900";
    const subText = isDarkMode ? "text-slate-400" : "text-slate-500";
    const inputClasses = `w-full ${isDarkMode ? 'bg-[#0B1219] border-slate-800 text-white placeholder:text-slate-700' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'} rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-blue-500 transition-all`;

    return (
        <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
            <header className="mb-8 sm:mb-10 flex justify-between items-end">
                <div>
                    <h1 className={`text-2xl sm:text-3xl font-normal tracking-tight ${headerText}`}>Account Settings</h1>
                    <p className={`${subText} text-xs sm:text-sm mt-1`}>Manage your profile and exclusive membership preferences.</p>
                </div>
                <button
                    onClick={() => dispatch(getUserDetails())}
                    className={`flex items-center gap-2 px-4 py-2 border rounded-xl text-xs font-normal transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                >
                    <RefreshCcw size={16} className={authLoading ? "animate-spin" : ""} /> Refresh
                </button>
            </header>

            {/* Profile Card / Edit Form */}
            <section className={`border rounded-2xl p-6 sm:p-8 flex flex-col gap-8 mb-8 transition-all duration-300 ${cardClasses}`}>
                <div className="flex flex-col lg:flex-row items-start justify-between gap-6">
                    <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left w-full lg:w-auto">
                        <div className="relative group">
                            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-600 to-blue-400 p-[2px] shadow-lg shadow-blue-600/20">
                                <div className={`w-full h-full rounded-3xl flex items-center justify-center overflow-hidden ${isDarkMode ? 'bg-slate-900' : 'bg-white'}`}>
                                    {user?.image ? (
                                        <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-4xl font-normal text-blue-400">
                                            {user?.name?.charAt(0)?.toUpperCase() || "A"}
                                        </span>
                                    )}
                                </div>
                            </div>
                            {isEditing && (
                                <button title="Change Image" className="absolute -bottom-2 -right-2 bg-blue-600 p-2 rounded-xl border-4 border-slate-900 text-white hover:bg-blue-500 transition-colors">
                                    <Camera size={16} />
                                </button>
                            )}
                        </div>
                        <div className="flex-1">
                            {!isEditing ? (
                                <>
                                    <div className="flex items-center justify-center sm:justify-start gap-3">
                                        <h2 className={`text-2xl font-normal uppercase tracking-tight ${headerText}`}>{user?.name || "Administrator"}</h2>
                                        <span className="bg-blue-600/10 text-blue-400 text-[10px] font-normal tracking-widest px-2 py-1 rounded-md border border-blue-600/20">
                                            {user?.role?.toUpperCase() || "USER"}
                                        </span>
                                    </div>
                                    <p className={`${subText} text-sm font-normal mt-1 flex items-center justify-center sm:justify-start gap-2`}>
                                        <Mail size={14} /> {user?.email || "—"}
                                    </p>
                                    <div className="flex flex-wrap justify-center sm:justify-start gap-4 mt-4 text-xs font-normal uppercase tracking-widest text-slate-500">
                                        <span className="flex items-center gap-1.5"><Building2 size={12} /> {user?.companyName || "N/A"}</span>
                                        <span className="flex items-center gap-1.5"><Phone size={12} /> {user?.contact || "N/A"}</span>
                                        <span className="flex items-center gap-1.5"><MapPin size={12} /> {user?.city}, {user?.country}</span>
                                    </div>
                                </>
                            ) : (
                                <div className="space-y-1">
                                    <h2 className={`text-xl font-normal ${headerText}`}>Editing Profile</h2>
                                    <p className="text-blue-500 text-xs font-normal uppercase tracking-widest">Update your identification</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {!isEditing ? (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="w-full lg:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-normal shadow-lg shadow-blue-600/20 active:scale-95 transition-all"
                        >
                            Edit Profile
                        </button>
                    ) : (
                        <div className="flex gap-3 w-full lg:w-auto">
                            <button
                                onClick={() => setIsEditing(false)}
                                className="flex-1 lg:flex-none px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-normal active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                                <X size={18} /> Cancel
                            </button>
                            <button
                                onClick={handleUpdateProfile}
                                className="flex-1 lg:flex-none px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-normal shadow-lg shadow-blue-600/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                                <Check size={18} /> Save Changes
                            </button>
                        </div>
                    )}
                </div>

                {isEditing && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-6 border-t border-slate-800/50"
                    >
                        <div className="space-y-2">
                            <label className="text-[10px] font-normal text-slate-500 uppercase tracking-[0.2em] ml-1">Full Name</label>
                            <input name="name" value={formData.name} onChange={handleInputChange} className={inputClasses} placeholder="Enter your name ..." />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-normal text-slate-500 uppercase tracking-[0.2em] ml-1">Company Name</label>
                            <input name="companyName" value={formData.companyName} onChange={handleInputChange} className={inputClasses} placeholder="Global Diamonds Ltd." />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-normal text-slate-500 uppercase tracking-[0.2em] ml-1">Email Address</label>
                            <input name="email" value={formData.email} onChange={handleInputChange} className={inputClasses} placeholder="Enter your email ..." />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-normal text-slate-500 uppercase tracking-[0.2em] ml-1">Contact No.</label>
                            <input name="contact" value={formData.contact} onChange={handleInputChange} className={inputClasses} placeholder="+1 234 567 890" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-normal text-slate-500 uppercase tracking-[0.2em] ml-1">Country</label>
                            <Select
                                options={countryOptions}
                                styles={styles}
                                placeholder="Country"
                                value={countryOptions.find(c => c.value === countryCode) || null}
                                onChange={handleCountryChange}
                                isSearchable
                                isClearable
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-normal text-slate-500 uppercase tracking-[0.2em] ml-1">State</label>
                            <Select
                                options={stateOptions}
                                styles={styles}
                                placeholder="State"
                                value={stateOptions.find(s => s.value === stateCode) || null}
                                onChange={handleStateChange}
                                isSearchable
                                isClearable
                                isDisabled={!countryCode}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-normal text-slate-500 uppercase tracking-[0.2em] ml-1">City</label>
                            <Select
                                options={cityOptions}
                                styles={styles}
                                placeholder="City"
                                value={cityOptions.find(c => c.name === formData.city) || null}
                                onChange={handleCityChange}
                                isSearchable
                                isClearable
                                isDisabled={!stateCode}
                            />
                        </div>

                    </motion.div>
                )}
            </section>

            {/* Preference Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Theme Controller */}
                <div className={`border rounded-2xl p-6 md:p-8 transition-all duration-300 ${cardClasses}`}>
                    <div className="flex items-center gap-3 mb-8 text-blue-400">
                        {isDarkMode ? <Moon size={20} /> : <Sun size={20} />}
                        <h3 className={`text-sm font-normal uppercase tracking-widest ${headerText}`}>Appearance</h3>
                    </div>
                    <div className="space-y-6">
                        <ToggleRow
                            label="Dark Mode"
                            description={isDarkMode ? "Interface set to Onyx Night" : "Interface set to Crystal Day"}
                            checked={isDarkMode}
                            onChange={() => dispatch(toggleTheme())}
                        />
                        <ToggleRow
                            label="High Contrast"
                            description="Enhance visual separation"
                            checked={localPrefs.isHighContrast}
                            onChange={() => toggleLocal('isHighContrast')}
                        />
                    </div>
                </div>

                {/* Security Section */}
                <div className={`border rounded-2xl p-6 sm:p-8 transition-all duration-300 ${cardClasses}`}>
                    <div className="flex items-center gap-3 mb-8 text-emerald-400">
                        <Shield size={20} />
                        <h3 className={`text-sm font-normal uppercase tracking-widest ${headerText}`}>Security</h3>
                    </div>
                    <div className="space-y-6">
                        <ToggleRow
                            label="Email Notifications"
                            description="Weekly inventory and log reports"
                            icon={Bell}
                            checked={localPrefs.isEmailNotifications}
                            onChange={() => toggleLocal('isEmailNotifications')}
                        />
                        <button className="w-full py-3.5 mt-4 border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 text-rose-500 rounded-xl text-[10px] font-normal tracking-widest transition-all active:scale-95">
                            TERMINATE ALL SESSIONS
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

