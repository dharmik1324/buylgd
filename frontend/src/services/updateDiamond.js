import api from "./api";

export const updateDiamond = (id, data) => {
    return api.put(`/admin/diamonds/${id}`, data);
};
