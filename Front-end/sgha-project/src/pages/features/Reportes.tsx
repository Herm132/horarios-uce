import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { getHorarios } from "../../api/horario";
import { getSemestresLectivos } from "../../api/semestreLectivo";
import { getHorasClase } from "../../api/horaClase";
import { useAuth } from "../../auth/AuthContext";
import "../../styles/features/reportes.css";
import logoUce from "/Encabezado.png";
import { getAulas } from "../../api/aulas";

interface Asignatura {
  id_asignatura: number;
  nombre: string;
  codigo: string;
  semestre: number;
}

interface Aula {
  id_aula: number;
  nombre: string;
}

interface HoraClase {
  id_hora_clase: number;
  dia: string;
  hora_inicio: string;
  hora_fin: string;
}

interface Usuario {
  id_usuario: number;
  nombres: string;
  apellidos: string;
}

interface SemestreLectivo {
  id_semestre_lectivo: number;
  anio_inicio: number;
  anio_fin: number;
  periodo: string;
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

const img = new Image();
img.src = logoUce;

const ReportesPage = () => {
  const { usuario } = useAuth();
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [horasClase, setHorasClase] = useState<HoraClase[]>([]);
  const [semestresLectivos, setSemestresLectivos] = useState<SemestreLectivo[]>(
    []
  );
  const [anioLectivoConsulta, setAnioLectivoConsulta] = useState("");
  const [semestreSeleccionado, setSemestreSeleccionado] = useState("");
  const [semestresDisponibles, setSemestresDisponibles] = useState<number[]>(
    []
  );
  const [aulas, setAulas] = useState<Aula[]>([]);
  const [aulaSeleccionada, setAulaSeleccionada] = useState<string>("");

  // Paleta de colores unificada
  const colores = {
    azulOscuro: [25, 84, 144] as [number, number, number], // Azul oscuro para encabezados
    azulMedio: [52, 144, 220] as [number, number, number], // Azul medio para acentos
    celeste: [135, 206, 250] as [number, number, number], // Celeste para fondos
    grisClaro: [245, 245, 245] as [number, number, number], // Gris claro para tablas
    grisTexto: [85, 85, 85] as [number, number, number], // Gris para texto
    grisLineas: [200, 200, 200] as [number, number, number], // Gris para líneas
    blanco: [255, 255, 255] as [number, number, number],
  };

  const dibujarEncabezadoUnificado = (
    doc: jsPDF,
    img: HTMLImageElement,
    semestreLectivo?: SemestreLectivo
  ) => {
    // Fondo azul celeste para el encabezado
    doc.setFillColor(
      colores.celeste[0],
      colores.celeste[1],
      colores.celeste[2]
    );
    doc.rect(0, 0, 210, 35, "F");

    // Logo
    doc.addImage(img, "PNG", 10, 5, 40, 25);

    // Texto universidad (lado izquierdo)
    doc.setFont("helvetica", "bold");
    doc.setTextColor(
      colores.azulOscuro[0],
      colores.azulOscuro[1],
      colores.azulOscuro[2]
    );
    doc.setFontSize(15);
    doc.text("UNIVERSIDAD CENTRAL DEL ECUADOR", 55, 19);

    // Información del período (lado derecho)
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("HORARIO ACADÉMICO", 200, 12, { align: "right" });

    if (semestreLectivo) {
      doc.setFontSize(10);
      doc.text(
        `${semestreLectivo.anio_inicio}-${semestreLectivo.anio_fin}`,
        200,
        16,
        { align: "right" }
      );
      doc.text(`(${semestreLectivo.periodo})`, 200, 19, { align: "right" });
    }

    // Fecha de generación (centrado debajo del encabezado)
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(
      colores.grisTexto[0],
      colores.grisTexto[1],
      colores.grisTexto[2]
    );
    doc.text(
      `Generado el: ${new Date().toLocaleDateString("es-EC", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })}`,
      105,
      42,
      { align: "center" }
    );

    // Línea separadora
    doc.setDrawColor(
      colores.azulMedio[0],
      colores.azulMedio[1],
      colores.azulMedio[2]
    );
    doc.setLineWidth(1);
    doc.line(14, 45, 196, 45);

    return 50;
  };

  useEffect(() => {
    const fetchData = async () => {
      const [hRaw, slRaw, hcRaw] = await Promise.all([
        getHorarios(),
        getSemestresLectivos(),
        getHorasClase(),
      ]);

      const h = hRaw as Horario[];
      const sl = slRaw as SemestreLectivo[];
      const hc = hcRaw as HoraClase[];
      const aulasData = await getAulas();

      setAulas(aulasData);
      setHorarios(h);
      setSemestresLectivos(sl);
      setHorasClase(hc);

      const semestres: number[] = Array.from(
        new Set(h.map((h) => h.asignatura.semestre))
      ).sort((a, b) => a - b);

      setSemestresDisponibles(semestres);
    };
    fetchData();
  }, []);

  const horariosFiltrados = horarios.filter(
    (h) =>
      h.semestre_lectivo.id_semestre_lectivo === Number(anioLectivoConsulta) &&
      h.asignatura.semestre === Number(semestreSeleccionado)
  );

  const exportarPDFAnual = () => {
    const doc = new jsPDF();
    const diasSemana = [
      "Lunes",
      "Martes",
      "Miércoles",
      "Jueves",
      "Viernes",
      "Sábado",
    ];
    const franjasHorarias = horasClase
      .map((h) => `${h.hora_inicio} - ${h.hora_fin}`)
      .filter((v, i, arr) => arr.indexOf(v) === i);

    const horariosDelAnio = horarios.filter(
      (h) =>
        h.semestre_lectivo.id_semestre_lectivo === Number(anioLectivoConsulta)
    );

    if (horariosDelAnio.length === 0) {
      alert("⚠️ No hay horarios disponibles para el año lectivo seleccionado.");
      return;
    }

    const semestresAcademicos = [
      ...new Set(horariosDelAnio.map((h) => h.asignatura.semestre)),
    ].sort((a, b) => a - b);

    const semestreLectivoInfo = semestresLectivos.find(
      (sl) => sl.id_semestre_lectivo === Number(anioLectivoConsulta)
    );

    let pagina = 1;

    for (const semestreNum of semestresAcademicos) {
      const horariosDelSemestre = horariosDelAnio.filter(
        (h) => h.asignatura.semestre === semestreNum
      );

      const paralelos = [
        ...new Set(horariosDelSemestre.map((h) => h.paralelo)),
      ].sort((a, b) => a - b);

      for (const paralelo of paralelos) {
        if (pagina > 1) doc.addPage();

        const horariosParalelo = horariosDelSemestre.filter(
          (h) => h.paralelo === paralelo
        );

        // Encabezado unificado
        const startY = dibujarEncabezadoUnificado(
          doc,
          img,
          semestreLectivoInfo
        );

        // Header del semestre y paralelo
        doc.setFillColor(
          colores.azulMedio[0],
          colores.azulMedio[1],
          colores.azulMedio[2]
        );
        doc.rect(14, startY + 5, 182, 18, "F");

        doc.setTextColor(
          colores.blanco[0],
          colores.blanco[1],
          colores.blanco[2]
        );
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text(
          `${usuario?.carreras?.[0]?.nombre || "CARRERA"}`,
          20,
          startY + 12
        );
        doc.text(`SEMESTRE: ${semestreNum}°`, 20, startY + 18);
        doc.text(`PARALELO: ${paralelo}`, 150, startY + 15);

        // Tabla de horario
        const tabla = franjasHorarias.map((franja) => {
          return [
            franja,
            ...diasSemana.map((dia) => {
              const clase = horariosParalelo.find(
                (h) =>
                  h.hora_clase.dia === dia &&
                  `${h.hora_clase.hora_inicio} - ${h.hora_clase.hora_fin}` ===
                    franja
              );
              return clase
                ? `${clase.asignatura.nombre}\n${clase.aula.nombre}\nProf. ${
                    clase.usuario.nombres.split(" ")[0]
                  } ${clase.usuario.apellidos.split(" ")[0]}`
                : "";
            }),
          ];
        });

        autoTable(doc, {
          startY: startY + 30,
          head: [["HORA", ...diasSemana]],
          body: tabla,
          theme: "grid",
          headStyles: {
            fillColor: colores.azulOscuro,
            textColor: colores.blanco,
            fontSize: 9,
            fontStyle: "bold",
            halign: "center",
          },
          bodyStyles: {
            fontSize: 8,
            textColor: colores.grisTexto,
            fillColor: colores.grisClaro,
          },
          alternateRowStyles: {
            fillColor: colores.blanco,
          },
          columnStyles: {
            0: {
              cellWidth: 25,
              halign: "center",
              fillColor: [235, 235, 235],
              fontStyle: "bold",
            },
            1: { cellWidth: 26 },
            2: { cellWidth: 26 },
            3: { cellWidth: 26 },
            4: { cellWidth: 26 },
            5: { cellWidth: 26 },
            6: { cellWidth: 26 },
          },
          margin: { left: 14, right: 14 },
          tableLineColor: colores.grisLineas,
          tableLineWidth: 0.5,
        });

        // Pie de página
        doc.setTextColor(
          colores.grisTexto[0],
          colores.grisTexto[1],
          colores.grisTexto[2]
        );
        doc.setFontSize(8);
        doc.text(`Página ${pagina}`, 105, 285, { align: "center" });
        doc.setDrawColor(
          colores.grisLineas[0],
          colores.grisLineas[1],
          colores.grisLineas[2]
        );
        doc.setLineWidth(0.5);
        doc.line(14, 280, 196, 280);

        pagina++;
      }
    }

    // Footer final
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setTextColor(
        colores.grisTexto[0],
        colores.grisTexto[1],
        colores.grisTexto[2]
      );
      doc.setFontSize(7);
      doc.text(
        `Sistema de Gestión Académica | Generado automáticamente`,
        105,
        292,
        { align: "center" }
      );
    }

    window.open(doc.output("bloburl"), "_blank");
  };

