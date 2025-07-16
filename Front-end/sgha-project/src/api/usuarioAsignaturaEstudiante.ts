import { BASE_URL } from "../config/config";

const API_URL = `${BASE_URL}/superadmin/usu-asig-estudiante/`;
const USUARIOS_URL = `${BASE_URL}/usuarios/`;
const ASIGNATURA_CARRERA_URL = `${BASE_URL}/superadmin/asignatura-carrera/`;

const headers = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("access")}`,
});

// 🔹 Obtener solo los usuarios (estudiantes filtrados se hace en el frontend)
export const getUsuarios = async () => {
  const res = await fetch(USUARIOS_URL, { headers: headers() });
  if (!res.ok) throw new Error("Error al obtener usuarios");
  return await res.json();
};

// 🔹 Obtener todas las asignaturas (si las necesitas)
export const getAsignaturas = async () => {
  const res = await fetch(`${BASE_URL}/superadmin/asignaturas/`, {
    headers: headers(),
  });
  if (!res.ok) throw new Error("Error al obtener asignaturas");
  return await res.json();
};

// 🔹 Obtener relaciones asignatura-carrera (para filtrar asignaturas por carrera del estudiante)
export const getAsignaturasCarrera = async () => {
  const res = await fetch(ASIGNATURA_CARRERA_URL, {
    headers: headers(),
  });
  if (!res.ok) throw new Error("Error al obtener asignatura-carrera");
  return await res.json();
};

// 🔹 Obtener asignaturas inscritas por estudiante
export const getAsignaturasPorUsuario = async (id_usuario: number) => {
  const res = await fetch(`${API_URL}?usuario=${id_usuario}`, {
    headers: headers(),
  });
  if (!res.ok) throw new Error("Error al obtener asignaturas del estudiante");
  return (await res.json()).resultados;
};

// 🔹 Crear relación estudiante-asignatura
export const crearUsuarioAsignaturaEstudiante = async (payload: {
  id_usuario: number;
  id_asignatura: number;
  paralelo: number;
}) => {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Error al asignar estudiante a asignatura");
  return await res.json();
};

// 🔹 Eliminar asignación
export const eliminarUsuarioAsignaturaEstudiante = async (id: number) => {
  const res = await fetch(`${API_URL}${id}/`, {
    method: "DELETE",
    headers: headers(),
  });
  if (!res.ok) throw new Error("Error al eliminar asignación");
  return true;
};
