import { BASE_URL } from "../config/config";

const USUARIOS_URL = `${BASE_URL}/usuarios/`;
const getAuthHeaders = () => {
  const token = localStorage.getItem("access");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

export const getUsuarios = async () => {
  const response = await fetch(USUARIOS_URL, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error("Error al obtener las carreras");
  return await response.json();
};
