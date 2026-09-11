import { Outlet } from "react-router";
import CutomerNavbar from "../components/CustomerNavbar";


const CustomerLayout = () => {
  return (
    <>
      <CutomerNavbar />
      <Outlet />
      
    </>
  );
};

export default CustomerLayout;