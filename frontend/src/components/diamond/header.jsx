import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout, logoutUser } from "../../store/authSlice";
import { selectCartCount } from "../../store/cartSlice";
import { useState } from "react";
import { EditProfileModal } from "../common/EditProfileModal";
import { CartSidebar } from "./cartSideBar";
import { IoDiamondSharp } from "react-icons/io5";
import { Gem, Moon, Sun, Menu, X } from "lucide-react";
import { toggleTheme } from "../../store/themeSlice";
const logoDark = "/removed-bg-hd (1).png";
const logoLight = "/N6yun2CMI33J3R5MVpHWql06P0E.png";

export const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { token, user } = useSelector((state) => state.auth);
  const cartCount = useSelector(selectCartCount);
  const isDarkMode = useSelector((state) => state.theme.isDarkMode);

  const [openCart, setOpenCart] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const companySlug = user?.companyName?.toLowerCase().replace(/\s+/g, '-') || "user";
  const selectionPath = user?.companyName ? `/${companySlug}/selection` : "/filter-selection";
  const inventoryPath = token ? (user?.companyName ? `/${companySlug}/inventory` : "/diamonds") : "/inventory";
  const supportPath = user?.companyName ? `/${companySlug}/support` : "/support";
  const chatboxPath = user?.companyName ? `/${companySlug}/chatbox` : "/chatbox";
  const cartPath = user?.companyName ? `/${companySlug}/cart` : "/cart";
  const profilePath = user?.companyName ? `/${companySlug}/profile` : "/profile";

  const isActive = (path) => location.pathname === path;

  const linkClass = (path) =>
    `cursor-pointer transition-all duration-300 text-xl ${isActive(path)
      ? `${isDarkMode ? "text-white" : "text-black"}`
      : `${isDarkMode ? "text-white" : "text-black"} hover:text-blue-400`
    }`;

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser());
      navigate("/login", { replace: true });
    } catch (err) {
      console.error("Logout failed", err);
      // Still navigate as we clear state locally anyway
      navigate("/login", { replace: true });
    }
  };

  const handleInventoryNavigation = () => {
    const hasVisited = localStorage.getItem(`inventoryVisited_${user?._id || 'guest'}`);
    if (hasVisited) {
      navigate(inventoryPath);
    } else {
      navigate(selectionPath);
    }
  };

  return (
    <header className={`border-b border-white/10 shadow-lg shadow-gray-500/10 ${isDarkMode ? "bg-black" : "bg-white"}`}>
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-[70px] flex items-center justify-between">

        <div
          onClick={handleInventoryNavigation}
          className="flex items-center gap-3 cursor-pointer"
        >
          <div className="text-white leading-tight">
            <h1 className="text-sm md:text-2xl font-normal tracking-widest">
              <img src={isDarkMode ? logoDark : logoLight} alt="BUYLGD" className={`w-40 h-10 object-contain ${isDarkMode ? "brightness-110" : "text-black"}`} />
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3 md:gap-6">

          <nav className="hidden md:flex gap-10 text-sm font-normal tracking-wide items-center">
            <span
              className={`cursor-pointer transition-all duration-300 text-xl ${isActive(selectionPath) || isActive(inventoryPath)
                ? `${isDarkMode ? "text-white" : "text-black"}`
                : `${isDarkMode ? "text-white" : "text-black"} hover:text-blue-400`
                }`}
              onClick={handleInventoryNavigation}
            >
              Inventory
            </span>
            <span
              className={linkClass(chatboxPath)}
              onClick={() => navigate(chatboxPath)}
            >
              Chatbox
            </span>
            <span
              className={linkClass(supportPath)}
              onClick={() => navigate(supportPath)}
            >
              Support
            </span>
          </nav>

          <button
            onClick={() => dispatch(toggleTheme())}
            className={`p-2 rounded-full hover:bg-white/10 transition ${isDarkMode ? "text-white" : "text-black"}`}
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <button
            className={`md:hidden ${isDarkMode ? "text-white" : "text-black"}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>

          {!token ? (
            <div className="hidden md:flex gap-3">
              <button
                onClick={() => navigate("/login")}
                className={`px-4 py-2 rounded-full border border-white/30 text-gray-100 text-sm hover:bg-white/10 transition ${isDarkMode ? "text-white" : "text-black"}`}
              >
                LOG IN
              </button>

              <button
                onClick={() => navigate("/register")}
                className={`px-4 py-2 rounded-full bg-blue-500 text-white text-sm hover:bg-blue-600 transition ${isDarkMode ? "text-white" : "text-black"}`}
              >
                REGISTER
              </button>
            </div>
          ) : (
            <>
              {/* Profile Link (Avatar) - Visible on all devices */}
              <button
                onClick={() => navigate(profilePath)}
                className="flex items-center gap-2 group"
              >
                <span className={`hidden md:block text-sm font-normal group-hover:text-blue-500 transition-colors ${isDarkMode ? "text-white" : "text-black"}`}>
                  Hi, {user?.name?.split(" ")[0]}
                </span>

                <div className="w-8 h-8 md:w-9 md:h-9 bg-blue-500 rounded-full flex items-center justify-center font-normal text-xs md:text-sm text-white group-hover:scale-110 transition-transform shadow-lg shadow-blue-500/20">
                  {user?.name?.charAt(0)?.toUpperCase()}
                </div>
              </button>

              <button
                onClick={() => navigate(cartPath)}
                className={`relative p-2 rounded-full transition-all duration-300 ${isDarkMode ? "bg-white/10 text-white hover:bg-white/20" : "bg-[#3C4759] text-white hover:bg-[#2D3543]"} shadow-lg`}
              >
                <IoDiamondSharp size={20} className="drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border-2 border-[#3C4759]">
                    {cartCount}
                  </span>
                )}
              </button>
            </>
          )}
        </div>
      </div>

      {mobileMenuOpen && (
        <div className={`md:hidden absolute top-[70px] left-0 right-0 z-50 shadow-2xl ${isDarkMode ? "bg-black border-white/10 text-white" : "bg-white border-black/10 text-black"} border-b px-6 py-4 space-y-4`}>
          <div

            className={`flex flex-col gap-4 ${isDarkMode ? "bg-black" : "bg-white"}`}
          >
            <span
              className={`cursor-pointer transition-all duration-300 text-xl ${isActive(selectionPath) || isActive(inventoryPath)
                ? `${isDarkMode ? "text-white" : "text-black"}`
                : `${isDarkMode ? "text-white" : "text-black"} hover:text-blue-400`
                }`}
              onClick={() => {
                handleInventoryNavigation();
                setMobileMenuOpen(false);
              }}
            >
              Inventory
            </span>

            <span
              className={linkClass(chatboxPath)}
              onClick={() => {
                navigate(chatboxPath);
                setMobileMenuOpen(false);
              }}
            >
              Chatbox
            </span>

            <span
              className={linkClass(supportPath)}
              onClick={() => {
                navigate(supportPath);
                setMobileMenuOpen(false);
              }}
            >
              Support
            </span>
          </div>

          {!token ? (
            <>
              <button
                onClick={() => navigate("/login")}
                className={`block w-full text-left ${isDarkMode ? "text-gray-200" : "text-gray-800"}`}
              >
                Log In
              </button>

              <button
                onClick={() => navigate("/register")}
                className="block w-full text-left text-blue-400"
              >
                Register
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  navigate(profilePath);
                  setMobileMenuOpen(false);
                }}
                className={`block w-full text-left ${isDarkMode ? "text-gray-200" : "text-gray-800"}`}
              >
                Account
              </button>

              <button
                onClick={() => {
                  setEditOpen(true);
                  setMobileMenuOpen(false);
                }}
                className={`block w-full text-left ${isDarkMode ? "text-gray-200" : "text-gray-800"}`}
              >
                Edit Profile
              </button>

              <button
                onClick={handleLogout}
                className="block w-full text-left text-red-400"
              >
                Sign Out
              </button>
            </>
          )}
        </div>
      )}

      {/* Cart Sidebar */}
      <CartSidebar
        open={openCart}
        onClose={() => setOpenCart(false)}
        isDarkMode={isDarkMode}
      />

      {/* Edit Profile Modal */}
      <EditProfileModal
        key={user?._id || "guest"}
        open={editOpen}
        onClose={() => setEditOpen(false)}
      />
    </header>
  );
};

