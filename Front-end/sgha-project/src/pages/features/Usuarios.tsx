import { useEffect, useState } from "react";
import {
  getUsuarios,
  registrarUsuario,
  eliminarUsuario,
  actualizarUsuario,
} from "../../api/usuarios";
import { getCarreras } from "../../api/carreras";
import type { RegistroUsuarioInput, Usuario } from "../../api/usuarios";
import "../../styles/features/Usuarios.css";

interface Carrera {
  id_carrera: number;
  nombre: string;
  codigo: string;
}

const UsuariosPage = () => {
  const [modoEditar, setModoEditar] = useState(false);
  const [idEditando, setIdEditando] = useState<number | null>(null);
  const [errorForm, setErrorForm] = useState<string | null>(null);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [carreras, setCarreras] = useState<Carrera[]>([]);
  const [filtros, setFiltros] = useState({
    carrera: "",
    rol: "",
  });

  const [formData, setFormData] = useState<RegistroUsuarioInput>({
    nombres: "",
    apellidos: "",
    cedula: "",
    correo: "",
    password: "",
    id_rol: 1,
    carreras: [],
    modalidad_contratacion: "",
    tiempo_dedicacion: "",
  });

  const formatearErrores = (errorObj: any): string => {
    if (!errorObj || typeof errorObj !== "object") return "Error inesperado.";

    let mensajes: string[] = [];

    for (const clave in errorObj) {
      if (Array.isArray(errorObj[clave])) {
        mensajes.push(`${clave}: ${errorObj[clave].join(", ")}`);
      } else if (typeof errorObj[clave] === "string") {
        mensajes.push(`${clave}: ${errorObj[clave]}`);
      }
    }

    return mensajes.join("\n");
  };

  const cargarDatos = async () => {
    try {
      const [usuariosData, carrerasData] = await Promise.all([
        getUsuarios(),
        getCarreras(),
      ]);
      setUsuarios(usuariosData);
      setCarreras(carrerasData);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "id_rol" ? parseInt(value) : value,
    });
  };

  const handleEditar = (usuario: Usuario) => {
    setFormData({
      nombres: usuario.nombres,
      apellidos: usuario.apellidos,
      cedula: usuario.cedula,
      correo: usuario.correo,
      password: "", // no se puede editar directamente
      id_rol: usuario.rol.id_rol,
      carreras: usuario.carreras.map((c) => c.id_carrera),
      modalidad_contratacion: "",
      tiempo_dedicacion: "",
    });
    setModoEditar(true);
    setIdEditando(usuario.id_usuario);
    setErrorForm(null);
  };

  const handleEliminar = async (id: number) => {
    const confirm = window.confirm("¿Estás seguro de eliminar este usuario?");
    if (!confirm) return;

    try {
      await eliminarUsuario(id);
      alert("Usuario eliminado");
      cargarDatos();
    } catch (error: any) {
      alert(error?.detail || "Error al eliminar usuario");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorForm(null);

    try {
      if (modoEditar && idEditando) {
        await actualizarUsuario(idEditando, formData);
        alert("Usuario actualizado correctamente");
      } else {
        await registrarUsuario(formData);
        alert("Usuario creado correctamente");
      }

      setFormData({
        nombres: "",
        apellidos: "",
        cedula: "",
        correo: "",
        password: "",
        id_rol: 1,
        carreras: [],
        modalidad_contratacion: "",
        tiempo_dedicacion: "",
      });
      setModoEditar(false);
      setIdEditando(null);
      cargarDatos();
    } catch (error: any) {
      console.error("Error:", error);
      const mensaje = formatearErrores(error);
      setErrorForm(mensaje);
    }
  };

  const usuariosFiltrados = usuarios.filter((u) => {
    const carreraMatch =
      !filtros.carrera ||
      u.carreras.some((c) => c.id_carrera === parseInt(filtros.carrera));
    const rolMatch =
      !filtros.rol ||
      u.rol.nombre_rol.toLowerCase() === filtros.rol.toLowerCase();
    return carreraMatch && rolMatch;
  });

  return (
    <div className="usuarios-page">
      <h2>Registrar Usuario</h2>
      <form className="usuario-formulario" onSubmit={handleSubmit}>
        <input
          name="nombres"
          placeholder="Nombres"
          value={formData.nombres}
          onChange={handleChange}
          required
        />
        <input
          name="apellidos"
          placeholder="Apellidos"
          value={formData.apellidos}
          onChange={handleChange}
          required
        />
        <input
          name="cedula"
          placeholder="Cédula"
          value={formData.cedula}
          onChange={handleChange}
          required
        />
        <input
          name="correo"
          type="email"
          placeholder="Correo"
          value={formData.correo}
          onChange={handleChange}
          required
        />
        <input
          name="password"
          type="password"
          placeholder="Contraseña"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <label>Rol:</label>
        <select name="id_rol" value={formData.id_rol} onChange={handleChange}>
          <option value={1}>Estudiante</option>
          <option value={2}>Docente</option>
          <option value={3}>Administrador</option>
          <option value={4}>SuperAdmin</option>
        </select>

        {(formData.id_rol === 1 || formData.id_rol === 2) && (
          <>
            <label>Carreras:</label>
            <div className="chips-carreras">
              {carreras.map((c) => {
                const isSelected = formData.carreras.includes(c.id_carrera);
                return (
                  <div
                    key={c.id_carrera}
                    className={`chip-carrera ${isSelected ? "selected" : ""}`}
                    onClick={() => {
                      const actual = [...formData.carreras];
                      const updated = isSelected
                        ? actual.filter((id) => id !== c.id_carrera)
                        : [...actual, c.id_carrera];
                      setFormData({ ...formData, carreras: updated });
                    }}>
                    {c.nombre} ({c.codigo})
                    {isSelected && <span className="chip-close">×</span>}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {formData.id_rol === 2 && (
          <>
            <input
              name="modalidad_contratacion"
              placeholder="Modalidad de Contratación"
              value={formData.modalidad_contratacion}
              onChange={handleChange}
            />
            <input
              name="tiempo_dedicacion"
              placeholder="Tiempo de Dedicación"
              value={formData.tiempo_dedicacion}
              onChange={handleChange}
            />
          </>
        )}

        <button type="submit">Registrar</button>
      </form>
      {errorForm && <div className="error-message">{errorForm}</div>}
      <h2>Usuarios Registrados</h2>

      {/* 🎯 Filtros */}
      <div className="filtros-usuarios">
        <label>
          Filtrar por Carrera:
          <select
            value={filtros.carrera}
            onChange={(e) =>
              setFiltros({ ...filtros, carrera: e.target.value })
            }>
            <option value="">Todas</option>
            {carreras.map((c) => (
              <option key={c.id_carrera} value={c.id_carrera}>
                {c.nombre}
              </option>
            ))}
          </select>
        </label>

        <label>
          Filtrar por Rol:
          <select
            value={filtros.rol}
            onChange={(e) => setFiltros({ ...filtros, rol: e.target.value })}>
            <option value="">Todos</option>
            <option value="Estudiante">Estudiante</option>
            <option value="Docente">Docente</option>
            <option value="Admin">Administrador</option>
            <option value="SuperAdmin">SuperAdmin</option>
          </select>
        </label>
      </div>

      {/* Tabla */}
      <table className="tabla-usuarios">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre completo</th>
            <th>Correo</th>
            <th>Rol</th>
            <th>Carreras</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuariosFiltrados.map((u) => (
            <tr key={u.id_usuario}>
              <td>{u.id_usuario}</td>
              <td>
                {u.nombres} {u.apellidos}
              </td>
              <td>{u.correo}</td>
              <td>
                <span
                  className={`badge-rol ${
                    u.rol.nombre_rol === "Estudiante"
                      ? "badge-estudiante"
                      : u.rol.nombre_rol === "Docente"
                      ? "badge-docente"
                      : u.rol.nombre_rol === "Admin"
                      ? "badge-admin"
                      : "badge-superadmin"
                  }`}>
                  {u.rol.nombre_rol}
                </span>
              </td>
              <td>{u.carreras.map((c) => c.codigo).join(", ")}</td>
              <td>
                <button onClick={() => handleEditar(u)} className="btn-editar">
                  ✏️
                </button>
                <button
                  onClick={() => handleEliminar(u.id_usuario)}
                  className="btn-eliminar">
                  🗑️
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UsuariosPage;
