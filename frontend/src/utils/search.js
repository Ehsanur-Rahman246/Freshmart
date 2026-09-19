export const filterProductsByCategory = (products = [], category) => {
  if (!category) return products;
  return products.filter((product) => product.category === category);
};
