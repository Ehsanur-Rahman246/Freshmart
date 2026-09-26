const PriceRangeGauge = ({ min, max, value }) => {
  const hasValue = value !== undefined && value !== null && value !== "";
  const numValue = Number(value);
  const outOfRange = hasValue && (numValue < min || numValue > max);
  const clamped = hasValue ? Math.min(Math.max(numValue, min), max) : null;
  const percent =
    hasValue && max > min ? ((clamped - min) / (max - min)) * 100 : null;

  return (
    <div className="mt-2">
      <div className="relative h-2.5 rounded-full bg-base-300 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-r from-warning/40 via-success/50 to-warning/40" />
        {hasValue && (
          <div
            className={`absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 -translate-x-1/2 rounded-full border-2 border-base-100 shadow ${
              outOfRange ? "bg-error" : "bg-primary"
            }`}
            style={{ left: `${percent}%` }}
          />
        )}
      </div>

      <div className="mt-1 flex items-center justify-between text-[11px] text-muted-light">
        <span>৳{min}</span>
        <span>৳{max}</span>
      </div>

      {hasValue && (
        <p
          className={`mt-1 text-xs font-semibold ${
            outOfRange ? "text-error" : "text-success"
          }`}
        >
          {outOfRange
            ? `Outside admin range — must be ৳${min}–৳${max}`
            : percent < 33
              ? "Priced on the lower end"
              : percent > 66
                ? "Priced on the higher end"
                : "Within the mid-range"}
        </p>
      )}
    </div>
  );
};

export default PriceRangeGauge;
