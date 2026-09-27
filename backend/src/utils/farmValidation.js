import { resolveDistrict } from "./district.js";

const SIZE_UNITS = ["acre", "hectare", "decimal"];

const parseJsonField = (raw) => {
  if (typeof raw !== "string") return raw;
  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
};

export const validateFarmInput = async (body, { partial = false } = {}) => {
  const value = {};
  const fail = (error) => ({ error });
  const provided = (key) => body[key] !== undefined;
  const need = (key) => !partial || provided(key);

  if (need("name")) {
    const name = String(body.name ?? "").trim();
    if (!name || name.length > 100) {
      return fail("Farm name is required (max 100 characters)");
    }
    value.name = name;
  }

  if (provided("description")) {
    const description = String(body.description ?? "").trim();
    if (description.length > 2000) return fail("Description is too long");
    value.description = description;
  }

  if (provided("isActive")) {
    value.isActive = body.isActive === true || body.isActive === "true";
  }

  if (provided("establishedYear")) {
    if (body.establishedYear === null || body.establishedYear === "") {
      value.establishedYear = null;
    } else {
      const year = Number(body.establishedYear);
      if (!Number.isInteger(year) || year < 1800 || year > new Date().getFullYear()) {
        return fail("Established year is not valid");
      }
      value.establishedYear = year;
    }
  }

  if (need("size")) {
    const size = parseJsonField(body.size);
    const sizeValue = Number(size?.value);

    if (!size || !Number.isFinite(sizeValue) || sizeValue <= 0 || !SIZE_UNITS.includes(size.unit)) {
      return fail("A valid farm size and unit are required");
    }
    value.size = { value: sizeValue, unit: size.unit };
  }

  if (need("location")) {
    const location = parseJsonField(body.location);
    const upazila = String(location?.upazila ?? "").trim();
    const village = String(location?.village ?? "").trim();
    const district = await resolveDistrict(location?.district);

    if (!district) return fail("Please choose a district we deliver to");
    if (!upazila || !village) return fail("Upazila and village are required");

    value.location = { district, upazila, village };
  }

  if (need("farmType")) {
    const raw = parseJsonField(body.farmType);

    if (!Array.isArray(raw)) return fail("Add at least one farm type");

    const types = [...new Set(raw.map((t) => String(t ?? "").trim()).filter(Boolean))];

    if (types.length === 0 || types.length > 10) {
      return fail("Add between 1 and 10 farm types");
    }
    value.farmType = types;
  }

  return { value };
};