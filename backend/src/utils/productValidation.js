import Product from "../models/Product.js";

export const PRODUCT_ENUMS = {
  category: Product.schema.path("category").enumValues,
  season: Product.schema.path("season").enumValues,
  source: Product.schema.path("source").enumValues,
  unit: Product.schema.path("unit").enumValues,
};

const toNumber = (raw) =>
  raw === "" || raw === null || raw === undefined ? NaN : Number(raw);

export const validateProductInput = (body, { partial = false } = {}) => {
  const value = {};
  const fail = (error) => ({ error });
  const provided = (key) => body[key] !== undefined;
  const need = (key) => !partial || provided(key);

  if (need("name")) {
    const name = String(body.name ?? "").trim();
    if (!name || name.length > 100) {
      return fail("Name is required (max 100 characters)");
    }
    value.name = name;
  }

  if (provided("description")) {
    const description = String(body.description ?? "").trim();
    if (description.length > 2000) {
      return fail("Description is too long (max 2000 characters)");
    }
    value.description = description;
  }

  if (need("subCategory")) {
    const subCategory = String(body.subCategory ?? "").trim();
    if (!subCategory || subCategory.length > 60) {
      return fail("Sub-category is required (max 60 characters)");
    }
    value.subCategory = subCategory;
  }

  for (const key of ["category", "season", "source", "unit"]) {
    if (need(key)) {
      const v = String(body[key] ?? "").trim();
      if (!PRODUCT_ENUMS[key].includes(v)) return fail(`Invalid ${key}`);
      value[key] = v;
    }
  }

  if (need("price")) {
    const price = toNumber(body.price);
    if (!Number.isFinite(price) || price < 0) {
      return fail("Price must be a number of 0 or more");
    }
    value.price = price;
  }

  if (need("stock")) {
    const stock = toNumber(body.stock);
    if (!Number.isInteger(stock) || stock < 0) {
      return fail("Stock must be a whole number of 0 or more");
    }
    value.stock = stock;
  }

  if (provided("discountPercentage")) {
    const discount = toNumber(body.discountPercentage);
    if (!Number.isFinite(discount) || discount < 0 || discount > 100) {
      return fail("Discount must be between 0 and 100");
    }
    value.discountPercentage = discount;
  }

  if (need("listingDuration")) {
    const days = toNumber(body.listingDuration);
    if (!Number.isInteger(days) || days < 1 || days > 365) {
      return fail("Listing duration must be between 1 and 365 days");
    }
    value.listingDuration = days;
  }

  return { value };
};
