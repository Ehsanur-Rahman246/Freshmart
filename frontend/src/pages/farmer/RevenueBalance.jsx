import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { FiDollarSign, FiTrendingUp, FiShoppingBag } from "react-icons/fi";
import { getMyRevenue } from "../../api/farmer";
import { getMyFarms } from "../../api/farm";

const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

// Builds the bucket windows for the selected view, relative to "today".
const buildBuckets = (view) => {
  const now = new Date();

  if (view === "week") {
    return Array.from({ length: 7 }).map((_, i) => {
      const d = startOfDay(now);
      d.setDate(d.getDate() - (6 - i));
      const end = new Date(d);
      end.setDate(end.getDate() + 1);
      return {
        label: d.toLocaleDateString(undefined, { weekday: "short" }),
        start: d,
        end,
      };
    });
  }

  if (view === "month") {
    return Array.from({ length: 30 }).map((_, i) => {
      const d = startOfDay(now);
      d.setDate(d.getDate() - (29 - i));
      const end = new Date(d);
      end.setDate(end.getDate() + 1);
      return {
        label: String(d.getDate()),
        start: d,
        end,
      };
    });
  }

  // year — last 12 months
  return Array.from({ length: 12 }).map((_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 1);
    return {
      label: d.toLocaleDateString(undefined, { month: "short" }),
      start: d,
      end,
    };
  });
};

const RevenueBalance = () => {
  const [view, setView] = useState("week");
  const [farmId, setFarmId] = useState("all");

  const { data: revenue, isLoading: loadingRevenue } = useQuery({
    queryKey: ["myRevenue"],
    queryFn: async () => (await getMyRevenue()).data,
  });

  const { data: farms = [] } = useQuery({
    queryKey: ["myFarms"],
    queryFn: async () => (await getMyFarms()).data.farms,
  });

  const entries = revenue?.entries || [];
  const summary = revenue?.summary || {
    totalFarmerRevenue: 0,
    totalGross: 0,
    count: 0,
  };

  const chartData = useMemo(() => {
    const filtered =
      farmId === "all"
        ? entries
        : entries.filter((e) => e.farm?._id === farmId);

    const buckets = buildBuckets(view);

    return buckets.map((bucket) => {
      const revenueInBucket = filtered
        .filter((e) => {
          const created = new Date(e.createdAt);
          return created >= bucket.start && created < bucket.end;
        })
        .reduce((sum, e) => sum + e.farmerRevenue, 0);

      return { label: bucket.label, revenue: revenueInBucket };
    });
  }, [entries, farmId, view]);

  if (loadingRevenue) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 py-10 px-4">
      <div className="max-w-5xl mx-auto space-y-6">
        <h1 className="text-3xl font-extrabold">Revenue & Balance</h1>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-box border border-theme bg-base-100 p-5 flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-soft text-primary">
              <FiDollarSign size={20} />
            </div>
            <div>
              <p className="text-xs text-muted-light">Total Revenue</p>
              <p className="text-xl font-extrabold">
                ৳{summary.totalFarmerRevenue}
              </p>
            </div>
          </div>

          <div className="rounded-box border border-theme bg-base-100 p-5 flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary-soft text-secondary">
              <FiTrendingUp size={20} />
            </div>
            <div>
              <p className="text-xs text-muted-light">Total Gross</p>
              <p className="text-xl font-extrabold">৳{summary.totalGross}</p>
            </div>
          </div>

          <div className="rounded-box border border-theme bg-base-100 p-5 flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-soft text-accent">
              <FiShoppingBag size={20} />
            </div>
            <div>
              <p className="text-xs text-muted-light">Total Sales</p>
              <p className="text-xl font-extrabold">{summary.count}</p>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="w-full rounded-2xl border border-theme bg-base-100 p-4 shadow-sm sm:p-6">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-extrabold">Revenue Overview</h2>
              <p className="mt-1 text-sm text-muted">
                {view === "year" && "Last 12 months"}
                {view === "month" && "Last 30 days"}
                {view === "week" && "Last 7 days"}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <select
                value={farmId}
                onChange={(e) => setFarmId(e.target.value)}
                className="select select-sm border-theme bg-base-100"
              >
                <option value="all">All Farms</option>
                {farms.map((farm) => (
                  <option key={farm._id} value={farm._id}>
                    {farm.name}
                  </option>
                ))}
              </select>

              <div className="join">
                <button
                  onClick={() => setView("week")}
                  className={`btn btn-sm join-item ${
                    view === "week" ? "btn-primary" : "btn-ghost"
                  }`}
                >
                  Week
                </button>
                <button
                  onClick={() => setView("month")}
                  className={`btn btn-sm join-item ${
                    view === "month" ? "btn-primary" : "btn-ghost"
                  }`}
                >
                  Month
                </button>
                <button
                  onClick={() => setView("year")}
                  className={`btn btn-sm join-item ${
                    view === "year" ? "btn-primary" : "btn-ghost"
                  }`}
                >
                  Year
                </button>
              </div>
            </div>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart
                data={chartData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="currentColor"
                  className="text-base-content/10"
                />

                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                  interval={view === "month" ? 2 : 0}
                  className="text-base-content/50"
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `৳${value}`}
                  className="text-base-content/50"
                />

                <Tooltip
                  cursor={{ fill: "currentColor", fillOpacity: 0.05 }}
                  formatter={(value) => [`৳${value}`, "Revenue"]}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid hsl(var(--bc) / 0.1)",
                    backgroundColor: "hsl(var(--b1))",
                  }}
                />

                <Bar
                  dataKey="revenue"
                  fill="#45a15c"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={40}
                />
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueBalance;