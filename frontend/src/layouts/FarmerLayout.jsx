import { Outlet } from "react-router"
import FarmerNavbar from "../components/FarmerNavbar"
import Footer from "../components/Footer"

const FarmerLayout = () => {
  return (
    <>
    <FarmerNavbar/>
    <Footer/>
    <Outlet/>
    </>
  )
}

export default FarmerLayout