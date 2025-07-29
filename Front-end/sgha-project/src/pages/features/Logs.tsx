import { useState } from "react";
import { getLogs, type Log } from "../../api/logs";
import * as XLSX from "xlsx";

const LogsPage = () => {
  const [descargando, setDescargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getDescripcionAccion = (accion: string, tabla: string | null) => {
    if (accion === "LOGIN") return "Se inició sesión";

    const tablaAcciones: Record<string, string> = {
      usuario: "un usuario",
      usuario_asignatura_estudiante: "una relación estudiante-asignatura",
      usuario_asignatura: "una relación docente-asignatura",
      usuario_carrera: "una relación usuario-carrera",
      asignatura_carrera: "una relación asignatura-carrera",
      hora_clase: "una hora de clase",
      facultad: "una facultad",
      carrera: "una carrera",
      asignatura: "una asignatura",
      aula: "un aula",
      horario: "un horario",
      auth: "el sistema (login)",
    };

    const descripcion = tablaAcciones[tabla ?? ""] ?? `la tabla "${tabla}"`;

    switch (accion) {
      case "CREATE":
        return `Se creó ${descripcion}`;
      case "UPDATE":
        return `Se actualizó ${descripcion}`;
      case "DELETE":
        return `Se eliminó ${descripcion}`;
      default:
        return `${accion} sobre ${descripcion}`;
    }
  };

  const descargarLogsExcel = async () => {
    setDescargando(true);
    setError(null);

    try {
      const logs: Log[] = await getLogs();

      // Ordenar por fecha (más reciente arriba)
      const logsOrdenados = [...logs].sort(
        (a, b) =>
          new Date(b.fecha_hora).getTime() - new Date(a.fecha_hora).getTime()
      );

      // Mapear los logs a formato plano para Excel
      const datos = logsOrdenados.map((log) => {
        let tipo = "";
        switch (log.accion) {
          case "LOGIN":
            tipo = "LOGIN";
            break;
          case "UPDATE":
            tipo = "UPDATE";
            break;
          case "CREATE":
            tipo = "CREATE";
            break;
          case "DELETE":
            tipo = "DELETE";
            break;
          default:
            tipo = log.accion;
        }
        return {
          ID: log.id,
          Fecha: new Date(log.fecha_hora).toLocaleString(),
          Tipo: tipo,
          Cédula: log.usuario_cedula || "—",
          Correo: log.usuario_correo || "—",
          Acción_Realizada: getDescripcionAccion(
            log.accion,
            log.tabla_afectada
          ),
          ID_Registro: log.id_registro || "—",
          Datos_Anteriores: JSON.stringify(log.datos_anteriores, null, 2),
          Datos_Nuevos: JSON.stringify(log.datos_nuevos, null, 2),
        };
      });

      const worksheet = XLSX.utils.json_to_sheet(datos);

      //Activar filtro en encabezado
      worksheet["!autofilter"] = { ref: "A1:I1" };

      // Crear libro y exportar
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Todos los Logs");
      XLSX.writeFile(workbook, "logs.xlsx");
    } catch (err: any) {
      console.error(err);
      setError("Error al descargar los logs");
    } finally {
      setDescargando(false);
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-3">Descargar Logs del Sistema</h2>

      {error && <p className="text-danger">{error}</p>}

      <button
        className="btn btn-success"
        onClick={descargarLogsExcel}
        disabled={descargando}>
        {descargando ? "Descargando..." : "Descargar logs en Excel"}
      </button>
    </div>
  );
};

export default LogsPage;
