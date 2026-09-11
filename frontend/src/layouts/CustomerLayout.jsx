import { Outlet } from "react-router";
import CutomerNavbar from "../components/CustomerNavbar";
import CustomerProfileForm from "../forms/CustomerProfileForm";

const CustomerLayout = () => {
  return (
    <>
      <CutomerNavbar />
      <CustomerProfileForm/>
      <Outlet />
    </>
  );
};

export default CustomerLayout;