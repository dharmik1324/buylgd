import { useDispatch, useSelector } from "react-redux";
import { bulkUpdateDiamonds, fetchDiamonds } from "../../store/diamondSlice";
import { motion } from "framer-motion";
import { X, Zap, AlertCircle, Filter, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";

export const BulkUpdateModal = ({ open, onClose, currentFilters, selectedIds = [] }) => {
    const dispatch = useDispatch();
    const isDarkMode = useSelector((state) => state.theme?.isDarkMode ?? true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Local state for filters so user can tweak them before hitting 'Apply'
    const [localFilters, setLocalFilters] = useState(currentFilters);
    const [updateConfig, setUpdateConfig] = useState({
        field: "Final_Price",
        type: "percentage",
        value: "",
    });

    useEffect(() => {
        if (open) setLocalFilters(currentFilters);
    }, [open, currentFilters]);

    if (!open) return null;

    const isSelectionMode = selectedIds.length > 0;
    const canSubmit = updateConfig.value !== "" && !isSubmitting;

    const handleLocalFilterChange = (e) => {
        const { name, value } = e.target;
        setLocalFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await dispatch(bulkUpdateDiamonds({
                filter: { ...localFilters, ids: isSelectionMode ? selectedIds : null },
                update: updateConfig
            })).unwrap();

            // Refresh the main list with original filters after update
            dispatch(fetchDiamonds(currentFilters));
            onClose();
        } catch (error) {
            console.error("Bulk update failed:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const modalBg = isDarkMode ? "bg-[#111922] border-slate-800" : "bg-white border-slate-200";
    const headerBg = isDarkMode ? "bg-[#161F29]" : "bg-slate-50";
    const headText = isDarkMode ? "text-white" : "text-slate-900";
    const inputCls = isDarkMode ? "bg-[#0B1219] border-slate-800 text-white placeholder:text-slate-700" : "bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400";
    const borderCol = isDarkMode ? "border-white/5" : "border-slate-200";

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`relative ${modalBg} w-full max-w-2xl rounded-[2.5rem] shadow-2xl border overflow-hidden`}
            >
                {/* Header */}
                <div className={`px-8 py-6 border-b ${borderCol} ${headerBg} flex justify-between items-center`}>
                    <div>
                        <h2 className={`text-xl font-normal ${headText} uppercase tracking-tighter`}>Bulk Price Adjustment</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <span className={`h-2 w-2 rounded-full animate-pulse ${isSelectionMode ? 'bg-purple-500' : 'bg-blue-500'}`} />
                            <p className="text-[10px] text-slate-400 font-normal uppercase tracking-widest">
                                {isSelectionMode ? `Updating ${selectedIds.length} selected items` : "Updating items based on filters"}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className={`p-2 hover:${isDarkMode ? 'bg-white/10' : 'bg-slate-200'} rounded-full transition-colors text-slate-400`}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">

                    {/* 1. Filter Review/Change Section */}
                    {!isSelectionMode && (
                        <div className={`${isDarkMode ? 'bg-white/[0.03]' : 'bg-slate-50'} p-6 rounded-3xl border ${borderCol}`}>
                            <div className="flex items-center gap-2 mb-2">
                                <Filter size={14} className="text-blue-500" />
                                <span className="text-[10px] font-normal uppercase tracking-widest text-slate-500">Targeting Filters</span>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                <ModalFilterSelect name="shape" value={localFilters.shape} onChange={handleLocalFilterChange} options={["Round", "Emerald", "Pear", "Princess", "Oval"]} placeholder="All Shapes" isDarkMode={isDarkMode} />
                                <ModalFilterSelect name="color" value={localFilters.color} onChange={handleLocalFilterChange} options={["D", "E", "F", "G", "H"]} placeholder="All Colors" isDarkMode={isDarkMode} />
                                <ModalFilterSelect name="clarity" value={localFilters.clarity} onChange={handleLocalFilterChange} options={["FL", "IF", "VVS1", "VS1"]} placeholder="All Clarity" isDarkMode={isDarkMode} />
                                <ModalFilterSelect name="availability" value={localFilters.availability} onChange={handleLocalFilterChange} options={["Available", "Reserved", "Sold"]} placeholder="All Status" isDarkMode={isDarkMode} />
                                <div className="md:col-span-2">
                                    <input
                                        type="text"
                                        placeholder="Search filter..."
                                        value={localFilters.search || ""}
                                        onChange={(e) => setLocalFilters({ ...localFilters, search: e.target.value })}
                                        className={`w-full ${inputCls} rounded-xl py-2 px-4 text-[10px] font-normal outline-none focus:border-blue-500`}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 2. Price Configuration */}
                    <div className="grid grid-cols-1 gap-6">
                        <div className="bg-blue-600/5 border border-blue-500/20 p-6 rounded-3xl space-y-4">
                            <label className="text-[10px] font-normal uppercase text-blue-400 tracking-widest">Increase Price By (%)</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    required
                                    value={updateConfig.value}
                                    onChange={(e) => setUpdateConfig({ ...updateConfig, value: e.target.value })}
                                    placeholder="e.g. 10 for 10% increase"
                                    className={`w-full ${inputCls} rounded-2xl px-6 py-5 text-xl font-normal outline-none focus:border-blue-500 transition-all`}
                                />
                                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-blue-500 text-2xl font-normal">%</span>
                            </div>
                            <p className="text-[9px] text-slate-500 ">Example: Entering '10' will change a $1,000 diamond to $1,100.</p>
                        </div>
                    </div>

                    {/* Summary Warning */}
                    <div className="bg-amber-500/5 border border-amber-500/10 p-4 rounded-2xl flex gap-3">
                        <AlertCircle className="text-amber-500 shrink-0" size={18} />
                        <p className="text-[10px] leading-relaxed text-amber-200/70 font-normal">
                            Attention: This will modify <span className="text-amber-400 font-normal">{isSelectionMode ? selectedIds.length : 'all filtered'}</span> assets. This action cannot be undone.
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={!canSubmit}
                        className={`w-full py-5 rounded-2xl text-xs font-normal uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 ${!canSubmit
                            ? (isDarkMode ? 'bg-slate-800 text-slate-600' : 'bg-slate-100 text-slate-400')
                            : 'bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-600/20'
                            }`}
                    >
                        {isSubmitting ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <Zap size={16} fill="currentColor" />
                                Confirm & Update Inventory
                            </>
                        )}
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

const ModalFilterSelect = ({ name, value, onChange, options, placeholder, isDarkMode }) => (
    <div className="relative">
        <select
            name={name}
            value={value}
            onChange={onChange}
            className={`w-full appearance-none rounded-xl py-2 pl-3 pr-8 text-[9px] font-normal uppercase tracking-tighter transition-all cursor-pointer border focus:outline-none focus:border-blue-500 ${isDarkMode
                ? "bg-[#0B1219] border-slate-800 text-slate-400"
                : "bg-white border-slate-200 text-slate-600"
                }`}
        >
            <option value="">{placeholder}</option>
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
        <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" />
    </div>
);

