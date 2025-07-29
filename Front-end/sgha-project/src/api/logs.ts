import { BASE_URL } from "../config/config";

const LOGS_URL = `${BASE_URL}/superadmin/logs/`;

export interface Log {
  id: number;
  usuario_cedula: string;
  usuario_correo: string;
  tabla_afectada: string;
  accion: string;
  id_registro: number;
  datos_anteriores: any;
  datos_nuevos: any;
  fecha_hora: string;
  usuario: number | null;
}

const getAuthHeaders = () => {
  const token = localStorage.getItem("access");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

// Obtener todos los logs
export const getLogs = async () => {
  const res = await fetch(LOGS_URL, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Error al obtener los logs");
  return await res.json();
};
