import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";
import {
  FiTrendingUp,
  FiTrendingDown,
  FiMinus,
  FiArrowLeft,
} from "react-icons/fi";
import { getPriceLedger } from "../../api/pricing";
import { getCategoryIcon } from "../../utils/categoryIcons";
import Loader from "../../components/Loader";

const REASON_LABEL = {
  adminRangeClamp: "Updated by admin",
  rangeDeleted: "Range removed by admin",
  rangeCreated: "Range created by admin",
  rangeUpdated: "Range updated by admin",
};

const PricingHistory = () => {
  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["priceLedger"],
    queryFn: async () => (await getPriceLedger()).data.entries,
  });

  if (isLoading) return <Loader />;

  return (
    <div className="min-h-screen bg-base-200 py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <Link
            to="/farmer"
            className="inline-flex items-center gap-1 text-sm text-muted-light hover:text-primary mb-3"
          >
            <FiArrowLeft size={14} /> Back
          </Link>
          <h1 className="text-2xl font-extrabold">Price History</h1>
          <p className="text-sm text-muted-light mt-1">
            Every price range change made by admin, across every farmer's
            listings
          </p>
        </div>

        {entries.length === 0 ? (
          <p className="text-sm text-muted-light text-center py-16">
            No price changes recorded yet.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-box border border-theme-light bg-base-100">
            <table className="table">
              <thead>
                <tr className="text-xs text-muted-light">
                  <th></th>
                  <th>Product</th>
                  <th>Unit</th>
                  <th>Farm / Reason</th>
                  <th>Date</th>
                  <th>Price Change</th>
                  <th></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme-light">
                {entries.map((entry) => {
                  const Icon = getCategoryIcon(entry.product?.category);
                  const isRangeMeta = [
                    "rangeDeleted",
                    "rangeCreated",
                    "rangeUpdated",
                  ].includes(entry.reason);
                  const increased =
                    !isRangeMeta && entry.newPrice > entry.oldPrice;
                  const decreased =
                    !isRangeMeta && entry.newPrice < entry.oldPrice;
                  const productName = entry.product?.name || entry.productName;

                  return (
                    <tr key={entry._id}>
                      <td className="w-14">
                        <div className="w-10 h-10 rounded-field bg-primary-soft flex items-center justify-center">
                          <Icon className="text-primary" size={18} />
                        </div>
                      </td>
                      <td className="font-bold truncate max-w-50">
                        {productName}
                      </td>
                      <td className="text-muted-light">
                        {entry.product?.unit || "-"}
                      </td>
                      <td className="text-muted-light text-xs truncate max-w-50">
                        {entry.product?.farm?.name && (
                          <>{entry.product.farm.name} · </>
                        )}
                        {REASON_LABEL[entry.reason] || entry.reason}
                      </td>
                      <td className="text-muted-light text-xs whitespace-nowrap">
                        {new Date(entry.createdAt).toLocaleDateString(
                          undefined,
                          { month: "short", day: "numeric", year: "numeric" },
                        )}
                      </td>
                      <td className="whitespace-nowrap">
                        {!isRangeMeta ? (
                          <>
                            <span className="text-muted-light line-through">
                              ৳{entry.oldPrice}
                            </span>{" "}
                            <span className="font-bold">৳{entry.newPrice}</span>
                          </>
                        ) : entry.rangeMin != null && entry.rangeMax != null ? (
                          <span className="text-muted-light">
                            ৳{entry.rangeMin} – ৳{entry.rangeMax}
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="w-10">
                        {isRangeMeta ? (
                          <FiMinus className="text-muted-light" size={16} />
                        ) : increased ? (
                          <FiTrendingUp className="text-success" size={16} />
                        ) : decreased ? (
                          <FiTrendingDown className="text-error" size={16} />
                        ) : null}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PricingHistory;
