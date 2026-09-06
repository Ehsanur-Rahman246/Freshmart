import { logout } from "../lib/auth";
import { useNavigate } from "react-router";



const AdminLayout = () => {
  const navigate = useNavigate();
  const handleLogout = async () => {
    await logout();
    navigate("/login");
  }
  return (
    <>
    <div>AdminLayout</div>
    <br />
    <br />
    <button className="btn btn-primary" onClick={handleLogout}>log out</button>
    </>
  )
}

export default AdminLayout