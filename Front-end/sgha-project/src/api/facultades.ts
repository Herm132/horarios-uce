import { BASE_URL } from "../config/config";

const FACULTADES_URL = `${BASE_URL}/superadmin/facultades/`;

// Función para obtener el token desde localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem("access");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

// Obtener todas las facultades
export const getFacultades = async () => {
  const response = await fetch(FACULTADES_URL, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Error al obtener las facultades");
  }

  return await response.json();
};

// Crear nueva facultad
export const createFacultad = async (nombre: string) => {
  const response = await fetch(FACULTADES_URL, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ nombre }),
  });

  if (!response.ok) {
    throw new Error("Error al crear la facultad");
  }

  return await response.json();
};

// Actualizar facultad por ID
export const updateFacultad = async (id: number, nombre: string) => {
  const response = await fetch(`${FACULTADES_URL}${id}/`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({ nombre }),
  });

  if (!response.ok) {
    throw new Error("Error al actualizar la facultad");
  }

  return await response.json();
};

// Eliminar facultad por ID
export const deleteFacultad = async (id: number) => {
  const response = await fetch(`${FACULTADES_URL}${id}/`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Error al eliminar la facultad");
  }

  return true;
};
