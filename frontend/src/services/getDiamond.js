import api from "./api";

export const getDiamond = async (setData, setLoading) => {
    try {
        const response = await api.get("/admin/diamonds");
        const fewData = response.data.slice(0, 50);
        setData(fewData);
    } catch (error) {
        console.error("Error fetching data:", error);
    } finally {
        setLoading(false);
    }
};
