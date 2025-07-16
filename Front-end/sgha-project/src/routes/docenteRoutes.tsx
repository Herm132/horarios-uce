import type { RouteObject } from "react-router-dom";
import DocenteDashboard from "../pages/docente/DocenteDashboard";
import ProtectedRoute from "../auth/ProtectedRoute";

const docenteRoutes: RouteObject[] = [
  {
    path: "/dashboard/docente",
    element: (
      <ProtectedRoute rolesPermitidos={[2]}>
        <DocenteDashboard />
      </ProtectedRoute>
    ),
  },
];

export default docenteRoutes;
