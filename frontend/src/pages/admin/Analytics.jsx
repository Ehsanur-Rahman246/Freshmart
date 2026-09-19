import { useQuery } from "@tanstack/react-query";
import {
  getAdminDashboard,
  getAdminRevenueSummary,
  getRevenueOverTime,
} from "../../api/admin";
import AdminStatCards from "../../components/AdminStatCards";
import AdminRevenueChart from "../../components/AdminRevenueChart";
import Loader from "../../components/Loader";

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

  return (
    <div className="space-y-6">
      <AdminStatCards stats={stats} />
      <div>
        <h1 className="text-xl font-extrabold">Analytics</h1>
        <p className="text-sm text-muted-light mt-1">
          Platform performance at a glance
        </p>
      </div>

      <AdminRevenueChart daily={overTime?.daily} monthly={overTime?.monthly} />
    </div>
  );
};

export default AdminAnalytics;