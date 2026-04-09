import React, { useState, useCallback, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ShapeIcon } from "./DiamondShapeIcons";
import squareRadiantImg from "../../assets/shapes/square_radiant.png";
import oldMinerImg from "../../assets/shapes/old_miner.png";
import europeanCutImg from "../../assets/shapes/european_cut.png";
import roseImg from "../../assets/shapes/rose.png";
import triangularImg from "../../assets/shapes/triangular.png";
import cushionModifiedImg from "../../assets/shapes/cushion_modified.png";
import { Search, Loader2, Mic } from "lucide-react";
import api from "../../services/api";
import { setCurrentFilters } from "../../store/diamondSlice";

export const FilterDetails = ({ metadata = {}, filters: propFilters, resultsCount, loading, isDarkMode }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const companySlug = user?.companyName?.toLowerCase().replace(/\s+/g, '-') || "user";

    const [liveCount, setLiveCount] = useState(resultsCount || 0);
    const [isCountLoading, setIsCountLoading] = useState(true);
    const debounceTimeoutRef = useRef(null);
    const isFirstRender = useRef(true);

    const {
        shapes = Array.from(new Set([
            "ROUND", "PRINCESS", "OVAL", "MARQUISE", "EMERALD", "PEAR", "RADIANT", "CUSHION",
            "HEART", "ASSCHER", "CUSHION MODIFIED", "EUROPEAN CUT", "OLD MINER", "ROSE",
            "SQUARE RADIANT", "TRIANGULAR", "BAGUETTE", "TAPERED BAGUETTE", "TRILLION",
            "SHIELD", "HEXAGONAL", "TRAPEZOID", "KITE", "HALF MOON", "BULLET"
        ])),
        colors = ["D", "E", "F", "G", "H", "I", "J"],
        clarities = ["IF", "VVS1", "VVS2", "VS1", "VS2", "SI1"],
        cuts = ["ID", "EX", "VG"],
        polish = ["EX", "VG"],
        symmetry = ["EX", "VG"],
        tinges = ["RGB", "NONE"],
        locations = ["MUMBAI", "SURAT", "USA", "HK", "EXHB"],
        priceMin: metaPriceMin = 0,
        priceMax: metaPriceMax = 0,
        caratMin: metaCaratMin = 0,
        caratMax: metaCaratMax = 0,
        tableMin: metaTableMin = 0,
        tableMax: metaTableMax = 0,
        depthMin: metaDepthMin = 0,
        depthMax: metaDepthMax = 0,
        ratioMin: metaRatioMin = 0,
        ratioMax: metaRatioMax = 0,
        hasCarat = true,
    } = metadata;

    const initialFilters = {
        shapes: [],
        colors: [],
        clarities: [],
        cuts: [],
        polish: [],
        symmetry: [],
        priceMin: 0,
        priceMax: 0,
        caratMin: 0,
        caratMax: 0,
        tableMin: 0,
        tableMax: 0,
        depthMin: 0,
        depthMax: 0,
        ratioMin: 0,
        ratioMax: 0,
        tinge: [],
        location: [],
        search: "",
        ...propFilters
    };

    const [filters, setFilters] = useState(initialFilters);

    const uniqueShapes = useMemo(() => {
        const seen = new Set();
        const excluded = ['cm-b', 'sqcu'];
        return shapes.filter(shape => {
            if (!shape) return false;
            const lower = shape.toLowerCase().trim();
            if (excluded.includes(lower) || seen.has(lower)) return false;
            seen.add(lower);
            return true;
        });
    }, [shapes]);

    const updateFilters = useCallback((updates) => {
        setFilters((prev) => ({ ...prev, ...updates }));
        setError("");
    }, []);

    const buildParams = (filtersObj) => {
        const params = { limit: 1 };

        if (filtersObj.shapes?.length) params.shapes = filtersObj.shapes.join(",");
        if (filtersObj.colors?.length) params.colors = filtersObj.colors.join(",");
        if (filtersObj.clarities?.length) params.clarities = filtersObj.clarities.join(",");
        if (filtersObj.cuts?.length) params.cuts = filtersObj.cuts.join(",");
        if (filtersObj.polish?.length) params.polish = filtersObj.polish.join(",");
        if (filtersObj.symmetry?.length) params.symmetry = filtersObj.symmetry.join(",");
        if (filtersObj.tinge?.length) params.tinge = filtersObj.tinge.join(",");
        if (filtersObj.location?.length) params.location = filtersObj.location.join(",");
        if (filtersObj.search) params.search = filtersObj.search;

        // Range filters — only send if non-zero and non-empty
        if (filtersObj.priceMin && filtersObj.priceMin !== "") params.priceMin = filtersObj.priceMin;
        if (filtersObj.priceMax && filtersObj.priceMax !== "") params.priceMax = filtersObj.priceMax;
        if (filtersObj.caratMin && filtersObj.caratMin !== "") params.caratMin = filtersObj.caratMin;
        if (filtersObj.caratMax && filtersObj.caratMax !== "") params.caratMax = filtersObj.caratMax;
        if (filtersObj.tableMin && filtersObj.tableMin !== "") params.tableMin = filtersObj.tableMin;
        if (filtersObj.tableMax && filtersObj.tableMax !== "") params.tableMax = filtersObj.tableMax;
        if (filtersObj.depthMin && filtersObj.depthMin !== "") params.depthMin = filtersObj.depthMin;
        if (filtersObj.depthMax && filtersObj.depthMax !== "") params.depthMax = filtersObj.depthMax;
        if (filtersObj.ratioMin && filtersObj.ratioMin !== "") params.ratioMin = filtersObj.ratioMin;
        if (filtersObj.ratioMax && filtersObj.ratioMax !== "") params.ratioMax = filtersObj.ratioMax;

        return params;
    };

    React.useEffect(() => {
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }

        // First render: fetch immediately to show real total count
        const delay = isFirstRender.current ? 0 : 500;
        isFirstRender.current = false;

        setIsCountLoading(true);

        debounceTimeoutRef.current = setTimeout(async () => {
            try {
                const params = buildParams(filters);
                const res = await api.get("/admin/diamonds", { params });
                if (res.data?.success) {
                    setLiveCount(res.data.pagination.totalDiamonds);
                }
            } catch (err) {
                console.error("Failed to fetch count", err);
            } finally {
                setIsCountLoading(false);
            }
        }, delay);

        dispatch(setCurrentFilters(filters));

        return () => {
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }
        };
    }, [filters, dispatch]);

    const toggleArrayFilter = useCallback((key, value) => {
        setFilters(prev => {
            const current = prev[key] || [];
            const valueLower = value.toLowerCase();
            const exists = current.some(item =>
                typeof item === 'string' ? item.toLowerCase() === valueLower : item === value
            );

            return {
                ...prev,
                [key]: exists
                    ? current.filter(item =>
                        typeof item === 'string' ? item.toLowerCase() !== valueLower : item !== value
                    )
                    : [...current, value]
            };
        });
        setError("");
    }, []);

    const handleRangeChange = useCallback((field, value, type) => {
        // Allow empty string to clear the field
        if (value === "" || value === null || value === undefined) {
            const minKey = `${field}Min`;
            const maxKey = `${field}Max`;
            updateFilters({ [type === "min" ? minKey : maxKey]: "" });
            return;
        }

        const numValue = Number(value);
        if (isNaN(numValue)) return;

        const minKey = `${field}Min`;
        const maxKey = `${field}Max`;

        // Free entry — no clamping, user can type max before min or vice versa
        if (type === "min") {
            updateFilters({ [minKey]: numValue });
        } else {
            updateFilters({ [maxKey]: numValue });
        }
    }, [updateFilters]);

    const handleApplyFilter = async () => {
        if (liveCount > 2000) return;

        setError("");

        if (user?._id) {
            try {
                const filtersToSave = { ...filters };
                if (filtersToSave.shapes?.length) filtersToSave.shapes = filtersToSave.shapes.join(",");
                if (filtersToSave.colors?.length) filtersToSave.colors = filtersToSave.colors.join(",");
                if (filtersToSave.clarities?.length) filtersToSave.clarities = filtersToSave.clarities.join(",");
                if (filtersToSave.cuts?.length) filtersToSave.cuts = filtersToSave.cuts.join(",");
                if (filtersToSave.polish?.length) filtersToSave.polish = filtersToSave.polish.join(",");
                if (filtersToSave.symmetry?.length) filtersToSave.symmetry = filtersToSave.symmetry.join(",");
                if (filtersToSave.tinge?.length) filtersToSave.tinge = filtersToSave.tinge.join(",");
                if (filtersToSave.location?.length) filtersToSave.location = filtersToSave.location.join(",");

                await api.put(`/auth/users/update-filters/${user._id}`, { filters: filtersToSave });
            } catch (err) {
                console.error("Failed to save filters to profile:", err);
            }
        }

        const targetPath = user?.companyName
            ? `/${companySlug}/inventory`
            : "/diamonds";

        localStorage.setItem(`inventoryVisited_${user?._id || 'guest'}`, "true");

        const filtersToNavigate = { ...filters };
        if (filtersToNavigate.priceMin === metaPriceMin) delete filtersToNavigate.priceMin;
        if (filtersToNavigate.priceMax === metaPriceMax) delete filtersToNavigate.priceMax;
        if (filtersToNavigate.caratMin === metaCaratMin) delete filtersToNavigate.caratMin;
        if (filtersToNavigate.caratMax === metaCaratMax) delete filtersToNavigate.caratMax;

        navigate(targetPath, { state: { filters: filtersToNavigate } });
    };

    const [error, setError] = useState("");

    const handleReset = async () => {
        const defaultFilters = {
            shapes: [],
            colors: [],
            clarities: [],
            cuts: [],
            polish: [],
            symmetry: [],
            priceMin: 0,
            priceMax: 0,
            caratMin: 0,
            caratMax: 0,
            tableMin: 0,
            tableMax: 0,
            depthMin: 0,
            depthMax: 0,
            ratioMin: 0,
            ratioMax: 0,
            tinge: [],
            location: [],
            search: "",
        };
        setFilters(defaultFilters);
        setError("");

        if (user?._id) {
            try {
                await api.put(`/auth/users/update-filters/${user._id}`, { filters: defaultFilters });
            } catch (err) {
                console.error("Failed to reset filters in profile:", err);
            }
        }
    };

    if (loading) {
        return (
            <div className="animate-pulse">
                <div className="h-6 w-24 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 w-40 bg-gray-200 rounded"></div>
            </div>
        );
    }

    return (
        <div className={`p-4 sm:p-10 rounded-[2.5rem] shadow-2xl border ${isDarkMode ? "bg-[#0A0A0A] border-gray-800 text-white" : "bg-white border-gray-100 text-black"}`}>
            {/* Header — count hidden, only title + clear */}
            <div className="flex flex-col sm:flex-row items-center justify-between mb-6 sm:mb-8 pb-4 sm:pb-6 border-b border-gray-100 dark:border-gray-800 gap-4 sm:gap-0">
                <div className="flex items-center sm:items-baseline gap-2 sm:gap-4 flex-wrap justify-center">
                    <h2 className={`text-xl sm:text-2xl font-bold tracking-tight`}>Filters</h2>
                </div>
                <button
                    onClick={handleReset}
                    className="text-[10px] sm:text-xs font-bold text-blue-500 uppercase tracking-[0.2em] hover:opacity-70 transition-all"
                >
                    Clear All
                </button>
            </div>

            {/* Integrated Search Bar */}
            <div className="mb-12 flex justify-center">
                <div className={`w-full max-w-3xl flex items-center p-1.5 rounded-full border transition-all duration-300 ${isDarkMode ? "bg-black border-gray-800 focus-within:border-blue-500/50" : "bg-white border-slate-200 shadow-xl shadow-blue-500/5 focus-within:border-blue-400/50"}`}>
                    <div className="pl-4 sm:pl-6 text-gray-400 flex-shrink-0">
                        <Search size={22} className="opacity-40" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search Diamonds..."
                        value={filters.search}
                        onChange={(e) => updateFilters({ search: e.target.value })}
                        className={`flex-1 min-w-0 px-3 sm:px-4 py-3 sm:py-4 text-sm sm:text-base bg-transparent outline-none font-medium tracking-wide ${isDarkMode ? "text-white placeholder-gray-600" : "text-slate-800 placeholder-slate-400"}`}
                    />
                    <div className="flex-shrink-0 pr-1">
                        <button
                            onClick={handleApplyFilter}
                            disabled={liveCount === 0}
                            className={`px-5 sm:px-10 py-2.5 sm:py-3.5 rounded-full bg-blue-500 text-white flex items-center justify-center gap-2 sm:gap-3 transition-all duration-300 whitespace-nowrap
                                ${liveCount === 0 ? "opacity-30 cursor-not-allowed" : "hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-500/30 active:scale-95"}`}
                        >
                            {isCountLoading ? (
                                <Loader2 size={18} className="animate-spin" />
                            ) : (
                                <>
                                    <Search size={18} className="hidden sm:inline" />
                                    <span className="text-[10px] sm:text-sm font-black tracking-[0.1em] uppercase">
                                        ( {liveCount > 2000 ? "2000+" : liveCount} )
                                    </span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            <div className="space-y-8">
                {/* Shape selection section */}
                <div className="mb-12">
                    <div className="relative flex items-center justify-center mb-8">
                        <div className="absolute inset-0 flex items-center" aria-hidden="true">
                            <div className={`w-full border-t-2 ${isDarkMode ? "border-gray-800" : "border-slate-100"}`}></div>
                        </div>
                        <div className={`relative px-4 sm:px-8 ${isDarkMode ? "bg-[#141414]" : "bg-white"}`}>
                            <span className={`text-xs sm:text-sm font-bold tracking-[0.2em] uppercase ${isDarkMode ? "text-gray-400" : "text-[#1B3061]"}`}>
                                Select Shape
                            </span>
                        </div>
                    </div>

                    <div className="w-full">
                        <div
                            className="w-full overflow-x-auto pb-4 scrollbar-hide flex justify-start"
                            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                        >
                            <div className="flex flex-nowrap gap-2 sm:gap-4 px-2 sm:px-4">
                                    {uniqueShapes.map((shape) => {
                                        const selected = filters.shapes?.some(s => s.toLowerCase() === shape.toLowerCase());
                                        const shapeKey = shape.toLowerCase().replace('.', '').trim();
                                        const imageUrl = {
                                            "round": "https://diamonds.kiradiam.com/KOnline/images/search/ShapeNew/2.png",
                                            "oval": "https://diamonds.kiradiam.com/KOnline/images/search/ShapeNew/3.png",
                                            "emerald": "https://diamonds.kiradiam.com/KOnline/images/search/ShapeNew/4.png",
                                            "pear": "https://diamonds.kiradiam.com/KOnline/images/search/ShapeNew/5.png",
                                            "radiant": "https://diamonds.kiradiam.com/KOnline/images/search/ShapeNew/6.png",
                                            "marquise": "https://diamonds.kiradiam.com/KOnline/images/search/ShapeNew/7.png",
                                            "cushion": "https://diamonds.kiradiam.com/KOnline/images/search/ShapeNew/9.png",
                                            "cushion modified": cushionModifiedImg,
                                            "cushionsq": cushionModifiedImg,
                                            "princess": "https://diamonds.kiradiam.com/KOnline/images/search/ShapeNew/11.png",
                                            "heart": "https://diamonds.kiradiam.com/KOnline/images/search/ShapeNew/13.png",
                                            "asscher": "https://diamonds.kiradiam.com/KOnline/images/search/ShapeNew/26.png",
                                            "square radiant": squareRadiantImg,
                                            "old miner": oldMinerImg,
                                            "european cut": europeanCutImg,
                                            "rose": roseImg,
                                            "triangular": triangularImg,
                                            "trillion": triangularImg,
                                            "baguette": "https://diamonds.kiradiam.com/KOnline/images/search/ShapeNew/4.png",
                                            "tapered baguette": "https://diamonds.kiradiam.com/KOnline/images/search/ShapeNew/4.png",
                                        }[shapeKey] || "https://diamonds.kiradiam.com/KOnline/images/search/ShapeNew/2.png";

                                        // Local assets often have white backgrounds that need to be removed or inverted in dark mode
                                        const isLocal = !imageUrl.includes('kiradiam.com');

                                        return (
                                            <button
                                                key={shape}
                                                onClick={() => toggleArrayFilter("shapes", shape)}
                                                className={`flex flex-col items-center justify-center rounded-2xl transition-all duration-300 flex-shrink-0 w-24 h-24 sm:w-28 sm:h-28 group ${selected
                                                    ? isDarkMode
                                                        ? "bg-amber-500/10"
                                                        : "bg-amber-50 shadow-sm"
                                                    : isDarkMode
                                                        ? "bg-[#111111] hover:bg-amber-500/5"
                                                        : "bg-white hover:bg-amber-50/40"
                                                    }`}
                                            >
                                                <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
                                                    <img
                                                        src={imageUrl}
                                                        alt={shape}
                                                        className={`max-w-full max-h-full object-contain transition-all duration-300 ${isDarkMode
                                                            ? "brightness-0 invert mix-blend-screen brightness-200"
                                                            : isLocal ? "mix-blend-multiply" : ""
                                                            } ${selected
                                                                ? isDarkMode
                                                                    ? "brightness-125 [filter:sepia(1)_saturate(3)_hue-rotate(-45deg)]"
                                                                    : "brightness-110 [filter:sepia(1)_saturate(5)_hue-rotate(-45deg)]"
                                                                : "opacity-100 grayscale hover:opacity-100 hover:grayscale-0"
                                                            }`}
                                                    />
                                                </div>
                                            </button>
                                        );
                                    })}
                            </div>
                        </div>
                    </div>
                </div>
                {hasCarat && (
                    <RangeSection
                        label="Carat Weight"
                        field="carat"
                        min={filters.caratMin ?? metaCaratMin}
                        max={filters.caratMax ?? metaCaratMax}
                        onChange={handleRangeChange}
                        isDarkMode={isDarkMode}
                    />
                )}
                <FilterGrid
                    label="Color"
                    options={colors}
                    selectedItems={filters.colors}
                    toggleFn={(val) => toggleArrayFilter("colors", val)}
                    isDarkMode={isDarkMode}
                />

                <FilterGrid
                    label="Clarity"
                    options={clarities}
                    selectedItems={filters.clarities}
                    toggleFn={(val) => toggleArrayFilter("clarities", val)}
                    isDarkMode={isDarkMode}
                />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FilterGrid
                        label="Cut"
                        options={cuts}
                        selectedItems={filters.cuts}
                        toggleFn={(val) => toggleArrayFilter("cuts", val)}
                        isDarkMode={isDarkMode}
                    />
                    <FilterGrid
                        label="Polish"
                        options={polish}
                        selectedItems={filters.polish}
                        toggleFn={(val) => toggleArrayFilter("polish", val)}
                        isDarkMode={isDarkMode}
                    />
                    <FilterGrid
                        label="Symmetry"
                        options={symmetry}
                        selectedItems={filters.symmetry}
                        toggleFn={(val) => toggleArrayFilter("symmetry", val)}
                        isDarkMode={isDarkMode}
                    />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FilterGrid
                        label="RGB"
                        options={tinges}
                        selectedItems={filters.tinge}
                        toggleFn={(val) => toggleArrayFilter("tinge", val)}
                        isDarkMode={isDarkMode}
                    />
                    <FilterGrid
                        label="Location"
                        options={locations}
                        selectedItems={filters.location}
                        toggleFn={(val) => toggleArrayFilter("location", val)}
                        isDarkMode={isDarkMode}
                    />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <RangeSection
                        label="Table %"
                        field="table"
                        min={filters.tableMin ?? metaTableMin}
                        max={filters.tableMax ?? metaTableMax}
                        onChange={handleRangeChange}
                        isDarkMode={isDarkMode}
                    />
                    <RangeSection
                        label="Total Depth %"
                        field="depth"
                        min={filters.depthMin ?? metaDepthMin}
                        max={filters.depthMax ?? metaDepthMax}
                        onChange={handleRangeChange}
                        isDarkMode={isDarkMode}
                    />
                    <RangeSection
                        label="L. W. Ratio"
                        field="ratio"
                        min={filters.ratioMin ?? metaRatioMin}
                        max={filters.ratioMax ?? metaRatioMax}
                        onChange={handleRangeChange}
                        isDarkMode={isDarkMode}
                    />
                </div>

                {error && (
                    <p className="text-red-500 text-xs font-normal text-center mt-4 animate-bounce">
                        {error}
                    </p>
                )}
                <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 ${isDarkMode ? "bg-[#111111]/50 border-gray-800" : "bg-gray-50/50 border-gray-100"} p-4 rounded-2xl border`}>
                    <div className="flex items-center w-full sm:w-auto">
                        <button
                            onClick={handleReset}
                            className={`text-xs font-normal hover:underline px-4 py-2 rounded-lg transition-colors ${isDarkMode ? "text-blue-400" : "text-blue-600 hover:bg-blue-50"}`}
                        >
                            Clear Data
                        </button>
                    </div>

                    <div className="flex flex-col w-full sm:w-auto relative">
                        <button
                            onClick={handleApplyFilter}
                            disabled={liveCount > 2000 || liveCount === 0}
                            className={`w-full sm:w-64 py-3 rounded-xl font-normal transition flex items-center justify-center gap-2 ${liveCount > 2000 || liveCount === 0
                                ? "bg-gray-400 text-gray-700 cursor-not-allowed border border-gray-400 opacity-60"
                                : "bg-blue-500 text-white hover:bg-blue-600 shadow-lg shadow-blue-500/20"
                                }`}
                        >
                            {isCountLoading && <Loader2 size={18} className="animate-spin" />}
                            <Search size={18} />
                            <span>
                                {liveCount > 2000 ? "Too Many Results" : (liveCount === 0 ? "No Details Found" : `Search ${liveCount} Diamonds`)}
                            </span>
                        </button>
                        {liveCount > 2000 && !isCountLoading && (
                            <p className="text-red-500 text-[10px] font-normal text-center mt-2 absolute -bottom-6 left-0 right-0">
                                Result limit (2000) exceeded. Please select more filters.
                            </p>
                        )}
                        {liveCount === 0 && !isCountLoading && (
                            <p className="text-yellow-600 text-[10px] font-normal text-center mt-2 absolute -bottom-6 left-0 right-0">
                                No diamonds match your filters.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

function RangeSection({ label, field, min, max, onChange, isDarkMode }) {
    // Show blank instead of 0
    const displayMin = min === 0 || min === "" ? "" : min;
    const displayMax = max === 0 || max === "" ? "" : max;

    return (
        <div className="mb-10 w-full px-4">
            <div className="relative flex items-center justify-center mb-8">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className={`w-full border-t-2 ${isDarkMode ? "border-gray-800" : "border-slate-100"}`}></div>
                </div>
                <div className={`relative px-4 sm:px-8 ${isDarkMode ? "bg-[#141414]" : "bg-white"}`}>
                    <span className={`text-xs sm:text-sm font-bold tracking-[0.2em] uppercase ${isDarkMode ? "text-gray-400" : "text-[#1B3061]"}`}>
                        {label}
                    </span>
                </div>
            </div>
            <div className="flex gap-2 mb-4">
                <input
                    type="number"
                    value={displayMin}
                    onChange={(e) => onChange(field, e.target.value, "min")}
                    className={`w-1/2 border rounded-lg p-2 text-sm focus:ring-1 outline-none ${isDarkMode ? "border-gray-700 bg-[#111111] text-white focus:ring-blue-500" : "border-gray-200 focus:ring-blue-500"}`}
                    placeholder="Min"
                />
                <input
                    type="number"
                    value={displayMax}
                    onChange={(e) => onChange(field, e.target.value, "max")}
                    className={`w-1/2 border rounded-lg p-2 text-sm focus:ring-1 outline-none ${isDarkMode ? "border-gray-700 bg-[#111111] text-white focus:ring-blue-500" : "border-gray-200 focus:ring-blue-500"}`}
                    placeholder="Max"
                />
            </div>
        </div>
    );
}

function FilterGrid({ label, options = [], selectedItems = [], toggleFn, isDarkMode, accentBg }) {
    return (
        <div className="mb-10 w-full">
            <div className="relative flex items-center justify-center mb-6">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className={`w-full border-t-2 ${isDarkMode ? "border-gray-800" : "border-slate-100"}`}></div>
                </div>
                <div className={`relative px-4 sm:px-8 ${isDarkMode ? "bg-[#141414]" : "bg-white"}`}>
                    <span className={`text-xs sm:text-sm font-bold tracking-[0.2em] uppercase ${isDarkMode ? "text-gray-400" : "text-[#1B3061]"}`}>
                        {label}
                    </span>
                </div>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3">
                {options.map((opt) => {
                    const active = selectedItems?.includes(opt);
                    return (
                        <button
                            key={opt}
                            onClick={() => toggleFn(opt)}
                            className={`px-4 py-1.5 sm:px-8 sm:py-2 text-[10px] sm:text-[11px] font-bold rounded-full transition-all duration-300 ${active
                                ? isDarkMode
                                    ? "bg-amber-500/20 text-amber-400"
                                    : "bg-amber-100 text-amber-900 shadow-sm"
                                : isDarkMode
                                    ? "bg-transparent text-gray-500 hover:bg-amber-500/5 hover:text-amber-400"
                                    : "bg-white text-[#4A4A4A] hover:bg-amber-50/50 hover:text-amber-700"
                                }`}
                        >
                            {opt}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

export default FilterDetails;
