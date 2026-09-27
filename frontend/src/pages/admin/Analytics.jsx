import { useQuery } from "@tanstack/react-query";
import {
  getAdminDashboard,
  getAdminRevenueSummary,
  getRevenueOverTime,
} from "../../api/admin";
import AdminStatCards from "../../components/AdminStatCards";
import AdminRevenueChart from "../../components/AdminRevenueChart";
import Loader from "../../components/Loader";
import { FiPackage, FiTrendingUp } from "react-icons/fi";

const AdminAnalytics = () => {
  const { data: dashboard, isLoading: dashLoading } = useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: async () => (await getAdminDashboard()).data.stats,
  });

  const { data: revenueSummary, isLoading: revLoading } = useQuery({
    queryKey: ["admin", "revenueSummary"],
    queryFn: async () => (await getAdminRevenueSummary()).data.summary,
  });

  const { data: overTime, isLoading: overTimeLoading } = useQuery({
    queryKey: ["admin", "revenueOverTime"],
    queryFn: async () => {
      const { data } = await getRevenueOverTime();
      return { daily: data.daily, monthly: data.monthly };
    },
  });

  if (dashLoading || revLoading || overTimeLoading) {
    return <Loader />;
  }

  const stats = {
    totalFarmers: dashboard?.totalFarmers,
    totalFarms: dashboard?.totalFarms,
    totalCustomers: dashboard?.totalCustomers,
    totalAdminRevenue: revenueSummary?.totalAdminRevenue,
  };

  const today = overTime?.daily?.at(-1) || {
    count: 0,
    totalSales: 0,
    adminRevenue: 0,
  };

  return (
    <div className="space-y-6">
      <AdminStatCards stats={stats} />
      <div>
        <h1 className="text-xl font-extrabold">Analytics</h1>
        <p className="text-sm text-muted-light mt-1">
          Platform performance at a glance
        </p>
      </div>

      {/* NEW: today's 3 cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-base-100 border border-theme-light rounded-box p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-field flex items-center justify-center shrink-0 bg-primary-soft text-primary">
            <FiPackage size={22} />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-light">Orders Delivered Today</p>
            <p className="text-xl font-extrabold">{today.count}</p>
          </div>
        </div>

        <div className="bg-base-100 border border-theme-light rounded-box p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-field flex items-center justify-center shrink-0 bg-secondary-soft text-secondary">
            <FiTrendingUp size={22} />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-light">Today's Gross</p>
            <p className="text-xl font-extrabold">৳{today.totalSales}</p>
          </div>
        </div>

        <div className="bg-base-100 border border-theme-light rounded-box p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-field flex items-center justify-center shrink-0 bg-cyan-soft text-cyan">
            <span className="text-[22px]">৳</span>
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-light">Today's Revenue</p>
            <p className="text-xl font-extrabold">৳{today.adminRevenue}</p>
          </div>
        </div>
      </div>

      <AdminRevenueChart daily={overTime?.daily} monthly={overTime?.monthly} />
    </div>
  );
};

export default AdminAnalytics;
