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
import { normalizeDiamond } from "../../utils/diamondFields";


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
    shapes: serverMetadata?.shapes?.length ? serverMetadata.shapes : ["Round", "Princess", "Oval", "Marquise", "Emerald", "Pear", "Radiant", "Cushion", "Heart", "Asscher"],
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

          {/* <div className="flex flex-col items-center mt-6 sm:mt-8 w-full">
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
          </div> */}
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
                ) : data.map((rawItem, idx) => {
                  const item = normalizeDiamond(rawItem);
                  return (
                    <motion.div
                      key={item._id || idx}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      whileHover={{ y: -4 }}
                      onClick={() => handleActionCheck(() => setSelectedDiamond(item))}
                      className={`group relative flex flex-col rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 border
                      ${isDarkMode
                          ? "bg-[#1c1c1c] border-gray-800 hover:border-gray-600 shadow-md shadow-black/50"
                          : "bg-white border-gray-200 hover:border-gray-300 shadow-sm"
                        }`}
                    >
                      {/* Image Section */}
                      <div className={`relative w-full aspect-square flex items-center justify-center p-4 transition-colors duration-500
                      ${isDarkMode ? "bg-gradient-to-br from-[#2a2a2a] to-[#1c1c1c]" : "bg-[#F8F9FA]"}`}>

                        {/* Checkbox placeholder or Availability Badge */}
                        <div className="absolute top-3 left-3 z-10">
                          <span className="bg-white/90 backdrop-blur-sm text-black text-[7px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-widest shadow-sm">
                            {item.Availability || "IN STOCK"}
                          </span>
                        </div>

                        {/* Heart Icon (Top Right) */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleActionCheck(() => dispatch(toggleWishlist(item)));
                          }}
                          className={`absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full backdrop-blur-sm transition-all duration-200 cursor-pointer z-10 ${isWishlisted(item._id)
                            ? "bg-red-500 text-white shadow-md"
                            : isDarkMode ? "bg-black/40 text-gray-300 hover:text-white" : "bg-white border border-gray-100 text-gray-400 hover:text-gray-800 shadow-sm"
                            }`}
                        >
                          <Heart size={16} fill={isWishlisted(item._id) ? "currentColor" : "none"} />
                        </button>

                        {/* Diamond Image */}
                        {item.Diamond_Image ? (
                          <img
                            src={item.Diamond_Image}
                            alt={item.Shape}
                            loading="lazy"
                            className={`w-full h-full object-contain transition-transform duration-500 group-hover:scale-105 ${isDarkMode ? "mix-blend-screen" : "mix-blend-multiply"}`}
                          />
                        ) : (
                          <ShapeIcon
                            shape={item.Shape}
                            className={`w-28 h-28 ${isDarkMode ? "text-gray-600" : "text-gray-300"} transition-transform duration-500 group-hover:scale-105`}
                          />
                        )}

                        {/* Green Dot Indicator */}
                        <div className="absolute bottom-3 left-3 w-2.5 h-2.5 bg-green-500 rounded-full border border-white shadow-sm" title="Available"></div>
                      </div>

                      {/* Content Section */}
                      <div className={`flex flex-col flex-1 p-4 text-left border-t ${isDarkMode ? "border-gray-800" : "border-gray-50"}`}>
                        {/* Title Line */}
                        <h3 className={`text-sm sm:text-base font-bold truncate ${isDarkMode ? "text-gray-100" : "text-[#1a202c]"}`}>
                          {item.Shape} {item.Weight ? item.Weight.toFixed(2) : '0.00'}ct {item.Color} {item.Clarity}
                        </h3>

                        {/* Subtitle: Cut.Polish.Symmetry / Fluorescence */}
                        <p className={`text-[11px] sm:text-xs font-semibold mt-1 tracking-wider ${isDarkMode ? "text-gray-500" : "text-[#718096] uppercase"}`}>
                          {item.Cut ? `${item.Cut.charAt(0)}.` : 'E.'}
                          {item.Polish ? `${item.Polish.charAt(0)}.` : 'E.'}
                          {item.Symmetry ? `${item.Symmetry.charAt(0)}.` : '-'} / {item.Fluorescence || 'NONE'}
                        </p>

                        <div className="flex items-end justify-between mt-auto pt-4">
                          <div className="flex flex-col">
                            <span className={`text-sm sm:text-base font-bold ${isDarkMode ? "text-gray-100" : "text-[#718096]"}`}>
                              {item.Final_Price > 0
                                ? `$${item.Final_Price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                                : <span className="">Price on request</span>
                              }
                            </span>
                            <span className={`text-[10px] sm:text-[11px] font-medium mt-0.5 ${isDarkMode ? "text-gray-600" : "text-[#a0aec0]"}`}>
                              Total Price
                            </span>
                          </div>

                          {/* More options button equivalents or View Details arrow */}
                          <div className={`p-2 rounded-full transition-all duration-300 group-hover:translate-x-1 ${isDarkMode ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-600"}`}>
                            <ArrowRight className="w-3 h-3" />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
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
