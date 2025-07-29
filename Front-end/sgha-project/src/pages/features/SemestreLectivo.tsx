import { useEffect, useState } from "react";
import {
  getSemestresLectivos,
  crearSemestreLectivo,
  actualizarSemestreLectivo,
  eliminarSemestreLectivo,
} from "../../api/semestreLectivo";
import type { SemestreLectivo } from "../../api/semestreLectivo";
import "../../styles/features/semestreLectivo.css";

const SemestreLectivoPage = () => {
  const [semestres, setSemestres] = useState<SemestreLectivo[]>([]);
  const [filtros, setFiltros] = useState({
    anio_inicio: "",
    anio_fin: "",
    periodo: "",
  });

  const [formData, setFormData] = useState<
    Omit<SemestreLectivo, "id_semestre_lectivo">
  >({
    anio_inicio: new Date().getFullYear(),
    anio_fin: new Date().getFullYear() + 1,
    periodo: "A",
  });

  const [modoEditar, setModoEditar] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  const cargarSemestres = async () => {
    try {
      const data = await getSemestresLectivos();
      setSemestres(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    cargarSemestres();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFiltroChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFiltros({ ...filtros, [e.target.name]: e.target.value });
  };

  const resetFormulario = () => {
    setModoEditar(false);
    setEditId(null);
    setFormData({
      anio_inicio: new Date().getFullYear(),
      anio_fin: new Date().getFullYear() + 1,
      periodo: "A",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (modoEditar && editId !== null) {
        await actualizarSemestreLectivo(editId, formData);
      } else {
        await crearSemestreLectivo(formData);
      }
      resetFormulario();
      cargarSemestres();
    } catch (error) {
      console.error(error);
    }
  };

  const handleEditar = (sem: SemestreLectivo) => {
    setModoEditar(true);
    setEditId(sem.id_semestre_lectivo);
    setFormData({
      anio_inicio: sem.anio_inicio,
      anio_fin: sem.anio_fin,
      periodo: sem.periodo,
    });
  };

  const handleEliminar = async (id: number) => {
    if (!confirm("¿Estás seguro de eliminar este semestre?")) return;
    try {
      await eliminarSemestreLectivo(id);
      cargarSemestres();
    } catch (error) {
      console.error(error);
    }
  };

  // 🔍 Aplicar filtros
  const semestresFiltrados = semestres.filter((s) => {
    return (
      (filtros.anio_inicio === "" ||
        s.anio_inicio.toString() === filtros.anio_inicio) &&
      (filtros.anio_fin === "" || s.anio_fin.toString() === filtros.anio_fin) &&
      (filtros.periodo === "" || s.periodo === filtros.periodo)
    );
  });

  return (
    <div className="semestre-page">
      <div className="semestre-formulario">
        <h2>
          {modoEditar ? "Editar Semestre Lectivo" : "Crear Semestre Lectivo"}
        </h2>
        <form onSubmit={handleSubmit}>
          <label>
            Año Inicio:
            <input
              type="number"
              name="anio_inicio"
              value={formData.anio_inicio}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Año Fin:
            <input
              type="number"
              name="anio_fin"
              value={formData.anio_fin}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Periodo:
            <select
              name="periodo"
              value={formData.periodo}
              onChange={handleChange}>
              <option value="A">A</option>
              <option value="B">B</option>
            </select>
          </label>
          <div className="form-buttons">
            <button type="submit">{modoEditar ? "Actualizar" : "Crear"}</button>
            {modoEditar && (
              <button
                type="button"
                className="cancelar"
                onClick={resetFormulario}>
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="semestre-tabla">
        <h2>Listado de Semestres</h2>

        <div className="filtros">
          <label>
            Filtrar por Año Inicio:
            <input
              type="number"
              name="anio_inicio"
              value={filtros.anio_inicio}
              onChange={handleFiltroChange}
              placeholder="Ej: 2025"
            />
          </label>
          <label>
            Filtrar por Año Fin:
            <input
              type="number"
              name="anio_fin"
              value={filtros.anio_fin}
              onChange={handleFiltroChange}
              placeholder="Ej: 2026"
            />
          </label>
          <label>
            Filtrar por Periodo:
            <select
              name="periodo"
              value={filtros.periodo}
              onChange={handleFiltroChange}>
              <option value="">Todos</option>
              <option value="A">A</option>
              <option value="B">B</option>
            </select>
          </label>
        </div>

        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Año Inicio</th>
              <th>Año Fin</th>
              <th>Periodo</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {semestresFiltrados.map((s) => (
              <tr key={s.id_semestre_lectivo}>
                <td>{s.id_semestre_lectivo}</td>
                <td>{s.anio_inicio}</td>
                <td>{s.anio_fin}</td>
                <td>{s.periodo}</td>
                <td>
                  <button className="edit" onClick={() => handleEditar(s)}>
                    ✏️
                  </button>
                  <button
                    className="delete"
                    onClick={() => handleEliminar(s.id_semestre_lectivo)}>
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
            {semestresFiltrados.length === 0 && (
              <tr>
                <td colSpan={5}>
                  No se encontraron semestres que coincidan con los filtros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SemestreLectivoPage;
