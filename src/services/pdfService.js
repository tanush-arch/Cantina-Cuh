import { jsPDF } from 'jspdf';

/**
 * Generate and download an accessible structured PDF summary of form responses
 * @param {Object} formData Form key-value data
 * @param {string} documentTitle Title of the document
 */
export function generateFormPDF(formData, documentTitle = 'Cantina Cuhh - Completed Form') {
  const doc = new jsPDF();

  // Document Styling & Accessible header
  doc.setFontSize(22);
  doc.setTextColor(20, 20, 20);
  doc.text('Cantina Cuhh', 20, 22);

  doc.setFontSize(14);
  doc.setTextColor(70, 70, 70);
  doc.text(documentTitle, 20, 32);

  doc.setFontSize(10);
  doc.setTextColor(110, 110, 110);
  const dateStr = new Date().toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  doc.text(`Generated on: ${dateStr}`, 20, 40);

  // Line separator
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(20, 45, 190, 45);

  // Content entries
  let yPosition = 56;
  doc.setFontSize(11);

  Object.entries(formData).forEach(([label, value]) => {
    // If running close to bottom of page, add page
    if (yPosition > 270) {
      doc.addPage();
      yPosition = 20;
    }

    // Question / Field Label
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 30, 30);
    doc.text(`${label}:`, 20, yPosition);

    // Answer / Value
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    const answerText = value ? String(value) : '(Not answered)';
    const splitText = doc.splitTextToSize(answerText, 165);
    doc.text(splitText, 25, yPosition + 6);

    yPosition += 8 + splitText.length * 5;
  });

  // Footer notes
  if (yPosition > 260) {
    doc.addPage();
    yPosition = 30;
  } else {
    yPosition = Math.max(yPosition + 10, 260);
  }

  doc.setDrawColor(220, 220, 220);
  doc.line(20, yPosition, 190, yPosition);
  doc.setFontSize(9);
  doc.setTextColor(130, 130, 130);
  doc.text('Note: This document was produced with Cantina Cuhh assistive technology.', 20, yPosition + 6);
  doc.text('Please verify all details before submitting to any official department.', 20, yPosition + 11);

  // Save / Trigger Download
  const fileName = `cantina-cuhh-form-${Date.now()}.pdf`;
  doc.save(fileName);
  return fileName;
}
