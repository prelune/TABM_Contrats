import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export async function downloadContractAsPdf(elementId: string, filename: string): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id ${elementId} not found`);
    return;
  }

  try {
    // Generate high-resolution canvas with full scroll height captured
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: element.scrollWidth || 800,
      windowHeight: element.scrollHeight,
      x: 0,
      y: 0,
      scrollX: 0,
      scrollY: 0,
    });

    // A4 dimensions in mm: 210 x 297
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth(); // 210
    const pdfHeight = pdf.internal.pageSize.getHeight(); // 297

    // Ratio of A4 in pixels on this canvas
    const a4Ratio = 297 / 210;
    const pageHeightPx = Math.floor(canvas.width * a4Ratio);

    const totalPages = Math.max(1, Math.ceil(canvas.height / pageHeightPx));

    for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
      const sourceY = pageIndex * pageHeightPx;
      const remainingHeight = canvas.height - sourceY;
      const currentSliceHeight = Math.min(pageHeightPx, remainingHeight);

      // Create a clean canvas for this individual page
      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = canvas.width;
      pageCanvas.height = pageHeightPx;
      const pageCtx = pageCanvas.getContext('2d');

      if (pageCtx) {
        // Fill page with clean white background
        pageCtx.fillStyle = '#ffffff';
        pageCtx.fillRect(0, 0, pageCanvas.width, pageHeightPx);

        // Draw ONLY the slice belonging to this page
        pageCtx.drawImage(
          canvas,
          0,
          sourceY,
          canvas.width,
          currentSliceHeight,
          0,
          0,
          canvas.width,
          currentSliceHeight
        );

        const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.96);

        if (pageIndex > 0) {
          pdf.addPage();
        }

        pdf.addImage(pageImgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
      }
    }

    const cleanFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
    pdf.save(cleanFilename);
  } catch (error) {
    console.error('Erreur lors de la génération PDF via html2canvas:', error);
    // Fallback: window print dialog
    window.print();
  }
}

export function printContractDocument(elementId: string): void {
  const element = document.getElementById(elementId);
  if (!element) {
    window.print();
    return;
  }

  try {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      window.print();
      return;
    }

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html lang="fr">
        <head>
          <meta charset="utf-8">
          <title>Impression Contrat - TABM</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 15mm 15mm 15mm 15mm;
            }
            body {
              font-family: Georgia, Cambria, "Times New Roman", Times, serif;
              color: #111827;
              background: #fff;
              line-height: 1.5;
              font-size: 11pt;
              margin: 0;
              padding: 0;
            }
            .contract-page {
              max-width: 100%;
              margin: 0 auto;
            }
            h1, h2, h3, h4 {
              color: #0f172a;
            }
            .article-block {
              margin-bottom: 1.25rem;
              page-break-inside: avoid;
            }
            .signatures-block {
              margin-top: 2.5rem;
              page-break-inside: avoid;
            }
            table {
              width: 100%;
            }
          </style>
        </head>
        <body>
          <div class="contract-page">
            ${element.innerHTML}
          </div>
        </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (err) {
        console.warn('Iframe print failed, falling back to window.print', err);
        window.print();
      } finally {
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }, 3000);
      }
    }, 400);
  } catch (e) {
    console.warn('Fallback print:', e);
    window.print();
  }
}

