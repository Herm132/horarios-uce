import React, { useEffect, useState } from "react";
import {
  getFacultades,
  createFacultad,
  updateFacultad,
  deleteFacultad,
} from "../../api/facultades";
import "../../styles/features/facultad.css"; // Estilos específicos

interface Facultad {
  id_facultad: number;
  nombre: string;
}

const FacultadPage = () => {
  const [facultades, setFacultades] = useState<Facultad[]>([]);
  const [nombre, setNombre] = useState("");
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [error, setError] = useState("");

  // Cargar facultades al iniciar la página
  useEffect(() => {
    cargarFacultades();
  }, []);

  const cargarFacultades = async () => {
    try {
      const data = await getFacultades();
      setFacultades(data);
    } catch (err) {
      setError("Error al cargar facultades");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      if (editandoId) {
        await updateFacultad(editandoId, nombre);
      } else {
        await createFacultad(nombre);
      }

      setNombre("");
      setEditandoId(null);
      cargarFacultades();
    } catch (err) {
      setError("Error al guardar la facultad");
    }
  };

  const handleEdit = (facultad: Facultad) => {
    setEditandoId(facultad.id_facultad);
    setNombre(facultad.nombre);
  };

  const handleDelete = async (id: number) => {
    if (confirm("¿Seguro que deseas eliminar esta facultad?")) {
      try {
        await deleteFacultad(id);
        cargarFacultades();
      } catch (err) {
        setError("Error al eliminar la facultad");
      }
    }
  };

  return (
    <div className="facultad-container">
      <h2>Gestión de Facultades</h2>

      {error && <p className="error">{error}</p>}

      <form onSubmit={handleSubmit} className="facultad-form">
        <input
          type="text"
          placeholder="Nombre de la facultad"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />
        <button type="submit">{editandoId ? "Actualizar" : "Crear"}</button>
      </form>

      <ul className="facultad-list">
        {facultades.map((fac) => (
          <li key={fac.id_facultad}>
            <span>{fac.nombre}</span>
            <button onClick={() => handleEdit(fac)}>Editar</button>
            <button onClick={() => handleDelete(fac.id_facultad)}>
              Eliminar
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FacultadPage;
