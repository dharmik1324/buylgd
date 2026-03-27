import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { MdDelete } from "react-icons/md";
import { removeFromCart } from "../../store/cartSlice";
import { releaseHold } from "../../store/diamondSlice";
import { ShapeIcon } from "./DiamondShapeIcons";

import { toast } from "react-toastify";

export const CartSidebar = ({ open, onClose, isDarkMode }) => {
    const cartItems = useSelector((state) => state.cart.items);
    console.log(cartItems);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleDeleteCartItem = async (id) => {
        try {
            await dispatch(releaseHold(id)).unwrap();
            dispatch(removeFromCart(id));
        } catch (err) {
            dispatch(removeFromCart(id));
        }
    };
    return (
        <>
            <div
                onClick={onClose}
                className={`fixed inset-0 bg-black/40 transition-opacity z-40 ${open ? "opacity-100 visible" : "opacity-0 invisible"}`}
            />

            <div
                className={`fixed top-0 right-0 h-full w-full sm:w-[380px] md:w-[450px] shadow-xl z-50 transform transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"} ${isDarkMode ? "bg-[#000]" : "bg-white"}`}
            >
                <div className={`p-4 border-b flex justify-between items-center ${isDarkMode ? "bg-[#000] text-white" : "bg-white text-black"}`}>
                    <h2 className="text-lg font-semibold">Hold diamonds</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-black text-xl cursor-pointer"
                    >
                        ✕
                    </button>
                </div>

                <div className="p-3 sm:p-4 space-y-3 sm:space-y-4 overflow-y-auto h-[calc(100%-200px)]">
                    {cartItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full py-20 text-center">
                            <div className="w-20 h-20 rounded-full bg-[#111111]/50 flex items-center justify-center mb-4 border border-white/5">
                                <ShapeIcon shape="round" className="w-10 h-10 text-gray-700 opacity-20" />
                            </div>
                            <p className={`text-lg font-medium ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>No diamonds on hold</p>
                            <p className={`text-sm mt-1 ${isDarkMode ? "text-gray-600" : "text-gray-400"}`}>Explore our inventory to find your next stone.</p>
                        </div>
                    ) : (
                        cartItems.map((item) => (
                            <div key={item._id} className={`flex justify-between items-center border p-2 sm:p-3 rounded-2xl ${isDarkMode ? "border-slate-800 bg-slate-900/50" : "border-gray-200 bg-gray-50"}`}>
                                <div className="flex items-center min-w-0">
                                    <div className={`w-14 h-14 sm:w-20 sm:h-20 flex-shrink-0 shadow shadow-sm rounded-xl border border-slate-700/50 flex items-center justify-center overflow-hidden ${isDarkMode ? "bg-slate-900" : "bg-white"}`}>
                                        {item.Diamond_Image ? (
                                            <img src={item.Diamond_Image} className="w-full h-full object-cover" alt="img" />
                                        ) : (
                                            <ShapeIcon shape={item.Shape} className={`w-1/2 h-1/2 ${isDarkMode ? "text-slate-700" : "text-slate-200"}`} />
                                        )}
                                    </div>
                                    <div className="flex flex-col ml-3 sm:ml-4 min-w-0">
                                        <p className={`font-bold text-sm sm:text-base ${isDarkMode ? "text-white" : "text-[#111111]"}`}>{item.Weight} ct {item.Shape}</p>
                                        <div className={`flex flex-wrap gap-x-2 text-[10px] sm:text-xs font-medium ${isDarkMode ? "text-slate-500" : "text-gray-500"}`}>
                                            <span>{item.Color}</span>
                                            <span>•</span>
                                            <span>{item.Clarity}</span>
                                            <span>•</span>
                                            <span>{item.Lab}</span>
                                        </div>
                                        <p className={`font-black text-sm sm:text-lg mt-1 ${isDarkMode ? "text-blue-400" : "text-blue-600"}`}>${Number(item.Final_Price).toLocaleString()}</p>
                                    </div>
                                </div>
                                <button onClick={() => handleDeleteCartItem(item._id)} className="p-2 hover:bg-red-500/10 rounded-full transition-colors group">
                                    <MdDelete className="text-gray-500 group-hover:text-red-500" size={22} />
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {cartItems.length > 0 && (
                    <div className={`p-6 border-t ${isDarkMode ? "border-slate-800 bg-[#000]" : "border-gray-100 bg-white"}`}>
                        <div className="flex items-center justify-between mb-6">
                            <span className={`text-sm font-bold uppercase tracking-widest ${isDarkMode ? "text-slate-500" : "text-gray-400"}`}>Total Value</span>
                            <span className={`text-2xl font-black ${isDarkMode ? "text-blue-400" : "text-blue-600"}`}>
                                ${cartItems.reduce((total, item) => total + Number(item.Final_Price || 0), 0).toLocaleString()}
                            </span>
                        </div>
                        <button
                            onClick={() => {
                                navigate("/cart");
                                onClose();
                            }}
                            className={`w-full py-3 rounded-2xl font-black uppercase text-xs tracking-widest transition-all cursor-pointer ${isDarkMode ? "bg-blue-600 hover:bg-blue-500 text-white" : "bg-blue-500 hover:bg-blue-600 text-white"}`}
                        >
                            View All Holds
                        </button>
                    </div>
                )}
            </div>
        </>
    );
};

