import { Navigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../store/authSlice";

export const CheckAuth = ({ children }) => {
    const { pathname } = useLocation();
    const dispatch = useDispatch();
    const { token, user } = useSelector((state) => state.auth);

    const isAuthenticated = Boolean(token && user);

    if (!isAuthenticated) {
        if (pathname === "/login" || pathname === "/register" || pathname === "/inventory" || pathname === "/filter-selection") {
            return children;
        }
        return <Navigate to="/login" replace />;
    }

    if (user.role === "admin") {
        if (pathname.startsWith("/admin")) {
            return children;
        }
        return <Navigate to="/admin/dashboard" replace />;
    }

    if (user.role === "user") {
        if (pathname.startsWith("/admin")) {
            const companySlug = user.companyName?.toLowerCase().replace(/\s+/g, '-') || "user";
            return <Navigate to={`/${companySlug}/selection`} replace />;
        }
        return children;
    }

    return children;
};

