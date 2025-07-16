import { useEffect, useState } from "react";
import {
  getAsignaturaCarrera,
  vincularAsignaturaCarreras,
  updateAsignaturaCarrera,
  deleteAsignaturaCarrera,
  //   getAsignaturasPorCarrera,
  //   getCarrerasPorAsignatura,
} from "../../api/asignaturaCarrera";
import { getAsignaturas } from "../../api/asignaturas";
import { getCarreras } from "../../api/carreras";
import "../../styles/features/asignaturaCarrera.css";

interface Asignatura {
  id_asignatura: number;
  nombre: string;
  codigo: string;
  es_comun: boolean;
}

interface Carrera {
  id_carrera: number;
  nombre: string;
  codigo: string;
}

interface Relacion {
  id: number;
  id_asignatura: number;
  id_carrera: number;
  asignatura: Asignatura;
  carrera: Carrera;
}

const AsignaturaCarreraPage = () => {
  const [asignaturaCarrera, setRelaciones] = useState<Relacion[]>([]);
  const [asignaturas, setAsignaturas] = useState<Asignatura[]>([]);
  const [carreras, setCarreras] = useState<Carrera[]>([]);

  const [selectedAsignatura, setSelectedAsignatura] = useState<number | null>(
    null
  );
  const [selectedCarreras, setSelectedCarreras] = useState<number[]>([]);
  const [editandoId, setEditandoId] = useState<number | null>(null);

  const [filtroAsignatura, setFiltroAsignatura] = useState("");
  const [filtroCarrera, setFiltroCarrera] = useState("");

  //   const [detalleCarrera, setDetalleCarrera] = useState<any>(null);
  //   const [detalleAsignatura, setDetalleAsignatura] = useState<any>(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [rel, asig, carr] = await Promise.all([
        getAsignaturaCarrera(),
        getAsignaturas(),
        getCarreras(),
      ]);
      setRelaciones(rel);
      setAsignaturas(asig);
      setCarreras(carr);
    } catch (error) {
      console.error("Error al cargar", error);
    }
  };

  const handleSubmit = async () => {
    if (!selectedAsignatura || selectedCarreras.length === 0) return;

    try {
      if (editandoId) {
        await updateAsignaturaCarrera(
          editandoId,
          selectedAsignatura,
          selectedCarreras
        );
      } else {
        await vincularAsignaturaCarreras(selectedAsignatura, selectedCarreras);
      }

      setSelectedAsignatura(null);
      setSelectedCarreras([]);
      setEditandoId(null);
      cargarDatos();
    } catch (err) {
      console.error("Error al guardar relación", err);
    }
  };

  //   const handleEditar = (rel: Relacion) => {
  //     setEditandoId(rel.id);
  //     setSelectedAsignatura(rel.id_asignatura);
  //     setSelectedCarreras([rel.id_carrera]);
  //   };

  const handleEliminar = async (id: number) => {
    if (!confirm("¿Eliminar esta relación?")) return;
    try {
      await deleteAsignaturaCarrera(id);
      cargarDatos();
    } catch (err) {
      console.error("Error al eliminar relación", err);
    }
  };

  const relacionesFiltradas = asignaturaCarrera.filter(
    (rel) =>
      rel.asignatura &&
      rel.carrera &&
      rel.asignatura.nombre
        .toLowerCase()
        .includes(filtroAsignatura.toLowerCase()) &&
      rel.carrera.nombre.toLowerCase().includes(filtroCarrera.toLowerCase())
  );

  //   const cargarAsignaturasPorCarrera = async (idCarrera: number) => {
  //     const res = await getAsignaturasPorCarrera(idCarrera);
  //     setDetalleCarrera(res);
  //     setDetalleAsignatura(null);
  //   };

  //   const cargarCarrerasPorAsignatura = async (idAsignatura: number) => {
  //     const res = await getCarrerasPorAsignatura(idAsignatura);
  //     setDetalleAsignatura(res);
  //     setDetalleCarrera(null);
  //   };

  return (
    <div className="asignatura-carrera-container">
      <h2>Gestión de Asignaturas ↔ Carreras</h2>

      <div className="filtros">
        <input
          type="text"
          placeholder="Buscar asignatura"
          value={filtroAsignatura}
          onChange={(e) => setFiltroAsignatura(e.target.value)}
        />
        <input
          type="text"
          placeholder="Buscar carrera"
          value={filtroCarrera}
          onChange={(e) => setFiltroCarrera(e.target.value)}
        />
      </div>

      <div className="form-vincular">
        <select
          value={selectedAsignatura ?? ""}
          onChange={(e) => setSelectedAsignatura(Number(e.target.value))}>
          <option value="">Selecciona una asignatura</option>
          {asignaturas.map((a) => (
            <option key={a.id_asignatura} value={a.id_asignatura}>
              {a.nombre} ({a.codigo})
            </option>
          ))}
        </select>

        <div className="checkbox-grid">
          {carreras.map((c) => (
            <label key={c.id_carrera}>
              <input
                type="checkbox"
                checked={selectedCarreras.includes(c.id_carrera)}
                onChange={() =>
                  setSelectedCarreras((prev) =>
                    prev.includes(c.id_carrera)
                      ? prev.filter((id) => id !== c.id_carrera)
                      : [...prev, c.id_carrera]
                  )
                }
              />
              {c.nombre}
            </label>
          ))}
        </div>

        <button onClick={handleSubmit}>
          {editandoId ? "Actualizar" : "Vincular"}
        </button>
      </div>

      <table className="tabla-relaciones">
        <thead>
          <tr>
            <th>Asignatura</th>
            <th>Carrera</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {relacionesFiltradas.map((rel, i) => (
            <tr key={i}>
              <td>
                {rel.asignatura.nombre} ({rel.asignatura.codigo})
              </td>
              <td>{rel.carrera.nombre}</td>
              <td>
                {/* <button onClick={() => handleEditar(rel)}>Editar</button> */}
                <button onClick={() => handleEliminar(rel.id)}>Eliminar</button>
                {/* <button
                  onClick={() => cargarAsignaturasPorCarrera(rel.id_carrera)}>
                  🔍 Ver asignaturas
                </button>
                <button
                  onClick={() =>
                    cargarCarrerasPorAsignatura(rel.id_asignatura)
                  }>
                  🔍 Ver carreras
                </button> */}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* {detalleCarrera && (
        <div className="detalle">
          <h3>Asignaturas de {detalleCarrera.carrera.nombre}</h3>
          <ul>
            {detalleCarrera.asignaturas.map((a: Asignatura) => (
              <li key={a.id_asignatura}>
                {a.nombre} ({a.codigo}) {a.es_comun && <em>[común]</em>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {detalleAsignatura && (
        <div className="detalle">
          <h3>Carreras de {detalleAsignatura.asignatura.nombre}</h3>
          <ul>
            {detalleAsignatura.carreras.map((c: Carrera) => (
              <li key={c.id_carrera}>
                {c.nombre} ({c.codigo})
              </li>
            ))}
          </ul>
        </div>
      )} */}
    </div>
  );
};

export default AsignaturaCarreraPage;
