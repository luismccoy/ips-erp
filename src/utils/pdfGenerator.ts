import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface RIPSData {
    codigoPrestador: string;
    fechaConsulta: string;
    numeroDocumento: string;
    codigoDiagnosticoPrincipal: string;
    valoracionClinica: {
        glasgow: number | null;
        dolor: number | null;
        braden: number | null;
        morse: number | null;
        news: number | null;
        barthel: number | null;
        norton: number | null;
        rass: number | null;
        alertas: string[];
        observaciones: string;
    };
}

export function generateRIPSPDF(data: RIPSData): jsPDF {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('REPORTE RIPS - VALORACION CLINICA', pageWidth / 2, 20, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Resolucion 2275/2023 - Ministerio de Salud', pageWidth / 2, 28, { align: 'center' });

    doc.setDrawColor(200);
    doc.setFillColor(245, 245, 245);
    doc.roundedRect(14, 35, pageWidth - 28, 30, 3, 3, 'FD');

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Informacion del Paciente', 20, 44);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Documento: ${data.numeroDocumento}`, 20, 52);
    doc.text(`Fecha Consulta: ${data.fechaConsulta}`, 100, 52);
    doc.text(`Diagnostico (CIE-10): ${data.codigoDiagnosticoPrincipal}`, 20, 60);
    doc.text(`Prestador: ${data.codigoPrestador}`, 100, 60);

    const vc = data.valoracionClinica;
    autoTable(doc, {
        startY: 75,
        head: [['Escala Clinica', 'Valor', 'Rango Normal', 'Estado']],
        body: [
            ['Glasgow (GCS)', vc.glasgow?.toString() || 'N/A', '15', getStatus(vc.glasgow, 15, 13)],
            ['Dolor (EVA)', vc.dolor?.toString() || 'N/A', '0-3', getStatus(10 - (vc.dolor || 0), 7, 4)],
            ['Braden', vc.braden?.toString() || 'N/A', '19-23', getStatus(vc.braden, 18, 12)],
            ['Morse', vc.morse?.toString() || 'N/A', '0-24', getStatus(125 - (vc.morse || 0), 100, 80)],
            ['NEWS', vc.news?.toString() || 'N/A', '0-4', getStatus(20 - (vc.news || 0), 16, 13)],
            ['Barthel', vc.barthel?.toString() || 'N/A', '100', getStatus(vc.barthel, 90, 60)],
            ['Norton', vc.norton?.toString() || 'N/A', '16-20', getStatus(vc.norton, 14, 10)],
            ['RASS', vc.rass?.toString() || 'N/A', '0', Math.abs(vc.rass || 0) <= 1 ? 'OK' : 'ALTERADO']
        ],
        theme: 'grid',
        headStyles: { fillColor: [37, 99, 235], textColor: 255 },
        alternateRowStyles: { fillColor: [249, 250, 251] },
        columnStyles: {
            0: { fontStyle: 'bold' },
            3: { halign: 'center' }
        }
    });

    const finalY = (doc as any).lastAutoTable.finalY + 10;

    if (vc.alertas.length > 0) {
        doc.setFillColor(254, 243, 199);
        doc.roundedRect(14, finalY, pageWidth - 28, 10 + vc.alertas.length * 6, 3, 3, 'F');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text('Alertas Clinicas', 20, finalY + 8);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        vc.alertas.forEach((alert, i) => {
            doc.text(`- ${alert}`, 25, finalY + 16 + i * 6);
        });
    }

    const obsY = vc.alertas.length > 0 ? finalY + 20 + vc.alertas.length * 6 : finalY;
    if (vc.observaciones) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text('Observaciones:', 14, obsY);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        const splitObs = doc.splitTextToSize(vc.observaciones, pageWidth - 28);
        doc.text(splitObs, 14, obsY + 8);
    }

    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setFontSize(8);
    doc.setTextColor(128);
    doc.text(`Generado: ${new Date().toLocaleString('es-CO')} | IPS-ERP Sistema`, pageWidth / 2, pageHeight - 10, { align: 'center' });

    return doc;
}

function getStatus(value: number | null, good: number, warning: number): string {
    if (value === null) return 'SIN DATOS';
    if (value >= good) return 'OK';
    if (value >= warning) return 'PRECAUCION';
    return 'CRITICO';
}

export function downloadRIPSPDF(data: RIPSData, filename?: string): void {
    const doc = generateRIPSPDF(data);
    doc.save(filename || `RIPS_${data.numeroDocumento}_${data.fechaConsulta}.pdf`);
}