  const exportarPDF = () => {
    if (horariosFiltrados.length === 0) {
      alert(
        "⚠️ No hay horarios disponibles para el semestre y año seleccionados."
      );
      return;
    }
    const doc = new jsPDF();

    const diasSemana = [
      "Lunes",
      "Martes",
      "Miércoles",
      "Jueves",
      "Viernes",
      "Sábado",
    ];

    const franjasHorarias = horasClase
      .map((h) => `${h.hora_inicio} - ${h.hora_fin}`)
      .filter((v, i, arr) => arr.indexOf(v) === i);

    const paralelos = Array.from(
      new Set(horariosFiltrados.map((h) => h.paralelo))
    );

    const semestreLectivoInfo = semestresLectivos.find(
      (sl) => sl.id_semestre_lectivo === Number(anioLectivoConsulta)
    );

    let currentY = 0;

    paralelos.forEach((paralelo, index) => {
      const horariosPorParalelo = horariosFiltrados.filter(
        (h) => h.paralelo === paralelo
      );

      // Nueva página para cada paralelo (excepto el primero)
      if (index > 0) {
        doc.addPage();
      }

      // Encabezado unificado
      currentY = dibujarEncabezadoUnificado(doc, img, semestreLectivoInfo);

      // Header del paralelo
      doc.setFillColor(
        colores.azulMedio[0],
        colores.azulMedio[1],
        colores.azulMedio[2]
      );
      doc.rect(14, currentY + 5, 182, 18, "F");

      doc.setTextColor(colores.blanco[0], colores.blanco[1], colores.blanco[2]);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(
        `${usuario?.carreras?.[0]?.nombre || "CARRERA"}`,
        20,
        currentY + 12
      );
      doc.text(`SEMESTRE: ${Number(semestreSeleccionado)}°`, 20, currentY + 18);
      doc.text(`PARALELO: ${paralelo}`, 150, currentY + 15);

      currentY += 30;

      // Tabla de horario
      const tablaCompleta = franjasHorarias.map((franja) => {
        return [
          franja,
          ...diasSemana.map((dia) => {
            const clase = horariosPorParalelo.find(
              (h) =>
                h.hora_clase.dia === dia &&
                `${h.hora_clase.hora_inicio} - ${h.hora_clase.hora_fin}` ===
                  franja
            );
            return clase
              ? `${clase.asignatura.nombre}\n${clase.aula.nombre}\nProf. ${
                  clase.usuario.nombres.split(" ")[0]
                } ${clase.usuario.apellidos.split(" ")[0]}`
              : "";
          }),
        ];
      });

      autoTable(doc, {
        startY: currentY,
        head: [["HORA", ...diasSemana]],
        body: tablaCompleta,
        theme: "grid",
        headStyles: {
          fillColor: colores.azulOscuro,
          textColor: colores.blanco,
          fontSize: 9,
          fontStyle: "bold",
          halign: "center",
          cellPadding: { top: 4, bottom: 4, left: 3, right: 3 },
        },
        bodyStyles: {
          fontSize: 8,
          cellPadding: { top: 6, bottom: 6, left: 4, right: 4 },
          valign: "middle",
          textColor: colores.grisTexto,
          fillColor: colores.grisClaro,
        },
        alternateRowStyles: {
          fillColor: colores.blanco,
        },
        columnStyles: {
          0: {
            fillColor: [235, 235, 235],
            fontStyle: "bold",
            halign: "center",
            cellWidth: 25,
          },
          1: { cellWidth: 26 },
          2: { cellWidth: 26 },
          3: { cellWidth: 26 },
          4: { cellWidth: 26 },
          5: { cellWidth: 26 },
          6: { cellWidth: 26 },
        },
        margin: { left: 14, right: 14 },
        tableLineColor: colores.grisLineas,
        tableLineWidth: 0.5,
      });

      currentY = (doc as any).lastAutoTable.finalY + 15;

      // Pie de página para cada paralelo
      doc.setTextColor(
        colores.grisTexto[0],
        colores.grisTexto[1],
        colores.grisTexto[2]
      );
      doc.setFontSize(8);
      doc.text(
        `Página ${index + 1} de ${paralelos.length} | Paralelo ${paralelo}`,
        105,
        285,
        { align: "center" }
      );

      // Línea decorativa
      doc.setDrawColor(
        colores.grisLineas[0],
        colores.grisLineas[1],
        colores.grisLineas[2]
      );
      doc.setLineWidth(0.5);
      doc.line(14, 280, 196, 280);
    });

    // Footer final del documento
    const totalPages = paralelos.length;
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setTextColor(
        colores.grisTexto[0],
        colores.grisTexto[1],
        colores.grisTexto[2]
      );
      doc.setFontSize(7);
      doc.text(
        `Sistema de Gestión Académica | Generado automáticamente`,
        105,
        292,
        { align: "center" }
      );
    }

