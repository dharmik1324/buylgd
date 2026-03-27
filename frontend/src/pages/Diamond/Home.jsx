import { LuArrowRightFromLine } from "react-icons/lu";
import { About } from "./About";
import { useNavigate } from "react-router-dom";
import FeaturesSection from "../../components/diamond/FeaturesSection";
import SignatureShowcase from "../../components/diamond/SignatureShowcase";
import { useSelector } from "react-redux";

export const Home = () => {
    const navigate = useNavigate();
    const isDarkMode = useSelector((state) => state.theme.isDarkMode);

    return (
        <div className={isDarkMode ? "bg-black" : "bg-white"}>
            <div
                className="flex items-end justify-center h-[60vh] sm:h-[70vh] md:h-[80vh] lg:h-[90vh] pb-10 sm:pb-16 md:pb-20"
                style={{ backgroundImage: "url('../home-banner.png')", backgroundSize: "cover", backgroundPosition: "center" }}
            >
                <button
                    onClick={() => navigate("/filter-selection")}
                    className={`${isDarkMode ? "bg-white text-black hover:bg-gray-200" : "bg-black text-white hover:bg-[#111111]"} px-6 font-semibold text-base sm:text-lg py-2 sm:py-3 cursor-pointer rounded-full flex items-center gap-2 transition group relative`}
                >
                    Shop now <LuArrowRightFromLine />
                    <span className="absolute -top-12 left-1/2 -translate-x-1/2 bg-[#111111] text-white text-[10px] px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-white/20">
                        First select your category
                    </span>
                </button>
            </div>
            <FeaturesSection />
            <SignatureShowcase />
            <About />
        </div>
    )
}

