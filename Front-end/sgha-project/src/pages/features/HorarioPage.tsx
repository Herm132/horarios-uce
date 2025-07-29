import { useEffect, useState } from "react";
import Modal from "./Modal";
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
import { getSemestresLectivos } from "../../api/semestreLectivo";
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

interface SemestreLectivo {
  id_semestre_lectivo: number;
  anio_inicio: number;
  anio_fin: number;
  periodo: string;
}

interface Asignatura {
  id_asignatura: number;
  nombre: string;
  codigo: string;
  semestre: number;
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
  semestre_lectivo: SemestreLectivo;
}

const HorarioPage = () => {
  const [semestreSeleccionado, setSemestreSeleccionado] = useState("");
  const [consultarActivado, setConsultarActivado] = useState(false);
  const [semestresDisponibles, setSemestresDisponibles] = useState<number[]>(
    []
  );
  const [anioLectivoConsulta, setAnioLectivoConsulta] = useState("");

  const [dragHorarioId, setDragHorarioId] = useState<string | null>(null);

  const [mostrarModal, setMostrarModal] = useState(false);
  const [horariosDocente, setHorariosDocente] = useState<Horario[]>([]);

  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [asignaturas, setAsignaturas] = useState<Asignatura[]>([]);
  const [aulas, setAulas] = useState<Aula[]>([]);
  const [horasClase, setHorasClase] = useState<HoraClase[]>([]);
  const [semestresLectivos, setSemestresLectivos] = useState<SemestreLectivo[]>(
    []
  );

  const [modoEditar, setModoEditar] = useState(false);
  const [idHorarioEditando, setIdHorarioEditando] = useState<number | null>(
    null
  );

  const [formData, setFormData] = useState({
    id_asignatura: "",
    id_aula: "",
    id_hora_clase: "",
    id_usuario: "",
    paralelo: "",
    id_semestre_lectivo: "",
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    const [h, u, a, au, hc, sl] = await Promise.all([
      getHorarios(),
      getUsuarios(),
      getAsignaturas(),
      getAulas(),
      getHorasClase(),
      getSemestresLectivos(),
    ]);

    const asignaturasTyped = a as Asignatura[];
    const semestresUnicos: number[] = Array.from(
      new Set(asignaturasTyped.map((asig) => asig.semestre))
    ).sort((a, b) => a - b);

    const soloDocentes = u.filter((user: Usuario) => user.rol?.id_rol === 2);

    setHorarios(h);
    setUsuarios(soloDocentes);
    setAsignaturas(a);
    setSemestresDisponibles(semestresUnicos);
    setAulas(au);
    setHorasClase(hc);
    setSemestresLectivos(sl);
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
      paralelo: "",
      id_semestre_lectivo: "",
    });
    setModoEditar(false);
    setIdHorarioEditando(null);
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        id_asignatura: Number(formData.id_asignatura),
        id_aula: Number(formData.id_aula),
        id_hora_clase: Number(formData.id_hora_clase),
        id_usuario: Number(formData.id_usuario),
        paralelo: Number(formData.paralelo),
        id_semestre_lectivo: Number(formData.id_semestre_lectivo),
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
      paralelo: String(horario.paralelo),
      id_semestre_lectivo: String(horario.semestre_lectivo.id_semestre_lectivo),
    });
    setModoEditar(true);
    setIdHorarioEditando(horario.id_horario);
  };

  const buscarPorDocente = async () => {
    if (!formData.id_usuario) return;
    try {
      const response = await getHorariosPorDocente(Number(formData.id_usuario));
      setHorariosDocente(response);
      setMostrarModal(true);
    } catch (error) {
      console.error("Error al buscar horarios por docente", error);
    }
  };

  const horariosFiltrados = consultarActivado
    ? horarios.filter(
        (h) =>
          h.semestre_lectivo.id_semestre_lectivo ===
            Number(anioLectivoConsulta) &&
          h.asignatura.semestre === Number(semestreSeleccionado)
      )
    : [];

  // 🧲 DRAG & DROP
  useEffect(() => {
    const cells = document.querySelectorAll(".class-info");
    cells.forEach((cell) => {
      cell.setAttribute("draggable", "true");
      cell.addEventListener("dragstart", (e) =>
        handleDragStart(e as DragEvent)
      );
    });
  }, [horarios]);

  const handleDragStart = (e: DragEvent) => {
    const target = e.target as HTMLElement;
    const idHorario = target.dataset.idhorario;
    e.dataTransfer?.setData("text/plain", idHorario || "");
  };

  return (
    <div className="horario-container">
      <div className="header-section">
        {/* <h1 className="main-title">
          <span className="title-icon">📅</span>
          {modoEditar ? "Editar Horario" : "Gestión de Horarios"}
        </h1> */}
        <p className="subtitle">
          Administra los horarios académicos de forma sencilla
        </p>
      </div>

      {/* Formulario principal */}
      <div className="card form-card">
        <div className="card-header">
          <h2 className="card-title">
            <span className="card-icon">{modoEditar ? "✏️" : "➕"}</span>
            {modoEditar ? "Editar Horario" : "Crear Nuevo Horario"}
          </h2>
        </div>

        <div className="card-content">
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">
                <span className="label-icon">👨‍🏫</span>
                Docente
              </label>
              <select
                name="id_usuario"
                value={formData.id_usuario}
                onChange={handleChange}
                className="form-select">
                <option value="">Selecciona un docente</option>
                {usuarios.map((u) => (
                  <option key={u.id_usuario} value={u.id_usuario}>
                    {u.nombres} {u.apellidos}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <button
                onClick={buscarPorDocente}
                className="btn btn-secondary full-width">
                <span className="btn-icon">🔍</span>
                Buscar horarios del docente
              </button>
            </div>

            <div className="form-group">
              <label className="form-label">
                <span className="label-icon">📚</span>
                Asignatura
              </label>
              <select
                name="id_asignatura"
                value={formData.id_asignatura}
                onChange={handleChange}
                className="form-select">
                <option value="">Selecciona una asignatura</option>
                {asignaturas.map((a) => (
                  <option key={a.id_asignatura} value={a.id_asignatura}>
                    {a.nombre} ({a.codigo})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                <span className="label-icon">🏢</span>
                Aula
              </label>
              <select
                name="id_aula"
                value={formData.id_aula}
                onChange={handleChange}
                className="form-select">
                <option value="">Selecciona un aula</option>
                {aulas.map((a) => (
                  <option key={a.id_aula} value={a.id_aula}>
                    {a.nombre} - {a.edificio} piso {a.piso}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                <span className="label-icon">🕐</span>
                Horario
              </label>
              <select
                name="id_hora_clase"
                value={formData.id_hora_clase}
                onChange={handleChange}
                className="form-select">
                <option value="">Selecciona una hora</option>
                {horasClase.map((h) => (
                  <option key={h.id_hora_clase} value={h.id_hora_clase}>
                    {h.dia} {h.hora_inicio} - {h.hora_fin}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                <span className="label-icon">🎯</span>
                Paralelo
              </label>
              <input
                type="number"
                name="paralelo"
                placeholder="Ej: 1, 2, 3..."
                value={formData.paralelo}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <span className="label-icon">📆</span>
                Semestre Lectivo
              </label>
              <select
                name="id_semestre_lectivo"
                value={formData.id_semestre_lectivo}
                onChange={handleChange}
                className="form-select">
                <option value="">Selecciona un semestre lectivo</option>
                {semestresLectivos.map((s) => (
                  <option
                    key={s.id_semestre_lectivo}
                    value={s.id_semestre_lectivo}>
                    {s.anio_inicio}-{s.anio_fin} ({s.periodo})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button onClick={handleSubmit} className="btn btn-primary">
              <span className="btn-icon">{modoEditar ? "💾" : "➕"}</span>
              {modoEditar ? "Actualizar Horario" : "Crear Horario"}
            </button>
            {modoEditar && (
              <button onClick={resetForm} className="btn btn-outline">
                <span className="btn-icon">❌</span>
                Cancelar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Sección de consulta */}
      <div className="card query-card">
        <div className="card-header">
          <h2 className="card-title">
            <span className="card-icon">🔍</span>
            Consulta de Horarios
          </h2>
        </div>

        <div className="card-content">
          <div className="query-filters">
            <div className="filter-group">
              <label className="form-label">
                <span className="label-icon">📅</span>
                Año Lectivo
              </label>
              <select
                value={anioLectivoConsulta}
                onChange={(e) => setAnioLectivoConsulta(e.target.value)}
                className="form-select">
                <option value="">Selecciona un año lectivo</option>
                {semestresLectivos.map((s) => (
                  <option
                    key={s.id_semestre_lectivo}
                    value={s.id_semestre_lectivo}>
                    {s.anio_inicio}-{s.anio_fin} ({s.periodo})
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label className="form-label">
                <span className="label-icon">🎓</span>
                Semestres
              </label>
              <div className="semester-buttons">
                {semestresDisponibles.map((sem) => (
                  <button
                    key={sem}
                    onClick={() => {
                      setSemestreSeleccionado(sem.toString());
                      setConsultarActivado(true);
                    }}
                    className={`semester-btn ${
                      semestreSeleccionado === sem.toString() ? "active" : ""
                    }`}>
                    <span className="semester-number">{sem}</span>
                    <span className="semester-text">Semestre</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tablas de horarios */}
      <div className="schedules-section">
        {[...new Set(horariosFiltrados.map((h) => h.paralelo))].map(
          (paralelo) => {
            const horariosPorParalelo = horariosFiltrados.filter(
              (h) => h.paralelo === paralelo
            );

            // const franjasHorarias = horasClase
            //   .map((h) => `${h.hora_inicio} - ${h.hora_fin}`)
            //   .filter((value, index, self) => self.indexOf(value) === index);

            const franjasHorarias = horasClase
              .map((h) => `${h.hora_inicio} - ${h.hora_fin}`)
              .filter((value, index, self) => self.indexOf(value) === index); // elimina duplicados

            return (
              <div key={paralelo} className="schedule-card">
                <div className="schedule-header">
                  <h3 className="schedule-title">
                    <span className="schedule-icon">📋</span>
                    Horario - Paralelo {paralelo}
                  </h3>
                  <div className="schedule-badge">
                    {horariosPorParalelo.length} clases
                  </div>
                </div>

                <div className="schedule-table-wrapper">
                  <table className="schedule-table">
                    <thead>
                      <tr>
                        <th className="time-column">
                          <span className="column-icon">🕐</span>
                          Hora
                        </th>
                        {[
                          "Lunes",
                          "Martes",
                          "Miércoles",
                          "Jueves",
                          "Viernes",
                          "Sábado",
                        ].map((dia) => (
                          <th key={dia} className="day-column">
                            <span className="day-name">{dia}</span>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {franjasHorarias.map((franja) => (
                        <tr key={franja}>
                          <td className="time-cell">
                            <div className="time-slot">{franja}</div>
                          </td>
                          {[
                            "Lunes",
                            "Martes",
                            "Miércoles",
                            "Jueves",
                            "Viernes",
                            "Sábado",
                          ].map((dia) => {
                            const clase = horariosPorParalelo.find(
                              (h) =>
                                h.hora_clase.dia === dia &&
                                `${h.hora_clase.hora_inicio} - ${h.hora_clase.hora_fin}` ===
                                  franja
                            );
                            return (
                              <td key={dia} className="class-cell">
                                {clase ? (
                                  <div
                                    className="class-info"
                                    draggable
                                    onDragStart={() =>
                                      setDragHorarioId(
                                        clase.id_horario.toString()
                                      )
                                    }>
                                    <div className="subject-name">
                                      {clase.asignatura.nombre}
                                    </div>
                                    <div className="class-details">
                                      <span className="room-info">
                                        <span className="detail-icon">🏢</span>
                                        {clase.aula.nombre}
                                      </span>
                                      <span className="teacher-info">
                                        <span className="detail-icon">👨‍🏫</span>
                                        {
                                          clase.usuario.nombres.split(" ")[0]
                                        }{" "}
                                        {clase.usuario.apellidos.split(" ")[0]}
                                      </span>
                                      <span className="parallel-info">
                                        <span className="detail-icon">🎯</span>
                                        Paralelo {clase.paralelo}
                                      </span>
                                    </div>
                                    <div className="class-actions">
                                      <button
                                        onClick={() => handleEditar(clase)}
                                        className="action-btn edit-btn"
                                        title="Editar">
                                        ✏️
                                      </button>
                                      <button
                                        onClick={() =>
                                          handleEliminar(clase.id_horario)
                                        }
                                        className="action-btn delete-btn"
                                        title="Eliminar">
                                        🗑️
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div
                                    className="empty-cell"
                                    data-dia={dia}
                                    data-horainicio={franja.split(" - ")[0]}
                                    data-horafin={franja.split(" - ")[1]}
                                    onDragOver={(e) => {
                                      e.preventDefault();
                                      e.currentTarget.classList.add(
                                        "drag-over"
                                      );
                                    }}
                                    onDragLeave={(e) => {
                                      e.currentTarget.classList.remove(
                                        "drag-over"
                                      );
                                    }}
                                    onDrop={async (e) => {
                                      e.preventDefault();
                                      e.currentTarget.classList.remove(
                                        "drag-over"
                                      );

                                      if (!dragHorarioId) return;

                                      const dia = e.currentTarget.dataset.dia!;
                                      const horaInicio =
                                        e.currentTarget.dataset.horainicio!;
                                      const horaFin =
                                        e.currentTarget.dataset.horafin!;

                                      const franja = horasClase.find(
                                        (h) =>
                                          h.dia === dia &&
                                          h.hora_inicio === horaInicio &&
                                          h.hora_fin === horaFin
                                      );

                                      if (!franja) return;

                                      const horario = horarios.find(
                                        (h) =>
                                          h.id_horario === Number(dragHorarioId)
                                      );
                                      if (!horario) return;

                                      const payload = {
                                        id_asignatura:
                                          horario.asignatura.id_asignatura,
                                        id_aula: horario.aula.id_aula,
                                        id_hora_clase: franja.id_hora_clase,
                                        id_usuario: horario.usuario.id_usuario,
                                        paralelo: horario.paralelo,
                                        id_semestre_lectivo:
                                          horario.semestre_lectivo
                                            .id_semestre_lectivo,
                                      };

                                      await actualizarHorario(
                                        horario.id_horario,
                                        payload
                                      );
                                      await cargarDatos();
                                      setDragHorarioId(null);
                                    }}>
                                    <span className="empty-text">Libre</span>
                                  </div>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          }
        )}
      </div>
      {mostrarModal && (
        <Modal onClose={() => setMostrarModal(false)}>
          <h2>📋 Horarios del Docente</h2>
          {horariosDocente.length > 0 ? (
            <table className="modal-table">
              <thead>
                <tr>
                  <th>Asignatura</th>
                  <th>Código</th>
                  <th>Día</th>
                  <th>Hora</th>
                  <th>Aula</th>
                  <th>Paralelo</th>
                  <th>Período</th>
                </tr>
              </thead>
              <tbody>
                {horariosDocente.map((h) => (
                  <tr key={h.id_horario}>
                    <td>{h.asignatura.nombre}</td>
                    <td>{h.asignatura.codigo}</td>
                    <td>{h.hora_clase.dia}</td>
                    <td>
                      {h.hora_clase.hora_inicio} - {h.hora_clase.hora_fin}
                    </td>
                    <td>{h.aula.nombre}</td>
                    <td>{h.paralelo}</td>
                    <td>
                      {h.semestre_lectivo.anio_inicio}-
                      {h.semestre_lectivo.anio_fin} (
                      {h.semestre_lectivo.periodo})
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>Este docente no tiene horarios asignados.</p>
          )}
        </Modal>
      )}
    </div>
  );
};
export default HorarioPage;
