import { useEffect, useState } from "react";
import {
  getUsuariosConCarreras,
  crearUsuarioCarrera,
  eliminarUsuarioCarrera,
  getCarrerasPorUsuario,
  getUsuariosPorCarrera,
} from "../../api/usuarioCarrera";
import { getUsuarios } from "../../api/usuarios";
import { getCarreras } from "../../api/carreras";
import "../../styles/features/usuarioCarrera.css";

interface Usuario {
  id_usuario: number;
  nombres: string;
  apellidos: string;
  correo: string;
}

interface Carrera {
  id_carrera: number;
  nombre: string;
  codigo: string;
}

interface RelacionUsuarioCarrera {
  id: number;
  id_usuario: number;
  id_carrera: number;
  usuario: Usuario;
  carrera: Carrera;
}

const UsuarioCarreraPage = () => {
  const [relaciones, setRelaciones] = useState<RelacionUsuarioCarrera[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [carreras, setCarreras] = useState<Carrera[]>([]);

  const [idUsuario, setIdUsuario] = useState<number | null>(null);
  const [idCarrera, setIdCarrera] = useState<number | null>(null);

  const [usuarioBuscado, setUsuarioBuscado] = useState<Usuario | null>(null);
  const [carrerasUsuarioBuscado, setCarrerasUsuarioBuscado] = useState<
    (Carrera & { idRelacion: number })[]
  >([]);

  const [detalleCarrera, setDetalleCarrera] = useState<any>(null);
  const [inputUsuario, setInputUsuario] = useState("");

  useEffect(() => {
    cargarTodo();
  }, []);

  const cargarTodo = async () => {
    const [rel, us, car] = await Promise.all([
      getUsuariosConCarreras(),
      getUsuarios(),
      getCarreras(),
    ]);
    setRelaciones(rel);
    setUsuarios(us);
    setCarreras(car);
  };

  const handleCrear = async () => {
    if (!idUsuario || !idCarrera) return;
    try {
      await crearUsuarioCarrera({
        id_usuario: idUsuario,
        id_carrera: idCarrera,
      });
      setIdUsuario(null);
      setIdCarrera(null);
      setUsuarioBuscado(null); // limpiar búsqueda si estaba abierta
      cargarTodo();
    } catch (err) {
      console.error("Error al asignar carrera", err);
    }
  };

  const handleEliminar = async (idRelacion: number) => {
    if (!confirm("¿Eliminar esta relación?")) return;
    try {
      await eliminarUsuarioCarrera(idRelacion);
      cargarTodo();
      if (usuarioBuscado) buscarCarrerasPorUsuario(usuarioBuscado.id_usuario);
    } catch (err) {
      console.error("Error al eliminar", err);
    }
  };

  const buscarCarrerasPorUsuario = async (id: number) => {
    const res = await getCarrerasPorUsuario(id);
    setUsuarioBuscado(res.usuario);
    const carrerasConRelacion = relaciones
      .filter((rel) => rel.id_usuario === id)
      .map((rel) => ({
        ...rel.carrera,
        idRelacion: rel.id,
      }));
    setCarrerasUsuarioBuscado(carrerasConRelacion);
    setDetalleCarrera(null);
  };

  const buscarUsuariosPorCarrera = async (id: number) => {
    const res = await getUsuariosPorCarrera(id);
    setDetalleCarrera(res);
    setUsuarioBuscado(null);
  };

  const handleInputUsuario = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputUsuario(e.target.value);
  };

  const sugerenciasUsuarios = usuarios.filter(
    (u) =>
      u.nombres.toLowerCase().includes(inputUsuario.toLowerCase()) ||
      u.apellidos.toLowerCase().includes(inputUsuario.toLowerCase()) ||
      u.correo.toLowerCase().includes(inputUsuario.toLowerCase())
  );

  const agrupadas = relaciones.reduce((acc: Record<number, any>, rel) => {
    const { usuario, carrera, id } = rel;
    if (!acc[usuario.id_usuario]) {
      acc[usuario.id_usuario] = {
        usuario,
        carreras: [],
      };
    }
    acc[usuario.id_usuario].carreras.push({ ...carrera, idRelacion: id });
    return acc;
  }, {});

  return (
    <div className="usuario-carrera-container">
      <h2>Gestión de Usuarios ↔ Carreras</h2>

      {/* 👉 Asignación */}
      <div className="form-usuario-carrera">
        <select
          value={idUsuario ?? ""}
          onChange={(e) => setIdUsuario(Number(e.target.value))}>
          <option value="">Selecciona un usuario</option>
          {usuarios.map((u) => (
            <option key={u.id_usuario} value={u.id_usuario}>
              {u.nombres} {u.apellidos} - {u.correo}
            </option>
          ))}
        </select>

        <select
          value={idCarrera ?? ""}
          onChange={(e) => setIdCarrera(Number(e.target.value))}>
          <option value="">Selecciona una carrera</option>
          {carreras.map((c) => (
            <option key={c.id_carrera} value={c.id_carrera}>
              {c.nombre} ({c.codigo})
            </option>
          ))}
        </select>

        <button onClick={handleCrear} disabled={!idUsuario || !idCarrera}>
          Asignar
        </button>
      </div>

      {/* 🔍 Busquedas */}
      <div className="busquedas">
        <select
          onChange={(e) => buscarUsuariosPorCarrera(Number(e.target.value))}>
          <option value="">🔎 Usuarios por carrera</option>
          {carreras.map((c) => (
            <option key={c.id_carrera} value={c.id_carrera}>
              {c.nombre}
            </option>
          ))}
        </select>

        <div className="buscador-autocomplete">
          <input
            type="text"
            placeholder="🔍 Buscar usuario por nombre o correo"
            value={inputUsuario}
            onChange={handleInputUsuario}
          />
          {inputUsuario && (
            <ul className="sugerencias">
              {sugerenciasUsuarios.map((u) => (
                <li
                  key={u.id_usuario}
                  onClick={() => {
                    buscarCarrerasPorUsuario(u.id_usuario);
                    setInputUsuario("");
                  }}>
                  {u.nombres} {u.apellidos} - {u.correo}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* 📋 Tabla de relaciones generales */}
      {!usuarioBuscado && (
        <table className="tabla-usuarios-carreras">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Correo</th>
              <th>Carreras asignadas</th>
            </tr>
          </thead>
          <tbody>
            {Object.values(agrupadas).map((grupo: any) => (
              <tr key={grupo.usuario.id_usuario}>
                <td>
                  {grupo.usuario.nombres} {grupo.usuario.apellidos}
                </td>
                <td>{grupo.usuario.correo}</td>
                <td>
                  <ul>
                    {grupo.carreras.map((c: any) => (
                      <li key={c.id_carrera}>
                        {c.nombre} ({c.codigo})
                      </li>
                    ))}
                  </ul>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* 👤 Detalle de usuario */}
      {usuarioBuscado && (
        <div className="resultado-usuario">
          <h3>
            Asignaciones de: {usuarioBuscado.nombres} {usuarioBuscado.apellidos}
          </h3>
          <p>
            <strong>Correo:</strong> {usuarioBuscado.correo}
          </p>
          <ul>
            {carrerasUsuarioBuscado.map((c) => (
              <li key={c.id_carrera}>
                {c.nombre} ({c.codigo})
                <button onClick={() => handleEliminar(c.idRelacion)}>🗑️</button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 🏫 Detalle de carrera */}
      {detalleCarrera && (
        <div className="modal">
          <h3>Usuarios de la carrera: {detalleCarrera.carrera.nombre}</h3>
          <ul>
            {detalleCarrera.usuarios.map((u: Usuario) => (
              <li key={u.id_usuario}>
                {u.nombres} {u.apellidos} - {u.correo}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default UsuarioCarreraPage;
