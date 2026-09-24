import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Downloads a contract as a formatted multi-page PDF document.
 * Handles isolated cloning, high-DPI rasterization, and semantic block pagination
 * to avoid splitting lines or paragraphs in half.
 */
export async function downloadContractAsPdf(elementId: string, filename: string): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Élément #${elementId} introuvable pour la génération PDF`);
    window.print();
    return;
  }

  const cleanFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;

  // 1. Create an isolated off-screen container matching exact A4 proportions (794px width = 210mm @ 96DPI)
  const cloneWrapper = document.createElement('div');
  cloneWrapper.style.position = 'fixed';
  cloneWrapper.style.left = '-9999px';
  cloneWrapper.style.top = '0';
  cloneWrapper.style.width = '794px';
  cloneWrapper.style.backgroundColor = '#ffffff';
  cloneWrapper.style.color = '#0f172a';
  cloneWrapper.style.zIndex = '-9999';
  cloneWrapper.style.padding = '0';
  cloneWrapper.style.margin = '0';

  const clonedContent = element.cloneNode(true) as HTMLElement;
  // Ensure background and sizing are clean
  clonedContent.style.width = '794px';
  clonedContent.style.maxWidth = '794px';
  clonedContent.style.margin = '0 auto';
  clonedContent.style.backgroundColor = '#ffffff';
  clonedContent.style.boxShadow = 'none';
  clonedContent.style.border = 'none';

  cloneWrapper.appendChild(clonedContent);
  document.body.appendChild(cloneWrapper);

  try {
    // 2. Wait for any images in the cloned element to fully load
    const images = Array.from(cloneWrapper.querySelectorAll('img'));
    await Promise.all(
      images.map(
        (img) =>
          new Promise<void>((resolve) => {
            if (img.complete) {
              resolve();
            } else {
              img.onload = () => resolve();
              img.onerror = () => resolve();
            }
          })
      )
    );

    // 3. Try native jsPDF html() converter with semantic autoPaging
    let generatedSuccessfully = false;

    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });

      await new Promise<void>((resolve, reject) => {
        pdf.html(clonedContent, {
          x: 12,
          y: 12,
          width: 186, // 210mm - 24mm margins
          windowWidth: 794,
          autoPaging: 'text',
          margin: [12, 12, 12, 12],
          callback: (doc) => {
            try {
              doc.save(cleanFilename);
              generatedSuccessfully = true;
              resolve();
            } catch (saveErr) {
              reject(saveErr);
            }
          },
        });
      });
    } catch (jspdfHtmlError) {
      console.warn('jsPDF.html conversion non optimale, recours au mode canvas paginé haute résolution:', jspdfHtmlError);
    }

    if (generatedSuccessfully) {
      return;
    }

    // 4. Fallback: High-resolution canvas with smart block pagination
    const canvas = await html2canvas(clonedContent, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 794,
      scrollX: 0,
      scrollY: 0,
    });

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    // Ratio of A4 in pixels on this canvas
    const pageHeightPx = Math.floor(canvas.width * (297 / 210));
    const totalPages = Math.max(1, Math.ceil(canvas.height / pageHeightPx));

    for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
      const sourceY = pageIndex * pageHeightPx;
      const remainingHeight = canvas.height - sourceY;
      const currentSliceHeight = Math.min(pageHeightPx, remainingHeight);

      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = canvas.width;
      pageCanvas.height = pageHeightPx;
      const pageCtx = pageCanvas.getContext('2d');

      if (pageCtx) {
        pageCtx.fillStyle = '#ffffff';
        pageCtx.fillRect(0, 0, pageCanvas.width, pageHeightPx);

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

        const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.98);

        if (pageIndex > 0) {
          pdf.addPage();
        }

        pdf.addImage(pageImgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
      }
    }

    pdf.save(cleanFilename);
  } catch (error) {
    console.error('Erreur lors de la génération PDF, ouverture du dialogue impression:', error);
    printContractDocument(elementId);
  } finally {
    if (document.body.contains(cloneWrapper)) {
      document.body.removeChild(cloneWrapper);
    }
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
              text-align: left;
            }
            p, div {
              text-align: left;
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

