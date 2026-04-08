import { lazy, Suspense } from "react";
import { Route, Routes, Navigate, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AnimatePresence } from "framer-motion";

// Common Components
import { CheckAuth } from "./components/common/checkAuth";
import PageTransition from "./components/common/PageTransition";
import Loader from "./components/common/Loader";

// Layouts
import { AppLayout } from "./components/layout/diamond/AppLayout";
import { Layout } from "./components/layout/admin/layout";

// Auth Pages (Lazy)
const Login = lazy(() => import("./pages/auth/Login").then(m => ({ default: m.Login })));
const Register = lazy(() => import("./pages/auth/Register").then(m => ({ default: m.Register })));
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword").then(m => ({ default: m.ForgotPassword })));

// Admin Pages (Lazy)
const Dashboard = lazy(() => import("./pages/admin/Dashboard").then(m => ({ default: m.Dashboard })));
const Diamond = lazy(() => import("./pages/admin/Diamond").then(m => ({ default: m.Diamond })));
const Users = lazy(() => import("./pages/admin/Users").then(m => ({ default: m.Users })));
const Reports = lazy(() => import("./pages/admin/Reports").then(m => ({ default: m.Reports })));
const Logs = lazy(() => import("./pages/admin/Logs").then(m => ({ default: m.Logs })));
const Setting = lazy(() => import("./pages/admin/Setting").then(m => ({ default: m.Setting })));
const Notifications = lazy(() => import("./pages/admin/Notifications").then(m => ({ default: m.Notifications })));
const Orders = lazy(() => import("./pages/admin/Orders").then(m => ({ default: m.Orders })));
const Inquiries = lazy(() => import("./pages/admin/Inquiries").then(m => ({ default: m.Inquiries })));

// User Pages (Lazy)
const AppDiamond = lazy(() => import("./pages/Diamond/AppDiamond").then(m => ({ default: m.AppDiamond })));
const AppDiamondDetails = lazy(() => import("./pages/Diamond/AppDiamondDetails").then(m => ({ default: m.AppDiamondDetails })));
const FilterPage = lazy(() => import("./pages/Diamond/FilterPage").then(m => ({ default: m.FilterPage })));
const PublicInventory = lazy(() => import("./pages/Diamond/PublicInventory").then(m => ({ default: m.PublicInventory })));
const Cart = lazy(() => import("./pages/Diamond/Cart").then(m => ({ default: m.Cart })));
const Support = lazy(() => import("./pages/Diamond/Support").then(m => ({ default: m.Support })));
const Profile = lazy(() => import("./pages/Diamond/Profile").then(m => ({ default: m.Profile })));
const Chatbox = lazy(() => import("./pages/Diamond/Chatbox").then(m => ({ default: m.Chatbox })));
const GuidePage = lazy(() => import("./pages/Diamond/GuidePage").then(m => ({ default: m.GuidePage })));

function App() {
  const location = useLocation();

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar
        newestOnTop
        closeOnClick
        theme="colored"
      />
      <Suspense fallback={<Loader />}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route
              element={
                <CheckAuth>
                  <PageTransition>
                    <AppLayout />
                  </PageTransition>
                </CheckAuth>
              }
            >
              <Route path="/inventory" element={<PublicInventory />} />
              <Route path="/diamonds" element={<AppDiamond />} />
              <Route path="/:companyName/inventory" element={<AppDiamond />} />
              <Route path="/:companyName/shop" element={<AppDiamond />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/:companyName/cart" element={<Cart />} />
              <Route path="/diamonds/diamond-details" element={<AppDiamondDetails />} />
              <Route path="/:companyName/diamonds/details" element={<AppDiamondDetails />} />
              <Route path="/filter-selection" element={<FilterPage />} />
              <Route path="/:companyName/selection" element={<FilterPage />} />
              <Route path="/support" element={<Support />} />
              <Route path="/:companyName/support" element={<Support />} />
              <Route path="/chatbox" element={<Chatbox />} />
              <Route path="/:companyName/chatbox" element={<Chatbox />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/:companyName/profile" element={<Profile />} />
            </Route>

            <Route
              element={
                <CheckAuth>
                  <PageTransition>
                    <Layout />
                  </PageTransition>
                </CheckAuth>
              }
            >
              <Route path="/admin/dashboard" element={<Dashboard />} />
              <Route path="/admin/diamonds" element={<Diamond />} />
              <Route path="/admin/users" element={<Users />} />
              <Route path="/admin/logs" element={<Logs />} />
              <Route path="/admin/reports" element={<Reports />} />
              <Route path="/admin/settings" element={<Setting />} />
              <Route path="/admin/notifications" element={<Notifications />} />
              <Route path="/admin/orders" element={<Orders />} />
              <Route path="/admin/inquiries" element={<Inquiries />} />
            </Route>

            <Route 
              path="/login" 
              element={
                <PageTransition>
                  <Login />
                </PageTransition>
              } 
            />
            <Route 
              path="/register" 
              element={
                <PageTransition>
                  <Register />
                </PageTransition>
              } 
            />
            <Route 
              path="/forgot-password" 
              element={
                <PageTransition>
                  <ForgotPassword />
                </PageTransition>
              } 
            />
            <Route 
              path="/guide" 
              element={
                <PageTransition>
                  <GuidePage />
                </PageTransition>
              } 
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </Suspense>
    </>
  );
}

export default App;


