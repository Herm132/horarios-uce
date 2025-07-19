import { BASE_URL } from "../config/config";

const SEMESTRE_URL = `${BASE_URL}/superadmin/semestre-lectivo/`;

const getAuthHeaders = () => {
  const token = localStorage.getItem("access");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

// Interfaces
export interface SemestreLectivo {
  id_semestre_lectivo: number;
  anio_inicio: number;
  anio_fin: number;
  periodo: string;
}

// 🔹 Obtener todos los semestres lectivos
export const getSemestresLectivos = async (): Promise<SemestreLectivo[]> => {
  const res = await fetch(SEMESTRE_URL, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error("Error al obtener los semestres lectivos");
  }

  return await res.json();
};
