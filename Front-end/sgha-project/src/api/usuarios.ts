import { BASE_URL } from "../config/config";

const USUARIOS_URL = `${BASE_URL}/usuarios/`;

export interface Usuario {
  id_usuario: number;
  nombres: string;
  apellidos: string;
  cedula: string;
  correo: string;
  rol: {
    id_rol: number;
    nombre_rol: string;
  };
  carreras: {
    id_carrera: number;
    nombre: string;
    codigo: string;
  }[];
}

export interface RegistroUsuarioInput {
  nombres: string;
  apellidos: string;
  cedula: string;
  correo: string;
  password: string;
  id_rol: number;
  carreras: number[];
  modalidad_contratacion?: string;
  tiempo_dedicacion?: string;
}

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

const REGISTRO_URL = `${BASE_URL}/usuarios/registro/`;

export const registrarUsuario = async (data: RegistroUsuarioInput) => {
  const response = await fetch(REGISTRO_URL, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw error;
  }

  return await response.json();
};

export const actualizarUsuario = async (
  id: number,
  data: RegistroUsuarioInput
) => {
  const response = await fetch(`${USUARIOS_URL}${id}/`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw error;
  }

  return await response.json();
};

export const eliminarUsuario = async (id: number) => {
  const response = await fetch(`${USUARIOS_URL}${id}/`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw error;
  }
};
