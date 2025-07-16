import { BASE_URL } from "../config/config";

const USUARIO_ASIGNATURA_URL = `${BASE_URL}/superadmin/usuario-asignatura/`;

const headers = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("access")}`,
});

// Obtener todas las relaciones
export const getUsuariosAsignaturas = async () => {
  const res = await fetch(USUARIO_ASIGNATURA_URL, {
    headers: headers(),
  });
  if (!res.ok)
    throw new Error("Error al obtener relaciones usuario-asignatura");
  return await res.json();
};

// Crear una relación
export const crearUsuarioAsignatura = async (payload: {
  id_usuario: number;
  id_asignatura: number;
  paralelo: number;
}) => {
  const res = await fetch(USUARIO_ASIGNATURA_URL, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Error al crear asignación");
  return await res.json();
};

// Eliminar por ID de relación
export const eliminarUsuarioAsignatura = async (id: number) => {
  const res = await fetch(`${USUARIO_ASIGNATURA_URL}${id}/`, {
    method: "DELETE",
    headers: headers(),
  });
  if (!res.ok) throw new Error("Error al eliminar asignación");
  return true;
};

// Buscar asignaturas por usuario
export const getAsignaturasPorUsuario = async (id_usuario: number) => {
  const res = await fetch(`${USUARIO_ASIGNATURA_URL}usuario/${id_usuario}/`, {
    headers: headers(),
  });
  if (!res.ok) throw new Error("Error al obtener asignaturas del usuario");
  return await res.json();
};

// Buscar usuarios por asignatura
export const getUsuariosPorAsignatura = async (id_asignatura: number) => {
  const res = await fetch(
    `${USUARIO_ASIGNATURA_URL}asignatura/${id_asignatura}/`,
    {
      headers: headers(),
    }
  );
  if (!res.ok) throw new Error("Error al obtener usuarios de la asignatura");
  return await res.json();
};
