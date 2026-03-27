import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    isDarkMode: localStorage.getItem("isDarkMode") !== null
        ? JSON.parse(localStorage.getItem("isDarkMode"))
        : false,
};

const themeSlice = createSlice({
    name: "theme",
    initialState,
    reducers: {
        toggleTheme: (state) => {
            state.isDarkMode = !state.isDarkMode;
            localStorage.setItem("isDarkMode", JSON.stringify(state.isDarkMode));
        },
    },
});

export const { toggleTheme } = themeSlice.actions;
export default themeSlice.reducer;
