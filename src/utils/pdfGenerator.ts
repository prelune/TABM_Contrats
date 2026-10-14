/**
 * Module d'impression et de génération PDF natif haute fidélité.
 * Ouvre le dialogue d'impression / enregistrement PDF du navigateur avec un rendu
 * 100% vectoriel, net et rigoureusement identique à la prévisualisation écran.
 */
export function printContractDocument(elementId: string, documentTitle: string = 'Contrat de travail - TABM'): void {
  const element = document.getElementById(elementId);
  if (!element) {
    window.print();
    return;
  }

  // Récupérer toutes les feuilles de style actives dans l'application
  const activeStyles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
    .map((node) => node.outerHTML)
    .join('\n');

  try {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.opacity = '0';
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
          <title>${documentTitle}</title>
          ${activeStyles}
          <style>
            @page {
              size: A4 portrait;
              margin: 15mm 15mm 15mm 15mm;
            }
            * {
              box-sizing: border-box !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            html, body {
              background-color: #ffffff !important;
              color: #0f172a !important;
              margin: 0 !important;
              padding: 0 !important;
              width: 100% !important;
              font-family: Verdana, Geneva, sans-serif !important;
              font-size: 10pt !important;
              line-height: 1.28 !important;
            }
            .contract-print-page {
              width: 100% !important;
              max-width: 100% !important;
              margin: 0 auto !important;
              padding: 0 !important;
              background: #ffffff !important;
              box-shadow: none !important;
              border: none !important;
              font-family: Verdana, Geneva, sans-serif !important;
              font-size: 10pt !important;
              line-height: 1.28 !important;
            }
            .contract-print-page #contract-document-preview {
              border: none !important;
              box-shadow: none !important;
              padding: 0 !important;
              margin: 0 !important;
              width: 100% !important;
              max-width: 100% !important;
            }
            h1, h2, h3, h4, p, div, span, em, strong {
              font-family: Verdana, Geneva, sans-serif !important;
            }
            /* Respect strict de la disposition des blocs sans coupure orpheline */
            .article-block {
              page-break-inside: avoid !important;
              break-inside: avoid !important;
              margin-bottom: 1.5rem !important;
              font-family: Verdana, Geneva, sans-serif !important;
              font-size: 10pt !important;
              line-height: 1.28 !important;
            }
            .article-block h3 {
              font-size: 10pt !important;
              font-weight: bold !important;
              text-transform: uppercase !important;
              color: #0f172a !important;
              border-bottom: 1px solid #e2e8f0 !important;
              padding-bottom: 0.25rem !important;
              margin-bottom: 0.45rem !important;
              line-height: 1.25 !important;
            }
            .article-block div {
              font-family: Verdana, Geneva, sans-serif !important;
              font-size: 10pt !important;
              line-height: 1.28 !important;
              color: #1e293b !important;
            }
            .signatures-block {
              page-break-inside: avoid !important;
              break-inside: avoid !important;
              margin-top: 2rem !important;
              padding-top: 1.25rem !important;
              border-top: 2px solid #0f172a !important;
            }
            /* Alignement propre des signatures côte à côte */
            .signature-grid {
              display: flex !important;
              flex-direction: row !important;
              gap: 1.5rem !important;
              justify-content: space-between !important;
              padding-top: 0.25rem !important;
              padding-bottom: 0.5rem !important;
            }
            .signature-box {
              flex: 1 1 0% !important;
              border: 2px solid #94a3b8 !important;
              background-color: #f8fafc !important;
              border-radius: 0.5rem !important;
              padding: 1rem !important;
              min-height: 9.5rem !important;
              height: auto !important;
              display: flex !important;
              flex-direction: column !important;
              justify-content: space-between !important;
              box-sizing: border-box !important;
            }
            /* Le pied de page de l'établissement apparaît STRICTEMENT en fin de document (dernière page seulement) */
            .contract-footer-note {
              page-break-inside: avoid !important;
              break-inside: avoid !important;
              margin-top: 2rem !important;
              padding-top: 0.75rem !important;
              border-top: 1px solid #cbd5e1 !important;
              font-family: Verdana, Geneva, sans-serif !important;
              font-size: 7.5pt !important;
              color: #64748b !important;
              line-height: 1.25 !important;
              text-align: left !important;
              white-space: pre-line !important;
              display: block !important;
              position: static !important;
            }
            .no-print {
              display: none !important;
            }
          </style>
        </head>
        <body>
          <div class="contract-print-page">
            ${element.innerHTML}
          </div>
        </body>
      </html>
    `);
    doc.close();

    // Attendre l'injection des styles et le calcul de disposition avant d'imprimer
    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (err) {
        console.warn('Impression via iframe non disponible, basculement vers window.print :', err);
        window.print();
      } finally {
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }, 2500);
      }
    }, 350);
  } catch (err) {
    console.warn('Erreur lors de la préparation d\'impression :', err);
    window.print();
  }
}
