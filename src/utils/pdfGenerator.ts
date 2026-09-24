/**
 * Module d'impression et de génération PDF natif haute fidélité.
 * Ouvre le dialogue d'impression / enregistrement PDF du navigateur avec un rendu
 * 100% vectoriel, net et rigoureusement conforme à la prévisualisation écran.
 */
export function printContractDocument(elementId: string): void {
  const element = document.getElementById(elementId);
  if (!element) {
    window.print();
    return;
  }

  // Récupérer toutes les feuilles de style et règles Tailwind actives dans l'application
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
          <title>Contrat de travail - TABM</title>
          ${activeStyles}
          <style>
            @page {
              size: A4 portrait;
              margin: 14mm 14mm 14mm 14mm;
            }
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              box-sizing: border-box !important;
            }
            html, body {
              background-color: #ffffff !important;
              color: #0f172a !important;
              margin: 0 !important;
              padding: 0 !important;
              width: 100% !important;
              font-family: Georgia, Cambria, "Times New Roman", Times, serif;
              font-size: 11pt;
              line-height: 1.5;
            }
            .contract-print-page {
              width: 100% !important;
              max-width: 100% !important;
              margin: 0 auto !important;
              padding: 0 !important;
              background: #ffffff !important;
              box-shadow: none !important;
              border: none !important;
            }
            /* Respect strict de la disposition des blocs */
            .article-block {
              page-break-inside: avoid !important;
              break-inside: avoid !important;
              margin-bottom: 1.25rem !important;
            }
            .signatures-block {
              page-break-inside: avoid !important;
              break-inside: avoid !important;
              margin-top: 2rem !important;
            }
            /* Sécurité d'affichage côte à côte des signatures */
            .signature-grid {
              display: grid !important;
              grid-template-columns: 1fr 1fr !important;
              gap: 2rem !important;
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

    // Attendre l'injection des styles et le chargement du document avant d'ouvrir l'impression
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
    }, 250);
  } catch (err) {
    console.warn('Erreur lors de la préparation d\'impression :', err);
    window.print();
  }
}
