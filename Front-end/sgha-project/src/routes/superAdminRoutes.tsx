import type { RouteObject } from "react-router-dom";
import ProtectedRoute from "../auth/ProtectedRoute";
import SuperAdminDashboard from "../pages/superadmin/SuperAdminDashboard";
import SuperAdminLayout from "../layouts/SuperAdminLayout";
import FacultadPage from "../pages/features/FacultadPage";
import CarreraPage from "../pages/features/CarreraPage";
import AulaPage from "../pages/features/AulaPage";
import AsignaturaPage from "../pages/features/AsignaturaPage";
import AsignaturaCarreraPage from "../pages/features/AsignaturaCarreraPage";
import HoraClasePage from "../pages/features/HoraClasePage";
import UsuarioCarreraPage from "../pages/features/UsuarioCarreraPage";
import UsuarioAsignaturaPage from "../pages/features/UsuarioAsignaturaPage";
import UsuarioAsignaturaEstudiantePage from "../pages/features/UsuarioAsignaturaEstudiantePage";
import HorarioPage from "../pages/features/HorarioPage";
import SemestreLectivoPage from "../pages/features/SemestreLectivo";
import UsuariosPage from "../pages/features/Usuarios";
import ReportesPage from "../pages/features/Reportes";
import LogsPage from "../pages/features/Logs";

const superAdminRoutes: RouteObject[] = [
  {
    path: "/dashboard/superadmin",
    element: (
      <ProtectedRoute rolesPermitidos={[4]}>
        <SuperAdminLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <SuperAdminDashboard />,
      },
      {
        path: "facultades",
        element: <FacultadPage />,
      },
      {
        path: "carreras",
        element: <CarreraPage />,
      },
      {
        path: "aulas",
        element: <AulaPage />,
      },
      {
        path: "asignaturas",
        element: <AsignaturaPage />,
      },
      {
        path: "asignatura-carreras",
        element: <AsignaturaCarreraPage />,
      },
      {
        path: "horas-clase",
        element: <HoraClasePage />,
      },
      {
        path: "usuario-carrera",
        element: <UsuarioCarreraPage />,
      },
      {
        path: "usuario-asignatura",
        element: <UsuarioAsignaturaPage />,
      },
      {
        path: "usu-asig-estudiante",
        element: <UsuarioAsignaturaEstudiantePage />,
      },
      {
        path: "horario",
        element: <HorarioPage />,
      },
      {
        path: "semestre-lectivo",
        element: <SemestreLectivoPage />,
      },
      {
        path: "usuarios",
        element: <UsuariosPage />,
      },
      {
        path: "reportes",
        element: <ReportesPage />,
      },
      {
        path: "logs",
        element: <LogsPage />,
      },
    ],
  },
];

export default superAdminRoutes;
