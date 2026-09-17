import { Outlet } from "react-router";
import CutomerNavbar from "../components/CustomerNavbar";
<<<<<<< HEAD
<<<<<<< HEAD

=======
import CustomerProfileForm from "../forms/CustomerProfileForm";
>>>>>>> f2d6f2c11405b316c995acba723a2752cad2d38f
=======
>>>>>>> 2917153390ec8cf2fe10391893afb65676bb3fcf

const CustomerLayout = () => {
  return (
    <>
      <CutomerNavbar />
<<<<<<< HEAD
<<<<<<< HEAD
      <Outlet />
      
=======
      <CustomerProfileForm/>
      <Outlet />
>>>>>>> f2d6f2c11405b316c995acba723a2752cad2d38f
=======
      <Outlet/>
>>>>>>> 2917153390ec8cf2fe10391893afb65676bb3fcf
    </>
  );
};

export default CustomerLayout;