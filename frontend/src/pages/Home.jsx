import { useState } from "react";
import CutomerNavbar from "../components/CutomerNavBar";
import HomeNavbar from "../components/HomeNavbar";
import SellerNavbar from "../components/SellerNavbar";
import Listings from "./farmer/Listings";

const Home = () => {
  const [showListings, setShowListings] = useState(false);

  return (
    <>
      <CutomerNavbar />
      <HomeNavbar />

      <SellerNavbar
        onListingsClick={() => setShowListings(true)}
      />

      {showListings && (
        <Listings
          onClose={() => setShowListings(false)}
        />
      )}
    </>
  );
};

export default Home;