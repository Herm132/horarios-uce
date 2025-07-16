import React, { useEffect, useState } from "react";
import {
  getAsignaturas,
  createAsignatura,
  updateAsignatura,
  deleteAsignatura,
} from "../../api/asignaturas";
import "../../styles/features/asignatura.css";

interface Asignatura {
  id_asignatura: number;
  nombre: string;
  codigo: string;
  horas_clase: number;
  horas_pae: number;
  semestre: number;
  es_comun: boolean;
}

const AsignaturaPage = () => {
  const [asignaturas, setAsignaturas] = useState<Asignatura[]>([]);
  const [form, setForm] = useState<Omit<Asignatura, "id_asignatura">>({
    nombre: "",
    codigo: "",
    horas_clase: 0,
    horas_pae: 0,
    semestre: 1,
    es_comun: false,
  });
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    cargarAsignaturas();
  }, []);

  const cargarAsignaturas = async () => {
    try {
      const data = await getAsignaturas();
      setAsignaturas(data);
    } catch {
      setError("Error al cargar asignaturas");
    }
  };

  const resetForm = () => {
    setForm({
      nombre: "",
      codigo: "",
      horas_clase: 0,
      horas_pae: 0,
      semestre: 1,
      es_comun: false,
    });
    setEditandoId(null);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editandoId) {
        await updateAsignatura(editandoId, form);
      } else {
        await createAsignatura(form);
      }
      resetForm();
      cargarAsignaturas();
    } catch {
      setError("Error al guardar asignatura");
    }
  };

  const handleEdit = (asig: Asignatura) => {
    const { id_asignatura, ...rest } = asig;
    setForm(rest);
    setEditandoId(id_asignatura);
  };

  const handleDelete = async (id: number) => {
    if (confirm("¿Eliminar esta asignatura?")) {
      try {
        await deleteAsignatura(id);
        cargarAsignaturas();
      } catch {
        setError("Error al eliminar asignatura");
      }
    }
  };

  return (
    <div className="asignatura-container">
      <h2>Gestión de Asignaturas</h2>
      {error && <p className="error">{error}</p>}

      <form onSubmit={handleSubmit} className="asignatura-form">
        <label>
          Nombre
          <input
            type="text"
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            required
          />
        </label>
        <label>
          Código
          <input
            type="text"
            value={form.codigo}
            onChange={(e) => setForm({ ...form, codigo: e.target.value })}
            required
          />
        </label>
        <label>
          Horas Clase
          <input
            type="number"
            value={form.horas_clase}
            onChange={(e) =>
              setForm({ ...form, horas_clase: Number(e.target.value) })
            }
            required
          />
        </label>
        <label>
          Horas PAE
          <input
            type="number"
            value={form.horas_pae}
            onChange={(e) =>
              setForm({ ...form, horas_pae: Number(e.target.value) })
            }
            required
          />
        </label>
        <label>
          Semestre
          <input
            type="number"
            value={form.semestre}
            onChange={(e) =>
              setForm({ ...form, semestre: Number(e.target.value) })
            }
            required
          />
        </label>
        <label className="full-width">
          <input
            type="checkbox"
            checked={form.es_comun}
            onChange={(e) => setForm({ ...form, es_comun: e.target.checked })}
          />
          Es común
        </label>

        <button type="submit">{editandoId ? "Actualizar" : "Crear"}</button>
      </form>

      <ul className="asignatura-list">
        {asignaturas.map((a) => (
          <li key={a.id_asignatura}>
            <strong>{a.nombre}</strong> ({a.codigo})<br />
            Horas Clase: {a.horas_clase}, PAE: {a.horas_pae}, Semestre:{" "}
            {a.semestre}, Común: {a.es_comun ? "Sí" : "No"}
            <br />
            <div className="btn-group">
              <button onClick={() => handleEdit(a)}>Editar</button>
              <button onClick={() => handleDelete(a.id_asignatura)}>
                Eliminar
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AsignaturaPage;
