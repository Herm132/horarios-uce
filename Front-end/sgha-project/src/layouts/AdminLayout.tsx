import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import "../styles/Admin/AdminLayout.css";

const AdminLayout = () => {
  return (
    <div className="layout">
      <Sidebar />
      <div className="main-content">
        <Topbar />
        <div className="page-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
