const BD_MOBILE = /^(?:\+?88)?01[3-9]\d{8}$/;

export const normalizePhone = (raw) => {
  const cleaned = String(raw ?? "").replace(/[\s-]/g, "");
  if (!BD_MOBILE.test(cleaned)) return null;
  return cleaned.replace(/^(?:\+?88)/, "");
};