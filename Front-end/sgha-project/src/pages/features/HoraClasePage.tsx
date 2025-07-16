import { useEffect, useState } from "react";
import {
  getHorasClase,
  crearHoraClase,
  actualizarHoraClase,
  eliminarHoraClase,
} from "../../api/horaClase";
import "../../styles/features/horaClase.css";

interface HoraClase {
  id_hora_clase: number;
  dia: string;
  hora_inicio: string;
  hora_fin: string;
}

const diasSemana = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

const HoraClasePage = () => {
  const [horasClase, setHorasClase] = useState<HoraClase[]>([]);
  const [dia, setDia] = useState("");
  const [horaInicio, setHoraInicio] = useState("");
  const [horaFin, setHoraFin] = useState("");
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [filtroDia, setFiltroDia] = useState("");

  useEffect(() => {
    cargarHorasClase();
  }, []);

  const cargarHorasClase = async () => {
    try {
      const data = await getHorasClase();
      setHorasClase(data);
    } catch (error) {
      console.error("Error al cargar horas de clase", error);
    }
  };

  const handleSubmit = async () => {
    if (!dia || !horaInicio || !horaFin) return;

    const payload = { dia, hora_inicio: horaInicio, hora_fin: horaFin };

    try {
      if (editandoId) {
        await actualizarHoraClase(editandoId, payload);
      } else {
        await crearHoraClase(payload);
      }
      setDia("");
      setHoraInicio("");
      setHoraFin("");
      setEditandoId(null);
      cargarHorasClase();
    } catch (err) {
      console.error("Error al guardar", err);
    }
  };

  const handleEditar = (h: HoraClase) => {
    setEditandoId(h.id_hora_clase);
    setDia(h.dia);
    setHoraInicio(h.hora_inicio);
    setHoraFin(h.hora_fin);
  };

  const handleEliminar = async (id: number) => {
    if (!confirm("¿Eliminar esta hora de clase?")) return;
    try {
      await eliminarHoraClase(id);
      cargarHorasClase();
    } catch (err) {
      console.error("Error al eliminar", err);
    }
  };

  // Agrupar por día
  const horariosPorDia: Record<string, HoraClase[]> = {};
  diasSemana.forEach((d) => {
    horariosPorDia[d] = horasClase
      .filter(
        (h) =>
          h.dia.toLowerCase().includes(filtroDia.toLowerCase()) && h.dia === d
      )
      .sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio));
  });

  return (
    <div className="hora-clase-container">
      <h2>Gestión de Horas de Clase</h2>

      <div className="filtros">
        <input
          type="text"
          placeholder="Filtrar por día"
          value={filtroDia}
          onChange={(e) => setFiltroDia(e.target.value)}
        />
      </div>

      <div className="form-hora">
        <select value={dia} onChange={(e) => setDia(e.target.value)}>
          <option value="">Selecciona un día</option>
          {diasSemana.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>

        <input
          type="time"
          value={horaInicio}
          onChange={(e) => setHoraInicio(e.target.value)}
        />
        <input
          type="time"
          value={horaFin}
          onChange={(e) => setHoraFin(e.target.value)}
        />

        <button onClick={handleSubmit}>
          {editandoId ? "Actualizar" : "Registrar"}
        </button>
      </div>

      <div className="horario-grid">
        {diasSemana.map((d) => (
          <div key={d} className="horario-dia">
            <h3>{d}</h3>
            {horariosPorDia[d].length === 0 ? (
              <p className="sin-horario">Sin horarios</p>
            ) : (
              horariosPorDia[d].map((h) => (
                <div key={h.id_hora_clase} className="horario-card">
                  <span>
                    {h.hora_inicio} - {h.hora_fin}
                  </span>
                  <div className="acciones">
                    <button onClick={() => handleEditar(h)}>Editar</button>
                    <button onClick={() => handleEliminar(h.id_hora_clase)}>
                      Eliminar
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default HoraClasePage;
