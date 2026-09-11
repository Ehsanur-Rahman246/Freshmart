import { logout } from "../api/auth";
import { useNavigate } from "react-router";



const AdminLayout = () => {
  const navigate = useNavigate();
  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };
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