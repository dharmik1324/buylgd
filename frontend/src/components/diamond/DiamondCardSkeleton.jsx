export const DiamondCardSkeleton = ({ isDarkMode }) => {
    const cardBg = isDarkMode ? "bg-black border-[#111111]" : "bg-white border-gray-100";
    const skeletonBg1 = isDarkMode ? "bg-gray-500" : "bg-gray-100";
    const skeletonBg2 = isDarkMode ? "bg-gray-400" : "bg-gray-200";
    const skeletonBg3 = isDarkMode ? "bg-gray-300" : "bg-gray-300";

    return (
        <div className={`${cardBg} rounded-[2rem] overflow-hidden shadow-sm border animate-pulse flex flex-col`}>

            <div className={`aspect-square w-full ${skeletonBg1}`} />

            <div className="p-8 flex flex-col flex-grow">

                <div className="mb-6">
                    <div className={`h-6 w-32 ${skeletonBg2} rounded mb-3`} />
                    <div className={`h-1 w-12 ${skeletonBg2} rounded-full`} />
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i}>
                            <div className={`h-3 w-16 ${skeletonBg2} rounded mb-2`} />
                            <div className={`h-4 w-20 ${skeletonBg3} rounded`} />
                        </div>
                    ))}
                </div>

                <div className={`mt-auto pt-6 border-t ${isDarkMode ? "border-[#111111]" : "border-gray-50"}`}>
                    <div className={`h-3 w-20 ${skeletonBg2} rounded mb-2`} />
                    <div className={`h-6 w-24 ${skeletonBg3} rounded`} />
                </div>
            </div>
        </div>
    );
};

