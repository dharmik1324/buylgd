import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState, useMemo, useRef } from "react";
import {
    fetchDiamonds,
    deleteDiamond,
    syncInventory,
    importInventoryFromCSV,
    clearInventory,
    fetchImportedFiles,
    clearByCSV,
    fetchSyncStatus
} from "../../store/diamondSlice";
import { ShapeIcon } from "../../components/diamond/DiamondShapeIcons";
import { CircleLoader } from "react-spinners";
import { AddDiamondModal } from "../../components/admin/appDiamondModal";
import { BulkUpdateModal } from "../../components/admin/BulkUpdateModal";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search, Plus, MoreVertical,
    ExternalLink, Trash2, Edit3, Filter, X, ChevronDown, Zap, Package, CheckCircle2, Clock, BarChart3,
    RefreshCw, Upload, Eye, Gem, Award, TrendingUp, Settings
} from "lucide-react";
import { InventoryApiModal } from "../../components/admin/InventoryApiModal";

export const Diamond = () => {
    const dispatch = useDispatch();
    const { data, loading, currentPage, totalPages, totalDiamonds, isSyncing } = useSelector(state => state.diamonds);
    const isDarkMode = useSelector(state => state.theme?.isDarkMode ?? true);

    const pageBg = isDarkMode ? "bg-[#0B1219] text-slate-300" : "bg-slate-50 text-slate-700";
    const cardBg = isDarkMode ? "bg-[#111922] border-slate-800" : "bg-white border-slate-200";
    const tableHdrBg = isDarkMode ? "bg-[#0F171F] border-slate-800" : "bg-slate-100 border-slate-200";
    const filterBarBg = isDarkMode ? "bg-[#111922] border-slate-800" : "bg-white border-slate-200";
    const inputBg = isDarkMode ? "bg-[#0B1219] border-slate-800 text-white" : "bg-slate-50 border-slate-300 text-slate-900";
    const headText = isDarkMode ? "text-white" : "text-slate-900";
    const rowBorder = isDarkMode ? "border-slate-800/40" : "border-slate-200/60";
    const rowHover = isDarkMode ? "hover:bg-white/[0.02]" : "hover:bg-blue-50/40";
    const imgBoxBg = isDarkMode ? "bg-[#0B1219] border-slate-800" : "bg-slate-100 border-slate-200";
    const paginationBg = isDarkMode ? "bg-[#0F171F] border-slate-800" : "bg-slate-100 border-slate-200";
    const menuBg = isDarkMode ? "bg-[#1A242F] border-slate-700" : "bg-white border-slate-200";

    const [page, setPage] = useState(1);
    const [limit] = useState(12);

    const [searchQuery, setSearchQuery] = useState("");
    const [filters, setFilters] = useState({
        shape: "",
        color: "",
        clarity: "",
        cut: "",
        availability: "",
        source: ""
    });

    const [sortOrder, setSortOrder] = useState('asc'); // Need to handle sorting logic if connected to backend or array processing

    const fileInputRef = useRef(null);

    const handleFileUpload = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            const formData = new FormData();
            files.forEach(file => {
                formData.append("files", file);
            });
            dispatch(importInventoryFromCSV(formData));
            // Reset input so the same files could be selected again if needed
            e.target.value = null;
        }
    };

    const [addOpen, setAddOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [bulkOpen, setBulkOpen] = useState(false);
    const [activeMenu, setActiveMenu] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);
    const [viewDiamond, setViewDiamond] = useState(null);
    const [clearOpen, setClearOpen] = useState(false);
    const [apiSettingsOpen, setApiSettingsOpen] = useState(false);


    const stats = useMemo(() => [
        { label: "Total Inventory", value: totalDiamonds, icon: <Package size={18} />, color: "text-blue-500", bg: "bg-blue-500/5" },
        { label: "Available", value: data.filter(d => ['available', 'in stock'].includes(d.Availability?.toLowerCase())).length, icon: <CheckCircle2 size={18} />, color: "text-emerald-400", bg: "bg-emerald-500/5" },
        { label: "Reserved", value: data.filter(d => d.Availability?.toLowerCase() === 'reserved' || d.onHold).length, icon: <Clock size={18} />, color: "text-amber-400", bg: "bg-amber-500/5" },
        { label: "Selection", value: selectedIds.length, icon: <BarChart3 size={18} />, color: "text-purple-400", bg: "bg-purple-500/5" },
    ], [data, totalDiamonds, selectedIds]);

    const prevSyncingRef = useRef(isSyncing);

    useEffect(() => {
        // Trigger initial background sync on mount for "Admin clarification"
        dispatch(syncInventory());

        // Polling loop for status
        const interval = setInterval(() => {
            dispatch(fetchSyncStatus());
        }, 5000);

        return () => clearInterval(interval);
    }, [dispatch]);

    // Handle data refresh when syncing FINISHES
    useEffect(() => {
        if (prevSyncingRef.current === true && isSyncing === false) {
            console.log("[DASHBOARD] Sync finished, refreshing data...");
            dispatch(fetchDiamonds({ page, limit, search: searchQuery, ...filters }));
        }
        prevSyncingRef.current = isSyncing;
    }, [isSyncing, dispatch, page, limit, searchQuery, filters]);

    useEffect(() => {
        dispatch(fetchDiamonds({
            page,
            limit,
            search: searchQuery,
            ...filters
        }));
    }, [dispatch, page, limit, searchQuery, filters]);

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedIds(data.map(item => item._id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectItem = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
        setPage(1);
        setSelectedIds([]);
    };

    const resetFilters = () => {
        setSearchQuery("");
        setFilters({ shape: "", color: "", clarity: "", cut: "", availability: "", source: "" });
        setPage(1);
        setSelectedIds([]);
    };

    const handleLoadMore = () => {
        if (!loading && currentPage < totalPages) {
            setPage(prev => prev + 1);
        }
    };

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to remove this asset from inventory?")) {
            dispatch(deleteDiamond(id));
            setActiveMenu(null);
        }
    };

    const handleOpenEdit = (item) => {
        setSelectedItem(item);
        setEditOpen(true);
        setActiveMenu(null);
    };

    const handleOpenView = (item) => {
        setViewDiamond(item);
        setActiveMenu(null);
    };

    const getStatusStyle = (status) => {
        switch (status?.toLowerCase()) {
            case 'available': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            case 'reserved': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
            case 'sold': return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
            default: return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
        }
    };

    if (loading && data.length === 0) {
        return (
            <div className={`flex-1 min-h-screen p-8 transition-colors duration-300 ${pageBg}`}>
                <div className="mb-10 space-y-3">
                    <div className={`h-8 w-64 rounded animate-pulse ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`} />
                    <div className={`h-4 w-96 rounded animate-pulse ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className={`border p-5 rounded-2xl ${cardBg}`}>
                            <div className={`h-3 w-24 rounded mb-3 animate-pulse ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`} />
                            <div className={`h-6 w-16 rounded animate-pulse ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`} />
                        </div>
                    ))}
                </div>
                <div className={`border rounded-3xl p-6 space-y-6 ${cardBg}`}>
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="flex items-center space-x-6">
                            <div className={`w-4 h-4 rounded animate-pulse ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`} />
                            <div className={`w-24 h-4 rounded animate-pulse ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`} />
                            <div className={`w-12 h-12 rounded-xl animate-pulse ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`} />
                            <div className={`flex-1 h-4 rounded animate-pulse ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`} />
                            <div className={`w-16 h-4 rounded animate-pulse ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`} />
                            <div className={`w-20 h-4 rounded animate-pulse ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`} />
                            <div className={`w-24 h-4 rounded animate-pulse ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`} />
                        </div>
                    ))}
                </div>
            </div>
        );
    }


    return (
        <div className={`flex-1 min-h-screen p-8 font-sans transition-colors duration-300 ${pageBg}`}>
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                <div>
                    <h1 className={`text-3xl sm:text-4xl font-normal tracking-tight flex items-center gap-3 ${headText}`}>
                        Asset Repository
                        <span className="text-sm px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 font-bold border border-blue-500/20">
                            {totalDiamonds?.toLocaleString() || 0}
                        </span>
                        {isSyncing && (
                            <motion.div 
                                animate={{ rotate: 360 }} 
                                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                                className="text-emerald-500"
                            >
                                <RefreshCw size={18} />
                            </motion.div>
                        )}
                    </h1>
                    <p className="text-sm text-slate-500 mt-2 uppercase tracking-widest font-normal">
                        {isSyncing ? "Vault Synchronization in Progress..." : "Vault Transaction Monitoring"}
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                    <button
                        onClick={() => setClearOpen(true)}
                        disabled={loading}
                        className={`flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-normal uppercase tracking-widest transition-all border border-red-500/20 text-red-500 ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-100 hover:bg-slate-200'} disabled:opacity-50`}
                    >
                        <Trash2 size={16} />
                        <span>Clear csv</span>
                    </button>
                    <input
                        type="file"
                        accept=".csv"
                        multiple
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        onChange={handleFileUpload}
                    />
                    <button
                        onClick={() => fileInputRef.current.click()}
                        disabled={loading}
                        className={`flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-normal uppercase tracking-widest transition-all border border-blue-500/20 text-blue-400 ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-100 hover:bg-slate-200'} disabled:opacity-50`}
                    >
                        <Upload size={16} />
                        <span>Import CSV</span>
                    </button>
                    <button
                        onClick={() => dispatch(fetchDiamonds({ page, limit, search: searchQuery, ...filters }))}
                        disabled={loading}
                        className={`flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-normal uppercase tracking-widest transition-all border border-blue-500/20 text-blue-400 ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-100 hover:bg-slate-200'} disabled:opacity-50`}
                    >
                        <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                        <span>Refresh</span>
                    </button>
                    <button
                        onClick={() => dispatch(syncInventory())}
                        disabled={loading || isSyncing}
                        className={`flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-normal uppercase tracking-widest transition-all border border-emerald-500/20 text-emerald-400 ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-100 hover:bg-slate-200'} disabled:opacity-50 relative`}
                    >
                        <RefreshCw size={16} className={(loading || isSyncing) ? "animate-spin" : ""} />
                        <span>{isSyncing ? "Syncing..." : "Sync HTTP"}</span>
                    </button>
                    <button
                        onClick={() => setApiSettingsOpen(true)}
                        className={`flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-normal uppercase tracking-widest transition-all border border-slate-500/20 text-slate-400 ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-100 hover:bg-slate-200'}`}
                    >
                        <Settings size={16} />
                        <span>API Settings</span>
                    </button>
                    <button

                        onClick={() => {
                            setFilters(prev => ({ ...prev, source: prev.source === 'CSV' ? '' : 'CSV' }));
                            setPage(1);
                        }}
                        disabled={loading}
                        className={`flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-normal uppercase tracking-widest transition-all border ${filters.source === 'CSV' ? 'border-amber-500 bg-amber-500/10 text-amber-500' : 'border-blue-500/20 text-blue-400 ' + (isDarkMode ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-100 hover:bg-slate-200')} disabled:opacity-50`}
                    >
                        {/* <Upload size={16} /> */}
                        <span>{filters.source === 'CSV' ? 'Full inventory' : 'Show CSV Only'}</span>
                    </button>
                    <button
                        onClick={() => setBulkOpen(true)}
                        className={`flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-normal uppercase tracking-widest transition-all border border-blue-500/20 text-blue-400 ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-100 hover:bg-slate-200'}`}
                    >
                        <Zap size={16} />
                        <span>Bulk Update {selectedIds.length > 0 && `(${selectedIds.length})`}</span>
                    </button>
                    <button onClick={() => setAddOpen(true)} className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-xs font-normal uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20 active:scale-95">
                        <Plus size={16} />
                        <span>Add Asset</span>
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {stats.map((stat, i) => (
                    <div key={i} className={`border p-6 rounded-2xl relative overflow-hidden group ${cardBg}`}>
                        <div className={`absolute top-0 right-0 p-5 opacity-10 group-hover:opacity-20 transition-opacity ${stat.color}`}>
                            {stat.icon}
                        </div>
                        <p className="text-xs font-normal uppercase tracking-[0.15em] text-slate-500 mb-2">{stat.label}</p>
                        <h3 className={`text-3xl font-normal ${stat.color}`}>{stat.value.toLocaleString()}</h3>
                    </div>
                ))}
            </div>

            <div className={`flex flex-col lg:flex-row items-stretch lg:items-center gap-4 mb-8 p-4 sm:p-6 rounded-3xl border border-blue-500/5 ${filterBarBg}`}>
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input
                        type="text"
                        placeholder="Search by Asset ID, Shape, or GIA #..."
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                        className={`w-full border rounded-xl py-3 pl-10 pr-4 text-xs font-normal focus:outline-none focus:border-blue-500 transition-all ${inputBg}`}
                    />
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <FilterSelect name="shape" value={filters.shape} onChange={handleFilterChange} options={["Round", "Emerald", "Pear", "Princess", "Oval", "Heart", "Marquise"]} placeholder="Shapes" />
                    <FilterSelect name="color" value={filters.color} onChange={handleFilterChange} options={["D", "E", "F", "G", "H", "I", "J", "K"]} placeholder="Color" />
                    <FilterSelect name="clarity" value={filters.clarity} onChange={handleFilterChange} options={["FL", "IF", "VVS1", "VVS2", "VS1", "VS2", "SI1", "SI2"]} placeholder="Clarity" />
                    <FilterSelect name="cut" value={filters.cut} onChange={handleFilterChange} options={["Excellent", "Very Good", "Good", "Fair"]} placeholder="Cut" />
                    <FilterSelect name="availability" value={filters.availability} onChange={handleFilterChange} options={["Available", "Reserved", "Sold"]} placeholder="Status" />

                    {(searchQuery || Object.values(filters).some(v => v !== "")) && (
                        <button onClick={resetFilters} className="w-full sm:w-auto mt-2 sm:mt-0 flex items-center justify-center gap-2 px-4 py-2.5 text-[10px] font-normal uppercase text-red-500 hover:text-red-400 transition-colors bg-red-500/5 rounded-xl border border-red-500/10">
                            <X size={14} /> Clear
                        </button>
                    )}
                </div>
            </div>

            <div className={`border rounded-3xl overflow-visible shadow-2xl relative ${cardBg}`}>
                <div className="overflow-x-auto overflow-y-visible">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                        <thead className={`border-b ${tableHdrBg}`}>
                            <tr>
                                <th className="px-8 py-5 w-10">
                                    <input
                                        type="checkbox"
                                        checked={data.length > 0 && selectedIds.length === data.length}
                                        onChange={handleSelectAll}
                                        className="w-4 h-4 rounded border-slate-700 bg-[#0B1219] text-blue-600 focus:ring-blue-500 transition-all cursor-pointer"
                                    />
                                </th>
                                <th className="px-8 py-5 text-[10px] font-normal uppercase tracking-[0.2em] text-slate-500">Asset ID</th>
                                <th className="px-8 py-5 text-[10px] font-normal uppercase tracking-[0.2em] text-slate-500">Diamond Details</th>
                                <th className="px-8 py-5 text-[10px] font-normal uppercase tracking-[0.2em] text-slate-500">Shape</th>
                                <th className="px-8 py-5 text-[10px] font-normal uppercase tracking-[0.2em] text-slate-500">Specifications</th>
                                <th className="px-8 py-5 text-[10px] font-normal uppercase tracking-[0.2em] text-slate-500">Certification</th>
                                <th className="px-8 py-5 text-[10px] font-normal uppercase tracking-[0.2em] text-slate-500">Valuation</th>
                                <th className="px-8 py-5 text-[10px] font-normal uppercase tracking-[0.2em] text-slate-500 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <AnimatePresence>
                                {data.map((item, idx) => (
                                    <motion.tr
                                        key={item._id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        onClick={() => handleOpenView(item)}
                                        className={`border-b ${rowBorder} ${rowHover} transition-colors group relative cursor-pointer ${selectedIds.includes(item._id) ? 'bg-blue-600/5' : ''}`}
                                    >
                                        <td className="px-8 py-6" onClick={(e) => e.stopPropagation()}>
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(item._id)}
                                                onChange={() => handleSelectItem(item._id)}
                                                className="w-4 h-4 rounded border-slate-700 bg-[#0B1219] text-blue-600 focus:ring-blue-500 transition-all cursor-pointer"
                                            />
                                        </td>
                                        <td className={`px-8 py-6 text-xs font-normal ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>
                                            {item.Stock_No || `BLG-${1000 + idx}`}
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center space-x-4">
                                                <div className={`w-12 h-12 rounded-xl border flex items-center justify-center overflow-hidden shrink-0 group-hover:border-blue-500/50 transition-colors ${imgBoxBg}`}>
                                                    {item.Diamond_Image ? (
                                                        <img src={item.Diamond_Image} alt="" loading="lazy" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <ShapeIcon shape={item.Shape} className={`w-1/2 h-1/2 ${isDarkMode ? "text-slate-700" : "text-slate-200"}`} />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className={`text-sm font-normal ${headText}`}>{item.Weight} ct {item.Shape}</p>
                                                    <p className="text-[10px] text-slate-500 font-normal uppercase tracking-wider mt-0.5">Natural Mined</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className={`px-8 py-6 text-sm font-normal ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{item.Shape}</td>
                                        <td className="px-8 py-6">
                                            <div className="flex space-x-1.5">
                                                <SpecBadge label={item.Color} color="blue" />
                                                <SpecBadge label={item.Clarity} color="slate" />
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center space-x-2 text-xs font-normal text-slate-500">
                                                <ExternalLink size={14} className="text-blue-500" />
                                                <span>GIA {item.Certificate_No || "N/A"}</span>
                                            </div>
                                        </td>
                                        <td className={`px-8 py-6 text-sm font-normal ${headText}`}>
                                            ${Number(item.Final_Price || item.Price || 0).toLocaleString()}
                                        </td>
                                        <td className="px-8 py-6 text-right relative overflow-visible">
                                            <div className="flex items-center justify-end space-x-4">
                                                <span className={`px-4 py-1.5 rounded-lg text-[9px] font-normal uppercase tracking-widest border ${getStatusStyle(item.Availability)}`}>
                                                    {item.Availability || "Available"}
                                                </span>
                                                <div className="relative" onClick={(e) => e.stopPropagation()}>
                                                    <button
                                                        onClick={() => setActiveMenu(activeMenu === item._id ? null : item._id)}
                                                        className={`p-2 rounded-lg text-slate-500 transition-all ${isDarkMode ? 'hover:bg-[#111111] hover:text-white' : 'hover:bg-slate-100 hover:text-slate-900'}`}
                                                    >
                                                        <MoreVertical size={20} />
                                                    </button>
                                                    <AnimatePresence>
                                                        {activeMenu === item._id && (() => {
                                                            const isLastFew = idx >= (data?.length || 0) - 2 && (data?.length || 0) > 3;
                                                            return (
                                                                <div key={`menu-${item._id}`}>
                                                                    <div className="fixed inset-0 z-10" onClick={() => setActiveMenu(null)} />
                                                                    <motion.div
                                                                        initial={{ opacity: 0, scale: 0.9, y: isLastFew ? -10 : 10 }}
                                                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                                                        exit={{ opacity: 0, scale: 0.9, y: isLastFew ? -10 : 10 }}
                                                                        className={`absolute right-0 ${isLastFew ? 'bottom-full mb-2' : 'top-full mt-2'} w-44 border rounded-xl shadow-2xl z-20 py-2 overflow-hidden text-left ${menuBg}`}
                                                                    >
                                                                        <button onClick={() => handleOpenView(item)} className={`w-full flex items-center space-x-3 px-4 py-2.5 text-xs font-normal transition-colors hover:bg-blue-600 hover:text-white ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                                                                            <Eye size={14} />
                                                                            <span>View Details</span>
                                                                        </button>
                                                                        <button onClick={() => handleOpenEdit(item)} className={`w-full flex items-center space-x-3 px-4 py-2.5 text-xs font-normal transition-colors hover:bg-blue-600 hover:text-white ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                                                                            <Edit3 size={14} />
                                                                            <span>Modify Asset</span>
                                                                        </button>
                                                                        <button onClick={() => handleDelete(item._id)} className="w-full flex items-center space-x-3 px-4 py-2.5 text-xs font-normal text-red-400 hover:bg-red-500/10 transition-colors">
                                                                            <Trash2 size={14} />
                                                                            <span>Remove</span>
                                                                        </button>
                                                                    </motion.div>
                                                                </div>
                                                            )
                                                        })()}
                                                    </AnimatePresence>
                                                </div>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>

                {/* Pagination Footer */}
                <div className={`p-8 flex flex-col items-center border-t rounded-b-3xl ${paginationBg}`}>
                    {currentPage < totalPages ? (
                        <button onClick={handleLoadMore} disabled={loading} className={`group px-12 py-3 bg-transparent border rounded-full transition-all duration-300 active:scale-95 disabled:opacity-50 ${isDarkMode ? 'border-slate-800 hover:border-blue-500' : 'border-slate-300 hover:border-blue-500'}`}>
                            <div className="flex items-center space-x-3">
                                {loading ? <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /> : <div className="w-1.5 h-1.5 rounded-full bg-blue-500 group-hover:animate-ping" />}
                                <span className={`text-[10px] font-normal uppercase tracking-[0.3em] ${headText}`}>{loading ? "Updating..." : "Load More Assets"}</span>
                            </div>
                        </button>
                    ) : (
                        <p className="text-[10px] font-normal uppercase tracking-[0.2em] text-slate-600">All {totalDiamonds} assets displayed</p>
                    )}
                </div>
            </div>

            {/* Modals */}
            <AddDiamondModal
                open={addOpen || editOpen}
                onClose={() => {
                    setAddOpen(false);
                    setEditOpen(false);
                    setSelectedItem(null);
                }}
                editData={selectedItem}
            />

            <BulkUpdateModal
                open={bulkOpen}
                onClose={() => {
                    setBulkOpen(false);
                    setSelectedIds([]);
                }}
                currentFilters={{ search: searchQuery, ...filters }}
                selectedIds={selectedIds}
                totalMatches={totalDiamonds}
            />

            {/* Diamond Detail View Modal */}
            <AdminDiamondViewModal
                diamond={viewDiamond}
                isDarkMode={isDarkMode}
                onClose={() => setViewDiamond(null)}
                onEdit={(d) => { setViewDiamond(null); handleOpenEdit(d); }}
            />

            <ClearCSVModal
                open={clearOpen}
                onClose={() => setClearOpen(false)}
                isDarkMode={isDarkMode}
            />

            <InventoryApiModal
                open={apiSettingsOpen}
                onClose={() => setApiSettingsOpen(false)}
            />
        </div>

    );
};

/* ─── Clear CSV Modal ────────────────────────────── */
const ClearCSVModal = ({ open, onClose, isDarkMode }) => {
    const dispatch = useDispatch();
    const { importedFiles, loading } = useSelector(state => state.diamonds);
    const bg = isDarkMode ? "bg-[#0F171F]" : "bg-white";
    const border = isDarkMode ? "border-slate-800" : "border-slate-200";
    const textMain = isDarkMode ? "text-white" : "text-slate-900";
    const cardItemBg = isDarkMode ? "bg-slate-900/50 hover:bg-slate-900/80" : "bg-slate-50 hover:bg-slate-100";

    useEffect(() => {
        if (open) {
            dispatch(fetchImportedFiles());
        }
    }, [dispatch, open]);

    const handleClearSpecific = (filename) => {
        if (window.confirm(`Are you sure you want to remove all diamonds imported from "${filename}"?`)) {
            dispatch(clearByCSV(filename));
        }
    };

    const handleClearAll = () => {
        if (window.confirm("Are you sure you want to completely clear the entire inventory? This action cannot be reversed!")) {
            dispatch(clearInventory());
        }
    };

    if (!open) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className={`relative w-full max-w-lg rounded-[24px] border shadow-2xl overflow-hidden ${bg} ${border}`}
                >
                    <div className={`px-6 py-5 border-b flex justify-between items-center ${border}`}>
                        <div className="flex items-center gap-3">
                            <Trash2 size={20} className="text-red-500" />
                            <h2 className={`text-lg font-normal ${textMain}`}>Clear Inventory</h2>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-slate-800/50 rounded-lg transition-colors text-slate-500">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="p-6">
                        <div className="flex flex-col gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            <div className="flex justify-between items-center mb-2">
                                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Imported Batch Files</p>
                                <button
                                    onClick={handleClearAll}
                                    className="text-[10px] uppercase tracking-widest text-red-500 hover:underline font-bold"
                                >
                                    Clear All Data
                                </button>
                            </div>

                            {importedFiles.length === 0 ? (
                                <div className="text-center py-12 border border-dashed rounded-2xl border-slate-800">
                                    <Package className="mx-auto mb-3 text-slate-700" size={32} />
                                    <p className="text-sm text-slate-500">No imported files found</p>
                                </div>
                            ) : (
                                importedFiles.map((file, i) => (
                                    <div key={i} className={`p-4 rounded-2xl border transition-all flex items-center justify-between group ${cardItemBg} ${border}`}>
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                                                <Upload size={18} />
                                            </div>
                                            <div>
                                                <p className={`text-sm font-normal truncate max-w-[200px] ${textMain}`}>{file.filename || "Unknown File"}</p>
                                                <p className="text-[10px] text-slate-500 uppercase tracking-tight">
                                                    {file.count} diamonds • {new Date(file.lastImport).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleClearSpecific(file.filename)}
                                            disabled={loading}
                                            className="p-2.5 rounded-xl bg-red-500/10 text-red-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"
                                            title="Remove this batch"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className={`p-6 border-t ${border} bg-slate-900/10 flex gap-3`}>
                        <button
                            onClick={onClose}
                            className={`flex-1 py-3 rounded-xl border text-xs font-bold uppercase tracking-widest transition-all ${isDarkMode ? "border-slate-700 text-slate-400 hover:bg-slate-800" : "border-slate-200 text-slate-500 hover:bg-slate-50"}`}
                        >
                            Close
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

/* ─── Admin Diamond View Modal ───────────────────────────── */
const AdminDiamondViewModal = ({ diamond, isDarkMode, onClose, onEdit }) => {
    if (!diamond) return null;

    const bg = isDarkMode ? "bg-[#0F171F]" : "bg-white";
    const border = isDarkMode ? "border-slate-800" : "border-slate-200";
    const textMain = isDarkMode ? "text-white" : "text-slate-900";
    const textSub = isDarkMode ? "text-slate-400" : "text-slate-500";
    const gridCell = isDarkMode ? "border-slate-800 bg-slate-900/30" : "border-slate-100 bg-slate-50/60";

    const specs = [
        { label: "Shape", value: diamond.Shape },
        { label: "Carat", value: diamond.Weight ? `${diamond.Weight} ct` : null },
        { label: "Color", value: diamond.Color },
        { label: "Clarity", value: diamond.Clarity },
        { label: "Cut", value: diamond.Cut },
        { label: "Polish", value: diamond.Polish },
        { label: "Symmetry", value: diamond.Symmetry },
        { label: "Table %", value: diamond.table_name },
        { label: "Depth %", value: diamond.Depth },
        { label: "Girdle", value: diamond.Girdle },
        { label: "Fluorescence", value: diamond.Fluorescence },
        { label: "Lab", value: diamond.Lab },
        { label: "Report #", value: diamond.Report },
        { label: "Location", value: diamond.Location },
        { label: "Stock #", value: diamond.Stock || diamond.Stock_No },
        { label: "Availability", value: diamond.Availability },
    ];

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center p-0 sm:p-6">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                />

                {/* Panel */}
                <motion.div
                    initial={{ y: 80, opacity: 0, scale: 0.97 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: 80, opacity: 0, scale: 0.97 }}
                    transition={{ type: "spring", damping: 28, stiffness: 300 }}
                    className={`relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-t-[32px] sm:rounded-[32px] border shadow-2xl ${bg} ${border}`}
                >
                    {/* Mobile handle */}
                    <div className="flex justify-center pt-4 sm:hidden">
                        <div className={`w-12 h-1 rounded-full ${isDarkMode ? "bg-slate-700" : "bg-slate-300"}`} />
                    </div>

                    {/* Header */}
                    <div className={`flex items-center justify-between px-6 pt-6 pb-5 border-b ${border}`}>
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-500">
                                <Gem size={20} />
                            </div>
                            <div>
                                <h2 className={`text-lg font-normal uppercase tracking-tight ${textMain}`}>
                                    {diamond.Weight} ct {diamond.Shape}
                                </h2>
                                <p className="text-[10px] uppercase tracking-widest text-blue-500">
                                    {diamond.Stock || diamond.Stock_No ? `Stock #${diamond.Stock || diamond.Stock_No}` : diamond.Lab || "Diamond Detail"}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={onClose}
                                className={`p-2 rounded-xl transition-all ${isDarkMode ? "hover:bg-slate-800 text-slate-400" : "hover:bg-slate-100 text-slate-500"
                                    }`}
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Image + Pricing Hero */}
                        <div className={`rounded-2xl border ${border} overflow-hidden`}>
                            <div className={`flex flex-col sm:flex-row gap-0`}>
                                {/* Image */}
                                <div className={`w-full sm:w-44 flex-shrink-0 flex items-center justify-center p-6 ${isDarkMode ? "bg-gradient-to-br from-slate-900 to-[#0B1219]" : "bg-gradient-to-br from-slate-100 to-white"
                                    }`}>
                                    {diamond.Diamond_Image ? (
                                        <img src={diamond.Diamond_Image} className="w-32 h-32 object-contain drop-shadow-2xl" alt="" />
                                    ) : (
                                        <ShapeIcon shape={diamond.Shape} className={`w-28 h-28 ${isDarkMode ? "text-slate-800" : "text-slate-200"
                                            }`} />
                                    )}
                                </div>

                                {/* Price + status */}
                                <div className={`flex-1 p-6 border-t sm:border-t-0 sm:border-l ${border}`}>
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        <span className={`text-[9px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest border ${diamond.Availability?.toLowerCase() === 'available'
                                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                            : diamond.Availability?.toLowerCase() === 'reserved'
                                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                                : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                                            }`}>
                                            {diamond.Availability || "Available"}
                                        </span>
                                        {diamond.Lab && (
                                            <span className="text-[9px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest border bg-blue-500/10 text-blue-400 border-blue-500/20">
                                                {diamond.Lab}
                                            </span>
                                        )}
                                        {diamond.onHold && (
                                            <span className="text-[9px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest border bg-orange-500/10 text-orange-400 border-orange-500/20">
                                                On Hold
                                            </span>
                                        )}
                                    </div>
                                    <p className={`text-[10px] uppercase tracking-widest ${textSub} mb-1`}>Total Valuation</p>
                                    <p className={`text-3xl font-bold ${isDarkMode ? "text-blue-400" : "text-blue-600"
                                        }`}>
                                        ${Number(diamond.Final_Price || diamond.Price || 0).toLocaleString()}
                                    </p>
                                    {diamond.Price_Per_Carat && (
                                        <p className={`text-xs mt-1 ${textSub}`}>
                                            ${Number(diamond.Price_Per_Carat).toFixed(2)} per carat
                                        </p>
                                    )}
                                    {diamond.Report && (
                                        <div className={`mt-4 flex items-center gap-2 text-xs ${textSub}`}>
                                            <Award size={14} className="text-amber-400" />
                                            <span>Certificate: <span className={textMain}>{diamond.Report}</span></span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Specs Grid */}
                        <div className={`rounded-2xl border ${border} overflow-hidden`}>
                            <div className={`px-4 py-3 border-b ${border} ${isDarkMode ? "bg-slate-900/40" : "bg-slate-50"
                                }`}>
                                <span className={`text-[10px] font-bold uppercase tracking-widest ${textSub}`}>Full Specifications</span>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4">
                                {specs.map(({ label, value }) => (
                                    <div key={label} className={`px-4 py-3 border-b border-r ${border}`}>
                                        <p className={`text-[9px] uppercase tracking-widest font-bold mb-0.5 ${isDarkMode ? "text-slate-600" : "text-slate-400"
                                            }`}>{label}</p>
                                        <p className={`text-xs font-normal ${value ? textMain : (isDarkMode ? "text-slate-700" : "text-slate-300")
                                            }`}>{value || "—"}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Bottom actions */}
                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                className={`w-full py-3 rounded-2xl border text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${isDarkMode ? "border-slate-700 text-slate-400 hover:bg-slate-800" : "border-slate-200 text-slate-500 hover:bg-slate-50"
                                    }`}
                            >
                                <X size={14} /> Close
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

const FilterSelect = ({ name, value, onChange, options, placeholder }) => {
    const isDarkMode = useSelector(state => state.theme?.isDarkMode ?? true);
    return (
        <div className="relative">
            <select
                name={name}
                value={value}
                onChange={onChange}
                className={`appearance-none border rounded-xl py-2.5 pl-4 pr-10 text-[10px] font-normal uppercase tracking-widest focus:outline-none focus:border-blue-500 transition-all cursor-pointer ${isDarkMode
                    ? 'bg-[#0B1219] border-slate-800 text-slate-400'
                    : 'bg-white border-slate-300 text-slate-600'
                    }`}
            >
                <option value="">{placeholder}</option>
                {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
        </div>
    );
};

const SpecBadge = ({ label, color }) => {
    const isDarkMode = useSelector(state => state.theme?.isDarkMode ?? true);
    return (
        <span className={`px-2.5 py-1 rounded-md text-[9px] font-normal border transition-all ${color === 'blue'
            ? 'bg-blue-600/10 text-blue-400 border-blue-500/20'
            : isDarkMode
                ? 'bg-slate-800 text-slate-400 border-slate-700'
                : 'bg-slate-100 text-slate-600 border-slate-300'
            }`}>
            {label || "N/A"}
        </span>
    );
};

