import api from "./api";
export const deleteDiamond = (id) => {
    return api.delete(`/admin/diamonds/${id}`);
};
