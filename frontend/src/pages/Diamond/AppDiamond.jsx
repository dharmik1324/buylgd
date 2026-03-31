import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback, useMemo } from "react";
import { fetchDiamonds, setCurrentFilters } from "../../store/diamondSlice";
import { toggleWishlist } from "../../store/wishlistSlice";
// import { CircleLoader } from "react-spinners";
import { motion, AnimatePresence } from "framer-motion";
import { IoDiamondOutline } from "react-icons/io5";
import { Heart, Maximize2, FileText, PlayCircle, AlertCircle, ArrowRight } from 'lucide-react';
import DiamondFilterSidebar from "../../components/diamond/DiamndFilterSidebar";
import { DiamondCardSkeleton } from "../../components/diamond/DiamondCardSkeleton";
import { AppDiamondDetails } from "./AppDiamondDetails";
import { ShapeIcon } from "../../components/diamond/DiamondShapeIcons";
import squareRadiantImg from "../../assets/shapes/square_radiant.png";
import oldMinerImg from "../../assets/shapes/old_miner.png";
import europeanCutImg from "../../assets/shapes/european_cut.png";
import roseImg from "../../assets/shapes/rose.png";
import triangularImg from "../../assets/shapes/triangular.png";
import cushionModifiedImg from "../../assets/shapes/cushion_modified.png";


