import { ContractArticle, ContractEmployeeData, ContractType, EmployeeStatus, Establishment } from '../types';
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

  const hasHours = Number(data.weeklyHours) > 0;
  const weeklyHoursNum = hasHours ? Number(data.weeklyHours) : 35;
  const monthlyHoursFormatted = (data.monthlyHours || (weeklyHoursNum * 52 / 12)).toFixed(2).replace('.', ',');
  const monthlySalaryStr = formatEuro(data.monthlyGrossSalary);
  const hourlyRateStr = formatEuro(data.hourlyRate);
  const pointValueStr = formatEuro(data.pointValue);

  const fullAddress = [data.address, data.postalCode, data.city].filter(Boolean).join(', ');
  const companyFullAddress = [data.companyAddress, data.companyCity].filter(Boolean).join(', ');

  const isTempsPartiel = data.workTimeRegime === 'temps_partiel';
  const regimeTravailLabel = isTempsPartiel ? 'Temps Partiel' : 'Temps Complet';
  const tempsTravailLabel = isTempsPartiel
    ? (hasHours ? `Temps partiel (${data.weeklyHours}h/semaine)` : 'Temps partiel')
    : (hasHours ? `Temps complet (${data.weeklyHours}h/semaine)` : 'Temps complet');

  const dureeHebdoStr = hasHours
    ? `${data.weeklyHours}h00`
    : (isTempsPartiel ? 'Temps partiel' : '35h00');

  const dureeMensuelleStr = hasHours
    ? `${monthlyHoursFormatted} heures`
    : (isTempsPartiel ? 'Horaire mensuel adapté' : '151,67 heures');

  const detailsRemplacement = data.replacedEmployeeName
    ? `Le présent contrat est conclu pour assurer le remplacement temporaire de ${data.replacedEmployeeName}${data.replacedEmployeeRole ? ` occupant le poste de ${data.replacedEmployeeRole}` : ''}.`
    : '';

  const isFeminine = (data.civility || '').trim().toLowerCase().startsWith('mme');

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
    '{{regime_travail}}': regimeTravailLabel,
    '{{temps_travail}}': tempsTravailLabel,
    '{{coefficient}}': String(data.coefficient || 0),
    '{{valeur_point}}': pointValueStr,
    '{{salaire_mensuel}}': monthlySalaryStr,
    '{{taux_horaire}}': hourlyRateStr,
    '{{duree_hebdo}}': dureeHebdoStr,
    '{{duree_mensuelle}}': dureeMensuelleStr,

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
    '{{date_anciennete_reprise}}': data.seniorityDate ? formatDateFrench(data.seniorityDate) : formatDateFrench(data.startDate),
    '{{anciennete}}': data.seniorityDate ? formatDateFrench(data.seniorityDate) : '______',

    // Balises directes de genre & accord féminin (M. vs Mme)
    '{{e}}': isFeminine ? 'e' : '',
    '{{E}}': isFeminine ? 'E' : '',
    '{{le_la}}': isFeminine ? 'la' : 'le',
    '{{Le_La}}': isFeminine ? 'La' : 'Le',
    '{{LE_LA}}': isFeminine ? 'LA' : 'LE',
    '{{un_une}}': isFeminine ? 'une' : 'un',
    '{{Un_Une}}': isFeminine ? 'Une' : 'Un',
    '{{UN_UNE}}': isFeminine ? 'UNE' : 'UN',
    '{{du_de_la}}': isFeminine ? 'de la' : 'du',
    '{{Du_De_la}}': isFeminine ? 'De la' : 'Du',
    '{{au_a_la}}': isFeminine ? 'à la' : 'au',
    '{{Au_A_la}}': isFeminine ? 'À la' : 'Au',
    '{{ce_cette}}': isFeminine ? 'cette' : 'ce',
    '{{Ce_Cette}}': isFeminine ? 'Cette' : 'Ce',
    '{{il_elle}}': isFeminine ? 'elle' : 'il',
    '{{Il_Elle}}': isFeminine ? 'Elle' : 'Il',
    '{{IL_ELLE}}': isFeminine ? 'ELLE' : 'IL',
    '{{lui_elle}}': isFeminine ? 'elle' : 'lui',
    '{{Lui_Elle}}': isFeminine ? 'Elle' : 'Lui',
    '{{salarie_e}}': isFeminine ? 'salariée' : 'salarié',
    '{{Salarie_e}}': isFeminine ? 'Salariée' : 'Salarié',
    '{{SALARIE_E}}': isFeminine ? 'SALARIÉE' : 'SALARIÉ',
    '{{engage_e}}': isFeminine ? 'engagée' : 'engagé',
    '{{Engage_e}}': isFeminine ? 'Engagée' : 'Engagé',
    '{{interesse_e}}': isFeminine ? 'intéressée' : 'intéressé',
    '{{Interesse_e}}': isFeminine ? 'Intéressée' : 'Intéressé',
    '{{conducteur_trice}}': isFeminine ? 'conductrice' : 'conducteur',
    '{{Conducteur_trice}}': isFeminine ? 'Conductrice' : 'Conducteur',
  };

  let compiled = text;

  // 1. Remplacement des balises personnalisées d'accord : {{accord:masculin|feminin}}, {{f:masculin|feminin}}, {{genre:masculin|feminin}}
  // Ou terminaisons : engagé{{f:e}}, soumis{{f:se}}, bon{{f:ne}}
  compiled = compiled.replace(/\{\{(?:accord|genre|f|feminin):([^{}]+)\}\}/gi, (_match, group: string) => {
    if (group.includes('|')) {
      const parts = group.split('|');
      const masc = parts[0] ?? '';
      const fem = parts[1] ?? '';
      return isFeminine ? fem : masc;
    }
    // Simple terminaison féminine
    return isFeminine ? group : '';
  });

  // 2. Remplacement des balises du dictionnaire
  Object.entries(tagsMap).forEach(([tag, val]) => {
    compiled = compiled.split(tag).join(val);
  });

  return compiled;

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

  if (data.workTimeRegime === 'temps_partiel' && (data.contractType === 'cdi' || data.contractType === 'cdd')) {
    title += ' (À TEMPS PARTIEL)';
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

  // Company preamble block in "ENTRE LES SOUSSIGNÉS"
  let companyPreamble = '';
  if (data.establishmentCompanyIntroText && data.establishmentCompanyIntroText.trim()) {
    companyPreamble = replaceContractTags(data.establishmentCompanyIntroText.trim(), data);
  } else {
    companyPreamble = `La société ${data.companyName},
Sise : ${data.companyAddress}, ${data.companyCity}
Représentée par ${data.companyRepresentative}, agissant en qualité de ${data.representativeRole},
Ci-après dénommée « L'Employeur » ou « La Société »,`;
  }

  // Employee preamble block in "ENTRE LES SOUSSIGNÉS"
  // Per user request:
  // - Supprimer le numéro de sécurité sociale
  // - Supprimer le "ci-après dénommé(e) le salarié"
  const employeePreamble = `${data.civility} ${data.firstName} ${data.lastName.toUpperCase()}
Demeurant : ${data.address}, ${data.postalCode} ${data.city}
Né(e) le : ${formatDateFrench(data.birthDate)} à ${data.birthPlace}
De nationalité : ${data.nationality}`;

  const partiesHtml = `
ENTRE LES SOUSSIGNÉS :

${companyPreamble}

D'une part,

ET :

${employeePreamble}

D'autre part,

IL A ÉTÉ CONVENU ET ARRÊTÉ CE QUI SUIT :
  `.trim();

  // Footer: strictly keep the customizable footer text (note de bas de page) from settings
  const legalFooter = data.establishmentFooterText ? data.establishmentFooterText.trim() : '';

  const footerHtml = `
Fait à ${data.companyCity || 'Lyon'}, le ${formatDateFrench(new Date().toISOString().slice(0, 10))},
En deux exemplaires originaux, dont un remis à chacune des parties.

(Faire précéder la signature de la mention manuscrite « Bon pour accord, lu et approuvé »)

POUR LA SOCIÉTÉ ${data.companyName.toUpperCase()}                   LE SALARIÉ
${data.companyRepresentative}                         ${data.firstName} ${data.lastName.toUpperCase()}
${data.representativeRole}
${legalFooter ? `\n__________________________________________________________________________________________\n${legalFooter}` : ''}
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

  if (data.establishmentFooterText && data.establishmentFooterText.trim()) {
    fullText += `___________________________________________________________\n`;
    fullText += `${data.establishmentFooterText.trim()}\n`;
  }

  return fullText;
}

/**
 * Calcule la période d'essai et la clause de renouvellement par défaut 
 * selon le type de contrat, le statut, les dates et les paramètres de l'établissement
 */
export function computeDefaultTrialPeriod({
  contractType,
  status,
  startDate,
  endDate,
  establishment,
}: {
  contractType: ContractType;
  status: EmployeeStatus;
  startDate?: string;
  endDate?: string;
  establishment?: Establishment;
}): { trialPeriod: string; trialPeriodRenewal: string; explanation: string; diffWeeks?: number } {
  const custom = establishment?.trialPeriods;

  // 1. CDD
  if (contractType === 'cdd') {
    let diffDays: number | null = null;
    let diffWeeks: number | null = null;
    let isUnder6Months = true;

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && end >= start) {
        diffDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);
        diffWeeks = Math.max(1, Math.round(diffDays / 7));
        isUnder6Months = diffDays <= 183;
      }
    }

    if (isUnder6Months) {
      // CDD de moins de 6 mois : 1 jour par semaine de contrat
      const customRule = custom?.cddUnder6Months?.trim();
      let trialPeriod = '';
      if (diffWeeks !== null) {
        trialPeriod = `${diffWeeks} jour${diffWeeks > 1 ? 's' : ''} (1 jour par semaine de contrat)`;
        if (customRule && customRule !== '1 jour par semaine de contrat') {
          trialPeriod = customRule.includes('{semaines}') || customRule.includes('{jours}')
            ? customRule.replace(/\{semaines\}|\{jours\}/g, String(diffWeeks))
            : `${diffWeeks} jour${diffWeeks > 1 ? 's' : ''} (${customRule})`;
        }
      } else {
        trialPeriod = customRule || '1 jour par semaine de contrat';
      }

      return {
        trialPeriod,
        trialPeriodRenewal: 'Non renouvelable (terme légal strict du CDD)',
        explanation: diffWeeks !== null 
          ? `CDD de ${diffWeeks} semaine${diffWeeks > 1 ? 's' : ''} (< 6 mois) : 1 jour par semaine calculé` 
          : 'CDD de moins de 6 mois : 1 jour par semaine de contrat',
        diffWeeks: diffWeeks || undefined,
      };
    } else {
      // CDD de plus de 6 mois : 1 mois
      const period = custom?.cddOver6Months?.trim() || '1 mois';
      return {
        trialPeriod: period,
        trialPeriodRenewal: 'Non renouvelable (terme légal strict du CDD)',
        explanation: 'CDD de plus de 6 mois : durée fixe de 1 mois',
      };
    }
  }

  // 2. Avenants et mutations
  if (contractType === 'avenant_cdd' || contractType === 'avenant_cdi' || contractType === 'convention_tripartite') {
    return {
      trialPeriod: 'Sans période d’essai (Continuité d’ancienneté)',
      trialPeriodRenewal: 'Sans objet',
      explanation: 'Avenant ou mutation : maintien de l’ancienneté acquise',
    };
  }

  // 3. CDI
  // Cadre : 4 mois
  // AMT : 3 mois (maitrise / haute_maitrise)
  // OUV, CDT, EMP : 2 mois (ouvrier, conducteur, employé)
  if (status === 'cadre') {
    const period = custom?.cdiCadre?.trim() || '4 mois';
    return {
      trialPeriod: period,
      trialPeriodRenewal: `renouvelable une fois pour une durée maximale de ${period}`,
      explanation: `CDI Cadre : ${period} (${establishment?.shortName || establishment?.name || 'Standard'})`,
    };
  }

  if (status === 'maitrise' || status === 'haute_maitrise') {
    const period = custom?.cdiMaitrise?.trim() || '3 mois';
    return {
      trialPeriod: period,
      trialPeriodRenewal: `renouvelable une fois pour une durée maximale de ${period}`,
      explanation: `CDI Maîtrise / AMT : ${period} (${establishment?.shortName || establishment?.name || 'Standard'})`,
    };
  }

  if (status === 'conducteur') {
    const period = custom?.cdiConducteur?.trim() || '2 mois';
    return {
      trialPeriod: period,
      trialPeriodRenewal: `renouvelable une fois pour une durée maximale de ${period}`,
      explanation: `CDI Conducteur (CDT) : ${period} (${establishment?.shortName || establishment?.name || 'Standard'})`,
    };
  }

  if (status === 'employé') {
    const period = custom?.cdiEmploye?.trim() || '2 mois';
    return {
      trialPeriod: period,
      trialPeriodRenewal: `renouvelable une fois pour une durée maximale de ${period}`,
      explanation: `CDI Employé (EMP) : ${period} (${establishment?.shortName || establishment?.name || 'Standard'})`,
    };
  }

  if (status === 'ouvrier') {
    const period = custom?.cdiOuvrier?.trim() || '2 mois';
    return {
      trialPeriod: period,
      trialPeriodRenewal: `renouvelable une fois pour une durée maximale de ${period}`,
      explanation: `CDI Ouvrier (OUV) : ${period} (${establishment?.shortName || establishment?.name || 'Standard'})`,
    };
  }

  // Fallback CDI
  return {
    trialPeriod: '2 mois',
    trialPeriodRenewal: 'renouvelable une fois pour une durée maximale de 2 mois',
    explanation: 'Durée légale par défaut : 2 mois',
  };
}



