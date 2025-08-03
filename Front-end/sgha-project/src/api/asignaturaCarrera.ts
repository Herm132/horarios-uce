import { BASE_URL } from "../config/config";

const ASIGNATURA_CARRERA_URL = `${BASE_URL}/superadmin/asignatura-carrera/`;

const getAuthHeaders = () => {
  const token = localStorage.getItem("access");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

// 🔹 Crear vínculo entre asignatura y múltiples carreras
export const vincularAsignaturaCarreras = async (
  id_asignatura: number,
  id_carrera: number[]
) => {
  const res = await fetch(ASIGNATURA_CARRERA_URL, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      id_asignatura,
      id_carrera,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw errorData;
  }
};

// 🔹 Obtener todas las relaciones asignatura-carrera agrupadas por asignatura
export const getAsignaturaCarrera = async () => {
  const res = await fetch(ASIGNATURA_CARRERA_URL, {
    headers: getAuthHeaders(),
  });
  if (!res.ok)
    throw new Error("Error al obtener relaciones asignatura-carrera");
  return await res.json();
};

// 🔹 Eliminar relación específica
export const deleteAsignaturaCarrera = async (id: number) => {
  const res = await fetch(`${ASIGNATURA_CARRERA_URL}${id}/`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Error al eliminar relación asignatura-carrera");
  return true;
};

// 🔹 Actualizar relación (normalmente se usa para cambiar el set de carreras de una asignatura)
export const updateAsignaturaCarrera = async (
  id: number,
  id_asignatura: number,
  id_carreras: number[]
) => {
  const res = await fetch(`${ASIGNATURA_CARRERA_URL}${id}/`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      id_asignatura,
      id_carrera: id_carreras,
    }),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw errorData;
  }
};

// 🔹 Obtener todas las asignaturas de una carrera específica
export const getAsignaturasPorCarrera = async (idCarrera: number) => {
  const res = await fetch(`${ASIGNATURA_CARRERA_URL}carrera/${idCarrera}/`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Error al obtener asignaturas por carrera");
  return await res.json();
};

// 🔹 Obtener todas las carreras asociadas a una asignatura
export const getCarrerasPorAsignatura = async (idAsignatura: number) => {
  const res = await fetch(
    `${ASIGNATURA_CARRERA_URL}asignatura/${idAsignatura}/`,
    {
      headers: getAuthHeaders(),
    }
  );
  if (!res.ok) throw new Error("Error al obtener carreras por asignatura");
  return await res.json();
};
