import { createSlice } from "@reduxjs/toolkit";

const loadCart = () => {
    try {
        const serializedState = localStorage.getItem("diamond_cart");
        if (serializedState === null) {
            return [];
        }
        return JSON.parse(serializedState);
    } catch (err) {
        return [];
    }
};

const saveCart = (items) => {
    try {
        const serializedState = JSON.stringify(items);
        localStorage.setItem("diamond_cart", serializedState);
    } catch (err) {
        // Ignore write errors
    }
};

const initialState = {
    items: loadCart(),
};

export const cartSlice = createSlice({
    name: "cart",
    initialState,
    reducers: {
        addToCart: (state, action) => {
            const item = action.payload;
            const existingItem = state.items.find((i) => i._id === item._id);

            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                state.items.push({ ...item, quantity: 1 });
            }
            saveCart(state.items);
        },

        removeFromCart: (state, action) => {
            state.items = state.items.filter((item) => item._id !== action.payload);
            saveCart(state.items);
        },

        decreaseQty: (state, action) => {
            const item = state.items.find((i) => i._id === action.payload);

            if (item && item.quantity > 1) {
                item.quantity -= 1;
            } else {
                state.items = state.items.filter((i) => i._id !== action.payload);
            }
            saveCart(state.items);
        },

        clearCart: (state) => {
            state.items = [];
            saveCart(state.items);
        },
    },
});

export const selectCartItems = (state) => state.cart.items;

export const selectCartCount = (state) =>
    state.cart.items.reduce((sum, item) => sum + item.quantity, 0);

export const selectCartTotal = (state) =>
    state.cart.items.reduce(
        (total, item) => total + Number(item.Final_Price) * item.quantity,
        0
    );

export const { addToCart, removeFromCart, decreaseQty, clearCart } = cartSlice.actions;

export default cartSlice.reducer;
