import { configureStore } from "@reduxjs/toolkit";
import diamondReducer from "./diamondSlice";
import authReducer from "./authSlice";
import cartReducer from "./cartSlice";
import userReducer from "./userSlice";
import themeReducer from "./themeSlice";
import notificationReducer from "./notificationSlice";
import supportReducer from "./supportSlice";
import wishlistReducer from "./wishlistSlice";

export const store = configureStore({
    reducer: {
        diamonds: diamondReducer,
        auth: authReducer,
        cart: cartReducer,
        users: userReducer,
        theme: themeReducer,
        notifications: notificationReducer,
        support: supportReducer,
        wishlist: wishlistReducer,
    },
});
