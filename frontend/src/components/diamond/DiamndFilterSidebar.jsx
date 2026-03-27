import React, { useCallback, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { SlidersHorizontal, X } from "lucide-react";
import { ShapeIcon } from "./DiamondShapeIcons";
import squareRadiantImg from "../../assets/shapes/square_radiant.png";
import oldMinerImg from "../../assets/shapes/old_miner.png";
import europeanCutImg from "../../assets/shapes/european_cut.png";
import roseImg from "../../assets/shapes/rose.png";
import triangularImg from "../../assets/shapes/triangular.png";

export const DiamondFilterSidebar = ({
    metadata = {},
    filters = {},
    setFilters = () => { },
    resetFilters = () => { },
    resultsCount = 0,
    onFilterChange = () => { },
    loading = false,
}) => {
    const isDarkMode = useSelector((state) => state.theme.isDarkMode);
    const [mobileOpen, setMobileOpen] = useState(false);

    const bgCard = isDarkMode ? "bg-transparent" : "bg-transparent";
    const textMain = isDarkMode ? "text-white" : "text-[#111111]";
    const textSub = isDarkMode ? "text-gray-400" : "text-gray-500";
    const borderMain = isDarkMode ? "border-transparent" : "border-transparent";
    const accentColor = isDarkMode ? "text-blue-500" : "text-blue-500";
    const lightAccentBg = isDarkMode ? "bg-blue-900/10" : "bg-blue-50";
    const accentBorder = isDarkMode ? "border-blue-500" : "border-blue-500";
    const accentText = isDarkMode ? "text-blue-400" : "text-blue-700";

    const {
        shapes = [],
        colors = [],
        clarities = [],
        priceMin: metaPriceMin = 500,
        priceMax: metaPriceMax = 20000,
        caratMin: metaCaratMin = 0.01,
        caratMax: metaCaratMax = 5,
        hasCarat = true,
    } = metadata;

    const uniqueShapes = useMemo(() => {
        const seen = new Set();
        const excluded = ['cm-b', 'sqcu'];
        return shapes.filter(shape => {
            const lower = shape.toLowerCase().trim();
            if (excluded.includes(lower) || seen.has(lower)) return false;
            seen.add(lower);
            return true;
        });
    }, [shapes]);

    const updateFilters = useCallback(
        (updates) => {
            setFilters((prev) => {
                const next = { ...prev, ...updates };
                try {
                    onFilterChange(next);
                } catch (e) {
                }
                return next;
            });
        },
        [setFilters, onFilterChange]
    );

    const toggleArrayFilter = useCallback(
        (key, value) => {
            const currentItems = filters[key] || [];
            const valueLower = value.toLowerCase();
            const exists = currentItems.some(item =>
                typeof item === 'string' ? item.toLowerCase() === valueLower : item === value
            );

            updateFilters({
                [key]: exists
                    ? currentItems.filter((item) =>
                        typeof item === 'string' ? item.toLowerCase() !== valueLower : item !== value
                    )
                    : [...currentItems, value],
            });
        },
        [filters, updateFilters]
    );

    const handleRangeChange = useCallback(
        (field, value, type) => {
            const numValue = Number(value);
            if (isNaN(numValue)) return;

            const minKey = `${field}Min`;
            const maxKey = `${field}Max`;
            const metaMin = metadata[minKey] ?? 0;
            const metaMax = metadata[maxKey] ?? 100000;
            const currentMin = filters[minKey] ?? metaMin;
            const currentMax = filters[maxKey] ?? metaMax;

            if (type === "min") {
                const newMin = Math.max(metaMin, Math.min(numValue, currentMax));
                updateFilters({ [minKey]: newMin });
            } else {
                const newMax = Math.min(metaMax, Math.max(numValue, currentMin));
                updateFilters({ [maxKey]: newMax });
            }
        },
        [filters, metadata, updateFilters]
    );

    const hasActiveFilters = useMemo(() => {
        return (
            (filters.shapes?.length ?? 0) > 0 ||
            (filters.colors?.length ?? 0) > 0 ||
            (filters.clarities?.length ?? 0) > 0 ||
            (filters.cuts?.length ?? 0) > 0 ||
            filters.priceMin !== metaPriceMin ||
            filters.priceMax !== metaPriceMax ||
            (hasCarat &&
                (filters.caratMin !== metaCaratMin ||
                    filters.caratMax !== metaCaratMax))
        );
    }, [filters, metaPriceMin, metaPriceMax, metaCaratMin, metaCaratMax, hasCarat]);

    // Filter content shared by both desktop and mobile
    const filterContent = (
        <>
            <div className={`flex items-center justify-between mb-4 p-2 rounded-xl ${isDarkMode ? "bg-[#1a1a1a] border border-gray-800" : "bg-white border border-gray-100 shadow-sm"}`}>
                <div>
                    <h3 className={`text-base font-bold ${textMain}`}>Filters</h3>
                    <p className={`text-xs ${textSub}`}>
                        <span className={`font-semibold ${isDarkMode ? "text-blue-400" : "text-gray-800"}`}>
                            {resultsCount?.toLocaleString() || 0}
                        </span>{" "}
                        Results Found
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {hasActiveFilters && (
                        <button
                            onClick={resetFilters}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${isDarkMode ? "bg-gray-800 text-gray-300 hover:text-white" : "bg-gray-100 text-gray-600 hover:text-black"} transition-colors`}
                        >
                            <X size={14} /> Clear
                        </button>
                    )}
                    {/* Close button for mobile */}
                    <button
                        onClick={() => setMobileOpen(false)}
                        className={`lg:hidden p-1.5 rounded-lg ${isDarkMode ? "hover:bg-[#111111] text-gray-400" : "hover:bg-gray-100 text-gray-500"}`}
                    >
                        <X size={20} />
                    </button>
                </div>
            </div>

            <div className="overflow-y-auto max-h-[calc(100vh-8rem)] pr-1 space-y-4 scrollbar-hide">
                <div className={`p-4 rounded-xl ${isDarkMode ? "bg-[#1a1a1a] border border-gray-800" : "bg-white border border-gray-100 shadow-sm"}`}>
                    <div className="flex justify-between items-center mb-3">
                        <label className={`block text-sm font-bold ${isDarkMode ? "text-gray-300" : "text-gray-800"}`}>
                            Shape
                        </label>
                        {filters.shapes?.length > 0 && (
                            <span className="text-xs text-blue-500 font-semibold">Selected: {filters.shapes[filters.shapes.length - 1]}</span>
                        )}
                    </div>
                    <div className="grid grid-cols-4 gap-2 w-full">
                        {uniqueShapes.map((shape) => {
                            const selected = filters.shapes?.some(s => s.toLowerCase() === shape.toLowerCase());
                            const imageUrl = {
                                "round": "https://diamonds.kiradiam.com/KOnline/images/search/ShapeNew/2.png",
                                "oval": "https://diamonds.kiradiam.com/KOnline/images/search/ShapeNew/3.png",
                                "emerald": "https://diamonds.kiradiam.com/KOnline/images/search/ShapeNew/4.png",
                                "pear": "https://diamonds.kiradiam.com/KOnline/images/search/ShapeNew/5.png",
                                "radiant": "https://diamonds.kiradiam.com/KOnline/images/search/ShapeNew/6.png",
                                "marquise": "https://diamonds.kiradiam.com/KOnline/images/search/ShapeNew/7.png",
                                "cushion": "https://diamonds.kiradiam.com/KOnline/images/search/ShapeNew/9.png",
                                "cushionsq": "https://diamonds.kiradiam.com/KOnline/images/search/ShapeNew/9.png",
                                "princess": "https://diamonds.kiradiam.com/KOnline/images/search/ShapeNew/11.png",
                                "heart": "https://diamonds.kiradiam.com/KOnline/images/search/ShapeNew/13.png",
                                "asscher": "https://diamonds.kiradiam.com/KOnline/images/search/ShapeNew/26.png",
                                "square radiant": squareRadiantImg,
                                "old miner": oldMinerImg,
                                "european cut": europeanCutImg,
                                "rose": roseImg,
                                "triangular": triangularImg
                            }[shape.toLowerCase().replace('.', '').trim()] || "https://diamonds.kiradiam.com/KOnline/images/search/ShapeNew/2.png";

                            const displayShape = shape.toLowerCase() === "cushionsq" ? "Cush Mod" : shape;

                            return (
                                <button
                                    key={shape}
                                    onClick={() => toggleArrayFilter("shapes", shape)}
                                    className={`flex flex-col items-center justify-center p-1 rounded-lg transition-all duration-300 ${selected
                                        ? isDarkMode
                                            ? "bg-blue-900/30 border border-blue-500/50"
                                            : "bg-blue-50 border border-blue-300"
                                        : isDarkMode
                                            ? "bg-[#2a2a2a] border border-transparent hover:border-gray-600"
                                            : "bg-gray-50 border border-transparent hover:border-gray-200"
                                        }`}
                                >
                                    <div className="w-12 h-12 flex items-center justify-center mb-1 text-gray-400">
                                        <img
                                            src={imageUrl}
                                            alt={shape}
                                            className={`max-w-full max-h-full object-contain diamond-shape-img ${selected
                                                ? isDarkMode
                                                    ? "brightness-125 [filter:hue-rotate(180deg)_saturate(200%)]"
                                                    : "brightness-90 [filter:sepia(1)_hue-rotate(-45deg)_saturate(5)]"
                                                : "opacity-100 grayscale"
                                                }`}
                                        />
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className={`p-4 rounded-xl ${isDarkMode ? "bg-[#1a1a1a] border border-gray-800" : "bg-white border border-gray-100 shadow-sm"}`}>
                    <RangeSection
                        label="Price"
                        field="price"
                        min={filters.priceMin ?? metaPriceMin}
                        max={filters.priceMax ?? metaPriceMax}
                        onChange={handleRangeChange}
                        isDarkMode={isDarkMode}
                    />
                </div>

                {hasCarat && (
                    <div className={`p-4 rounded-xl ${isDarkMode ? "bg-[#1a1a1a] border border-gray-800" : "bg-white border border-gray-100 shadow-sm"}`}>
                        <RangeSection
                            label="Carat"
                            field="carat"
                            min={filters.caratMin ?? metaCaratMin}
                            max={filters.caratMax ?? metaCaratMax}
                            onChange={handleRangeChange}
                            isDarkMode={isDarkMode}
                        />
                    </div>
                )}

                <div className={`p-4 rounded-xl ${isDarkMode ? "bg-[#1a1a1a] border border-gray-800" : "bg-white border border-gray-100 shadow-sm"}`}>
                    <FilterGrid
                        label="Cut"
                        options={metadata.cuts || []}
                        selectedItems={filters.cuts}
                        toggleFn={(val) => toggleArrayFilter("cuts", val)}
                        isDarkMode={isDarkMode}
                    />
                </div>

                <div className={`p-4 rounded-xl ${isDarkMode ? "bg-[#1a1a1a] border border-gray-800" : "bg-white border border-gray-100 shadow-sm"}`}>
                    <FilterGrid
                        label="Color"
                        options={colors}
                        selectedItems={filters.colors}
                        toggleFn={(val) => toggleArrayFilter("colors", val)}
                        isDarkMode={isDarkMode}
                    />
                </div>

                <div className={`p-4 rounded-xl ${isDarkMode ? "bg-[#1a1a1a] border border-gray-800" : "bg-white border border-gray-100 shadow-sm"}`}>
                    <FilterGrid
                        label="Clarity"
                        options={clarities}
                        selectedItems={filters.clarities}
                        toggleFn={(val) => toggleArrayFilter("clarities", val)}
                        isDarkMode={isDarkMode}
                    />
                </div>
            </div>

            <button
                onClick={resetFilters}
                className={`w-full mt-6 ${isDarkMode ? "bg-white text-black hover:bg-gray-200" : "bg-[#111111] text-white hover:bg-black"} py-3 rounded-xl font-bold transition`}
            >
                Reset Filters
            </button>
        </>
    );


    return (
        <>
            {/* Mobile Filter Toggle Button (FAB) */}
            <button
                onClick={() => setMobileOpen(true)}
                className={`lg:hidden fixed bottom-6 right-6 z-40 ${isDarkMode ? "bg-blue-600" : "bg-blue-500"} text-white p-4 rounded-2xl shadow-2xl hover:shadow-3xl transition-all active:scale-95`}
            >
                <SlidersHorizontal size={22} />
                {hasActiveFilters && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
                )}
            </button>

            {/* Mobile Overlay */}
            {mobileOpen && (
                <div
                    onClick={() => setMobileOpen(false)}
                    className="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
                />
            )}

            {/* Mobile Slide-up Panel */}
            <div
                className={`lg:hidden fixed inset-x-0 bottom-0 z-50 transform transition-transform duration-300 ease-out ${mobileOpen ? "translate-y-0" : "translate-y-full"
                    }`}
            >
                <div className={`${bgCard} border-t ${borderMain} rounded-t-3xl p-5 sm:p-6 shadow-2xl max-h-[85vh] overflow-y-auto`}>
                    {/* Drag handle */}
                    <div className="flex justify-center mb-4">
                        <div className={`w-12 h-1.5 rounded-full ${isDarkMode ? "bg-gray-700" : "bg-gray-300"}`} />
                    </div>
                    {filterContent}
                </div>
            </div>

            {/* Desktop Sidebar */}
            <aside className="hidden lg:block lg:w-[350px] 2xl:w-[500px] self-start transition-all duration-500">
                <div className={`${bgCard} border ${borderMain} rounded-2xl p-5 shadow-xl transition-colors duration-300`}>
                    {filterContent}
                </div>
            </aside>
        </>
    );
};

function RangeSection({ label, field, min, max, onChange, isDarkMode }) {
    const focusRing = isDarkMode ? "focus:ring-blue-500" : "focus:ring-blue-400";
    return (
        <div>
            <label className={`block text-sm font-bold ${isDarkMode ? "text-gray-300" : "text-gray-800"} mb-3`}>
                {label}
            </label>
            <div className="flex items-center gap-2">
                <input
                    type="number"
                    value={min}
                    onChange={(e) => onChange(field, e.target.value, "min")}
                    className={`w-1/2 border ${isDarkMode ? "border-gray-700 bg-[#2a2a2a] text-white" : "border-gray-300 text-gray-800"} rounded-lg p-2.5 text-sm focus:ring-1 ${focusRing} outline-none`}
                    placeholder={`Min, ${field === 'carat' ? 'ct' : '$'}`}
                />
                <span className="text-gray-400 text-sm font-semibold">&gt;</span>
                <input
                    type="number"
                    value={max}
                    onChange={(e) => onChange(field, e.target.value, "max")}
                    className={`w-1/2 border ${isDarkMode ? "border-gray-700 bg-[#2a2a2a] text-white" : "border-gray-300 text-gray-800"} rounded-lg p-2.5 text-sm focus:ring-1 ${focusRing} outline-none`}
                    placeholder={`Max, ${field === 'carat' ? 'ct' : '$'}`}
                />
            </div>
            {field === 'carat' && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                    {['0.30-0.39', '0.40-0.49', '0.50-0.69', '0.70-0.89'].map(range => (
                        <button key={range} className={`px-2 py-1.5 text-[10px] sm:text-xs font-semibold rounded-md border ${isDarkMode ? "border-gray-700 text-gray-300 hover:bg-[#333]" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
                            {range}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

function FilterGrid({ label, options = [], selectedItems = [], toggleFn, isDarkMode }) {
    return (
        <div>
            <label className={`block text-sm font-bold ${isDarkMode ? "text-gray-300" : "text-gray-800"} mb-3`}>
                {label}
            </label>
            <div className="flex flex-wrap gap-2">
                {options.map((opt) => {
                    const active = selectedItems?.includes(opt);
                    return (
                        <button
                            key={opt}
                            onClick={() => toggleFn(opt)}
                            className={`px-3 py-1.5 min-w-[3rem] text-xs font-semibold rounded-md border transition-colors ${active
                                ? isDarkMode
                                    ? "bg-blue-900/30 border-blue-500/50 text-blue-400"
                                    : "bg-blue-50 border-blue-300 text-blue-600"
                                : isDarkMode
                                    ? "bg-transparent border-gray-700 text-gray-400 hover:border-gray-500"
                                    : "bg-white border-gray-300 text-gray-600 hover:border-gray-400 hover:bg-gray-50"
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

export default DiamondFilterSidebar;

