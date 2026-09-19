import { useState } from "react";
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const formatDayLabel = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, { weekday: "short" });
};

const formatMonthDayLabel = (dateStr) => {
  const d = new Date(dateStr);
  return String(d.getDate());
};

const formatMonthLabel = (monthStr) => {
  const [year, month] = monthStr.split("-");
  const d = new Date(Number(year), Number(month) - 1, 1);
  return d.toLocaleDateString(undefined, { month: "short" });
};

// daily: [{ date: "YYYY-MM-DD", totalSales, adminRevenue }, ...] (30 entries)
// monthly: [{ month: "YYYY-MM", totalSales, adminRevenue }, ...] (12 entries)
const AdminRevenueChart = ({ daily = [], monthly = [] }) => {
  const [view, setView] = useState("week");

  const getChartData = () => {
    if (view === "week") {
      return daily.slice(-7).map((d) => ({
        label: formatDayLabel(d.date),
        totalSales: d.totalSales,
        adminRevenue: d.adminRevenue,
      }));
    }

    if (view === "month") {
      return daily.map((d) => ({
        label: formatMonthDayLabel(d.date),
        totalSales: d.totalSales,
        adminRevenue: d.adminRevenue,
      }));
    }

    // year
    return monthly.map((m) => ({
      label: formatMonthLabel(m.month),
      totalSales: m.totalSales,
      adminRevenue: m.adminRevenue,
    }));
  };

  const data = getChartData();

  return (
    <div className="w-full rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm sm:p-6">
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-extrabold text-base-content">
            Sales &amp; Revenue Overview
          </h2>
          <p className="mt-1 text-sm text-base-content/60">
            {view === "year" && "Yearly performance"}
            {view === "month" && "Monthly performance (last 30 days)"}
            {view === "week" && "Weekly performance"}
          </p>
        </div>

        <div className="join">
          <button
            onClick={() => setView("week")}
            className={`btn btn-sm join-item ${view === "week" ? "btn-primary" : "btn-ghost"}`}
          >
            Week
          </button>
          <button
            onClick={() => setView("month")}
            className={`btn btn-sm join-item ${view === "month" ? "btn-primary" : "btn-ghost"}`}
          >
            Month
          </button>
          <button
            onClick={() => setView("year")}
            className={`btn btn-sm join-item ${view === "year" ? "btn-primary" : "btn-ghost"}`}
          >
            Year
          </button>
        </div>
      </div>

      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsLineChart
            data={data}
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
              className="text-base-content/50"
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `৳${value / 1000}k`}
              className="text-base-content/50"
            />

            <Tooltip
              formatter={(value, name) => [
                `৳${value.toLocaleString()}`,
                name === "totalSales" ? "Total Sales" : "Revenue",
              ]}
              contentStyle={{
                borderRadius: "12px",
                border: "1px solid hsl(var(--bc) / 0.1)",
                backgroundColor: "hsl(var(--b1))",
              }}
            />

            <Legend
              formatter={(value) =>
                value === "totalSales" ? "Total Sales" : "Revenue"
              }
            />

            <Line
              type="monotone"
              dataKey="totalSales"
              stroke="#45a15c"
              strokeWidth={2}
              dot={{ r: 3, fill: "#45a15c" }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="adminRevenue"
              stroke="#d89b3c"
              strokeWidth={2}
              dot={{ r: 3, fill: "#d89b3c" }}
              activeDot={{ r: 6 }}
            />
          </RechartsLineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AdminRevenueChart;