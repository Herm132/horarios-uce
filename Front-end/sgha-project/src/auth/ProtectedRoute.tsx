import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import type { JSX } from "react";

interface Props {
  children: JSX.Element;
  rolesPermitidos: number[];
}

const ProtectedRoute = ({ children, rolesPermitidos }: Props) => {
  const { usuario } = useAuth();

  if (!usuario) return <Navigate to="/" />;

  if (!rolesPermitidos.includes(usuario.rol.id_rol)) {
    return <h2>No tienes permiso para acceder a esta sección</h2>;
  }

  return children;
};

export default ProtectedRoute;
