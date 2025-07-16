import React, { useEffect, useState } from "react";
import { getAulas, createAula, updateAula, deleteAula } from "../../api/aulas";
import { getFacultades } from "../../api/facultades";
import "../../styles/features/aula.css";

interface Aula {
  id_aula: number;
  nombre: string;
  capacidad: number;
  tipo: string;
  edificio: string;
  piso: number;
  id_facultad: number;
  uso_general: boolean;
}

interface Facultad {
  id_facultad: number;
  nombre: string;
}

const AulaPage = () => {
  const [aulas, setAulas] = useState<Aula[]>([]);
  const [facultades, setFacultades] = useState<Facultad[]>([]);
  const [form, setForm] = useState<Omit<Aula, "id_aula">>({
    nombre: "",
    capacidad: 0,
    tipo: "",
    edificio: "",
    piso: 0,
    id_facultad: 0,
    uso_general: false,
  });
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [aulasData, facultadesData] = await Promise.all([
        getAulas(),
        getFacultades(),
      ]);
      setAulas(aulasData);
      setFacultades(facultadesData);
    } catch {
      setError("Error al cargar datos");
    }
  };

  const resetForm = () => {
    setForm({
      nombre: "",
      capacidad: 0,
      tipo: "",
      edificio: "",
      piso: 0,
      id_facultad: 0,
      uso_general: false,
    });
    setEditandoId(null);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editandoId) {
        await updateAula(editandoId, form);
      } else {
        await createAula(form);
      }
      resetForm();
      cargarDatos();
    } catch {
      setError("Error al guardar aula");
    }
  };

  const handleEdit = (aula: Aula) => {
    const { id_aula, ...rest } = aula;
    setForm(rest);
    setEditandoId(id_aula);
  };

  const handleDelete = async (id: number) => {
    if (confirm("¿Eliminar esta aula?")) {
      try {
        await deleteAula(id);
        cargarDatos();
      } catch {
        setError("Error al eliminar aula");
      }
    }
  };

  return (
    <div className="aula-container">
      <h2>Gestión de Aulas</h2>
      {error && <p className="error">{error}</p>}

      <form onSubmit={handleSubmit} className="aula-form">
        <input
          type="text"
          placeholder="Nombre"
          value={form.nombre}
          onChange={(e) => setForm({ ...form, nombre: e.target.value })}
          required
        />
        <input
          type="number"
          placeholder="Capacidad"
          value={form.capacidad}
          onChange={(e) =>
            setForm({ ...form, capacidad: Number(e.target.value) })
          }
          required
        />
        <input
          type="text"
          placeholder="Tipo"
          value={form.tipo}
          onChange={(e) => setForm({ ...form, tipo: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Edificio"
          value={form.edificio}
          onChange={(e) => setForm({ ...form, edificio: e.target.value })}
          required
        />
        <input
          type="number"
          placeholder="Piso"
          value={form.piso}
          onChange={(e) => setForm({ ...form, piso: Number(e.target.value) })}
          required
        />
        <select
          value={form.id_facultad}
          onChange={(e) =>
            setForm({ ...form, id_facultad: Number(e.target.value) })
          }
          required>
          <option value="">Selecciona una facultad</option>
          {facultades.map((f) => (
            <option key={f.id_facultad} value={f.id_facultad}>
              {f.nombre}
            </option>
          ))}
        </select>
        <label>
          <input
            type="checkbox"
            checked={form.uso_general}
            onChange={(e) =>
              setForm({ ...form, uso_general: e.target.checked })
            }
          />
          Uso general
        </label>
        <button type="submit">{editandoId ? "Actualizar" : "Crear"}</button>
      </form>

      <ul className="aula-list">
        {aulas.map((a) => (
          <li key={a.id_aula}>
            <span>
              {a.nombre} ({a.tipo}) - Capacidad: {a.capacidad} - Piso {a.piso} -{" "}
              {a.edificio} - Uso general: {a.uso_general ? "Sí" : "No"}
            </span>
            <button onClick={() => handleEdit(a)}>Editar</button>
            <button onClick={() => handleDelete(a.id_aula)}>Eliminar</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AulaPage;