const Detail = ({ label, value, isDarkMode }) => (
  <div>
    <span className={`text-[9px] font-bold uppercase tracking-widest ${isDarkMode ? "text-gray-500" : "text-gray-400"} block`}>
      {label}
    </span>
    <span className={`text-sm font-semibold ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
      {value || "---"}
    </span>
  </div>
);


export const AppDiamond = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { data, loading, currentPage, totalPages, metadata: serverMetadata, totalDiamonds } = useSelector((state) => state.diamonds);
  const isDarkMode = useSelector((state) => state.theme.isDarkMode);
  const wishlistItems = useSelector((state) => state.wishlist.items);
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const isWishlisted = (id) => wishlistItems.some((w) => String(w._id) === String(id));

  const accentColor = isDarkMode ? "text-blue-500" : "text-blue-500";
  const accentBg = isDarkMode ? "bg-blue-600" : "bg-blue-500";
  const accentBorder = isDarkMode ? "border-blue-500" : "border-blue-500";
  const accentRing = isDarkMode ? "focus:ring-blue-500/20" : "focus:ring-blue-500/20";
  const lightAccentBg = isDarkMode ? "bg-blue-900/10" : "bg-blue-50";
  const bgMain = isDarkMode ? "bg-black" : "bg-gray-50";
  const bgCard = isDarkMode ? "bg-black/80" : "bg-white";
  const textMain = isDarkMode ? "text-white" : "text-[#111111]";
  const textSub = isDarkMode ? "text-gray-400" : "text-gray-500";
  const borderMain = isDarkMode ? "border-[#111111]" : "border-gray-200";

  const initialFilters = {
    search: "",
    shapes: [],
    colors: [],
    clarities: [],
    cuts: [],
    priceMin: undefined,
    priceMax: undefined,
    caratMin: undefined,
    caratMax: undefined,
    tableMin: undefined,
    tableMax: undefined,
    depthMin: undefined,
    depthMax: undefined,
    ratioMin: undefined,
    ratioMax: undefined,
    tinge: [],
    location: [],
    sort: "newest",
  };

  const [filters, setFilters] = useState(location.state?.filters || initialFilters);
  const [selectedDiamond, setSelectedDiamond] = useState(null);

  const hasActiveFilters =
    filters.shapes.length > 0 ||
    filters.search !== "" ||
    filters.colors.length > 0 ||
    filters.clarities.length > 0 ||
    filters.cuts.length > 0;

  const metadata = {
    shapes: Array.from(new Set(["ROUND", "PRINCESS", "OVAL", "MARQUISE", "EMERALD", "PEAR", "RADIANT", "CUSHION", "HEART", "ASSCHER", "CUSHION MODIFIED", "EUROPEAN CUT", "OLD MINER", "ROSE", "SQUARE RADIANT", "TRIANGULAR"])),
    colors: serverMetadata?.colors?.length ? serverMetadata.colors : ["D", "E", "F", "G", "H", "I", "J"],
    clarities: serverMetadata?.clarities?.length ? serverMetadata.clarities : ["IF", "VVS1", "VVS2", "VS1", "VS2", "SI1"],
    cuts: ["ID", "EX", "VG"],
    polish: ["EX", "VG"],
    symmetry: ["EX", "VG"],
    priceMin: serverMetadata?.priceMin ?? 500,
    priceMax: serverMetadata?.priceMax ?? 20000,
    caratMin: serverMetadata?.caratMin ?? 0.1,
    caratMax: serverMetadata?.caratMax ?? 10,
    tinges: ["NONE", "MIX1", "MIX2"],
    locations: ["MUMBAI", "SURAT", "USA", "HK", "EXHB"],
  };

  const uniqueShapes = useMemo(() => {
    const seen = new Set();
    const excluded = ['cm-b', 'sqcu'];
    const filtered = metadata.shapes.filter(shape => {
      if (!shape) return false;
      const lower = shape.toLowerCase().trim();
      if (excluded.includes(lower) || seen.has(lower)) return false;
      seen.add(lower);
      return true;
    });
    console.log("Unique Shapes to render:", filtered);
    return filtered;
  }, [metadata.shapes]);

  const getImageUrl = (shape) => {
    const s = shape.toLowerCase().replace('.', '').trim();
    const map = {
      "round": "https://diamonds.kiradiam.com/KOnline/images/search/ShapeNew/2.png",
      "brilliant round": "https://diamonds.kiradiam.com/KOnline/images/search/ShapeNew/2.png",
      "rb": "https://diamonds.kiradiam.com/KOnline/images/search/ShapeNew/2.png",
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
      "triangular": triangularImg,
      "cushion modified": cushionModifiedImg,
      "cushion mod": cushionModifiedImg,
      "cush mod": cushionModifiedImg,
      "cushion mod.": cushionModifiedImg
    };
    return map[s] || "https://diamonds.kiradiam.com/KOnline/images/search/ShapeNew/2.png";
  };

  const getParams = (page = 1) => {
    const params = { page, limit: 15, ...filters };

    // Only send range filters if they differ from the metadata defaults
    if (params.priceMin === metadata.priceMin) delete params.priceMin;
    if (params.priceMax === metadata.priceMax) delete params.priceMax;
    if (params.caratMin === metadata.caratMin) delete params.caratMin;
    if (params.caratMax === metadata.caratMax) delete params.caratMax;

    if (params.shapes?.length) params.shapes = params.shapes.join(",");
    if (params.colors?.length) params.colors = params.colors.join(",");
    if (params.clarities?.length) params.clarities = params.clarities.join(",");
    if (params.cuts?.length) params.cuts = params.cuts.join(",");
    if (params.tinge?.length) params.tinge = params.tinge.join(",");
    if (params.location?.length) params.location = params.location.join(",");
    return params;
  };

  useEffect(() => {
    dispatch(fetchDiamonds(getParams(1)));
    dispatch(setCurrentFilters(filters));

    // Mark inventory as visited for this user
    localStorage.setItem(`inventoryVisited_${user?._id || 'guest'}`, "true");
  }, [dispatch, filters, user?._id]);

  const handleLoadMore = () => {
    if (!loading && currentPage < totalPages) {
      dispatch(fetchDiamonds(getParams(currentPage + 1)));
    }
  };

  const toggleShape = (shape) => {
    setFilters(prev => {
      const currentShapes = prev.shapes || [];
      const shapeLower = shape.toLowerCase();
      const exists = currentShapes.some(s => s.toLowerCase() === shapeLower);

      return {
        ...prev,
        shapes: exists
          ? currentShapes.filter(s => s.toLowerCase() !== shapeLower)
          : [...currentShapes, shape]
      };
    });
  };



  return (
    <div className={`min-h-screen ${bgMain} ${textMain} font-sans transition-colors duration-300`}>
      <div className={`${bgCard} py-8 sm:py-10 md:py-12 px-4 sm:px-6 border-b ${borderMain}`}>
        <div className="max-w-7xl mx-auto text-center">
          <motion.h1 className={`text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-serif mb-4 sm:mb-6`}>
            BUYLGD Diamond <span className={`italic ${accentColor}`}>Inventory</span>
          </motion.h1>

          <div className="flex justify-center mt-6 sm:mt-8 w-full overflow-hidden">
            <div className="flex flex-nowrap gap-2 pl-4 sm:gap-4 w-full justify-start sm:justify-center overflow-x-auto scrollbar-hide items-center">
              {uniqueShapes.map((shape) => {
                const selected = filters.shapes?.some(s => s.toLowerCase() === shape.toLowerCase());
                const imageUrl = getImageUrl(shape);

                return (
                  <button
                    key={shape}
                    onClick={() => toggleShape(shape)}
                    className={`p-1 sm:p-2 flex-shrink-0 w-16 h-16 sm:w-24 sm:h-24 flex flex-col items-center justify-center gap-1.5 cursor-pointer rounded-xl border border-transparent transition-[background-color,box-shadow,opacity] duration-300 overflow-hidden group ${selected
                      ? isDarkMode
                        ? "bg-blue-500/10 shadow-lg shadow-blue-500/10"
                        : "bg-blue-50 shadow-lg shadow-blue-500/20"
                      : isDarkMode
                        ? "bg-transparent hover:bg-[#111111]"
                        : "bg-white hover:bg-slate-50"
                      }`}
                  >
                    <div className="relative w-full h-full flex items-center justify-center">
                      <img
                        src={imageUrl}
                        alt={shape}
                        className={`w-full h-full object-contain transition-all duration-300 diamond-shape-img ${selected
                          ? isDarkMode
                            ? "brightness-125 [filter:hue-rotate(180deg)_saturate(200%)]"
                            : "brightness-110 [filter:hue-rotate(190deg)_saturate(150%)]"
                          : isDarkMode
                            ? "opacity-60 grayscale group-hover:opacity-80 group-hover:grayscale-0"
                            : "opacity-90 grayscale group-hover:opacity-100"
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

      <div className="max-w-[2000px] mx-auto md:px-6 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 lg:gap-12">
          <DiamondFilterSidebar
            metadata={metadata}
            filters={filters}
            setFilters={setFilters}
            resetFilters={() => setFilters(initialFilters)}
            resultsCount={totalDiamonds || 0}
            loading={loading}
          />

          <div className="flex-1">
            <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-3 sm:gap-4 p-2 pl-2 pr-2 md:gap-8 px-1 sm:px-0">
              <AnimatePresence mode="popLayout">
                {loading && data.length === 0 ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <motion.div
                      key={`skeleton-${i}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <DiamondCardSkeleton isDarkMode={isDarkMode} />
                    </motion.div>
                  ))
                ) : data.map((item, idx) => (
                  <motion.div
                    key={item._id || idx}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    whileHover={{ y: -4 }}
                    onClick={() => setSelectedDiamond(item)}
                    className={`group relative flex flex-col rounded-xl overflow-hidden cursor-pointer transition-all duration-300 border
                      ${isDarkMode
                        ? "bg-[#1c1c1c] border-gray-800 hover:border-gray-600 shadow-md shadow-black/50"
                        : "bg-white border-gray-200 hover:border-gray-300 shadow-sm"
                      }`}
                  >
                    {/* Image Section */}
                    <div className={`relative w-full aspect-square flex items-center justify-center p-1 sm:p-4 transition-colors duration-500
                      ${isDarkMode ? "bg-gradient-to-br from-[#2a2a2a] to-[#1c1c1c]" : "bg-gradient-to-br from-gray-50 to-[#F8F9FA]"}`}>

                      {/* Checkbox (Top Left) */}
                      <div className="absolute top-1 left-1 sm:top-3 sm:left-3 z-10">
                        <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer" onClick={(e) => e.stopPropagation()} />
                      </div>

                      {/* Heart Icon (Top Right) */}
                      <button
                        onClick={(e) => { e.stopPropagation(); dispatch(toggleWishlist(item)); }}
                        className={`absolute top-1 right-1 sm:top-3 sm:right-3 p-1 rounded-full backdrop-blur-sm transition-all duration-200 cursor-pointer z-10 ${isWishlisted(item._id)
                          ? "bg-red-500 text-white shadow-md"
                          : isDarkMode ? "bg-black/40 text-gray-300 hover:text-white" : "bg-white/60 text-gray-500 hover:text-gray-800 shadow-sm"
                          }`}
                      >
                        <Heart
                          size={14}
                          className="w-4 h-4"
                          fill={isWishlisted(item._id) ? "currentColor" : "none"}
                        />
                      </button>

                      {/* Diamond Image */}
                      {item.Diamond_Image ? (
                        <img
                          src={item.Diamond_Image}
                          alt={item.Shape}
                          className={`w-full h-full object-contain transition-transform duration-500 group-hover:scale-105 ${isDarkMode ? "mix-blend-screen" : "mix-blend-multiply"}`}
                        />
                      ) : (
                        <ShapeIcon
                          shape={item.Shape}
                          className={`w-20 h-20 ${isDarkMode ? "text-gray-600" : "text-gray-300"} transition-transform duration-500 group-hover:scale-105`}
                        />
                      )}

                      {/* Green Dot Indicator (Bottom Left of Image Area) */}
                      <div className="absolute bottom-3 left-3 w-2.5 h-2.5 bg-green-500 rounded-full border border-white shadow-sm" title="Available"></div>
                    </div>

                    {/* Content Section */}
                    <div className={`flex flex-col flex-1 p-1 sm:p-4 text-left border-t ${isDarkMode ? "border-gray-800" : "border-gray-100"}`}>
                      {/* Title Line */}
                      <h3 className={`text-xs sm:text-sm font-semibold truncate ${isDarkMode ? "text-gray-100" : "text-gray-800"}`}>
                        {item.Shape} {item.Weight?.toFixed(2)}ct {item.Color} {item.Clarity}
                      </h3>

                      {/* Subtitle Line (Cut.Polish.Symmetry / Fluorescence) */}
                      <p className={`text-[10px] sm:text-xs mt-1 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                        {item.Cut && item.Cut !== '-' ? `${item.Cut?.charAt(0) || ''}.` : '-.'}
                        {item.Polish ? `${item.Polish?.charAt(0) || ''}.` : '-.'}
                        {item.Symmetry ? `${item.Symmetry?.charAt(0) || ''}` : '-'} / {item.Fluorescence || 'NONE'}
                      </p>

                      <div className="flex items-end justify-between mt-auto pt-3">
                        <div className="flex flex-col">
                          <span className={`text-sm sm:text-base font-bold ${isDarkMode ? "text-gray-100" : "text-gray-900"}`}>
                            ${Number(item.Final_Price?.toFixed(2) || 0).toLocaleString()}
                          </span>
                          <span className={`text-[9px] sm:text-[10px] ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
                            Total Price
                          </span>
                        </div>

                        {/* More options button */}
                        <button className={`w-8 h-6 flex items-center justify-center rounded-md ${isDarkMode ? "bg-blue-900/50 text-blue-400" : "bg-blue-100 text-blue-500 hover:bg-blue-200"} transition-colors`} onClick={(e) => { e.stopPropagation(); setSelectedDiamond(item); }}>
                          <span className="text-xl leading-none -mt-2">...</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {currentPage < totalPages && (
              <div className="mt-12 text-center">
                <button onClick={handleLoadMore} disabled={loading} className={`${accentBg} text-white px-8 py-3 rounded-full font-bold uppercase tracking-widest`}>
                  {loading ? "Loading..." : "Load More"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedDiamond && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100]"
          >
            <AppDiamondDetails
              isDarkMode={isDarkMode}
              diamond={selectedDiamond}
              onClose={() => setSelectedDiamond(null)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AppDiamond;

