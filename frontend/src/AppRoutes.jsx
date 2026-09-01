import { Routes, Route } from "react-router";

// Layouts
import CustomerLayout from "./layouts/CustomerLayout";
import FarmerLayout from "./layouts/FarmerLayout";
import AdminLayout from "./layouts/AdminLayout";

// Protection
import ProtectedRoute from "./components/ProtectedRoute";

// Public Pages
import Home from "./pages/Home";
import About from "./pages/About";
import Marketplace from "./pages/Marketplace";
import ProductDetails from "./pages/ProductDetails";
import FarmProfile from "./pages/FarmProfile";
import FarmInfo from "./pages/FarmInfo";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import TermsConditions from "./pages/TermsConditions";
import PrivacyPolicy from "./pages/PrivacyPolicy";

// Customer Pages
import CustomerDashboard from "./pages/customer/Dashboard";
import CustomerMarketplace from "./pages/customer/Marketplace";
import Cart from "./pages/customer/Cart";
import Checkout from "./pages/customer/Checkout";
import OrderConfirmation from "./pages/customer/OrderConfirmation";
import CustomerOrders from "./pages/customer/Orders";
import CustomerOrderDetails from "./pages/customer/OrderDetails";
import CustomerReviews from "./pages/customer/Reviews";
import CustomerNotifications from "./pages/customer/Notifications";
import CustomerProfile from "./pages/customer/Profile";

// Farmer Pages
import FarmerDashboard from "./pages/farmer/Dashboard";
import Listings from "./pages/farmer/Listings";
import AddProduct from "./pages/farmer/AddProduct";
import EditProduct from "./pages/farmer/EditProduct";
import FarmerOrders from "./pages/farmer/Orders";
import FarmerOrderDetails from "./pages/farmer/OrderDetails";
import RevenueBalance from "./pages/farmer/RevenueBalance";
import FarmerReviews from "./pages/farmer/Reviews";
import FarmerNotifications from "./pages/farmer/Notifications";
import FarmerProfileSettings from "./pages/farmer/Profile";

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard";
import Farmers from "./pages/admin/Farmers";
import Customers from "./pages/admin/Customers";
import Products from "./pages/admin/Products";
import Orders from "./pages/admin/Orders";
import LiveDeliveries from "./pages/admin/LiveDeliveries";
import Analytics from "./pages/admin/Analytics";
import AdminReviews from "./pages/admin/Reviews";
import AdminNotifications from "./pages/admin/Notifications";
import AdminProfile from "./pages/admin/Profile";

// Error Pages
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";

const AppRoutes = () => {
  return (
    <Routes>

      {/* ================= PUBLIC ROUTES ================= */}

      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/marketplace" element={<Marketplace />} />
      <Route path="/products/:id" element={<ProductDetails />} />
      <Route path="/farms" element={<FarmInfo/>} />
      <Route path="/farms/:id" element={<FarmProfile />} />
      <Route path="/login" element={<Login />} />

      <Route path="/register" element={<Register />} />

      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route
        path="/terms-and-conditions"
        element={<TermsConditions />}
      />
      <Route
        path="/privacy-policy"
        element={<PrivacyPolicy />}
      />


      {/* ================= CUSTOMER ROUTES ================= */}

      {/* element={<ProtectedRoute role="customer" />} */}
      <Route>
        <Route path="/customer" element={<CustomerLayout />}>

          <Route index element={<CustomerDashboard />} />

          <Route
            path="marketplace"
            element={<CustomerMarketplace />}
          />

          <Route path="cart" element={<Cart />} />

          <Route path="checkout" element={<Checkout />} />

          <Route
            path="order-confirmation"
            element={<OrderConfirmation />}
          />

          <Route path="orders">
            <Route index element={<CustomerOrders />} />
            <Route
              path=":id"
              element={<CustomerOrderDetails />}
            />
          </Route>

          <Route
            path="reviews"
            element={<CustomerReviews />}
          />

          <Route
            path="notifications"
            element={<CustomerNotifications />}
          />

          <Route
            path="profile"
            element={<CustomerProfile />}
          />

        </Route>
      </Route>


      {/* ================= FARMER ROUTES ================= */}

      {/* element={<ProtectedRoute role="farmer" />} */}
      <Route>
        <Route path="/farmer" element={<FarmerLayout />}>

          <Route index element={<FarmerDashboard />} />

          <Route path="listings">
            <Route index element={<Listings />} />
            <Route path="add" element={<AddProduct />} />
            <Route path="edit/:id" element={<EditProduct />} />
          </Route>

          <Route path="orders">
            <Route index element={<FarmerOrders />} />
            <Route
              path=":id"
              element={<FarmerOrderDetails />}
            />
          </Route>

          <Route
            path="revenue"
            element={<RevenueBalance />}
          />

          <Route
            path="reviews"
            element={<FarmerReviews />}
          />

          <Route
            path="notifications"
            element={<FarmerNotifications />}
          />

          <Route
            path="profile"
            element={<FarmerProfileSettings />}
          />

        </Route>
      </Route>


      {/* ================= ADMIN ROUTES ================= */}
      
      {/* element={<ProtectedRoute role="admin" />} */}
      <Route>
        <Route path="/admin" element={<AdminLayout />}>

          <Route index element={<AdminDashboard />} />

          <Route
            path="farmers"
            element={<Farmers />}
          />

          <Route
            path="customers"
            element={<Customers />}
          />

          <Route
            path="products"
            element={<Products />}
          />

          <Route
            path="orders"
            element={<Orders />}
          />

          <Route
            path="live-deliveries"
            element={<LiveDeliveries />}
          />

          <Route
            path="analytics"
            element={<Analytics />}
          />

          <Route
            path="reviews"
            element={<AdminReviews />}
          />

          <Route
            path="notifications"
            element={<AdminNotifications />}
          />

          <Route
            path="profile"
            element={<AdminProfile />}
          />

        </Route>
      </Route>


      {/* ================= ERROR ROUTES ================= */}

      <Route
        path="/unauthorized"
        element={<Unauthorized />}
      />

      <Route
        path="*"
        element={<NotFound />}
      />

    </Routes>
  );
};

export default AppRoutes;