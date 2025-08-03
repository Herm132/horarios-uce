// ✅ src/api/horario.ts
import { BASE_URL } from "../config/config";

const HORARIO_URL = `${BASE_URL}/superadmin/horario/`;

const getAuthHeaders = () => {
  const token = localStorage.getItem("access");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

// Interfaces
export interface HorarioPayload {
  id_asignatura: number;
  id_aula: number;
  id_hora_clase: number;
  id_usuario: number;
  paralelo: number;
  id_semestre_lectivo: number;
}

// 🔹 Obtener todos los horarios
export const getHorarios = async () => {
  const res = await fetch(HORARIO_URL, { headers: getAuthHeaders() });
  if (!res.ok) {
    const error = await res.json();
    throw error;
  }

  return await res.json();
};

// 🔹 Crear un horario
export const crearHorario = async (data: HorarioPayload) => {
  const res = await fetch(HORARIO_URL, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw error;
  }

  return await res.json();
};

// 🔹 Eliminar un horario
export const eliminarHorario = async (id: number) => {
  const res = await fetch(`${HORARIO_URL}${id}/`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const error = await res.json();
    throw error;
  }

  return await res.json();
};

// 🔹 Actualizar un horario
export const actualizarHorario = async (id: number, data: HorarioPayload) => {
  const res = await fetch(`${HORARIO_URL}${id}/`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw error;
  }

  return await res.json();
};

export const getHorariosPorDocente = async (id: number) => {
  const res = await fetch(`${HORARIO_URL}docente/${id}/`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const error = await res.json();
    throw error;
  }

  return await res.json();
};

export const getHorariosPorEstudiante = async (id: number) => {
  const res = await fetch(`${HORARIO_URL}estudiante/${id}/`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const error = await res.json();
    throw error;
  }

  return await res.json();
};
