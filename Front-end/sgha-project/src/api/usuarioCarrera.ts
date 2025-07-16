import { BASE_URL } from "../config/config";

const USUARIO_CARRERA_URL = `${BASE_URL}/superadmin/usuario-carrera/`;

const headers = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("access")}`,
});

export const getUsuariosConCarreras = async () => {
  const res = await fetch(USUARIO_CARRERA_URL, { headers: headers() });
  if (!res.ok) throw new Error("Error al obtener usuarios con carreras");
  return await res.json();
};

export const crearUsuarioCarrera = async (payload: {
  id_usuario: number;
  id_carrera: number;
}) => {
  const res = await fetch(USUARIO_CARRERA_URL, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Error al crear relación");
  return await res.json();
};

export const eliminarUsuarioCarrera = async (id: number) => {
  const res = await fetch(`${USUARIO_CARRERA_URL}${id}/`, {
    method: "DELETE",
    headers: headers(),
  });
  if (!res.ok) throw new Error("Error al eliminar relación");
  return true;
};

// NUEVOS:
export const getCarrerasPorUsuario = async (idUsuario: number) => {
  const res = await fetch(`${USUARIO_CARRERA_URL}usuario/${idUsuario}/`, {
    headers: headers(),
  });
  if (!res.ok) throw new Error("Error al obtener carreras por usuario");
  return await res.json();
};

export const getUsuariosPorCarrera = async (idCarrera: number) => {
  const res = await fetch(`${USUARIO_CARRERA_URL}carrera/${idCarrera}/`, {
    headers: headers(),
  });
  if (!res.ok) throw new Error("Error al obtener usuarios por carrera");
  return await res.json();
};
