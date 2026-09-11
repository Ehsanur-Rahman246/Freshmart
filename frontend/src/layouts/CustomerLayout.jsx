import { Outlet } from "react-router";
import CutomerNavbar from "../components/CustomerNavbar";
<<<<<<< HEAD

=======
import CustomerProfileForm from "../forms/CustomerProfileForm";
>>>>>>> f2d6f2c11405b316c995acba723a2752cad2d38f

const CustomerLayout = () => {
  return (
    <>
      <CutomerNavbar />
<<<<<<< HEAD
      <Outlet />
      
=======
      <CustomerProfileForm/>
      <Outlet />
>>>>>>> f2d6f2c11405b316c995acba723a2752cad2d38f
    </>
  );
};

export default CustomerLayout;