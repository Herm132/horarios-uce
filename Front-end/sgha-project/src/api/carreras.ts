import { BASE_URL } from "../config/config";

const CARRERAS_URL = `${BASE_URL}/superadmin/carreras/`;
const getAuthHeaders = () => {
  const token = localStorage.getItem("access");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

export const getCarreras = async () => {
  const response = await fetch(CARRERAS_URL, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error("Error al obtener las carreras");
  return await response.json();
};

export const createCarrera = async (
  nombre: string,
  codigo: string,
  id_facultad: number
) => {
  const response = await fetch(CARRERAS_URL, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ nombre, codigo, id_facultad }),
  });
  if (!response.ok) throw new Error("Error al crear la carrera");
  return await response.json();
};

export const updateCarrera = async (
  id: number,
  nombre: string,
  codigo: string,
  id_facultad: number
) => {
  const response = await fetch(`${CARRERAS_URL}${id}/`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({ nombre, codigo, id_facultad }),
  });
  if (!response.ok) throw new Error("Error al actualizar la carrera");
  return await response.json();
};

export const deleteCarrera = async (id: number) => {
  const response = await fetch(`${CARRERAS_URL}${id}/`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error("Error al eliminar la carrera");
  return true;
};
