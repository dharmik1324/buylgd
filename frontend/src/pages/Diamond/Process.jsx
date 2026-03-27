import { motion } from "framer-motion";
import { useSelector } from "react-redux";

const steps = [
  {
    tag: "STEP ONE",
    title: "THE ETHICAL SELECTION",
    description:
      "Every exceptional diamond begins with responsible sourcing. We partner exclusively with conflict-free suppliers who adhere to the highest environmental and ethical standards.",
    image: "../../assets/ETHICAL.webp",
  },
  {
    tag: "STEP TWO",
    title: "MATHEMATICAL PRECISION",
    description:
      "Master cutters apply scientific precision to maximize brilliance. Every angle, depth, and facet is calculated to unlock the diamond’s full light performance.",
    image: "../../assets/MATHEMATICAL.jpg",
  },
  {
    tag: "STEP THREE",
    title: "MASTER POLISHING",
    description:
      "Each facet is meticulously polished to achieve perfect symmetry and extraordinary radiance. This final refinement ensures unmatched brilliance.",
    image: "../../assets/MASTER.jpg",
  },
  {
    tag: "STEP FOUR",
    title: "FINAL CERTIFICATION",
    description:
      "Every diamond undergoes rigorous grading by internationally recognized gemological laboratories to verify authenticity, cut, clarity, and carat weight.",
    image: "../../assets/ETHICAL.webp",
  },
];

export const Process = () => {
  const isDarkMode = useSelector((state) => state.theme.isDarkMode);

  const bgMain = isDarkMode ? "bg-gradient-to-b from-[#0f1b10] to-[#050c13]" : "bg-white";
  const textMain = isDarkMode ? "text-white" : "text-black";
  const textSub = isDarkMode ? "text-gray-400" : "text-gray-600";
  const accentColor = isDarkMode ? "text-blue-400" : "text-blue-500";
  const stepCardBg = isDarkMode ? "bg-[#0d2236]" : "bg-gray-100";

  return (
    <section className={`relative ${bgMain} ${textMain} py-16 sm:py-20 md:py-28 px-4 sm:px-6 overflow-hidden transition-colors duration-300`}>

      {/* Background Diamond */}
      <img
        src="../../assets/Process-bg.jpg"
        alt="Background Diamond"
        className={`absolute top-20 left-1/2 -translate-x-1/2 ${isDarkMode ? "opacity-6" : "opacity-0"} w-[600px] pointer-events-none`}
      />

      {/* Header */}
      <div className="max-w-4xl mx-auto text-center mb-16 sm:mb-20 md:mb-28 relative z-10">
        <p className={`${accentColor} text-xs tracking-[0.3em] uppercase mb-4 font-bold`}>
          Our Process
        </p>

        <h2 className={`text-3xl sm:text-4xl md:text-5xl font-semibold mb-4 sm:mb-6 ${textMain}`}>
          Crafting <span className={accentColor}>Eternity</span>
        </h2>

        <p className={`${textSub} max-w-2xl mx-auto`}>
          From ethical sourcing to master craftsmanship, every diamond undergoes
          a journey of precision, integrity, and excellence.
        </p>
      </div>

      {/* Steps */}
      <div className="max-w-6xl mx-auto space-y-16 sm:space-y-24 md:space-y-32 relative z-10">
        {steps.map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 md:gap-16 items-center"
          >
            {/* Content */}
            <div className={`${index % 2 !== 0 ? "md:order-2" : ""}`}>
              <span className={`${accentColor} text-xs tracking-widest uppercase mb-4 inline-block font-bold`}>
                {step.tag}
              </span>

              <h3 className={`text-2xl md:text-3xl font-semibold mb-6 ${textMain}`}>
                {step.title}
              </h3>

              <p className={`${textSub} leading-relaxed`}>
                {step.description}
              </p>
            </div>

            {/* Image */}
            <div className={`${index % 2 !== 0 ? "md:order-1" : ""}`}>
              <div className={`${stepCardBg} rounded-2xl shadow-xl transition-colors duration-300`}>
                <img
                  src={step.image}
                  alt={step.title}
                  className="w-full object-cover rounded-xl hover:scale-105 transition duration-500"
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}


