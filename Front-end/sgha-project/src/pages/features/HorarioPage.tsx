import { useEffect, useState } from "react";
import {
  getHorarios,
  crearHorario,
  eliminarHorario,
  actualizarHorario,
  getHorariosPorDocente,
} from "../../api/horario";
import { getUsuarios } from "../../api/usuarios";
import { getAsignaturas } from "../../api/asignaturas";
import { getAulas } from "../../api/aulas";
import { getHorasClase } from "../../api/horaClase";
import "../../styles/features/horario.css";

interface Usuario {
  id_usuario: number;
  nombres: string;
  apellidos: string;
  correo: string;
  rol: {
    id_rol: number;
    nombre_rol: string;
  };
}

interface Asignatura {
  id_asignatura: number;
  nombre: string;
  codigo: string;
}

interface Aula {
  id_aula: number;
  nombre: string;
  edificio: string;
  piso: number;
}

interface HoraClase {
  id_hora_clase: number;
  dia: string;
  hora_inicio: string;
  hora_fin: string;
}

interface Horario {
  id_horario: number;
  asignatura: Asignatura;
  aula: Aula;
  hora_clase: HoraClase;
  usuario: Usuario;
  paralelo: number;
  semestre_lectivo: string;
}

const HorarioPage = () => {
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [asignaturas, setAsignaturas] = useState<Asignatura[]>([]);
  const [aulas, setAulas] = useState<Aula[]>([]);
  const [horasClase, setHorasClase] = useState<HoraClase[]>([]);

  const [modoEditar, setModoEditar] = useState(false);
  const [idHorarioEditando, setIdHorarioEditando] = useState<number | null>(
    null
  );

  const [formData, setFormData] = useState({
    id_asignatura: "",
    id_aula: "",
    id_hora_clase: "",
    id_usuario: "",
    paralelo: 1,
    semestre_lectivo: "2025-A",
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    const [h, u, a, au, hc] = await Promise.all([
      getHorarios(),
      getUsuarios(),
      getAsignaturas(),
      getAulas(),
      getHorasClase(),
    ]);

    // ✅ Filtrar solo docentes (id_rol === 2)
    const soloDocentes = u.filter((user: Usuario) => user.rol?.id_rol === 2);

    setHorarios(h);
    setUsuarios(soloDocentes);
    setAsignaturas(a);
    setAulas(au);
    setHorasClase(hc);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      id_asignatura: "",
      id_aula: "",
      id_hora_clase: "",
      id_usuario: "",
      paralelo: 1,
      semestre_lectivo: "2025-A",
    });
    setModoEditar(false);
    setIdHorarioEditando(null);
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        ...formData,
        id_asignatura: Number(formData.id_asignatura),
        id_aula: Number(formData.id_aula),
        id_hora_clase: Number(formData.id_hora_clase),
        id_usuario: Number(formData.id_usuario),
        paralelo: Number(formData.paralelo),
      };

      if (modoEditar && idHorarioEditando) {
        await actualizarHorario(idHorarioEditando, payload);
      } else {
        await crearHorario(payload);
      }

      resetForm();
      await cargarDatos();
    } catch (error) {
      console.error("Error al guardar el horario", error);
    }
  };

  const handleEliminar = async (id: number) => {
    if (!confirm("¿Eliminar este horario?")) return;
    try {
      await eliminarHorario(id);
      cargarDatos();
    } catch (err) {
      console.error("Error al eliminar horario", err);
    }
  };

  const handleEditar = (horario: Horario) => {
    setFormData({
      id_asignatura: String(horario.asignatura.id_asignatura),
      id_aula: String(horario.aula.id_aula),
      id_hora_clase: String(horario.hora_clase.id_hora_clase),
      id_usuario: String(horario.usuario.id_usuario),
      paralelo: horario.paralelo,
      semestre_lectivo: horario.semestre_lectivo,
    });
    setModoEditar(true);
    setIdHorarioEditando(horario.id_horario);
  };

  const buscarPorDocente = async () => {
    if (!formData.id_usuario) return;
    try {
      const horariosDocente = await getHorariosPorDocente(
        Number(formData.id_usuario)
      );
      setHorarios(horariosDocente);
    } catch (error) {
      console.error("Error al buscar horarios por docente", error);
    }
  };

  return (
    <div className="horario-container">
      <h2>{modoEditar ? "Editar Horario" : "Crear Horario"}</h2>
      <div className="formulario-horario">
        <select
          name="id_usuario"
          value={formData.id_usuario}
          onChange={handleChange}>
          <option value="">Selecciona un docente</option>
          {usuarios.map((u) => (
            <option key={u.id_usuario} value={u.id_usuario}>
              {u.nombres} {u.apellidos}
            </option>
          ))}
        </select>
        <button onClick={buscarPorDocente} className="buscar-docente">
          Buscar horarios del docente
        </button>

        <select
          name="id_asignatura"
          value={formData.id_asignatura}
          onChange={handleChange}>
          <option value="">Selecciona una asignatura</option>
          {asignaturas.map((a) => (
            <option key={a.id_asignatura} value={a.id_asignatura}>
              {a.nombre} ({a.codigo})
            </option>
          ))}
        </select>

        <select name="id_aula" value={formData.id_aula} onChange={handleChange}>
          <option value="">Selecciona un aula</option>
          {aulas.map((a) => (
            <option key={a.id_aula} value={a.id_aula}>
              {a.nombre} - {a.edificio} piso {a.piso}
            </option>
          ))}
        </select>

        <select
          name="id_hora_clase"
          value={formData.id_hora_clase}
          onChange={handleChange}>
          <option value="">Selecciona una hora</option>
          {horasClase.map((h) => (
            <option key={h.id_hora_clase} value={h.id_hora_clase}>
              {h.dia} {h.hora_inicio} - {h.hora_fin}
            </option>
          ))}
        </select>

        <input
          type="number"
          name="paralelo"
          placeholder="Paralelo"
          value={formData.paralelo}
          onChange={handleChange}
        />

        <input
          type="text"
          name="semestre_lectivo"
          placeholder="Semestre lectivo"
          value={formData.semestre_lectivo}
          onChange={handleChange}
        />

        <button onClick={handleSubmit}>
          {modoEditar ? "Actualizar" : "Crear"}
        </button>
        {modoEditar && (
          <button onClick={resetForm} className="cancelar">
            Cancelar
          </button>
        )}
      </div>

      <h3>Horarios existentes</h3>
      <ul className="lista-horarios">
        {horarios.map((h) => (
          <li key={h.id_horario}>
            <strong>{h.asignatura.nombre}</strong> ({h.asignatura.codigo}) -{" "}
            {h.usuario.nombres} {h.usuario.apellidos} - Aula: {h.aula.nombre} -{" "}
            {h.hora_clase.dia} {h.hora_clase.hora_inicio} -{" "}
            {h.hora_clase.hora_fin} - Paralelo {h.paralelo} (
            {h.semestre_lectivo})
            <button onClick={() => handleEditar(h)}>✏️</button>
            <button onClick={() => handleEliminar(h.id_horario)}>❌</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default HorarioPage;
