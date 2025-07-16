import {
  BrowserRouter as Router,
  useRoutes,
  type RouteObject,
} from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

import LoginPage from "../pages/login/LoginPage";
import estudianteRoutes from "./estudianteRoutes";
import docenteRoutes from "./docenteRoutes";
import adminRoutes from "./adminRoutes";
import superAdminRoutes from "./superAdminRoutes";

const AppRoutes = () => {
  const { usuario } = useAuth();

  const publicRoutes = [{ path: "/", element: <LoginPage /> }];
  let privateRoutes: RouteObject[] = [];

  if (usuario) {
    const rolId = usuario.rol.id_rol;

    switch (rolId) {
      case 1:
        privateRoutes = estudianteRoutes;
        break;
      case 2:
        privateRoutes = docenteRoutes;
        break;
      case 3:
        privateRoutes = adminRoutes;
        break;
      case 4:
        privateRoutes = superAdminRoutes;
        break;
      default:
        privateRoutes = [];
    }
  }

  const routes = [...publicRoutes, ...privateRoutes];

  return useRoutes(routes);
};

const AppRouter = () => {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
};

export default AppRouter;
