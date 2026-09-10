import { useEffect, useState } from "react";
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const yearData = [
  { month: "Jan", revenue: 12000 },
  { month: "Feb", revenue: 18000 },
  { month: "Mar", revenue: 15000 },
  { month: "Apr", revenue: 22000 },
  { month: "May", revenue: 28000 },
  { month: "Jun", revenue: 25000 },
  { month: "Jul", revenue: 32000 },
  { month: "Aug", revenue: 15000 },
  { month: "Sep", revenue: 22000 },
  { month: "Oct", revenue: 28000 },
  { month: "Nov", revenue: 25000 },
  { month: "Dec", revenue: 32000 },
];

const monthData = [
  { day: "1", revenue: 1200 },
  { day: "2", revenue: 1800 },
  { day: "3", revenue: 1500 },
  { day: "4", revenue: 2000 },
  { day: "5", revenue: 2800 },
  { day: "6", revenue: 2500 },
  { day: "7", revenue: 3200 },
  { day: "8", revenue: 2100 },
  { day: "9", revenue: 2400 },
  { day: "10", revenue: 3000 },
  { day: "11", revenue: 2700 },
  { day: "12", revenue: 3500 },
  { day: "13", revenue: 2900 },
  { day: "14", revenue: 3800 },
  { day: "15", revenue: 4100 },
  { day: "16", revenue: 3600 },
  { day: "17", revenue: 4300 },
  { day: "18", revenue: 3900 },
  { day: "19", revenue: 4500 },
  { day: "20", revenue: 4200 },
  { day: "21", revenue: 4800 },
  { day: "22", revenue: 4400 },
  { day: "23", revenue: 5000 },
  { day: "24", revenue: 4700 },
  { day: "25", revenue: 5300 },
  { day: "26", revenue: 4900 },
  { day: "27", revenue: 5500 },
  { day: "28", revenue: 5100 },
  { day: "29", revenue: 5700 },
  { day: "30", revenue: 5400 },
];

const weekData = [
  { day: "Sun", revenue: 1200 },
  { day: "Mon", revenue: 1800 },
  { day: "Tue", revenue: 1500 },
  { day: "Wed", revenue: 2000 },
  { day: "Thu", revenue: 2800 },
  { day: "Fri", revenue: 2500 },
  { day: "Sat", revenue: 3200 },
];

const getScreenSize = () => {
  if (typeof window === "undefined") return "lg";

  if (window.innerWidth < 640) return "xs";
  if (window.innerWidth < 1024) return "sm";

  return "lg";
};

const groupData = (data, groups, key) => {
  return groups.map((group) => ({
    [key]: group.label,
    revenue: group.indexes.reduce(
      (total, index) => total + (data[index]?.revenue || 0),
      0
    ),
  }));
};

const LineChart = () => {
  const [view, setView] = useState("week");
  const [screenSize, setScreenSize] = useState(getScreenSize);

  useEffect(() => {
    const handleResize = () => {
      setScreenSize(getScreenSize());
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const getChartData = () => {
    if (view === "week") {
      return weekData;
    }

    if (view === "month") {
      if (screenSize === "lg") {
        return monthData;
      }

      if (screenSize === "sm") {
        const days = [1, 5, 10, 15, 20, 25, 30];

        return days.map((day) => ({
          day: String(day),
          revenue: monthData
            .filter((item) => Number(item.day) === day)
            .reduce((total, item) => total + item.revenue, 0),
        }));
      }

      const days = [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31];

      return days.map((day) => ({
        day: String(day),
        revenue:
          monthData
            .filter((item) => Number(item.day) >= day && Number(item.day) < day + 3)
            .reduce((total, item) => total + item.revenue, 0) ||
          monthData
            .filter((item) => Number(item.day) === day)
            .reduce((total, item) => total + item.revenue, 0),
      }));
    }

    if (view === "year") {
      if (screenSize === "lg") {
        return yearData;
      }

      if (screenSize === "sm") {
        return groupData(
          yearData,
          [
            { label: "Jan-Feb", indexes: [0, 1] },
            { label: "Mar-Apr", indexes: [2, 3] },
            { label: "May-Jun", indexes: [4, 5] },
            { label: "Jul-Aug", indexes: [6, 7] },
            { label: "Sep-Oct", indexes: [8, 9] },
            { label: "Nov-Dec", indexes: [10, 11] },
          ],
          "month"
        );
      }

      return groupData(
        yearData,
        [
          { label: "Jan-Mar", indexes: [0, 1, 2] },
          { label: "Apr-Jun", indexes: [3, 4, 5] },
          { label: "Jul-Sep", indexes: [6, 7, 8] },
          { label: "Oct-Dec", indexes: [9, 10, 11] },
        ],
        "month"
      );
    }

    return [];
  };

  const data = getChartData();

  const xAxisKey = view === "year" ? "month" : "day";

  return (
    <div className="w-[calc(100% - 32px)] rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm sm:p-6 m-6">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-base-content">
            Revenue Overview
          </h2>

          <p className="mt-1 text-sm text-base-content/60">
            {view === "year" && "Yearly revenue performance"}
            {view === "month" && "Monthly revenue performance"}
            {view === "week" && "Weekly revenue performance"}
          </p>
        </div>

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

      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsLineChart
            data={data}
            margin={{
              top: 10,
              right: 5,
              left: 5,
              bottom: 10,
            }}
            className="bg-primary-soft rounded-2xl px-2 py-1"
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              horizontal={false}
              stroke="currentColor"
              className="text-base-content/10"
            />

            <XAxis
              dataKey={xAxisKey}
              axisLine={true}
              tickLine={false}
              tick={{ fontSize: 12 }}
              className="text-base-content/50"
            />

            <YAxis
              axisLine={true}
              tickLine={false}
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `\u09F3${value / 1000}k`}
              className="text-base-content/50"
            />

            <Tooltip
              cursor={{
                stroke: "currentColor",
                strokeOpacity: 0.15,
              }}
              formatter={(value) => [
                `\u09F3${value.toLocaleString()}`,
                "Revenue",
              ]}
              contentStyle={{
                borderRadius: "12px",
                border: "1px solid hsl(var(--bc) / 0.1)",
                backgroundColor: "hsl(var(--b1))",
              }}
            />

            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#45a15c"
              strokeWidth={2}
              dot={{
                r: 4,
                fill: "#45a15c",
                strokeWidth: 2,
              }}
              activeDot={{
                r: 6,
              }}
            />
          </RechartsLineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default LineChart;