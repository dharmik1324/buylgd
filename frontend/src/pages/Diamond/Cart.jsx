import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ShapeIcon } from "../../components/diamond/DiamondShapeIcons";
import { motion } from "framer-motion";
import { ShoppingBag, ChevronRight, Trash2, Clock } from "lucide-react";
import { releaseHold } from "../../store/diamondSlice";
import { removeFromCart } from "../../store/cartSlice";

export const Cart = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const cartItems = useSelector((state) => state.cart.items);
    const isDarkMode = useSelector((state) => state.theme.isDarkMode);

    const handleRemove = async (id) => {
        try {
            await dispatch(releaseHold(id)).unwrap();
            dispatch(removeFromCart(id));
        } catch (err) {
            dispatch(removeFromCart(id));
        }
    };


    return (
        <div className={`min-h-screen py-8 md:py-16 px-4 sm:px-6 lg:px-8 ${isDarkMode ? "bg-[#0A0A0A]" : "bg-[#F8F9FA]"}`}>
            <div className="max-w-5xl mx-auto">
                <div className="flex items-center gap-4 mb-10">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all duration-300 ${isDarkMode ? "bg-white/5 border-white/10" : "bg-white border-gray-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.1)]"}`}>
                        <Clock className={isDarkMode ? "text-blue-400" : "text-blue-500"} size={28} strokeWidth={1.5} />
                    </div>
                    <div>
                        <h1 className={`text-2xl md:text-3xl font-serif tracking-tight ${isDarkMode ? "text-white" : "text-[#111111]"}`}>
                            Holding <span className={`${isDarkMode ? "text-blue-400" : "text-blue-500"}`}>Diamonds</span>
                        </h1>
                        <p className={`text-sm tracking-wide ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                            Review your currently reserved assets and their expiration status.
                        </p>
                    </div>
                </div>

                {cartItems.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`text-center py-20 md:py-32 rounded-[3.5rem] border-2 border-dashed flex flex-col items-center justify-center transition-all duration-500 ${isDarkMode ? "border-white/10 bg-white/5" : "border-gray-200 bg-white shadow-sm"}`}
                    >
                        <div className={`relative mb-8 ${isDarkMode ? "text-gray-700" : "text-gray-200"}`}>
                            <ShoppingBag size={80} strokeWidth={1} />
                            <div className={`absolute bottom-0 right-0 p-1 rounded-full border-2 ${isDarkMode ? "bg-[#111] border-white/10 text-blue-400" : "bg-white border-white text-blue-500"}`}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                            </div>
                        </div>
                        
                        <h2 className={`text-2xl md:text-3xl font-bold mb-3 tracking-tight ${isDarkMode ? "text-white" : "text-[#111111]"}`}>
                            Your hold is empty
                        </h2>
                        <p className={`text-sm md:text-base max-w-sm mx-auto mb-10 px-6 leading-relaxed ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                            You haven't placed any diamonds on hold yet. Explore our inventory to find your perfect match.
                        </p>
                        
                        <button 
                            onClick={() => navigate(user?.companyName ? `/${user.companyName.toLowerCase().replace(/\s+/g, '-')}/inventory` : "/diamonds")}
                            className={`group relative overflow-hidden px-10 py-4 rounded-full font-bold text-sm tracking-widest uppercase transition-all duration-300 transform active:scale-95 shadow-xl shadow-blue-500/20 ${isDarkMode ? "bg-white text-black hover:bg-blue-400 hover:text-white" : "bg-blue-500 text-white hover:bg-blue-600 shadow-blue-500/30"}`}
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                Explore Inventory
                                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </span>
                        </button>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {cartItems.map((item, index) => (
                            <motion.div
                                key={item._id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className={`group relative p-6 rounded-[2.5rem] border transition-all hover:shadow-2xl ${isDarkMode ? "bg-[#111] border-[#111111] hover:border-blue-500/50" : "bg-white border-gray-100 hover:border-blue-500/50"}`}
                            >
                                <div className="flex flex-col md:flex-row items-center gap-8">
                                    {/* Image Section */}
                                    <div className={`w-36 h-36 rounded-3xl flex items-center justify-center overflow-hidden border ${isDarkMode ? "bg-black border-[#111111]" : "bg-gray-50 border-gray-100"}`}>
                                        {item.Diamond_Image ? (
                                            <img src={item.Diamond_Image} alt={item.Shape} className="w-full h-full object-contain p-2 transition-transform duration-500 group-hover:scale-110" />
                                        ) : (
                                            <ShapeIcon shape={item.Shape} className={`w-1/2 h-1/2 ${isDarkMode ? "text-[#111111]" : "text-gray-200"}`} />
                                        )}
                                    </div>

                                    {/* Info Section */}
                                    <div className="flex-1 space-y-4 text-center md:text-left">
                                        <div>
                                            <h3 className={`text-2xl font-serif ${isDarkMode ? "text-white" : "text-[#111111]"}`}>{item.Weight} ct {item.Shape}</h3>
                                            <p className="text-xs font-black uppercase tracking-widest text-gray-500 mt-1">Stock ID: {item.Stock || "---"}</p>
                                        </div>

                                        <div className="flex flex-wrap justify-center md:justify-start gap-3">
                                            <SpecBadge label={item.Color} color="blue" isDarkMode={isDarkMode} />
                                            <SpecBadge label={item.Clarity} color="slate" isDarkMode={isDarkMode} />
                                            <SpecBadge label={item.Cut} color="slate" isDarkMode={isDarkMode} />
                                            <SpecBadge label={item.Lab} color="blue" isDarkMode={isDarkMode} />
                                        </div>
                                    </div>

                                    {/* Pricing & Actions */}
                                    <div className="flex flex-col items-center md:items-end gap-6 min-w-[200px]">
                                        <div className="text-center md:text-right">
                                            <p className="text-xs font-bold uppercase text-gray-500 mb-1">Total Value</p>
                                            <p className={`text-3xl font-black ${isDarkMode ? "text-blue-500" : "text-blue-500"}`}>${Number(item.Final_Price).toLocaleString()}</p>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => handleRemove(item._id)}
                                                className={`p-4 rounded-2xl border transition-all ${isDarkMode ? "border-[#111111] text-red-500 hover:bg-red-500/10" : "border-gray-100 text-red-500 hover:bg-red-50"}`}
                                            >
                                                <Trash2 size={24} />
                                            </button>
                                            {/* <button className={`px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all ${isDarkMode ? "bg-blue-600 hover:bg-blue-500 text-white" : "bg-blue-500 hover:bg-blue-600 text-white"}`}>
                                                Checkout
                                            </button> */}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const SpecBadge = ({ label, color, isDarkMode }) => (
    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${color === 'blue'
        ? isDarkMode ? "bg-blue-500/10 border-blue-500/20 text-blue-400" : "bg-blue-50 border-blue-100 text-blue-700"
        : isDarkMode ? "bg-white/5 border-[#111111] text-gray-400" : "bg-gray-50 border-gray-100 text-gray-600"
        }`}>
        {label || "---"}
    </span>
);

