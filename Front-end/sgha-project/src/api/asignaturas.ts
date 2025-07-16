import { BASE_URL } from "../config/config";

const ASIGNATURAS_URL = `${BASE_URL}/superadmin/asignaturas/`;

const getAuthHeaders = () => {
  const token = localStorage.getItem("access");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

export const getAsignaturas = async () => {
  const res = await fetch(ASIGNATURAS_URL, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Error al obtener asignaturas");
  return await res.json();
};

export const createAsignatura = async (asignatura: {
  nombre: string;
  codigo: string;
  horas_clase: number;
  horas_pae: number;
  semestre: number;
  es_comun: boolean;
}) => {
  const res = await fetch(ASIGNATURAS_URL, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(asignatura),
  });
  if (!res.ok) throw new Error("Error al crear asignatura");
  return await res.json();
};

export const updateAsignatura = async (
  id: number,
  asignatura: {
    nombre: string;
    codigo: string;
    horas_clase: number;
    horas_pae: number;
    semestre: number;
    es_comun: boolean;
  }
) => {
  const res = await fetch(`${ASIGNATURAS_URL}${id}/`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(asignatura),
  });
  if (!res.ok) throw new Error("Error al actualizar asignatura");
  return await res.json();
};

export const deleteAsignatura = async (id: number) => {
  const res = await fetch(`${ASIGNATURAS_URL}${id}/`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Error al eliminar asignatura");
  return true;
};
