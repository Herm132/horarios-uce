import type { RouteObject } from "react-router-dom";
import DocenteDashboard from "../pages/docente/DocenteDashboard";
import ProtectedRoute from "../auth/ProtectedRoute";
import DocenteLayout from "../layouts/DocenteLayout";

const docenteRoutes: RouteObject[] = [
  {
    path: "/dashboard/docente",
    element: (
      <ProtectedRoute rolesPermitidos={[2]}>
        <DocenteLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <DocenteDashboard />,
      },
    ],
  },
];

export default docenteRoutes;
