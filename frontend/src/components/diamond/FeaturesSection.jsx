import { Award, Pencil, Leaf } from "lucide-react";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";

const features = [
  // ... (rest of features stays same)
  {
    icon: <Award className="w-8 h-8 text-blue-500" />,
    title: "CERTIFIED DIAMONDS",
    description:
      "Each stone in our collection is meticulously inspected and GIA-certified to ensure peak clarity, cut, and brilliance.",
  },
  {
    icon: <Pencil className="w-8 h-8 text-blue-500" />,
    title: "CUSTOM DESIGN",
    description:
      "Collaborate with our master artisans to translate your vision into a unique, one-of-a-kind jewelry masterpiece.",
  },
  {
    icon: <Leaf className="w-8 h-8 text-blue-500" />,
    title: "ETHICAL SOURCING",
    description:
      "We are committed to conflict-free sourcing and sustainable practices, upholding the highest standards of integrity.",
  },
];

export default function FeaturesSection() {
  const isDarkMode = useSelector((state) => state.theme.isDarkMode);
  const bgClass = isDarkMode ? "bg-black" : "bg-white";
  const cardBgClass = isDarkMode ? "bg-gradient-to-b from-[#111111] to-black border-[#111111]" : "bg-gray-50 border-gray-200";
  const textClass = isDarkMode ? "text-white" : "text-black";
  const subTextClass = isDarkMode ? "text-gray-400" : "text-gray-700";

  return (
    <section className={`${bgClass} py-14 sm:py-20 px-4 sm:px-6 transition-colors duration-300`}>
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
        {features.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.2 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.05 }}
            className={`${cardBgClass} border rounded-2xl p-8 hover:border-blue-500 transition-all duration-300 shadow-sm`}
          >
            <div className="mb-6">{item.icon}</div>

            <h3 className={`${textClass} font-semibold text-lg mb-4 tracking-wide`}>
              {item.title}
            </h3>

            <p className={`${subTextClass} text-sm leading-relaxed`}>
              {item.description}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}


