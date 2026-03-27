import api from "./api";

export const registerUser = async (userData) => {
    try {
        const response = await api.post("/auth/register", userData);
        return response.data;
    } catch (error) {
        console.error("Register error:", error);
        throw error;
    }
};

export const loginUser = async (userData) => {
    try {
        const response = await api.post("/auth/login", userData);
        return response.data;
    } catch (error) {
        console.error("Login error:", error);
        throw error;
    }
};

export const forgotPassword = async (email) => {
    try {
        const response = await api.post("/auth/forgot-password", { email });
        return response.data;
    } catch (error) {
        console.error("Forgot password error:", error);
        throw error;
    }
};

export const resetPassword = async (resetData) => {
    try {
        const response = await api.post("/auth/reset-password", resetData);
        return response.data;
    } catch (error) {
        console.error("Reset password error:", error);
        throw error;
    }
};
