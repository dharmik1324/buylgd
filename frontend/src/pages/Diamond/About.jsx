import { LuArrowRight } from "react-icons/lu";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import floatingHero from "../../assets/floating-hero.png";
import luxuryBg from "../../assets/luxury-bg.png";

export const About = () => {
    const ref = useRef(null);
    const [show, setShow] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => entry.isIntersecting && setShow(true),
            { threshold: 0.3 }
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    const isDarkMode = useSelector((state) => state.theme.isDarkMode);
    const bgClass = isDarkMode ? "bg-black" : "bg-white";
    const textClass = isDarkMode ? "text-white" : "text-slate-900";
    const subTextClass = isDarkMode ? "text-gray-400" : "text-slate-600";

    return (
        <section className={`relative py-20 md:py-32 px-4 md:px-12 ${bgClass} overflow-hidden transition-colors duration-300`}>
            {/* Background Diamond Facets */}
            <div 
                className="absolute inset-0 z-0 opacity-20 pointer-events-none bg-cover bg-center"
                style={{ backgroundImage: `url(${luxuryBg})`, filter: 'brightness(1.1)' }}
            />

            <div
                ref={ref}
                className={`container mx-auto relative z-10 flex flex-col md:flex-row items-center gap-16 transition-all duration-1000 
                ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-16"}`}
            >
                <div className="w-full md:w-1/2 relative group">
                    <div className="absolute -inset-4 bg-blue-500/10 rounded-[40px] blur-3xl group-hover:bg-blue-500/20 transition-all duration-700" />
                    <img
                        src={floatingHero}
                        alt="Luxury Anti-Gravity Showpiece"
                        className="relative w-full h-auto object-contain rounded-[40px] drop-shadow-[0_20px_50px_rgba(0,0,0,0.15)] hover:scale-[1.02] transition duration-700"
                    />
                </div>

                <div className="w-full md:w-1/2 space-y-8">
                    <div className="space-y-4">
                        <span className="inline-block text-xs font-black tracking-[0.4em] uppercase text-blue-600">
                            Beyond Gravity
                        </span>
                        <h2 className={`text-4xl sm:text-5xl md:text-7xl font-bold leading-tight ${textClass}`}>
                            The Art of <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-400">Pure Brilliance</span>
                        </h2>
                    </div>

                    <div className="space-y-6 max-w-xl">
                        <p className={`text-xl font-medium leading-relaxed ${subTextClass}`}>
                            At BUYLGD, we don't just sell diamonds; we curate celestial experiences. Our "Anti-Gravity" collection represents the pinnacle of lab-grown innovation—where every facet is a masterpiece of precision.
                        </p>
                        <p className={`text-lg leading-relaxed ${subTextClass} opacity-80`}>
                            Using state-of-the-art physics and artistic mastery, we've unlocked a level of clarity and fire that was once thought impossible. Experience the weightless elegance of the future.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-4 pt-4">
                        <button className="bg-blue-600 text-white px-10 py-5 rounded-2xl flex items-center gap-3 font-bold text-sm tracking-widest uppercase hover:bg-blue-700 hover:shadow-2xl hover:shadow-blue-500/30 transition-all active:scale-95 group">
                            Explore Collection
                            <LuArrowRight className="group-hover:translate-x-1 transition-transform" />
                        </button>
                        <button className={`px-10 py-5 rounded-2xl border ${isDarkMode ? 'border-slate-800 text-white' : 'border-slate-200 text-slate-900'} font-bold text-sm tracking-widest uppercase hover:bg-slate-50 transition-all`}>
                            Our Heritage
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto mt-14 sm:mt-20 grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
                {[
                    { title: "Ethically Sourced", desc: "Conflict-free diamonds from trusted origins" },
                    { title: "Master Craftsmanship", desc: "Hand-cut by skilled artisans" },
                    { title: "Certified Quality", desc: "Every gem verified for brilliance" },
                ].map((item, i) => (
                    <div
                        key={i}
                        className={`${isDarkMode ? "bg-[#111111] border-[#111111]" : "bg-slate-100/90 border-slate-200/50"} p-8 rounded-2xl shadow-lg hover:-translate-y-2 transition-all duration-500 border relative z-10`}
                    >
                        <h3 className={`text-xl font-semibold mb-3 ${textClass}`}>{item.title}</h3>
                        <p className={subTextClass}>{item.desc}</p>
                    </div>
                ))}
            </div>

            <div className="max-w-7xl mx-auto mt-16 sm:mt-20 md:mt-24 grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 md:gap-10 text-center">
                {[
                    { num: "25+", label: "Years Experience" },
                    { num: "10K+", label: "Happy Clients" },
                    { num: "500+", label: "Unique Designs" },
                    { num: "100%", label: "Certified Diamonds" },
                ].map((stat, i) => (
                    <div key={i} className="space-y-2">
                        <h3 className={`text-2xl sm:text-3xl md:text-4xl font-bold ${textClass}`}>{stat.num}</h3>
                        <p className={`${subTextClass} tracking-wide`}>{stat.label}</p>
                    </div>
                ))}
            </div>
        </section>
    );

};

