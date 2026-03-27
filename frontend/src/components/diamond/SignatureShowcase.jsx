import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import { ShapeIcon } from "./DiamondShapeIcons";

const items = [
  {
    title: "THE EMERALD",
    shape: "Emerald",
    button: "VIEW GALLERY",
    image:
      "https://static.vecteezy.com/system/resources/thumbnails/053/755/358/small/multiple-green-gemstones-are-elegantly-arranged-on-luxurious-dark-green-fabric-photo.jpg",
  },
  {
    title: "ROUND SHAPE",
    shape: "Round",
    button: "EXPLORE PIECES",
    image:
      "https://admin-pages-images.s3.amazonaws.com/page_image/RackMultipart20220718-13-codkd3.jpg",
  },
  {
    title: "PRINCESS SHAPE",
    shape: "Princess",
    button: "EXPLORE PIECES",
    image:
      "https://www.qualitydiamonds.co.uk/media/1130/loose-princess-diamond-in-tweezers.jpeg?anchor=center&mode=crop&width=900&height=500&rnd=131595521020000000&format=webp",
  },
  {
    title: "PEAR SHAPE",
    shape: "Pear",
    button: "DISCOVER MORE",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT801gtiECCNyEXMUarHUFDYqiBkEBRxty6qg&s",
  },
];

export default function SignatureShowcase() {
  const isDarkMode = useSelector((state) => state.theme.isDarkMode);

  const bgClass = isDarkMode ? "bg-black" : "bg-white";
  const textClass = isDarkMode ? "text-white" : "text-black";
  const subTextClass = isDarkMode ? "text-gray-400" : "text-gray-600";
  const nameTextClass = isDarkMode ? "text-gray-500" : "text-gray-700";

  return (
    <section className={`${bgClass} ${textClass} py-14 sm:py-20 px-4 sm:px-6 transition-colors duration-300`}>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="max-w-6xl mx-auto text-center mb-10 sm:mb-14"
      >
        <h2 className={`text-2xl sm:text-3xl tracking-widest font-semibold ${textClass}`}>
          SIGNATURE SHOWCASE
        </h2>
        <div className="w-16 h-1 bg-blue-500 mx-auto mt-4"></div>
      </motion.div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 auto-rows-[250px] sm:auto-rows-[300px]">
        {items.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.2 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.03 }}
            className={`relative rounded-2xl overflow-hidden ${index === 0 || index === 3 ? "md:row-span-2" : ""
              }`}
          >
            {item.image ? (
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
              />
            ) : (
              <div className={`w-full h-full flex items-center justify-center ${isDarkMode ? "bg-slate-900" : "bg-slate-50"}`}>
                <ShapeIcon shape={item.shape} className={`w-1/3 h-1/3 ${isDarkMode ? "text-slate-800" : "text-slate-100"}`} />
              </div>
            )}

            <div className="absolute inset-0 bg-black/50 flex flex-col justify-end p-4 sm:p-6">
              <h3 className="font-semibold mb-2 sm:mb-3 text-white text-sm sm:text-base">{item.title}</h3>

              <button className="text-blue-400 text-xs sm:text-sm flex items-center gap-2 hover:text-blue-300 transition w-fit">
                {item.button} <ArrowRight size={16} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="max-w-3xl mx-auto text-center mt-14 sm:mt-20 px-4"
      >
        <p className={`${subTextClass}  text-base sm:text-lg leading-relaxed`}>
          "The craftsmanship is truly unparalleled. Luxe Diamonds helped me
          design the perfect engagement ring, and the process was as brilliant
          as the diamond itself."
        </p>

        <p className={`mt-4 sm:mt-6 text-sm tracking-widest ${nameTextClass}`}>
          JAMES HARRINGTON
        </p>

        <div className="flex justify-center gap-1 mt-3 text-blue-500">
          ★★★★★
        </div>
      </motion.div>
    </section>
  );
}

