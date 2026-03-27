import { useSelector } from "react-redux";

export const Footer = () => {
    const isDarkMode = useSelector((state) => state.theme.isDarkMode);
    const bgClass = isDarkMode ? "bg-black" : "bg-white";
    const textClass = isDarkMode ? "text-white" : "text-black";
    const subTextClass = isDarkMode ? "text-gray-400" : "text-gray-600";
    const borderClass = isDarkMode ? "border-[#111111]" : "border-gray-200";

    return (
        <footer className={`border-t ${borderClass} ${bgClass} ${textClass} pt-12 sm:pt-16 pb-8 sm:pb-12 transition-colors duration-300`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 sm:gap-14">

                <div>
                    <p className={`text-2xl font-bold ${textClass}`}>Diamonds</p>

                    <h3 className={`font-semibold tracking-wide ${subTextClass} mb-3 uppercase text-sm`}>
                        DIAMOND LLP
                    </h3>
                </div>

                <div>
                    <h3 className={`font-semibold ${subTextClass} mb-4 sm:mb-6 uppercase text-sm`}>Quick Links</h3>
                    <ul className={`space-y-2 sm:space-y-3 text-sm ${isDarkMode ? "text-gray-400" : "text-gray-700"}`}>
                        <li className="hover:text-blue-400 cursor-pointer transition">Home</li>
                        <li className="hover:text-blue-400 cursor-pointer transition">About Us</li>
                        <li className="hover:text-blue-400 cursor-pointer transition">Inventory</li>
                        <li className="hover:text-blue-400 cursor-pointer transition">Process</li>
                        <li className="hover:text-blue-400 cursor-pointer transition">Knowledge</li>
                        <li className="hover:text-blue-400 cursor-pointer transition">Contact Us</li>
                        <li className="hover:text-blue-400 cursor-pointer transition">Faqs</li>
                        <li className="hover:text-blue-400 cursor-pointer transition">Special Cut</li>
                    </ul>
                </div>

                <div className="hidden md:block"></div>

                <div className="sm:col-span-2 md:col-span-1">
                    <h2 className={`text-2xl sm:text-3xl font-serif ${isDarkMode ? "text-white" : "text-[#111111]"} mb-6 sm:mb-8`}>
                        Get in Touch
                    </h2>

                    <div className="space-y-4 sm:space-y-5">
                        <input
                            type="text"
                            placeholder="Name"
                            className={`w-full border ${isDarkMode ? "border-gray-700 bg-[#111111] text-white" : "border-blue-200 bg-gray-50"} rounded-full px-5 py-3 outline-none focus:border-blue-400 transition`}
                        />

                        <input
                            type="email"
                            placeholder="Email"
                            className={`w-full border ${isDarkMode ? "border-gray-700 bg-[#111111] text-white" : "border-blue-200 bg-gray-50"} rounded-full px-5 py-3 outline-none focus:border-blue-400 transition`}
                        />

                        <textarea
                            placeholder="Message"
                            rows="4"
                            className={`w-full border ${isDarkMode ? "border-gray-700 bg-[#111111] text-white" : "border-blue-200 bg-gray-50"} rounded-3xl px-5 py-3 outline-none resize-none focus:border-blue-400 transition`}
                        />

                        <button className="w-full bg-blue-500 text-white px-10 py-3 rounded-full hover:bg-blue-600 transition shadow-lg font-bold">
                            Send Message
                        </button>
                    </div>
                </div>
            </div>
        </footer>
    );
}

