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



