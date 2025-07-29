import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logoUce from "/Encabezado.png";

interface Usuario {
  nombres: string;
  apellidos: string;
}

interface Asignatura {
  nombre: string;
  codigo: string;
}

interface Aula {
  nombre: string;
}

interface HoraClase {
  id_hora_clase: number;
  dia: string;
  hora_inicio: string;
  hora_fin: string;
}

interface Horario {
  id_horario: number;
  usuario: Usuario;
  asignatura: Asignatura;
  aula: Aula;
  hora_clase: HoraClase;
  paralelo: number;
  semestre_lectivo: string;
}

const diasSemana = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

const colores = {
  azulOscuro: [25, 84, 144] as [number, number, number],
  azulMedio: [52, 144, 220] as [number, number, number],
  celeste: [135, 206, 250] as [number, number, number],
  grisTexto: [85, 85, 85] as [number, number, number],
  grisClaro: [245, 245, 245] as [number, number, number],
  blanco: [255, 255, 255] as [number, number, number],
};

const dibujarEncabezadoUnificado = (
  doc: jsPDF,
  img: HTMLImageElement,
  nombre: string
) => {
  doc.setFillColor(...colores.celeste);
  doc.rect(0, 0, 210, 35, "F");

  doc.addImage(img, "PNG", 10, 5, 40, 25);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(...colores.azulOscuro);
  doc.setFontSize(15);
  doc.text("UNIVERSIDAD CENTRAL DEL ECUADOR", 55, 19);

  doc.setFontSize(10);
  doc.text("HORARIO ACADÉMICO", 200, 12, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setTextColor(...colores.grisTexto);
  doc.setFontSize(9);
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

  doc.setDrawColor(...colores.azulMedio);
  doc.setLineWidth(1);
  doc.line(14, 45, 196, 45);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...colores.azulOscuro);
  doc.text(`Estudiante: ${nombre}`, 14, 52);

  return 60;
};

export const generarHorarioEstudiantePDF = async (
  nombre: string,
  horarios: Horario[]
) => {
  const doc = new jsPDF();
  const img = new Image();
  img.src = logoUce;
  await new Promise((res) => (img.onload = res));

  const horasUnicas: HoraClase[] = Array.from(
    new Set(horarios.map((h) => h.hora_clase.id_hora_clase))
  )
    .map(
      (id) =>
        horarios.find((h) => h.hora_clase.id_hora_clase === id)?.hora_clase
    )
    .filter((h): h is HoraClase => h !== undefined)
    .sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio));

  const obtenerHorario = (dia: string, idHora: number) =>
    horarios.find(
      (h) => h.hora_clase.dia === dia && h.hora_clase.id_hora_clase === idHora
    );

  const tabla = horasUnicas.map((hora) => {
    const fila = [`${hora.hora_inicio} - ${hora.hora_fin}`];
    for (const dia of diasSemana) {
      const h = obtenerHorario(dia, hora.id_hora_clase);
      fila.push(
        h
          ? `${h.asignatura.nombre}\nAula: ${h.aula.nombre}\nParalelo: ${h.paralelo}`
          : ""
      );
    }
    return fila;
  });

  const startY = dibujarEncabezadoUnificado(doc, img, nombre);

  autoTable(doc, {
    startY,
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
    alternateRowStyles: { fillColor: colores.blanco },
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
    tableLineColor: [200, 200, 200],
    tableLineWidth: 0.5,
  });

  window.open(doc.output("bloburl"), "_blank");
};
