import { FiUsers, FiUserCheck, FiDollarSign } from "react-icons/fi";
import { PiFarmLight } from "react-icons/pi";

const StatCard = ({ label, value, icon: Icon, color }) => (
  <div className="bg-base-100 border border-theme-light rounded-box p-5 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-field flex items-center justify-center shrink-0 ${color}`}>
      <Icon size={22} />
    </div>
    <div className="min-w-0">
      <p className="text-xs text-muted-light">{label}</p>
      <p className="text-xl font-extrabold truncate">{value}</p>
    </div>
  </div>
);

// stats: { totalFarmers, totalFarms, totalCustomers, totalAdminRevenue }
const AdminStatCards = ({ stats }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    <StatCard
      label="Total Farmers"
      value={stats.totalFarmers ?? 0}
      icon={FiUserCheck}
      color="bg-primary-soft text-primary"
    />
    <StatCard
      label="Total Farms"
      value={stats.totalFarms ?? 0}
      icon={PiFarmLight}
      color="bg-accent-soft text-primary"
    />
    <StatCard
      label="Total Customers"
      value={stats.totalCustomers ?? 0}
      icon={FiUsers}
      color="bg-secondary-soft text-secondary"
    />
    <StatCard
      label="Total Revenue"
      value={`৳${(stats.totalAdminRevenue ?? 0).toLocaleString()}`}
      icon={FiDollarSign}
      color="bg-cyan-soft text-cyan"
    />
  </div>
);

export default AdminStatCards;