import { useEffect, useState } from "react";
import { getHorariosPorDocente } from "../../api/horario";
import { useAuth } from "../../auth/AuthContext";
import "../../styles/features/horarioDocenteEstudiante.css";
import { generarHorarioDocentePDF } from "../features/generarHorarioDocentePDF";

interface Horario {
  id_horario: number;
  asignatura: {
    nombre: string;
    codigo: string;
  };
  aula: {
    nombre: string;
  };
  hora_clase: {
    dia: string;
    hora_inicio: string;
    hora_fin: string;
  };
  paralelo: number;
  semestre_lectivo: string;
}

const diasSemana = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

const DocenteDashboard = () => {
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const { usuario } = useAuth(); // 👈 para obtener el ID del docente autenticado

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (usuario) {
          const data = await getHorariosPorDocente(usuario.id_usuario); // 👈 llamado con su ID
          setHorarios(data);
        }
      } catch (err) {
        console.error("Error al obtener horarios del docente", err);
      }
    };

    fetchData();
  }, [usuario]);

  const horasUnicas = Array.from(
    new Set(
      horarios.map(
        (h) => `${h.hora_clase.hora_inicio} - ${h.hora_clase.hora_fin}`
      )
    )
  ).sort();

  const obtenerHorario = (dia: string, hora: string) => {
    return horarios.find(
      (h) =>
        h.hora_clase.dia === dia &&
        `${h.hora_clase.hora_inicio} - ${h.hora_clase.hora_fin}` === hora
    );
  };

  return (
    <div className="horario-tabla-container">
      <h2>📘 Mi Horario como Docente</h2>
      <table className="tabla-horario">
        <thead>
          <tr>
            <th>Hora / Día</th>
            {diasSemana.map((dia) => (
              <th key={dia}>{dia}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {horasUnicas.map((hora) => (
            <tr key={hora}>
              <td className="columna-hora">{hora}</td>
              {diasSemana.map((dia) => {
                const h = obtenerHorario(dia, hora);
                return (
                  <td key={dia}>
                    {h ? (
                      <div className="celda-horario">
                        <strong>{h.asignatura.nombre}</strong>
                        <br />
                        <span>{h.asignatura.codigo}</span>
                        <br />
                        Aula: {h.aula.nombre}
                        <br />
                        Paralelo: {h.paralelo}
                      </div>
                    ) : (
                      "-"
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
        <button
          className="btn-descargar-horario"
          onClick={() =>
            generarHorarioDocentePDF(
              `${usuario?.nombres ?? ""} ${usuario?.apellidos ?? ""}`,
              horarios
            )
          }>
          📥 Descargar Horario
        </button>
      </table>
    </div>
  );
};

export default DocenteDashboard;