    window.open(doc.output("bloburl"), "_blank");
  };

  const exportarPDFHorariosPorAula = async () => {
    const doc = new jsPDF();

    const aulas = await getAulas();

    if (!anioLectivoConsulta) {
      alert("⚠️ Debes seleccionar un año lectivo.");
      return;
    }

    const horariosPorAnio = horarios.filter(
      (h) =>
        h.semestre_lectivo.id_semestre_lectivo === Number(anioLectivoConsulta)
    );

    if (horariosPorAnio.length === 0) {
      alert("⚠️ No hay horarios registrados para el año lectivo seleccionado.");
      return;
    }

    const franjasHorarias = horasClase
      .map((h) => `${h.hora_inicio} - ${h.hora_fin}`)
      .filter((v, i, arr) => arr.indexOf(v) === i);

    const diasSemana = [
      "Lunes",
      "Martes",
      "Miércoles",
      "Jueves",
      "Viernes",
      "Sábado",
    ];

    const semestreLectivoInfo = semestresLectivos.find(
      (sl) => sl.id_semestre_lectivo === Number(anioLectivoConsulta)
    );

    const aulasFiltradas = aulaSeleccionada
      ? aulas.filter(
          (a: { id_aula: number }) => a.id_aula === Number(aulaSeleccionada)
        )
      : aulas;

    const tieneHorarios = aulasFiltradas.some((aula: { id_aula: number }) =>
      horariosPorAnio.some((h) => h.aula.id_aula === aula.id_aula)
    );

    if (!tieneHorarios) {
      alert("⚠️ No hay horarios registrados para el aula seleccionada.");
      return;
    }

    let pagina = 1;

    for (const aula of aulasFiltradas) {
      const horariosAula = horariosPorAnio.filter(
        (h) => h.aula.id_aula === aula.id_aula
      );
      if (horariosAula.length === 0) continue;

      if (pagina > 1) doc.addPage();

      const startY = dibujarEncabezadoUnificado(doc, img, semestreLectivoInfo);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`AULA: ${aula.nombre}`, 20, startY + 10);
      doc.setFontSize(10);
      doc.text(`Tipo: ${aula.tipo}`, 20, startY + 17);
      doc.text(`Capacidad: ${aula.capacidad}`, 20, startY + 23);
      doc.text(`Edificio: ${aula.edificio}`, 80, startY + 17);
      doc.text(`Piso: ${aula.piso}`, 80, startY + 23);
      doc.text(
        `Uso General: ${aula.uso_general ? "Sí" : "No"}`,
        140,
        startY + 17
      );

      const tabla = franjasHorarias.map((franja) => {
        return [
          franja,
          ...diasSemana.map((dia) => {
            const clase = horariosAula.find(
              (h) =>
                h.hora_clase.dia === dia &&
                `${h.hora_clase.hora_inicio} - ${h.hora_clase.hora_fin}` ===
                  franja
            );
            return clase
              ? `${clase.asignatura.nombre}\nParalelo ${clase.paralelo}\n${
                  clase.usuario.nombres.split(" ")[0]
                } ${clase.usuario.apellidos.split(" ")[0]}`
              : "";
          }),
        ];
      });

      autoTable(doc, {
        startY: startY + 35,
        head: [["HORA", ...diasSemana]],
        body: tabla,
        theme: "grid",
        headStyles: {
          fillColor: colores.azulOscuro,
          textColor: colores.blanco,
          fontSize: 9,
          fontStyle: "bold",
          halign: "center",
        },
        bodyStyles: {
          fontSize: 8,
          textColor: colores.grisTexto,
          fillColor: colores.grisClaro,
        },
        alternateRowStyles: {
          fillColor: colores.blanco,
        },
        columnStyles: {
          0: {
            cellWidth: 25,
            halign: "center",
            fillColor: [235, 235, 235],
            fontStyle: "bold",
          },
          1: { cellWidth: 26 },
          2: { cellWidth: 26 },
          3: { cellWidth: 26 },
          4: { cellWidth: 26 },
          5: { cellWidth: 26 },
          6: { cellWidth: 26 },
        },
        margin: { left: 14, right: 14 },
        tableLineColor: colores.grisLineas,
        tableLineWidth: 0.5,
      });

      // Pie de página
      doc.setFontSize(8);
      doc.setTextColor(
        colores.grisTexto[0],
        colores.grisTexto[1],
        colores.grisTexto[2]
      );
      doc.text(`Página ${pagina}`, 105, 285, { align: "center" });
      doc.line(14, 280, 196, 280);

      pagina++;
    }

    // Footer final
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(7);
      doc.setTextColor(
        colores.grisTexto[0],
        colores.grisTexto[1],
        colores.grisTexto[2]
      );
      doc.text(
        `Sistema de Gestión Académica | Generado automáticamente`,
        105,
        292,
        { align: "center" }
      );
    }

    window.open(doc.output("bloburl"), "_blank");
  };

  return (
    <div className="reportes-container">
      <h2>📄 Generar Reporte PDF de Horarios</h2>
      <p className="indicacion">
        📌 Primero selecciona un <strong>año lectivo</strong> para habilitar los
        reportes disponibles:
      </p>

      <div className="form-section">
        <div className="form-row">
          <label htmlFor="anio">📅 Año lectivo</label>
          <select
            id="anio"
            value={anioLectivoConsulta}
            onChange={(e) => setAnioLectivoConsulta(e.target.value)}>
            <option value="">Seleccionar</option>
            {semestresLectivos.map((s) => (
              <option key={s.id_semestre_lectivo} value={s.id_semestre_lectivo}>
                {s.anio_inicio}-{s.anio_fin} ({s.periodo})
              </option>
            ))}
          </select>
        </div>
      </div>

      {anioLectivoConsulta && (
        <div className="reporte-bloques">
          {/* Bloque: Reporte por Semestre */}
          <div className="bloque-reporte">
            <h3>📘 Reporte por Semestre</h3>
            <div className="form-row">
              <label htmlFor="semestre">Seleccionar semestre:</label>
              <select
                id="semestre"
                value={semestreSeleccionado}
                onChange={(e) => setSemestreSeleccionado(e.target.value)}>
                <option value="">Seleccionar</option>
                {semestresDisponibles.map((sem) => (
                  <option key={sem} value={sem}>
                    {sem}° Semestre
                  </option>
                ))}
              </select>
              <button
                onClick={exportarPDF}
                disabled={!anioLectivoConsulta || !semestreSeleccionado}>
                📥 Exportar PDF Semestre
              </button>
            </div>
          </div>

          {/* Bloque: Reporte por Aula */}
          <div className="bloque-reporte">
            <h3>🏫 Reporte por Aula</h3>
            <div className="form-row">
              <label htmlFor="aula">Seleccionar aula:</label>
              <select
                id="aula"
                value={aulaSeleccionada}
                onChange={(e) => setAulaSeleccionada(e.target.value)}>
                <option value="">Todas las aulas</option>
                {aulas.map((aula) => {
                  const tieneClases = horarios.some(
                    (h) => h.aula.id_aula === aula.id_aula
                  );
                  return (
                    <option key={aula.id_aula} value={aula.id_aula}>
                      {aula.nombre} {tieneClases ? "" : "(sin clases)"}
                    </option>
                  );
                })}
              </select>
              <button onClick={exportarPDFHorariosPorAula}>
                🏫 Exportar PDF Aula
              </button>
            </div>
          </div>

          {/* Bloque: Reporte Anual */}
          <div className="bloque-reporte">
            <h3>📊 Reporte Anual General</h3>
            <div className="form-row">
              <button onClick={exportarPDFAnual}>
                📘 Exportar PDF Anual Completo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportesPage;
