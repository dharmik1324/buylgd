import { LuArrowRight, LuSparkles, LuShield, LuAward, LuHeart, LuGem, LuStar } from "react-icons/lu";
import { useEffect, useRef, useState } from "react";

export const About = () => {
    const ref = useRef(null);
    const [show, setShow] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => entry.isIntersecting && setShow(true),
            { threshold: 0.3 }
        );

        const currentRef = ref.current;
        if (currentRef) {
            observer.observe(currentRef);
        }

        return () => {
            if (currentRef) {
                observer.disconnect();
            }
        };
    }, []);

    return (
        <section className="relative py-14 sm:py-18 md:py-24 px-4 md:px-12 bg-gradient-to-br from-blue-50 via-white to-blue-50 overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse delay-700"></div>

            <div
                ref={ref}
                className={`relative container mx-auto flex flex-col md:flex-row items-center gap-14 transition-all duration-1000 
        ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-16"}`}
            >
                <div className="w-full md:w-1/2 relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-300 to-blue-300 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
                    <img
                        src="https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=2060&auto=format&fit=crop"
                        alt="Exquisite Blue Diamond Necklace"
                        className="relative w-full h-[300px] sm:h-[400px] md:h-[500px] object-cover rounded-2xl shadow-2xl hover:scale-[1.02] transition duration-700"
                    />
                    <div className="absolute top-6 right-6 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
                        <span className="text-sm font-semibold text-blue-600">✨ Certified Diamonds</span>
                    </div>
                </div>

                <div className="w-full md:w-1/2 space-y-6">
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-blue-100 px-4 py-2 rounded-full">
                        <LuSparkles className="text-blue-500" />
                        <h4 className="text-sm font-bold tracking-[0.2em] text-blue-700 uppercase">
                            Our Legacy
                        </h4>
                    </div>

                    <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-500 to-blue-600 leading-tight">
                        World's Finest <span className="">Diamonds</span>
                    </h2>

                    <p className="text-gray-700 text-lg leading-relaxed">
                        For over two decades, we have been trusted diamond suppliers, offering the finest
                        selection of certified loose diamonds from around the world. Each diamond is carefully
                        sourced from ethical mines and undergoes rigorous quality inspection.
                    </p>

                    <p className="text-gray-700 text-lg leading-relaxed">
                        We specialize in natural and lab-grown diamonds of all shapes, sizes, and qualities.
                        From brilliant round cuts to fancy shapes like princess, emerald, and cushion cuts,
                        we provide diamonds that meet the highest international standards.
                    </p>

                    <p className="text-gray-700 text-lg leading-relaxed">
                        Every diamond comes with complete certification from GIA, IGI, or HRD, ensuring
                        authenticity, quality, and value. We offer competitive wholesale and retail pricing
                        with complete transparency in grading and pricing.
                    </p>

                    <button className="bg-gradient-to-r from-blue-400 to-blue-400 text-white px-8 py-4 rounded-full flex items-center gap-3 hover:shadow-2xl hover:scale-105 transition-all duration-300 group">
                        View Our Diamond Inventory
                        <LuArrowRight className="group-hover:translate-x-2 transition-transform" />
                    </button>
                </div>
            </div>

            {/* Why Choose Us Section */}
            <div className="relative max-w-7xl mx-auto mt-14 sm:mt-18 md:mt-24">
                <div className="text-center mb-12">
                    <h3 className="text-2xl sm:text-3xl md:text-4xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-600 mb-4">
                        Why Choose Our Diamonds
                    </h3>
                    <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                        We are committed to excellence in sourcing, grading, and delivering the finest diamonds
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
                    {[
                        {
                            icon: LuShield,
                            title: "100% Certified",
                            desc: "Every diamond comes with international certification from GIA, IGI, or HRD. Complete transparency in grading reports including cut, color, clarity, and carat weight.",
                            gradient: "from-blue-400 to-cyan-400"
                        },
                        {
                            icon: LuGem,
                            title: "Ethically Sourced",
                            desc: "All our diamonds are conflict-free and sourced from responsible mines. We follow Kimberley Process certification and maintain complete supply chain transparency.",
                            gradient: "from-blue-400 to-rose-400"
                        },
                        {
                            icon: LuAward,
                            title: "Best Pricing",
                            desc: "Direct sourcing from diamond centers worldwide ensures competitive pricing. We offer wholesale rates for bulk orders and flexible payment terms for trusted clients.",
                            gradient: "from-purple-400 to-indigo-400"
                        },
                    ].map((item, i) => (
                        <div
                            key={i}
                            className="relative group bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-3 transition-all duration-500 border border-gray-100"
                        >
                            <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-500`}></div>
                            <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${item.gradient} text-white mb-4 shadow-md`}>
                                <item.icon className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-[#111111]">{item.title}</h3>
                            <p className="text-gray-600 leading-relaxed">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Diamond Shapes Section */}
            <div className="relative max-w-7xl mx-auto mt-14 sm:mt-18 md:mt-24">
                <div className="text-center mb-12">
                    <h3 className="text-2xl sm:text-3xl md:text-4xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-600 mb-4">
                        Available Diamond Shapes
                    </h3>
                    <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                        We offer all popular diamond cuts and fancy shapes to suit every preference
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                    {[
                        { shape: "Round Brilliant", desc: "Most popular and brilliant cut", icon: LuGem },
                        { shape: "Princess Cut", desc: "Square shape with brilliant facets", icon: LuStar },
                        { shape: "Emerald Cut", desc: "Rectangular with step-cut facets", icon: LuHeart },
                        { shape: "Cushion Cut", desc: "Rounded corners, vintage appeal", icon: LuAward },
                    ].map((item, i) => (
                        <div key={i} className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100">
                            <div className="flex items-center justify-center mb-4">
                                <item.icon className="w-12 h-12 text-blue-500" />
                            </div>
                            <h4 className="text-lg font-bold text-[#111111] mb-2 text-center">{item.shape}</h4>
                            <p className="text-gray-600 text-sm text-center">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Statistics Section */}
            <div className="relative max-w-7xl mx-auto mt-18 sm:mt-24 md:mt-32 grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 md:gap-10 text-center">
                {[
                    { num: "25+", label: "Years in Diamond Trade", color: "from-blue-500 to-cyan-500" },
                    { num: "50K+", label: "Diamonds Sold", color: "from-blue-500 to-rose-500" },
                    { num: "1000+", label: "Active Inventory", color: "from-purple-500 to-indigo-500" },
                    { num: "100%", label: "Certified Authentic", color: "from-emerald-500 to-teal-500" },
                ].map((stat, i) => (
                    <div key={i} className="space-y-3 group">
                        <div className="relative inline-block">
                            <h3 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
                                {stat.num}
                            </h3>
                            <div className={`absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r ${stat.color} rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500`}></div>
                        </div>
                        <p className="text-gray-700 tracking-wide font-medium">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Customer Promise Section */}
            <div className="relative max-w-4xl mx-auto mt-14 sm:mt-18 md:mt-24 overflow-hidden rounded-3xl shadow-xl border border-gray-100 group">
                <div className="absolute inset-0">
                    <img
                        src="https://images.unsplash.com/photo-1573408301185-9146fe634ad0?q=80&w=2075&auto=format&fit=crop"
                        alt="Background"
                        className="w-full h-full object-cover opacity-10 group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-100/90 via-white/90 to-blue-100/90 backdrop-blur-sm"></div>
                </div>

                <div className="relative p-6 sm:p-8 md:p-12 text-center">
                    <LuHeart className="w-12 h-12 text-blue-500 mx-auto mb-6" />
                    <h3 className="text-3xl font-serif text-[#111111] mb-4">Our Commitment</h3>
                    <p className="text-gray-700 text-lg leading-relaxed mb-6">
                        We guarantee the authenticity and quality of every diamond we sell. All diamonds come
                        with complete certification and grading reports. We offer buyback options, upgrade programs,
                        and a 7-day inspection period. Your satisfaction and trust are our top priorities.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
                        <span className="bg-white px-4 py-2 rounded-full shadow-sm">✓ GIA/IGI Certified</span>
                        <span className="bg-white px-4 py-2 rounded-full shadow-sm">✓ Conflict-Free</span>
                        <span className="bg-white px-4 py-2 rounded-full shadow-sm">✓ 7-Day Inspection</span>
                        <span className="bg-white px-4 py-2 rounded-full shadow-sm">✓ Buyback Available</span>
                    </div>
                </div>
            </div>
        </section>
    );
};

