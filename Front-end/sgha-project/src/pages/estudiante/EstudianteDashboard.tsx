import { useEffect, useState } from "react";
import { getHorariosPorEstudiante } from "../../api/horario";
import "../../styles/features/horarioDocenteEstudiante.css";
import { useAuth } from "../../auth/AuthContext";
import { generarHorarioEstudiantePDF } from "../features/generarHorarioEstudiantePDF";

interface Usuario {
  nombres: string;
  apellidos: string;
}

interface Asignatura {
  nombre: string;
  codigo: string;
}

interface Aula {
  nombre: string;
}

interface HoraClase {
  id_hora_clase: number;
  dia: string;
  hora_inicio: string;
  hora_fin: string;
}

interface Horario {
  id_horario: number;
  usuario: Usuario;
  asignatura: Asignatura;
  aula: Aula;
  hora_clase: HoraClase;
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

const EstudianteDashboard = () => {
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const { usuario } = useAuth();

  useEffect(() => {
    const cargar = async () => {
      if (usuario) {
        const res = await getHorariosPorEstudiante(usuario.id_usuario);
        setHorarios(res);
      }
    };
    cargar();
  }, [usuario]);

  const horasUnicas = Array.from(
    new Set(horarios.map((h) => h.hora_clase.id_hora_clase))
  )
    .map(
      (id) =>
        horarios.find((h) => h.hora_clase.id_hora_clase === id)?.hora_clase
    )
    .filter((h): h is HoraClase => h !== undefined)
    .sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio));

  const obtenerHorario = (dia: string, idHora: number) => {
    return horarios.find(
      (h) => h.hora_clase.dia === dia && h.hora_clase.id_hora_clase === idHora
    );
  };

  return (
    <div className="horario-tabla-container">
      <h2>📅 Mi Horario</h2>
      <table className="tabla-horario">
        <thead>
          <tr>
            <th>Hora</th>
            {diasSemana.map((dia) => (
              <th key={dia}>{dia}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {horasUnicas.map((hora) => (
            <tr key={hora.id_hora_clase}>
              <td className="columna-hora">
                {hora.hora_inicio} - {hora.hora_fin}
              </td>
              {diasSemana.map((dia) => {
                const h = obtenerHorario(dia, hora.id_hora_clase);
                return (
                  <td key={dia}>
                    {h && (
                      <div className="celda-horario">
                        <strong>{h.asignatura.nombre}</strong>
                        <span>Aula: {h.aula.nombre}</span>
                        <span>Paralelo: {h.paralelo}</span>
                      </div>
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
            generarHorarioEstudiantePDF(
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

export default EstudianteDashboard;
