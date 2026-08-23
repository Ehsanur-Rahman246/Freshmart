import SellerNavbar from "../components/SellerNavbar"
import FarmerDashboard from "../pages/farmer/FarmerDashboard"
import Footer from "../components/Footer"
import Listings from "../pages/farmer/Listings"
import { useState } from "react"

const FarmerLayout = () => {
    const [showListings, setShowListings] = useState(false);
  return (
    <>
      <SellerNavbar
        onListingsClick={() => setShowListings(true)}
      />

      {showListings && (
        <Listings
          onClose={() => setShowListings(false)}
        />
      )}
      <FarmerDashboard/>
      <Footer/>
    </>
  )
}

export default FarmerLayout