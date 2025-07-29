import { Outlet } from "react-router-dom";
import Topbar from "../components/Topbar";
import "../styles/Estudiante/EstudianteLayout.css";

const DocenteLayout = () => {
  return (
    <div className="layout">
      <div className="main-content">
        <Topbar />
        <div className="page-content responsive-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default DocenteLayout;
