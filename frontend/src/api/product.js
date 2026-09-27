import api from "./api";

export const createProduct = (data) => api.post("/product", data);

// farmId is optional: GET /product/my-products?farm=<id>
export const getMyProducts = (farmId) =>
  api.get("/product/my-products", {
    params: farmId ? { farm: farmId } : {},
  });

// options: { category, farm }, both optional
export const getProducts = (
  page = 1,
  limit = 10,
  search = "",
  options = {},
) => {
  const params = { page, limit };

  if (search) params.search = search;
  if (options.category) params.category = options.category;
  if (options.farm) params.farm = options.farm;

  return api.get("/product", { params });
};

export const searchProductNames = (q) =>
  api.get(`/product/search-names`, { params: { q } });

export const getRelatedProducts = (productId) =>
  api.get(`/product/${productId}/related`);
export const getProductById = (productId) => api.get(`/product/${productId}`);
export const updateProduct = (productId, data) =>
  api.patch(`/product/${productId}`, data);
export const deleteProduct = (productId) => api.delete(`/product/${productId}`);
