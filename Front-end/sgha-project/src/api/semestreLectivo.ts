import { BASE_URL } from "../config/config";

const SEMESTRE_URL = `${BASE_URL}/superadmin/semestre-lectivo/`;

const getAuthHeaders = () => {
  const token = localStorage.getItem("access");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

export interface SemestreLectivo {
  id_semestre_lectivo: number;
  anio_inicio: number;
  anio_fin: number;
  periodo: string;
}

// GET
export const getSemestresLectivos = async (): Promise<SemestreLectivo[]> => {
  const res = await fetch(SEMESTRE_URL, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Error al obtener los semestres lectivos");
  return await res.json();
};

// POST
export const crearSemestreLectivo = async (
  data: Omit<SemestreLectivo, "id_semestre_lectivo">
): Promise<SemestreLectivo> => {
  const res = await fetch(SEMESTRE_URL, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al crear semestre lectivo");
  return await res.json();
};

// PUT
export const actualizarSemestreLectivo = async (
  id: number,
  data: Omit<SemestreLectivo, "id_semestre_lectivo">
): Promise<SemestreLectivo> => {
  const res = await fetch(`${SEMESTRE_URL}${id}/`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al actualizar semestre lectivo");
  return await res.json();
};

// DELETE
export const eliminarSemestreLectivo = async (id: number): Promise<void> => {
  const res = await fetch(`${SEMESTRE_URL}${id}/`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Error al eliminar semestre lectivo");
};
