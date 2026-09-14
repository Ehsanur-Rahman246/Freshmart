const buildDistribution = (items) => {
  const total = items.length;
  const avg = total
    ? (items.reduce((sum, r) => sum + r.rating, 0) / total).toFixed(1)
    : 0;

  const counts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: items.filter((r) => r.rating === star).length,
  }));

  return { total, avg, counts };
};

const DistributionBlock = ({ label, items }) => {
  const { total, avg, counts } = buildDistribution(items);

  return (
    <div className="rounded-box border border-theme-light bg-base-100 p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-sm">{label}</h3>
        <div className="flex items-center gap-1.5">
          <span className="text-lg font-extrabold">{avg}</span>
          <span className="text-xs text-muted-light">({total})</span>
        </div>
      </div>

      {total === 0 ? (
        <p className="text-xs text-muted-light">No {label.toLowerCase()} yet.</p>
      ) : (
        <div className="space-y-1.5">
          {counts.map(({ star, count }) => (
            <div key={star} className="flex items-center gap-2 text-xs">
              <span className="w-10 shrink-0">{star} star</span>
              <div className="flex-1 h-1.5 rounded-full bg-base-300 overflow-hidden">
                <div
                  className="h-full bg-secondary"
                  style={{ width: total ? `${(count / total) * 100}%` : 0 }}
                />
              </div>
              <span className="w-16 text-right text-muted-light shrink-0">
                {count} review{count !== 1 ? "s" : ""}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// reviews: the full (unfiltered) farmer reviews array
const RatingSummary = ({ reviews }) => {
  const farmReviews = reviews.filter((r) => r.farm);
  const productReviews = reviews.filter((r) => r.product);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <DistributionBlock label="Farm Reviews" items={farmReviews} />
      <DistributionBlock label="Product Reviews" items={productReviews} />
    </div>
  );
};

export default RatingSummary;