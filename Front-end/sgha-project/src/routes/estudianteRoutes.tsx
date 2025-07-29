import type { RouteObject } from "react-router-dom";
import EstudianteDashboard from "../pages/estudiante/EstudianteDashboard";
import ProtectedRoute from "../auth/ProtectedRoute";
import EstudianteHorario from "../pages/estudiante/EstudianteDashboard";
import EstudianteLayout from "../layouts/EstudianteLayout";

const estudianteRoutes: RouteObject[] = [
  {
    path: "/dashboard/estudiante",
    element: (
      <ProtectedRoute rolesPermitidos={[1]}>
        <EstudianteLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <EstudianteDashboard />,
      },
      {
        path: "horario",
        element: <EstudianteHorario />,
      },
    ],
  },
];

export default estudianteRoutes;
