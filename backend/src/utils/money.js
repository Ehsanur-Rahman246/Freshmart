export const round2 = (n) => Math.round((n || 0) * 100) / 100;

export const roundTotals = (obj) =>
  Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [
      k,
      typeof v === "number" ? round2(v) : v,
    ]),
  );
