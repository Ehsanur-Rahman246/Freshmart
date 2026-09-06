import api from "./api";

export const createProduct = (data) => api.post("/product", data);
export const getMyProducts = () => api.get("/product/my-products");
export const getProducts = () => api.get("/product");
export const getProductById = (productId) => api.get(`/product/${productId}`);
export const updateProduct = (productId, data) => api.patch(`/product/${productId}`, data);
export const deleteProduct = (productId) => api.delete(`/product/${productId}`);