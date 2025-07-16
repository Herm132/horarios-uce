import { BASE_URL } from "../config/config";

const AULAS_URL = `${BASE_URL}/superadmin/aulas/`;

const getAuthHeaders = () => {
  const token = localStorage.getItem("access");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

export const getAulas = async () => {
  const res = await fetch(AULAS_URL, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Error al obtener aulas");
  return await res.json();
};

export const createAula = async (aula: {
  nombre: string;
  capacidad: number;
  tipo: string;
  edificio: string;
  piso: number;
  id_facultad: number;
  uso_general: boolean;
}) => {
  const res = await fetch(AULAS_URL, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(aula),
  });
  if (!res.ok) throw new Error("Error al crear aula");
  return await res.json();
};

export const updateAula = async (
  id: number,
  aula: {
    nombre: string;
    capacidad: number;
    tipo: string;
    edificio: string;
    piso: number;
    id_facultad: number;
    uso_general: boolean;
  }
) => {
  const res = await fetch(`${AULAS_URL}${id}/`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(aula),
  });
  if (!res.ok) throw new Error("Error al actualizar aula");
  return await res.json();
};

export const deleteAula = async (id: number) => {
  const res = await fetch(`${AULAS_URL}${id}/`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Error al eliminar aula");
  return true;
};
