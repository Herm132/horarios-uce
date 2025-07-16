import type { RouteObject } from "react-router-dom";
import EstudianteDashboard from "../pages/estudiante/EstudianteDashboard";
import ProtectedRoute from "../auth/ProtectedRoute";
import EstudianteHorario from "../pages/estudiante/EstudianteDashboard";

const estudianteRoutes: RouteObject[] = [
  {
    path: "/dashboard/estudiante",
    element: (
      <ProtectedRoute rolesPermitidos={[1]}>
        <EstudianteDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/dashboard/estudiante/horario",
    element: (
      <ProtectedRoute rolesPermitidos={[1]}>
        <EstudianteHorario />
      </ProtectedRoute>
    ),
  },
];

export default estudianteRoutes;
