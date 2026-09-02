import CutomerNavbar from "../components/CustomerNavbar"
import Footer from "../components/Footer"
import Dashboard from "../pages/customer/Dashboard"

const CustomerLayout = () => {
  return (
    <>
      <CutomerNavbar/>
      <Dashboard/>
      <Footer/>
    </>
  )
}

export default CustomerLayout