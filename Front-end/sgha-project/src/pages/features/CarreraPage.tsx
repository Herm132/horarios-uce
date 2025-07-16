import React, { useEffect, useState } from "react";
import {
  getCarreras,
  createCarrera,
  updateCarrera,
  deleteCarrera,
} from "../../api/carreras";
import { getFacultades } from "../../api/facultades";
import "../../styles/features/carrera.css";

interface Carrera {
  id_carrera: number;
  nombre: string;
  codigo: string;
  id_facultad: number;
}

interface Facultad {
  id_facultad: number;
  nombre: string;
}

const CarreraPage = () => {
  const [carreras, setCarreras] = useState<Carrera[]>([]);
  const [facultades, setFacultades] = useState<Facultad[]>([]);
  const [nombre, setNombre] = useState("");
  const [codigo, setCodigo] = useState("");
  const [facultadId, setFacultadId] = useState<number | undefined>(undefined);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [carrerasData, facultadesData] = await Promise.all([
        getCarreras(),
        getFacultades(),
      ]);
      setCarreras(carrerasData);
      setFacultades(facultadesData);
    } catch {
      setError("Error al cargar datos");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!facultadId) return setError("Selecciona una facultad");

    try {
      if (editandoId) {
        await updateCarrera(editandoId, nombre, codigo, facultadId);
      } else {
        await createCarrera(nombre, codigo, facultadId);
      }
      resetForm();
      cargarDatos();
    } catch {
      setError("Error al guardar carrera");
    }
  };

  const resetForm = () => {
    setNombre("");
    setCodigo("");
    setFacultadId(undefined);
    setEditandoId(null);
    setError("");
  };

  const handleEdit = (carrera: Carrera) => {
    setEditandoId(carrera.id_carrera);
    setNombre(carrera.nombre);
    setCodigo(carrera.codigo);
    setFacultadId(carrera.id_facultad);
  };

  const handleDelete = async (id: number) => {
    if (confirm("¿Eliminar esta carrera?")) {
      try {
        await deleteCarrera(id);
        cargarDatos();
      } catch {
        setError("Error al eliminar");
      }
    }
  };

  return (
    <div className="carrera-container">
      <h2>Gestión de Carreras</h2>

      {error && <p className="error">{error}</p>}

      <form onSubmit={handleSubmit} className="carrera-form">
        <input
          type="text"
          placeholder="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Código"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
          required
        />
        <select
          value={facultadId ?? ""}
          onChange={(e) => setFacultadId(Number(e.target.value))}
          required>
          <option value="">Selecciona una facultad</option>
          {facultades.map((f) => (
            <option key={f.id_facultad} value={f.id_facultad}>
              {f.nombre}
            </option>
          ))}
        </select>
        <button type="submit">{editandoId ? "Actualizar" : "Crear"}</button>
      </form>

      <ul className="carrera-list">
        {carreras.map((c) => (
          <li key={c.id_carrera}>
            <span>
              {c.nombre} - {c.codigo}
            </span>
            <button onClick={() => handleEdit(c)}>Editar</button>
            <button onClick={() => handleDelete(c.id_carrera)}>Eliminar</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CarreraPage;
