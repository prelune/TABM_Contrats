import { ContractArticle, ContractEmployeeData } from '../types';
import { CONTRACT_TYPE_LABELS, EMPLOYEE_STATUS_LABELS } from '../data/defaultData';

export function formatEuro(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDateFrench(dateString?: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

export function calculateSalary(coefficient: number, pointValue: number, additionalBonus = 0, weeklyHours = 35): {
  monthlyGrossSalary: number;
  hourlyRate: number;
  monthlyHours: number;
} {
  const coeff = Number(coefficient) || 0;
  const pt = Number(pointValue) || 0;
  const baseSalary = Number((coeff * pt).toFixed(2));
  const totalMonthly = baseSalary + (Number(additionalBonus) || 0);
  const hours = Number(weeklyHours) > 0 ? Number(weeklyHours) : 35;
  const monthlyHours = Number(((hours * 52) / 12).toFixed(2)); // e.g. 151.67h for 35h
  const hourlyRate = monthlyHours > 0 ? Number((totalMonthly / monthlyHours).toFixed(2)) : 0;

  return {
    monthlyGrossSalary: totalMonthly,
    hourlyRate,
    monthlyHours,
  };
}

export function replaceContractTags(text: string, data: ContractEmployeeData): string {
  if (!text) return '';

  const monthlyHoursFormatted = (data.monthlyHours || (data.weeklyHours * 52 / 12)).toFixed(2).replace('.', ',');
  const monthlySalaryStr = formatEuro(data.monthlyGrossSalary);
  const hourlyRateStr = formatEuro(data.hourlyRate);
  const pointValueStr = formatEuro(data.pointValue);

  const fullAddress = [data.address, data.postalCode, data.city].filter(Boolean).join(', ');
  const companyFullAddress = [data.companyAddress, data.companyCity].filter(Boolean).join(', ');

  const detailsRemplacement = data.replacedEmployeeName
    ? `Le présent contrat est conclu pour assurer le remplacement temporaire de ${data.replacedEmployeeName}${data.replacedEmployeeRole ? ` occupant le poste de ${data.replacedEmployeeRole}` : ''}.`
    : '';

  const tagsMap: Record<string, string> = {
    '{{nom}}': data.lastName ? data.lastName.toUpperCase() : '______',
    '{{prenom}}': data.firstName || '______',
    '{{civilite}}': data.civility || 'M./Mme',
    '{{adresse}}': fullAddress || '______',
    '{{num_secu}}': data.socialSecurityNumber || '______',
    '{{date_naissance}}': formatDateFrench(data.birthDate) || '______',
    '{{lieu_naissance}}': data.birthPlace || '______',
    '{{nationalite}}': data.nationality || 'Française',

    '{{etablissement}}': data.establishmentName || data.companyName || 'TABM Transport',
    '{{siret}}': data.establishmentSiret || '482 910 324 00028',
    '{{code_ape}}': data.establishmentApe || '4939A',
    '{{societe}}': data.companyName || 'TABM Transport',
    '{{adresse_societe}}': companyFullAddress || '______',
    '{{representant_societe}}': data.companyRepresentative || 'Le représentant légal',
    '{{role_representant}}': data.representativeRole || 'Directeur Général',
    '{{convention_collective}}': data.collectiveAgreement || 'Convention Collective Nationale des Transports Routiers',

    '{{metier}}': data.jobTitle || '______',
    '{{statut}}': EMPLOYEE_STATUS_LABELS[data.status] || data.status,
    '{{type_contrat}}': CONTRACT_TYPE_LABELS[data.contractType] || data.contractType,
    '{{coefficient}}': String(data.coefficient || 0),
    '{{valeur_point}}': pointValueStr,
    '{{salaire_mensuel}}': monthlySalaryStr,
    '{{taux_horaire}}': hourlyRateStr,
    '{{duree_hebdo}}': `${data.weeklyHours || 35}h00`,
    '{{duree_mensuelle}}': `${monthlyHoursFormatted} heures`,

    '{{date_debut}}': formatDateFrench(data.startDate) || '______',
    '{{date_fin}}': formatDateFrench(data.endDate) || '______',
    '{{motif_recours}}': data.cddReason || 'Nécessités de service',
    '{{details_remplacement}}': detailsRemplacement,
    '{{periode_essai}}': data.trialPeriod || '2 mois',
    '{{modalites_renouvellement}}': data.trialPeriodRenewal ? `Elle est ${data.trialPeriodRenewal}.` : '',
    '{{lieu_travail}}': data.workplaceDepot || 'Dépôt principal',
    '{{zone_mobilite}}': data.mobilityZone || 'Réseau et lignes de la société',
    '{{permis_requis}}': data.requiredLicenses || 'Permis et habilitations réglementaires conformes au poste',
    '{{date_signature}}': formatDateFrench(new Date().toISOString().slice(0, 10)),
    '{{date_anciennete_reprise}}': formatDateFrench(data.startDate),
  };

  let compiled = text;
  Object.entries(tagsMap).forEach(([tag, val]) => {
    // Replace all instances of the tag
    compiled = compiled.split(tag).join(val);
  });

  return compiled;
}

export function stripArticlePrefix(title: string): string {
  // Strip patterns like "Article 1 - ", "Article 02 : ", "Article Spécifique - ", "ARTICLE 12 – "
  return title
    .replace(/^article\s*(spécifique\s*[-–—:]\s*)?/i, '')
    .replace(/^\d+\s*[-–—:]\s*/i, '')
    .trim();
}

export function getContractFileName(
  firstName: string,
  lastName: string,
  extension: 'pdf' | 'doc' | 'txt' = 'pdf'
): string {
  const cleanFirst = (firstName || 'Prenom').trim();
  const cleanLast = (lastName || 'Nom').trim().toUpperCase();
  // Exact user requested format: "prenom - nom - contrat de travail"
  return `${cleanFirst} - ${cleanLast} - contrat de travail.${extension}`;
}

export function generateContractDocument(
  data: ContractEmployeeData,
  articles: ContractArticle[],
  selectedIds: string[],
  customContentMap: Record<string, string> = {}
): {
  title: string;
  headerHtml: string;
  partiesHtml: string;
  compiledArticles: { id: string; code: string; articleNumber: number; title: string; cleanTitle: string; text: string }[];
  footerHtml: string;
} {
  let title = 'CONTRAT DE TRAVAIL';
  if (data.contractType === 'cdi') {
    title = 'CONTRAT DE TRAVAIL À DURÉE INDÉTERMINÉE';
  } else if (data.contractType === 'cdd') {
    title = 'CONTRAT DE TRAVAIL À DURÉE DÉTERMINÉE';
  } else if (data.contractType === 'avenant_cdd') {
    title = 'AVENANT DE RENOUVELLEMENT DE CONTRAT À DURÉE DÉTERMINÉE';
  } else if (data.contractType === 'avenant_cdi') {
    title = 'AVENANT DE PASSAGE EN CONTRAT À DURÉE INDÉTERMINÉE';
  } else if (data.contractType === 'convention_tripartite') {
    title = 'CONVENTION TRIPARTITE DE MUTATION DE PERSONNEL';
  }

  // Filter and sort articles
  const selectedArticles = articles
    .filter((art) => selectedIds.includes(art.id))
    .sort((a, b) => a.order - b.order);

  // Strictly incremental article numbering: Article 1, Article 2, Article 3...
  const compiledArticles = selectedArticles.map((art, index) => {
    const articleNumber = index + 1;
    let rawContent = customContentMap[art.id] || art.content;
    
    // Replace any dynamic {{numero_article}} inside text
    rawContent = rawContent.split('{{numero_article}}').join(articleNumber.toString());
    
    const compiled = replaceContractTags(rawContent, data);
    const cleanTitle = stripArticlePrefix(art.title);
    const incrementalTitle = `Article ${articleNumber} - ${cleanTitle}`;

    return {
      id: art.id,
      code: art.code,
      articleNumber,
      title: incrementalTitle,
      cleanTitle,
      text: compiled,
    };
  });

  const partiesHtml = `
ENTRE LES SOUSSIGNÉS :

La société ${data.companyName},
Sise : ${data.companyAddress}, ${data.companyCity}
Représentée par ${data.companyRepresentative}, agissant en qualité de ${data.representativeRole},
Ci-après dénommée « L'Employeur » ou « La Société »,

D'une part,

ET :

${data.civility} ${data.firstName} ${data.lastName.toUpperCase()}
Demeurant : ${data.address}, ${data.postalCode} ${data.city}
Né(e) le : ${formatDateFrench(data.birthDate)} à ${data.birthPlace}
De nationalité : ${data.nationality}
Numéro de Sécurité Sociale : ${data.socialSecurityNumber}
Ci-après dénommé(e) « Le Salarié »,

D'autre part,

IL A ÉTÉ CONVENU ET ARRÊTÉ CE QUI SUIT :
  `.trim();

  const customFooterNotice = data.establishmentFooterText ? ` | ${data.establishmentFooterText}` : '';
  const legalFooter = `Raison Sociale : ${data.companyName} | ${data.companyAddress}, ${data.companyCity} | SIRET : ${data.establishmentSiret || '482 910 324 00028'} | APE : ${data.establishmentApe || '4939A'} | ${data.collectiveAgreement}${customFooterNotice}`;

  const footerHtml = `
Fait à ${data.companyCity || 'Lyon'}, le ${formatDateFrench(new Date().toISOString().slice(0, 10))},
En deux exemplaires originaux, dont un remis à chacune des parties.

(Faire précéder la signature de la mention manuscrite « Bon pour accord, lu et approuvé »)

POUR LA SOCIÉTÉ ${data.companyName.toUpperCase()}                   LE SALARIÉ
${data.companyRepresentative}                         ${data.firstName} ${data.lastName.toUpperCase()}
${data.representativeRole}

__________________________________________________________________________________________
${legalFooter}
  `.trim();

  return {
    title,
    headerHtml: `${data.companyName} — ${data.collectiveAgreement}`,
    partiesHtml,
    compiledArticles,
    footerHtml,
  };
}

/**
 * Returns full plain text of the contract for instant clipboard copy into Word
 */
export function getContractAsPlainText(
  data: ContractEmployeeData,
  articles: ContractArticle[],
  selectedIds: string[]
): string {
  const doc = generateContractDocument(data, articles, selectedIds);
  
  let fullText = `${data.companyName.toUpperCase()}\n`;
  fullText += `${data.companyAddress}, ${data.companyCity}\n`;
  fullText += `${data.collectiveAgreement}\n\n`;
  fullText += `===========================================================\n`;
  fullText += `${doc.title}\n`;
  fullText += `Statut : ${data.status.toUpperCase()} • Poste : ${data.jobTitle}\n`;
  fullText += `===========================================================\n\n`;
  fullText += `${doc.partiesHtml}\n\n`;

  doc.compiledArticles.forEach((art) => {
    fullText += `-----------------------------------------------------------\n`;
    fullText += `${art.title.toUpperCase()}\n`;
    fullText += `-----------------------------------------------------------\n`;
    fullText += `${art.text}\n\n`;
  });

  fullText += `\nFait à ${data.companyCity || 'Lyon'}, le ${new Date().toLocaleDateString('fr-FR')}, en deux exemplaires originaux.\n`;
  fullText += `(Mention manuscrite « Bon pour accord, lu et approuvé » avant signature)\n\n`;
  fullText += `Pour la Société ${data.companyName}                  Le Salarié\n`;
  fullText += `${data.companyRepresentative} (${data.representativeRole})     ${data.civility} ${data.firstName} ${data.lastName.toUpperCase()}\n\n`;

  return fullText;
}

/**
 * Exports contract to formatted Microsoft Word compatible document (.doc / HTML Word)
 */
export function exportContractToWordDocument(
  data: ContractEmployeeData,
  articles: ContractArticle[],
  selectedIds: string[],
  filename: string
): void {
  const doc = generateContractDocument(data, articles, selectedIds);

  const articlesHtml = doc.compiledArticles
    .map(
      (art) => `
      <div style="margin-bottom: 18pt; page-break-inside: avoid; mso-break-inside: avoid;">
        <h3 style="font-family: Arial, sans-serif; font-size: 11pt; font-weight: bold; color: #0f172a; border-bottom: 1pt solid #cbd5e1; padding-bottom: 4pt; margin-top: 14pt; margin-bottom: 8pt; text-transform: uppercase; text-align: left;">
          ${art.title}
        </h3>
        <p style="font-family: 'Times New Roman', Times, serif; font-size: 11pt; line-height: 1.5; text-align: left; color: #1e293b; margin: 0 0 10pt 0;">
          ${art.text.replace(/\n/g, '<br/>')}
        </p>
      </div>
    `
    )
    .join('');

  const wordContent = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>${doc.title}</title>
      <!--[if gte mso 9]>
      <xml>
        <w:WordDocument>
          <w:View>Print</w:View>
          <w:Zoom>100</w:Zoom>
          <w:DoNotOptimizeForBrowser/>
        </w:WordDocument>
      </xml>
      <![endif]-->
      <style>
        <!--
        @page Section1 {
          size: 595.3pt 841.9pt; /* A4 */
          margin: 70.85pt 56.7pt 70.85pt 56.7pt;
          mso-header-margin: 35.4pt;
          mso-footer-margin: 35.4pt;
          mso-header: h1;
          mso-footer: f1;
          mso-paper-source: 0;
        }
        div.Section1 {
          page: Section1;
        }
        p.MsoHeader, div.MsoHeader {
          margin: 0cm;
          margin-bottom: .0001pt;
          mso-pagination: widow-orphan;
          font-size: 8.5pt;
          font-family: Arial, sans-serif;
        }
        p.MsoFooter, div.MsoFooter {
          margin: 0cm;
          margin-bottom: .0001pt;
          mso-pagination: widow-orphan;
          font-size: 8.0pt;
          font-family: Arial, sans-serif;
        }
        body {
          font-family: 'Times New Roman', Times, serif;
          font-size: 11pt;
          line-height: 1.5;
          color: #111827;
          text-align: left;
        }
        p {
          text-align: left;
          margin: 0 0 10pt 0;
        }
        h1 {
          font-family: Arial, sans-serif;
          font-size: 14pt;
          font-weight: bold;
          text-align: center;
          text-transform: uppercase;
          letter-spacing: 0.5pt;
          margin: 15pt 0 6pt 0;
          color: #0f172a;
        }
        .parties-box {
          background-color: #f8fafc;
          border: 1pt solid #cbd5e1;
          padding: 12pt;
          margin: 14pt 0 18pt 0;
          font-size: 10.5pt;
          line-height: 1.5;
          text-align: left;
        }
        -->
      </style>
    </head>
    <body lang="FR">
      <div class="Section1">
        <!-- VRAIE EN-TÊTE WORD DÉDIÉE (répétée en haut de chaque page de document) -->
        <div style="mso-element:header" id="h1">
          <div class="MsoHeader">
            <table border="0" cellspacing="0" cellpadding="0" width="100%" style="width:100%; border-bottom: 1.5pt solid #1e3a8a; padding-bottom: 6pt; margin-bottom: 12pt;">
              <tr>
                ${data.establishmentLogoUrl ? `<td width="115" style="vertical-align: middle; padding-right: 12pt;"><img src="${data.establishmentLogoUrl}" width="100" style="max-height: 46pt; height: auto;" alt="Logo" /></td>` : ''}
                <td style="vertical-align: middle; text-align: left;">
                  <p style="margin:0; font-family: Arial, sans-serif; font-size: 11pt; font-weight: bold; color: #1e3a8a; text-align: left;">
                    ${data.companyName.toUpperCase()}
                  </p>
                  ${data.establishmentName ? `<p style="margin:0; font-family: Arial, sans-serif; font-size: 9.5pt; font-weight: bold; color: #2563eb; text-align: left;">${data.establishmentName}</p>` : ''}
                  <p style="margin:0; font-family: Arial, sans-serif; font-size: 8pt; color: #64748b; text-align: left;">
                    ${data.companyAddress}, ${data.companyCity} — ${data.collectiveAgreement}
                  </p>
                </td>
                <td style="vertical-align: middle; text-align: right; width: 140pt;">
                  <p style="margin:0; font-family: Arial, sans-serif; font-size: 8.5pt; font-weight: bold; color: #475569; text-align: right;">
                    DOCUMENT CONTRACTUEL RH
                  </p>
                  <p style="margin:0; font-family: Arial, sans-serif; font-size: 8pt; color: #64748b; text-align: right;">
                    Statut : ${data.status.toUpperCase()}
                  </p>
                </td>
              </tr>
            </table>
          </div>
        </div>

        <!-- VRAI PIED DE PAGE WORD DÉDIÉ (répété en bas de chaque page de document) -->
        <div style="mso-element:footer" id="f1">
          <div class="MsoFooter">
            <table border="0" cellspacing="0" cellpadding="0" width="100%" style="width:100%; border-top: 1pt solid #cbd5e1; padding-top: 5pt; font-family: Arial, sans-serif; font-size: 8pt; color: #64748b;">
              <tr>
                <td style="text-align: left; vertical-align: top; width: 85%;">
                  <p style="margin:0; text-align: left; font-size: 8pt; color: #64748b; line-height: 1.3;">
                    Raison Sociale : <strong>${data.companyName}</strong> — SIRET : ${data.establishmentSiret || '482 910 324 00028'} — APE : ${data.establishmentApe || '4939A'} — ${data.companyAddress}, ${data.companyCity}
                  </p>
                  ${data.establishmentFooterText ? `<p style="margin:2pt 0 0 0; text-align: left; font-size: 7.5pt; font-style: italic; color: #475569;">${data.establishmentFooterText}</p>` : ''}
                </td>
                <td style="text-align: right; vertical-align: top; width: 15%; font-family: Arial, sans-serif; font-size: 8pt; color: #64748b;">
                  <p style="margin:0; text-align: right;">
                    <!--[if supportFields]>
                    <span class="msoPageNumber">Page <span style="mso-field-code: PAGE "></span> / <span style="mso-field-code: NUMPAGES "></span></span>
                    <![endif]-->
                  </p>
                </td>
              </tr>
            </table>
          </div>
        </div>

        <!-- CORPS DU CONTRAT -->
        <h1>${doc.title}</h1>
        <p style="text-align: center; font-family: Arial, sans-serif; font-size: 10pt; color: #475569; margin-top: -6pt; margin-bottom: 18pt;">
          Poste : <strong>${data.jobTitle}</strong> • Coefficient : <strong>${data.coefficient}</strong> • Temps : <strong>${data.weeklyHours}h/semaine</strong>
        </p>

        <div class="parties-box">
          <p style="margin: 0; font-family: 'Times New Roman', Times, serif; font-size: 10.5pt; line-height: 1.5; text-align: left; color: #1e293b;">
            ${doc.partiesHtml.replace(/\n/g, '<br/>')}
          </p>
        </div>

        ${articlesHtml}

        <!-- BLOC DE SIGNATURES SPATIEUX POUR WORD -->
        <div style="margin-top: 30pt; page-break-inside: avoid; mso-break-inside: avoid;">
          <p style="font-family: Arial, sans-serif; font-size: 10pt; color: #334155; margin-bottom: 12pt; text-align: left;">
            Fait à ${data.companyCity || 'Lyon'}, le ${new Date().toLocaleDateString('fr-FR')}, en deux exemplaires originaux.<br/>
            <span style="font-style: italic; font-size: 9pt; color: #64748b;">(Faire précéder chaque signature de la mention manuscrite « Bon pour accord, lu et approuvé »)</span>
          </p>

          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="width: 100%; border-collapse: separate;">
            <tr>
              <!-- Carré Signature Employeur -->
              <td width="48%" style="width: 48%; border: 1.5pt solid #475569; background-color: #f8fafc; padding: 14pt; vertical-align: top; height: 180pt;">
                <p style="margin: 0; font-family: Arial, sans-serif; font-size: 10pt; font-weight: bold; text-transform: uppercase; color: #0f172a; text-align: left;">
                  Pour la Société ${data.companyName}
                </p>
                <p style="margin: 4pt 0 0 0; font-family: Arial, sans-serif; font-size: 9.5pt; color: #334155; text-align: left;">
                  ${data.companyRepresentative}<br/>(${data.representativeRole})
                </p>
                <p style="margin: 14pt 0 0 0; font-family: Arial, sans-serif; font-size: 8.5pt; color: #64748b; font-style: italic; text-align: left;">
                  Mention manuscrite et signature autorisée :
                </p>
                <!-- Espace réservé pour la signature manuscrite -->
                <div style="height: 100pt; min-height: 100pt;">&nbsp;</div>
              </td>

              <!-- Séparation -->
              <td width="4%" style="width: 4%;">&nbsp;</td>

              <!-- Carré Signature Salarié -->
              <td width="48%" style="width: 48%; border: 1.5pt solid #475569; background-color: #f8fafc; padding: 14pt; vertical-align: top; height: 180pt;">
                <p style="margin: 0; font-family: Arial, sans-serif; font-size: 10pt; font-weight: bold; text-transform: uppercase; color: #0f172a; text-align: left;">
                  Le Salarié
                </p>
                <p style="margin: 4pt 0 0 0; font-family: Arial, sans-serif; font-size: 9.5pt; color: #334155; text-align: left;">
                  ${data.civility} ${data.firstName} ${data.lastName.toUpperCase()}
                </p>
                <p style="margin: 14pt 0 0 0; font-family: Arial, sans-serif; font-size: 8.5pt; color: #64748b; font-style: italic; text-align: left;">
                  Mention manuscrite et signature :
                </p>
                <!-- Espace réservé pour la signature manuscrite -->
                <div style="height: 100pt; min-height: 100pt;">&nbsp;</div>
              </td>
            </tr>
          </table>
        </div>
      </div>
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff', wordContent], {
    type: 'application/msword;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.doc') ? filename : `${filename}.doc`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 200);
}

