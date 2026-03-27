import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useSelector } from "react-redux";
import { ShapeIcon } from "../../components/diamond/DiamondShapeIcons";

const cuts = [
  {
    tag: "DRAMATIC SILHOUETTE",
    title: "The Marquise Cut",
    shape: "Marquise",
    description:
      "Featuring a unique football-shaped silhouette, the Marquise cut maximizes carat weight and creates an elegant, elongating effect. Originally commissioned by King Louis XV to match the smile of the Marquise de Pompadour.",
    personality: "Vintage Sophistication",
    facets: "57–58 Standard",
    image: "../../assets/Marquise.webp", // Replace with your exact diamond image
  },
  {
    tag: "TIMELESS ELEGANCE",
    title: "The Pear Cut",
    shape: "Pear",
    description:
      "A harmonious blend of round brilliance and marquise elegance, the Pear cut features a single point and rounded edge for graceful sparkle and refined beauty.",
    personality: "Bold & Graceful",
    facets: "58 Brilliant Facets",
    image: "../../assets/Pear.webp",
  },
  {
    tag: "ARCHITECTURAL CLARITY",
    title: "The Emerald Cut",
    shape: "Emerald",
    description:
      "Distinguished by step cuts and a large open table, the Emerald cut emphasizes clarity and understated sophistication over intense sparkle.",
    personality: "Modern Classic",
    facets: "47–50 Facets",
    image: "../../assets/Emerald.webp",
  },
  {
    tag: "ROMANTIC LUXURY",
    title: "The Cushion Cut",
    shape: "Cushion",
    description:
      "A square or rectangular shape with softly rounded corners, the Cushion cut offers vintage charm with exceptional brilliance.",
    personality: "Timeless & Radiant",
    facets: "Up to 64 Facets",
    image: "../../assets/Cushion.webp",
  },
  {
    tag: "SYMBOL OF LOVE",
    title: "The Heart Cut",
    shape: "Heart",
    description:
      "A true emblem of romance, the Heart cut requires master craftsmanship to achieve perfect symmetry and maximum sparkle.",
    personality: "Romantic & Rare",
    facets: "59–63 Facets",
    image: "../../assets/Heart.webp",
  },
];

export const SpecialCuts = () => {
  const isDarkMode = useSelector((state) => state.theme.isDarkMode);

  const bgMain = isDarkMode ? "bg-gradient-to-b from-[#0a0303] to-[#0c1722]" : "bg-white";
  const textMain = isDarkMode ? "text-white" : "text-black";
  const textSub = isDarkMode ? "text-gray-400" : "text-gray-600";
  const accentColor = isDarkMode ? "text-blue-400" : "text-blue-500";
  const accentBg = isDarkMode ? "bg-blue-500/20" : "bg-blue-500/10";
  const accentBorder = isDarkMode ? "text-blue-400" : "text-blue-500";
  const cardBg = isDarkMode ? "bg-[#0d2236]" : "bg-gray-100";

  return (
    <section className={`${bgMain} ${textMain} py-14 sm:py-18 md:py-24 px-4 sm:px-6 transition-colors duration-300`}>

      {/* Header */}
      <div className="max-w-4xl mx-auto text-center mb-14 sm:mb-18 md:mb-24">
        <p className={`${accentColor} text-xs tracking-[0.3em] uppercase mb-4 font-bold`}>
          The Diamond Guide
        </p>

        <h2 className={`text-3xl sm:text-4xl md:text-5xl font-semibold mb-4 sm:mb-6 ${textMain}`}>
          The Art of <span className={accentColor}>the Cut</span>
        </h2>

        <p className={`${textSub} max-w-2xl mx-auto`}>
          A curated showcase of the world's most prestigious diamond cuts,
          each selected for its brilliance, craftsmanship, and timeless appeal.
        </p>
      </div>

      {/* Sections */}
      <div className="max-w-6xl mx-auto space-y-16 sm:space-y-24 md:space-y-32">
        {cuts.map((cut, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className={`grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 md:gap-16 items-center ${index % 2 !== 0 ? "md:flex-row-reverse" : ""
              }`}
          >
            <div className={`${index % 2 !== 0 ? "md:order-2" : ""}`}>
              <div className={`${cardBg} shadow-2xl rounded-3xl transition-colors duration-300`}>
                {cut.image ? (
                  <img
                    src={cut.image}
                    alt={cut.title}
                    className="w-full rounded-3xl object-contain hover:scale-105 transition duration-500 mix-blend-screen"
                  />
                ) : (
                  <div className="p-12 flex items-center justify-center">
                    <ShapeIcon shape={cut.shape} className={`w-32 h-32 ${isDarkMode ? "text-slate-800" : "text-slate-100"}`} />
                  </div>
                )}
              </div>
            </div>

            <div>
              <span className={`inline-block text-xs tracking-widest ${accentBg} ${accentColor} px-4 py-1 rounded-full mb-6 font-bold`}>
                {cut.tag}
              </span>

              <h3 className={`text-2xl md:text-3xl font-semibold mb-6 ${textMain}`}>
                {cut.title}
              </h3>

              <p className={`${textSub} leading-relaxed mb-8`}>
                {cut.description}
              </p>

              <div className="grid grid-cols-2 gap-10 mb-8 text-sm">
                <div>
                  <p className="text-gray-500 uppercase tracking-widest mb-2">
                    Personality
                  </p>
                  <p className={`${textMain} font-medium`}>
                    {cut.personality}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500 uppercase tracking-widest mb-2">
                    Facets
                  </p>
                  <p className={`${textMain} font-medium`}>
                    {cut.facets}
                  </p>
                </div>
              </div>

              <button className={`${accentColor} flex items-center gap-2 text-sm font-bold tracking-wide hover:underline`}>
                View {cut.title.split(" ")[1]} Inventory
                <ArrowRight size={16} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

