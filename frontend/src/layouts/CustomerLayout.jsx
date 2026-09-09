import { Outlet } from "react-router";
import CutomerNavbar from "../components/CustomerNavbar";
import Footer from "../components/Footer";

const CustomerLayout = () => {
  return (
    <>
      <CutomerNavbar />
      <Outlet />
      <Footer />
    </>
  );
};

export default CustomerLayout;