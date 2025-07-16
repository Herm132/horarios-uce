import { useEffect, useState } from "react";
import {
  getAsignaturasPorUsuario,
  crearUsuarioAsignaturaEstudiante,
  eliminarUsuarioAsignaturaEstudiante,
} from "../../api/usuarioAsignaturaEstudiante";
import { getUsuarios } from "../../api/usuarios";
import { getAsignaturaCarrera } from "../../api/asignaturaCarrera";
import "../../styles/features/usuarioAsignaturaEstudiante.css";

// Interfaces
interface Carrera {
  id_carrera: number;
  nombre: string;
  codigo: string;
}

interface Usuario {
  id_usuario: number;
  nombres: string;
  apellidos: string;
  correo: string;
  rol: { id_rol: number; nombre_rol: string };
  carreras: Carrera[];
}

interface Asignatura {
  id_asignatura: number;
  nombre: string;
  codigo: string;
  es_comun: boolean;
}

interface AsignaturaCarrera {
  id: number;
  asignatura: Asignatura;
  carrera: Carrera;
}

interface AsignacionEstudiante {
  id: number;
  id_usuario: number;
  id_asignatura: number;
  paralelo: number;
  asignatura: Asignatura;
}

const UsuarioAsignaturaEstudiantePage = () => {
  const [estudiantes, setEstudiantes] = useState<Usuario[]>([]);
  const [asignaciones, setAsignaciones] = useState<AsignacionEstudiante[]>([]);
  const [relacionesAsignaturaCarrera, setRelacionesAsignaturaCarrera] =
    useState<AsignaturaCarrera[]>([]);

  const [idUsuario, setIdUsuario] = useState<number | null>(null);
  const [idAsignatura, setIdAsignatura] = useState<number | null>(null);
  const [paralelo, setParalelo] = useState<number>(1);
  const [inputEstudiante, setInputEstudiante] = useState("");

  const [usuarioSeleccionado, setUsuarioSeleccionado] =
    useState<Usuario | null>(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    const usuarios = await getUsuarios();
    const estudiantesFiltrados = usuarios.filter(
      (u: { rol: { nombre_rol: string } }) => u.rol?.nombre_rol === "Estudiante"
    );
    setEstudiantes(estudiantesFiltrados);

    const relaciones = await getAsignaturaCarrera();
    setRelacionesAsignaturaCarrera(relaciones);
  };

  const cargarAsignaciones = async (id_usuario: number) => {
    const res = await getAsignaturasPorUsuario(id_usuario);
    setAsignaciones(res);
  };

  const seleccionarEstudiante = async (usuario: Usuario) => {
    setIdUsuario(usuario.id_usuario);
    setUsuarioSeleccionado(usuario);
    setInputEstudiante("");
    await cargarAsignaciones(usuario.id_usuario);
  };

  const handleCrear = async () => {
    if (!idUsuario || !idAsignatura) return;
    await crearUsuarioAsignaturaEstudiante({
      id_usuario: idUsuario,
      id_asignatura: idAsignatura,
      paralelo,
    });
    setParalelo(1);
    setIdAsignatura(null);
    await cargarAsignaciones(idUsuario);
  };

  const handleEliminar = async (id: number) => {
    if (!confirm("¿Eliminar esta asignación?")) return;
    await eliminarUsuarioAsignaturaEstudiante(id);
    if (idUsuario) cargarAsignaciones(idUsuario);
  };

  const sugerencias = estudiantes.filter(
    (u) =>
      u.nombres.toLowerCase().includes(inputEstudiante.toLowerCase()) ||
      u.apellidos.toLowerCase().includes(inputEstudiante.toLowerCase()) ||
      u.correo.toLowerCase().includes(inputEstudiante.toLowerCase())
  );

  const asignaturasFiltradas = () => {
    if (!usuarioSeleccionado) return [];
    const idCarrerasEstudiante = usuarioSeleccionado.carreras.map(
      (c) => c.id_carrera
    );
    const asignaturas = relacionesAsignaturaCarrera
      .filter((rel) => idCarrerasEstudiante.includes(rel.carrera.id_carrera))
      .map((rel) => rel.asignatura);

    const asignaturasUnicas = new Map();
    for (const a of asignaturas) {
      asignaturasUnicas.set(a.id_asignatura, a);
    }
    return Array.from(asignaturasUnicas.values());
  };

  return (
    <div className="usuario-asignatura-estudiante-container">
      <h2>Gestión Estudiante ↔ Asignaturas</h2>

      {/* 🔍 Autocompletado de estudiante */}
      <div className="buscador-autocomplete">
        <input
          type="text"
          placeholder="🔍 Buscar estudiante por nombre o correo"
          value={inputEstudiante}
          onChange={(e) => setInputEstudiante(e.target.value)}
        />
        {inputEstudiante && (
          <ul className="sugerencias">
            {sugerencias.map((u) => (
              <li key={u.id_usuario} onClick={() => seleccionarEstudiante(u)}>
                {u.nombres} {u.apellidos} - {u.correo}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 👉 Formulario de asignación */}
      <div className="formulario">
        <select
          value={idAsignatura ?? ""}
          onChange={(e) => setIdAsignatura(Number(e.target.value))}
          disabled={!idUsuario}>
          <option value="">Selecciona una asignatura</option>
          {asignaturasFiltradas().map((a) => (
            <option key={a.id_asignatura} value={a.id_asignatura}>
              {a.nombre} ({a.codigo})
            </option>
          ))}
        </select>

        <input
          type="number"
          min={1}
          placeholder="Paralelo"
          value={paralelo}
          onChange={(e) => setParalelo(Number(e.target.value))}
        />

        <button onClick={handleCrear} disabled={!idUsuario || !idAsignatura}>
          Asignar
        </button>
      </div>

      {/* 📋 Resultado */}
      {usuarioSeleccionado && (
        <div className="resultado-usuario">
          <h3>
            Asignaturas de {usuarioSeleccionado.nombres}{" "}
            {usuarioSeleccionado.apellidos}
          </h3>
          <p>
            <strong>Correo:</strong> {usuarioSeleccionado.correo}
          </p>

          {/* 📌 Carreras del estudiante */}
          {usuarioSeleccionado.carreras?.length > 0 && (
            <div className="carreras-estudiante">
              <strong>Carreras:</strong>
              <ul>
                {usuarioSeleccionado.carreras.map((c) => (
                  <li key={c.id_carrera}>
                    {c.nombre} ({c.codigo})
                  </li>
                ))}
              </ul>
            </div>
          )}

          <ul>
            {asignaciones.map((a) => (
              <li key={a.id}>
                {a.asignatura.nombre} ({a.asignatura.codigo}) - Paralelo{" "}
                {a.paralelo}
                <button onClick={() => handleEliminar(a.id)}>❌</button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default UsuarioAsignaturaEstudiantePage;
