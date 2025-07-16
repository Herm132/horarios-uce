import { useEffect, useState } from "react";
import {
  getUsuariosAsignaturas,
  crearUsuarioAsignatura,
  eliminarUsuarioAsignatura,
  getAsignaturasPorUsuario,
} from "../../api/usuarioAsignatura";
import { getUsuarios } from "../../api/usuarios";
import { getAsignaturas } from "../../api/asignaturas";
import "../../styles/features/usuarioAsignatura.css";

// Interfaces
interface Usuario {
  id_usuario: number;
  nombres: string;
  apellidos: string;
  correo: string;
}

interface Asignatura {
  id_asignatura: number;
  nombre: string;
  codigo: string;
  es_comun?: boolean;
}

interface RelacionUsuarioAsignatura {
  id: number;
  id_usuario: number;
  id_asignatura: number;
  paralelo: number;
  usuario: Usuario;
  asignatura: Asignatura;
}

// interface ResAsignaturasPorUsuario {
//   usuario: Usuario;
//   asignaturas: RelacionUsuarioAsignatura[];
// }

const UsuarioAsignaturaPage = () => {
  const [relaciones, setRelaciones] = useState<RelacionUsuarioAsignatura[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [asignaturas, setAsignaturas] = useState<Asignatura[]>([]);

  const [idUsuario, setIdUsuario] = useState<number | null>(null);
  const [idAsignatura, setIdAsignatura] = useState<number | null>(null);
  const [paralelo, setParalelo] = useState<number>(1);

  const [inputUsuario, setInputUsuario] = useState("");
  const [usuarioBuscado, setUsuarioBuscado] = useState<Usuario | null>(null);
  const [asignaturasUsuarioBuscado, setAsignaturasUsuarioBuscado] = useState<
    RelacionUsuarioAsignatura[]
  >([]);

  useEffect(() => {
    cargarTodo();
  }, []);

  const cargarTodo = async () => {
    const [rel, us, asig] = await Promise.all([
      getUsuariosAsignaturas(),
      getUsuarios(),
      getAsignaturas(),
    ]);
    setRelaciones(rel);
    setUsuarios(us);
    setAsignaturas(asig);
  };

  const handleCrear = async () => {
    if (!idUsuario || !idAsignatura) return;
    try {
      await crearUsuarioAsignatura({
        id_usuario: idUsuario,
        id_asignatura: idAsignatura,
        paralelo,
      });
      setIdUsuario(null);
      setIdAsignatura(null);
      setParalelo(1);
      setUsuarioBuscado(null);
      cargarTodo();
    } catch (err) {
      console.error("Error al asignar", err);
    }
  };

  const handleEliminar = async (idRelacion: number) => {
    if (!confirm("¿Eliminar esta asignación?")) return;
    try {
      await eliminarUsuarioAsignatura(idRelacion);
      cargarTodo();
      if (usuarioBuscado) {
        buscarAsignaturasPorUsuario(usuarioBuscado.id_usuario);
      }
    } catch (err) {
      console.error("Error al eliminar", err);
    }
  };

  const buscarAsignaturasPorUsuario = async (id: number) => {
    const res: RelacionUsuarioAsignatura[] = await getAsignaturasPorUsuario(id);

    if (res.length > 0) {
      setUsuarioBuscado(res[0].usuario); // ✔️ el usuario está dentro de cada relación
      setAsignaturasUsuarioBuscado(res); // ✔️ ya es un array de relaciones
    } else {
      setUsuarioBuscado(null);
      setAsignaturasUsuarioBuscado([]);
    }
  };

  const sugerenciasUsuarios = usuarios.filter(
    (u) =>
      u.nombres.toLowerCase().includes(inputUsuario.toLowerCase()) ||
      u.apellidos.toLowerCase().includes(inputUsuario.toLowerCase()) ||
      u.correo.toLowerCase().includes(inputUsuario.toLowerCase())
  );

  return (
    <div className="usuario-asignatura-container">
      <h2>Gestión de Docentes ↔ Asignaturas</h2>

      {/* 👉 Formulario de asignación */}
      <div className="form-usuario-asignatura">
        <select
          value={idUsuario ?? ""}
          onChange={(e) => setIdUsuario(Number(e.target.value))}>
          <option value="">Selecciona un docente</option>
          {usuarios.map((u) => (
            <option key={u.id_usuario} value={u.id_usuario}>
              {u.nombres} {u.apellidos} - {u.correo}
            </option>
          ))}
        </select>

        <select
          value={idAsignatura ?? ""}
          onChange={(e) => setIdAsignatura(Number(e.target.value))}>
          <option value="">Selecciona una asignatura</option>
          {asignaturas.map((a) => (
            <option key={a.id_asignatura} value={a.id_asignatura}>
              {a.nombre} ({a.codigo})
            </option>
          ))}
        </select>
        <h3>Paralelo</h3>
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

      {/* 🔍 Autocompletado */}
      <div className="buscador-autocomplete">
        <input
          type="text"
          placeholder="🔍 Buscar docente por nombre o correo"
          value={inputUsuario}
          onChange={(e) => setInputUsuario(e.target.value)}
        />
        {inputUsuario && (
          <ul className="sugerencias">
            {sugerenciasUsuarios.map((u) => (
              <li
                key={u.id_usuario}
                onClick={() => {
                  buscarAsignaturasPorUsuario(u.id_usuario);
                  setInputUsuario("");
                }}>
                {u.nombres} {u.apellidos} - {u.correo}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 📋 Tabla de relaciones generales */}
      {!usuarioBuscado && relaciones.length > 0 && (
        <table className="tabla-usuario-asignatura">
          <thead>
            <tr>
              <th>Docente</th>
              <th>Correo</th>
              <th>Asignatura</th>
              <th>Paralelo</th>
            </tr>
          </thead>
          <tbody>
            {relaciones.map((rel) => (
              <tr key={rel.id}>
                <td>
                  {rel.usuario.nombres} {rel.usuario.apellidos}
                </td>
                <td>{rel.usuario.correo}</td>
                <td>
                  {rel.asignatura.nombre} ({rel.asignatura.codigo})
                </td>
                <td>{rel.paralelo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* 📋 Resultado de búsqueda */}
      {usuarioBuscado && (
        <div className="resultado-usuario">
          <h3>
            Asignaturas de: {usuarioBuscado.nombres} {usuarioBuscado.apellidos}
          </h3>
          <p>
            <strong>Correo:</strong> {usuarioBuscado.correo}
          </p>
          <ul>
            {asignaturasUsuarioBuscado.map((a) => (
              <li key={a.id}>
                {a.asignatura
                  ? `${a.asignatura.nombre} (${a.asignatura.codigo}) - Paralelo ${a.paralelo}`
                  : "Asignatura no disponible"}
                <button onClick={() => handleEliminar(a.id)}>🗑️</button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default UsuarioAsignaturaPage;
