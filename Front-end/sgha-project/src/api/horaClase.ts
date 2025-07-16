import { BASE_URL } from "../config/config";

const HORA_CLASE_URL = `${BASE_URL}/superadmin/hora-clase/`;

const headers = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("access")}`,
});

export const getHorasClase = async () => {
  const res = await fetch(HORA_CLASE_URL, { headers: headers() });
  if (!res.ok) throw new Error("Error al obtener horas de clase");
  return res.json();
};

export const crearHoraClase = async (data: {
  dia: string;
  hora_inicio: string;
  hora_fin: string;
}) => {
  const res = await fetch(HORA_CLASE_URL, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al crear hora de clase");
  return res.json();
};

export const actualizarHoraClase = async (
  id: number,
  data: { dia: string; hora_inicio: string; hora_fin: string }
) => {
  const res = await fetch(`${URL}${id}/`, {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al actualizar hora de clase");
  return res.json();
};

export const eliminarHoraClase = async (id: number) => {
  const res = await fetch(`${URL}${id}/`, {
    method: "DELETE",
    headers: headers(),
  });
  if (!res.ok) throw new Error("Error al eliminar hora de clase");
  return true;
};
