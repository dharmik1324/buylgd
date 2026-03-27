import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { fetchPublicDiamonds, setCurrentFilters } from "../../store/diamondSlice";
import { toggleWishlist } from "../../store/wishlistSlice";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ArrowRight } from 'lucide-react';
import DiamondFilterSidebar from "../../components/diamond/DiamndFilterSidebar";
import { DiamondCardSkeleton } from "../../components/diamond/DiamondCardSkeleton";
import { AppDiamondDetails } from "./AppDiamondDetails";
import { ShapeIcon } from "../../components/diamond/DiamondShapeIcons";


export const PublicInventory = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { data, loading, currentPage, totalPages, metadata: serverMetadata, totalDiamonds } = useSelector((state) => state.diamonds);
  const isDarkMode = useSelector((state) => state.theme.isDarkMode);
  const wishlistItems = useSelector((state) => state.wishlist.items);
  const { user, token } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const isWishlisted = (id) => wishlistItems.some((w) => String(w._id) === String(id));

  const accentColor = isDarkMode ? "text-blue-500" : "text-blue-500";
  const accentBg = isDarkMode ? "bg-blue-600" : "bg-blue-500";
  const bgMain = isDarkMode ? "bg-black" : "bg-gray-50";
  const bgCard = isDarkMode ? "bg-black/80" : "bg-white";
  const textMain = isDarkMode ? "text-white" : "text-[#111111]";
  const borderMain = isDarkMode ? "border-[#111111]" : "border-gray-200";

  const initialFilters = {
    search: "",
    shapes: [],
    colors: [],
    clarities: [],
    cuts: [],
    priceMin: 500,
    priceMax: 20000,
    caratMin: 0.1,
    caratMax: 5,
    tinge: [],
    location: [],
    sort: "newest",
    source: "",
  };

  const [filters, setFilters] = useState(location.state?.filters || initialFilters);
  const [selectedDiamond, setSelectedDiamond] = useState(null);

  const metadata = {
    shapes: serverMetadata?.shapes?.length ? serverMetadata.shapes : ["Round"],
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
    return metadata.shapes.filter(shape => {
      const lower = shape.toLowerCase().trim();
      if (excluded.includes(lower) || seen.has(lower)) return false;
      seen.add(lower);
      return true;
    });
  }, [metadata.shapes]);

  const getParams = (page = 1) => {
    const params = { page, limit: 12, ...filters };
    if (params.shapes) params.shapes = params.shapes.join(",");
    if (params.colors) params.colors = params.colors.join(",");
    if (params.clarities) params.clarities = params.clarities.join(",");
    if (params.cuts) params.cuts = params.cuts.join(",");
    if (params.tinge) params.tinge = params.tinge.join(",");
    if (params.location) params.location = params.location.join(",");
    // Ensure source is passed if present
    return params;
  };

  useEffect(() => {
    // USE PUBLIC API
    dispatch(fetchPublicDiamonds(getParams(1)));
    dispatch(setCurrentFilters(filters));
  }, [dispatch, filters]);

  const handleLoadMore = () => {
    if (!loading && currentPage < totalPages) {
      dispatch(fetchPublicDiamonds(getParams(currentPage + 1)));
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

  const handleActionCheck = (callback) => {
    if (!token || !user) {
      navigate("/login", { state: { from: location.pathname } });
    } else {
      callback();
    }
  };

  return (
    <div className={`min-h-screen ${bgMain} ${textMain} font-sans transition-colors duration-300`}>
      <div className={`${bgCard} py-8 sm:py-10 md:py-12 px-4 sm:px-6 border-b ${borderMain}`}>
        <div className="max-w-7xl mx-auto text-center">
          <motion.h1 className={`text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-serif mb-4 sm:mb-6`}>
            BUYLGD Diamond <span className={`italic ${accentColor}`}>Inventory</span>
          </motion.h1>

          <div className="flex flex-col items-center mt-6 sm:mt-8 w-full">
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={() => setFilters(prev => ({ ...prev, source: prev.source === 'CSV' ? '' : 'CSV' }))}
                className={`px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all border ${filters.source === 'CSV'
                  ? 'bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-500/20'
                  : (isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-600' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300')}`}
              >
                {filters.source === 'CSV' ? 'Viewing CSV Collection' : 'Show CSV Collection'}
              </button>
            </div>

            <div className="flex flex-nowrap gap-2 sm:gap-4 w-full justify-start sm:justify-center overflow-x-auto pb-4 scrollbar-hide px-4 items-center">
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
                  "asscher": "https://diamonds.kiradiam.com/KOnline/images/search/ShapeNew/26.png"
                }[shape.toLowerCase().replace('.', '').trim()] || "https://diamonds.kiradiam.com/KOnline/images/search/ShapeNew/2.png";

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
                        className={`w-full h-full object-contain transition-all duration-300 ${isDarkMode ? "mix-blend-screen" : ""} ${selected
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

      <div className="max-w-[1900px] mx-auto px-3 sm:px-4 md:px-6 sm:py-8 md:py-12">
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
            <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-2 sm:gap-4 md:gap-8 px-1 sm:px-0">
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
                    whileHover={{ y: -8 }}
                    onClick={() => handleActionCheck(() => setSelectedDiamond(item))}
                    className={`group relative aspect-[3/4] rounded-lg sm:rounded-[2.5rem] overflow-hidden cursor-pointer transition-all duration-500 border
                      ${isDarkMode
                        ? "bg-[#0D0D0D] border-gray-800 hover:border-blue-500/50 shadow-lg shadow-black"
                        : "bg-slate-100/90 border-slate-200/50 hover:border-blue-200 shadow-md shadow-gray-200/30"
                      }`}
                  >
                    {/* Image Section (65%) */}
                    <div className={`h-[65%] w-full relative overflow-hidden flex items-center justify-center pt-0 pl-2 pr-2 transition-colors duration-500
                      ${isDarkMode ? "bg-gradient-to-br from-[#1A1A1A] to-black" : "bg-gradient-to-br from-slate-50 to-white"}`}>

                      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500/20 via-transparent to-transparent" />

                      {item.Diamond_Image ? (
                        <img
                          src={item.Diamond_Image}
                          alt={item.Shape}
                          className={`max-w-full max-h-full object-contain transition-transform duration-700 group-hover:scale-120 rounded-4xl ${isDarkMode ? "mix-blend-screen drop-shadow-[0_10px_20px_rgba(0,0,0,0.3)]" : "drop-shadow-[0_4px_12px_rgba(0,0,0,0.12)]"}`}
                        />
                      ) : (
                        <ShapeIcon
                          shape={item.Shape}
                          className={`w-24 h-24 ${isDarkMode ? "text-gray-800" : "text-gray-100"} transition-transform duration-700 group-hover:scale-110`}
                        />
                      )}

                      <div className="absolute top-2 left-2 sm:top-6 sm:left-6">
                        <span className="bg-white/90 backdrop-blur-sm text-black text-[6px] sm:text-[9px] font-bold px-1.5 py-0.5 sm:px-3 sm:py-1.5 rounded-full uppercase tracking-widest shadow-sm">
                          {item.Availability || "IN STOCK"}
                        </span>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleActionCheck(() => dispatch(toggleWishlist(item)));
                        }}
                        className={`absolute top-2 right-2 sm:top-6 sm:right-6 p-1.5 sm:p-2.5 rounded-full backdrop-blur-sm transition-all duration-200 shadow-sm cursor-pointer ${isWishlisted(item._id)
                          ? "bg-red-500 text-white"
                          : "bg-white/90 text-gray-400 hover:text-red-500"
                          }`}
                      >
                        <Heart
                          size={12}
                          className="sm:w-4 sm:h-4 w-3 h-3"
                          fill={isWishlisted(item._id) ? "currentColor" : "none"}
                        />
                      </button>
                    </div>

                    <div className="h-[35%] w-full p-1 sm:p-6 flex flex-col justify-between">
                      <div>
                        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-0.5 sm:mb-1">
                          <div className="mb-0.5 xl:mb-0 w-full sm:w-auto">
                            <p className="text-[7px] sm:text-[10px] font-bold tracking-[0.1em] sm:tracking-[0.2em] uppercase text-blue-500 sm:mb-1 truncate">
                              {item.Shape}
                            </p>
                            <h3 className="text-[10px] sm:text-lg lg:text-xl font-serif font-medium leading-tight truncate">
                              {item.Weight?.toFixed(2)} CT
                            </h3>
                          </div>
                          <div className="text-left xl:text-right">
                            <p className="text-[9px] sm:text-base lg:text-xl font-bold tracking-tight text-blue-600 dark:text-blue-400">
                              ${Number(item.Final_Price?.toFixed(2)).toLocaleString()}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1 sm:gap-2 text-[7px] sm:text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider sm:tracking-widest mt-0.5 sm:mt-1">
                          <span>{item.Color}</span>
                          <span className="text-gray-300 dark:text-gray-700">•</span>
                          <span>{item.Clarity}</span>
                          <span className="text-gray-300 dark:text-gray-700 hidden sm:inline">•</span>
                          <span className="hidden sm:inline">{item.Cut || "Ideal"}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between group/btn pt-1 sm:pt-3 border-t border-gray-100 dark:border-gray-800 mt-1 sm:mt-0">
                        <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-widest text-gray-500 group-hover/btn:text-blue-500 transition-colors">
                          <span className="hidden sm:inline">View </span>Details
                        </span>
                        <div className={`p-1 sm:p-2 rounded-full transition-all duration-300 group-hover/btn:translate-x-1 ${isDarkMode ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-600"}`}>
                          <ArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                        </div>
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

export default PublicInventory;
