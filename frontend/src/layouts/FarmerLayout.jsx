import { Outlet } from "react-router"
import FarmerNavbar from "../components/FarmerNavbar"
import Footer from "../components/Footer"

const FarmerLayout = () => {
    const [showListings, setShowListings] = useState(false);
    const [showOrders, setshowOrders] = useState(false);
  return (
    <>
    <FarmerNavbar/>
    <Footer/>
    <Outlet/>
    </>
  )
}

export default FarmerLayout