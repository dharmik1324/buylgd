import { createSlice } from "@reduxjs/toolkit";

// Read from localStorage on start
const loadWishlist = () => {
    try {
        const raw = localStorage.getItem("buylgd_wishlist");
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
};

// Save to localStorage
const saveWishlist = (items) => {
    try {
        localStorage.setItem("buylgd_wishlist", JSON.stringify(items));
    } catch {}
};

const wishlistSlice = createSlice({
    name: "wishlist",
    initialState: {
        items: loadWishlist(),
    },
    reducers: {
        toggleWishlist: (state, action) => {
            const diamond = action.payload;
            const existingIndex = state.items.findIndex(
                (d) => String(d._id) === String(diamond._id)
            );
            if (existingIndex > -1) {
                state.items.splice(existingIndex, 1);
            } else {
                state.items.push(diamond);
            }
            saveWishlist(state.items);
        },
        removeFromWishlist: (state, action) => {
            const id = action.payload;
            state.items = state.items.filter((d) => String(d._id) !== String(id));
            saveWishlist(state.items);
        },
        clearWishlist: (state) => {
            state.items = [];
            localStorage.removeItem("buylgd_wishlist");
        },
    },
});

export const { toggleWishlist, removeFromWishlist, clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
