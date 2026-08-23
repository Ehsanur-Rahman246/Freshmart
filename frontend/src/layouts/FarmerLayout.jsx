import SellerNavbar from "../components/SellerNavbar"
import FarmerDashboard from "../pages/farmer/FarmerDashboard"
import Footer from "../components/Footer"
import Listings from "../pages/farmer/Listings"
import Orders from "../pages/farmer/Orders"
import { useState } from "react"

const FarmerLayout = () => {
    const [showListings, setShowListings] = useState(false);
    const [showOrders, setshowOrders] = useState(false);
  return (
    <>
          <SellerNavbar
      onListingsClick={() => setShowListings(true)}
      onOrdersClick={() => setshowOrders(true)}
    />

    {showListings && (
      <Listings onClose={() => setShowListings(false)} />
    )}
    {showOrders && (
      <Orders onClose={() => setshowOrders(false)} />
    )}

    {!showListings && !showOrders && (
      <>
        <FarmerDashboard/>
        <Footer/>
      </>
    )}
    </>
  )
}

export default FarmerLayout