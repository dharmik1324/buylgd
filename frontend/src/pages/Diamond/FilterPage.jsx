import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchDiamonds } from "../../store/diamondSlice";
import { FilterDetails } from "../../components/diamond/FilterDetails";
import { motion } from "framer-motion";

export const FilterPage = () => {
    const dispatch = useDispatch();
    const isDarkMode = useSelector((state) => state.theme.isDarkMode);
    const {
        data,
        loading,
        metadata: serverMetadata,
        totalDiamonds,
    } = useSelector((state) => state.diamonds);

    useEffect(() => {
        dispatch(fetchDiamonds({ page: 1, limit: 1 }));
    }, [dispatch]);

    const metadata = {
        shapes:
            serverMetadata?.shapes && serverMetadata.shapes.length
                ? serverMetadata.shapes
                : ["Round", "Princess", "Emerald", "Pear", "Oval", "Radiant", "Marquise", "Cushion", "Heart", "Asscher", "Square Radiant", "Old Miner", "European Cut", "Rose", "Triangular"],
        colors:
            serverMetadata?.colors && serverMetadata.colors.length
                ? serverMetadata.colors
                : ["D", "E", "F", "G", "H", "I", "J"],
        clarities:
            serverMetadata?.clarities && serverMetadata.clarities.length
                ? serverMetadata.clarities
                : ["IF", "VVS1", "VVS2", "VS1", "VS2", "SI1"],
        cuts: ["ID", "EX", "VG"],
        polish: ["EX", "VG"],
        symmetry: ["EX", "VG"],
        priceMin: serverMetadata?.priceMin ?? 500,
        priceMax: serverMetadata?.priceMax ?? 20000,
        caratMin: serverMetadata?.caratMin ?? 0.1,
        caratMax: serverMetadata?.caratMax ?? 10,
        hasCarat: true,
    };

    return (
        <div className={`min-h-screen py-12 px-4 sm:px-6 lg:px-8 flex justify-center items-start ${isDarkMode ? "bg-black/80" : "bg-gray-50"}`}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-[1400px]"
            >
                <div className="text-center mb-10">
                    <h1 className={`text-4xl font-serif mb-4 ${isDarkMode ? "text-white" : "text-[#111111]"}`}>
                        <span className={` ${isDarkMode ? "text-white" : "text-[#111111]"}`}>BUYLGD</span>
                    </h1>
                    <div className={`overflow-hidden flex w-full max-w-2xl mx-auto rounded-full relative ${isDarkMode ? "bg-blue-500/10 border border-blue-500/20" : "bg-blue-600/20"}`}>
                        <div className="animate-marquee py-1">
                            {[...Array(4)].map((_, i) => (
                                <span key={i} className={`${isDarkMode ? "text-blue-300" : "text-gray-900"} px-4 whitespace-nowrap`}>
                                    Select your preferences below to discover diamonds that match your unique style and budget.
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="rounded-3xl overflow-hidden">
                    <FilterDetails
                        metadata={metadata}
                        resultsCount={totalDiamonds}
                        loading={loading}
                        filters={{}}
                        isDarkMode={isDarkMode}
                    />
                </div>
            </motion.div >
        </div >
    );
};

export default FilterPage;

