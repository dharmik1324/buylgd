import { Route, Routes, Navigate } from "react-router-dom";
import { Login } from "./pages/auth/Login";
import { Register } from "./pages/auth/Register";
import { ForgotPassword } from "./pages/auth/ForgotPassword";
// import { Home } from "./pages/Diamond/Home";
import { AppLayout } from "./components/layout/diamond/AppLayout";
import { Dashboard } from "./pages/admin/Dashboard";
// import { About } from "./pages/Diamond/About";
import { Diamond } from "./pages/admin/Diamond";
import { AppDiamond } from "./pages/Diamond/AppDiamond";
import { CheckAuth } from "./components/common/checkAuth";
import { Cart } from "./pages/Diamond/Cart";
// import { Contact } from "./pages/Diamond/Contact";
import { Users } from "./pages/admin/Users";
// import { Process } from "./pages/Diamond/Process";
// import { SpecialCuts } from "./pages/Diamond/SpecialCuts";
import { Layout } from "./components/layout/admin/layout";
import { Reports } from "./pages/admin/Reports";
import { Logs } from "./pages/admin/Logs";
import { Setting } from "./pages/admin/Setting";
import { Notifications } from "./pages/admin/Notifications";
import { Orders } from "./pages/admin/Orders";
import { AppDiamondDetails } from "./pages/Diamond/AppDiamondDetails";
import { FilterPage } from "./pages/Diamond/FilterPage";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Inquiries } from "./pages/admin/Inquiries";
import { Support } from "./pages/Diamond/Support";
import { Profile } from "./pages/Diamond/Profile";
import { Chatbox } from "./pages/Diamond/Chatbox";
import { GuidePage } from "./pages/Diamond/GuidePage";
import { store } from "./store/store";

function App() {
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
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route
          element={
            <CheckAuth>
              <AppLayout />
            </CheckAuth>
          }
        >
          {/* <Route path="/about" element={<About />} /> */}
          <Route path="/diamonds" element={<AppDiamond />} />
          <Route path="/:companyName/inventory" element={<AppDiamond />} />
          <Route path="/:companyName/shop" element={<AppDiamond />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/:companyName/cart" element={<Cart />} />
          {/* <Route path="/contact" element={<Contact />} /> */}
          {/* <Route path="/process" element={<Process />} /> */}
          {/* <Route path="/special-cuts" element={<SpecialCuts />} /> */}
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
              <Layout />
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

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/guide" element={<GuidePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;

