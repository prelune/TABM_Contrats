import * as XLSX from 'xlsx';
import { 
  AppDatabase, 
  JobPosition, 
  ContractArticle, 
  ContractTemplate, 
  GeneratedContract, 
  Establishment, 
  WorkflowStepConfig,
  ContractWorkflowSteps
} from '../types';
import { 
  DEFAULT_SETTINGS, 
  DEFAULT_ESTABLISHMENTS, 
  DEFAULT_WORKFLOW_STEPS, 
  DEFAULT_JOBS, 
  DEFAULT_ARTICLES, 
  DEFAULT_TEMPLATES 
} from '../data/defaultData';

export function createEmptyDatabase(): AppDatabase {
  return {
    version: '2.0',
    exportedAt: new Date().toISOString(),
    settings: { ...DEFAULT_SETTINGS },
    establishments: [...DEFAULT_ESTABLISHMENTS],
    workflowSteps: [...DEFAULT_WORKFLOW_STEPS],
    jobs: [],
    articles: [],
    templates: [],
    contracts: [],
  };
}

export function createSampleDatabase(): AppDatabase {
  const defaultEtab1 = DEFAULT_ESTABLISHMENTS[0];
  const defaultEtab2 = DEFAULT_ESTABLISHMENTS[1];

  return {
    version: '2.0',
    exportedAt: new Date().toISOString(),
    settings: { ...DEFAULT_SETTINGS },
    establishments: [...DEFAULT_ESTABLISHMENTS],
    workflowSteps: [...DEFAULT_WORKFLOW_STEPS],
    jobs: [...DEFAULT_JOBS],
    articles: [...DEFAULT_ARTICLES],
    templates: [...DEFAULT_TEMPLATES],
    contracts: [
      {
        id: 'sample-contract-1',
        contractNumber: 'TABM-2026-001',
        createdAt: '2026-09-15',
        employeeData: {
          civility: 'M.',
          lastName: 'DUBOIS',
          firstName: 'Alexandre',
          birthDate: '1992-04-12',
          birthPlace: 'Villeurbanne (69)',
          nationality: 'Française',
          socialSecurityNumber: '1 92 04 69 384 102 44',
          address: '18 Rue Paul Bert',
          postalCode: '69003',
          city: 'Lyon',

          // Établissement
          establishmentId: defaultEtab1.id,
          establishmentName: defaultEtab1.name,
          establishmentSiret: defaultEtab1.siret,
          establishmentApe: defaultEtab1.ape,
          establishmentLogoUrl: defaultEtab1.logoUrl,
          establishmentFooterText: defaultEtab1.footerText,

          companyName: defaultEtab1.companyName,
          companyAddress: defaultEtab1.address,
          companyCity: `${defaultEtab1.postalCode} ${defaultEtab1.city}`,
          companyRepresentative: defaultEtab1.director,
          representativeRole: defaultEtab1.directorRole,
          collectiveAgreement: defaultEtab1.collectiveAgreement,

          contractType: 'cdi',
          status: 'conducteur',
          workTimeRegime: 'temps_plein',
          jobTitle: 'Conducteur(trice) Receveur Lignes Régulières',
          coefficient: 140,
          pointValue: 10.92,
          monthlyGrossSalary: 1528.80,
          hourlyRate: 10.08,
          weeklyHours: 35,
          monthlyHours: 151.67,
          startDate: '2026-10-01',
          trialPeriod: '2 mois renouvelable',
          trialPeriodRenewal: 'renouvelable une fois pour une durée maximale de 2 mois',
          workplaceDepot: 'Dépôt Lyon Vaise',
          mobilityZone: 'Réseau métropolitain et lignes urbaines TABM',
          requiredLicenses: 'Permis D, FIMO Voyageurs, Carte de qualification conducteur valide',
        },
        selectedArticleIds: [
          'art-engagement',
          'art-cdi-prise-effet',
          'art-fonctions',
          'art-lieu-mobilite',
          'art-duree-travail',
          'art-remuneration-point',
          'art-specificite-transport',
          'art-securite-vehicule',
          'art-urbain-billetterie-saeiv',
          'art-secret-loyaute',
          'art-prevoyance-sante',
        ],
        renderedFullText: '',
        status: 'partially_signed',
        workflow: {
          checklist: {
            sentWithinDeadline: true,
            employeeSigned: true,
            directorSigned: false,
            dpaeCompleted: true,
            medicalVisitCompleted: true,
            licensesVerified: true,
            uniformDelivered: true,
            storedInSharepoint: false,
          },
          sentWithinDeadline: true,
          sentDate: '2026-09-15',
          employeeSigned: true,
          employeeSignedDate: '2026-09-18',
          directorSigned: false,
          dpaeCompleted: true,
          medicalVisitCompleted: true,
          licensesVerified: true,
          storedInSharepoint: false,
          sharepointUrl: 'https://tabm-transport.sharepoint.com/rh/recrutements/2026/DUBOIS_Alexandre_CDI.pdf',
          notes: 'Permis D et FIMO contrôlés. Tenue et badge délivrés. En attente visa directeur.',
        },
      },
      {
        id: 'sample-contract-2',
        contractNumber: 'TABM-2026-002',
        createdAt: '2026-09-18',
        employeeData: {
          civility: 'Mme',
          lastName: 'BENALI',
          firstName: 'Samia',
          birthDate: '1988-11-23',
          birthPlace: 'Vénissieux (69)',
          nationality: 'Française',
          socialSecurityNumber: '2 88 11 69 512 874 12',
          address: '42 Avenue Jean Jaurès',
          postalCode: '69007',
          city: 'Lyon',

          // Établissement
          establishmentId: defaultEtab2.id,
          establishmentName: defaultEtab2.name,
          establishmentSiret: defaultEtab2.siret,
          establishmentApe: defaultEtab2.ape,
          establishmentLogoUrl: defaultEtab2.logoUrl,
          establishmentFooterText: defaultEtab2.footerText,

          companyName: defaultEtab2.companyName,
          companyAddress: defaultEtab2.address,
          companyCity: `${defaultEtab2.postalCode} ${defaultEtab2.city}`,
          companyRepresentative: defaultEtab2.director,
          representativeRole: defaultEtab2.directorRole,
          collectiveAgreement: defaultEtab2.collectiveAgreement,

          contractType: 'cdi',
          status: 'maitrise',
          workTimeRegime: 'temps_plein',
          jobTitle: 'Dispatcheur / Régulateur de Réseau',
          coefficient: 160,
          pointValue: 10.92,
          monthlyGrossSalary: 1747.20,
          hourlyRate: 11.52,
          weeklyHours: 35,
          monthlyHours: 151.67,
          startDate: '2026-10-15',
          trialPeriod: '3 mois renouvelable',
          trialPeriodRenewal: 'renouvelable une fois pour une durée de 3 mois',
          workplaceDepot: 'Poste Central de Contrôle (PCC) - Lyon Part-Dieu',
          mobilityZone: 'Ensemble des dépôts et centres régionaux TABM',
          requiredLicenses: 'Attestation de formation SAEIV et régulation trafic',
        },
        selectedArticleIds: [
          'art-engagement',
          'art-cdi-prise-effet',
          'art-fonctions',
          'art-lieu-mobilite',
          'art-duree-travail',
          'art-remuneration-point',
          'art-secret-loyaute',
          'art-non-concurrence',
          'art-prevoyance-sante',
        ],
        renderedFullText: '',
        status: 'pending_signature',
        workflow: {
          checklist: {
            sentWithinDeadline: true,
            employeeSigned: false,
            directorSigned: true,
            dpaeCompleted: true,
            medicalVisitCompleted: false,
            licensesVerified: true,
            uniformDelivered: false,
            storedInSharepoint: false,
          },
          sentWithinDeadline: true,
          sentDate: '2026-09-18',
          employeeSigned: false,
          directorSigned: true,
          directorSignedDate: '2026-09-18',
          dpaeCompleted: true,
          medicalVisitCompleted: false,
          licensesVerified: true,
          storedInSharepoint: false,
          sharepointUrl: '',
          notes: 'Contrat transmis par voie électronique, attente retour collaboratrice.',
        },
      },
    ],
  };
}

export function exportDatabaseToExcel(db: AppDatabase, filenamePrefix = 'TABM_Contrats_Sauvegarde'): void {
  const wb = XLSX.utils.book_new();

  // 1. Feuille PARAMETRES (Configuration globale, branding, baselines et société)
  const settingsRows = [
    { Cle: 'Version', Valeur: db.version || '2.0', Description: 'Version de format de base' },
    { Cle: 'Date_Sauvegarde', Valeur: new Date().toISOString(), Description: 'Date et heure de l’export' },
    { Cle: 'Nom_Application', Valeur: db.settings.appName || 'TABM-Contrats', Description: 'Nom de l’application affiché dans la barre de titre' },
    { Cle: 'Badge_Application', Valeur: db.settings.appBadge || 'RH Transport', Description: 'Badge / Pillule affiché à côté du logo' },
    { Cle: 'Sous_Titre_Application', Valeur: db.settings.appSubtitle || 'Génération & Suivi des contrats de travail • 100% Hors-ligne', Description: 'Baseline principale de l’en-tête' },
    { Cle: 'Logo_Application_URL', Valeur: db.settings.appLogoUrl || '', Description: 'URL ou image base64 du logo de l’application' },
    { Cle: 'Notice_Pied_De_Page', Valeur: db.settings.appFooterNotice || 'TABM Transport & Mobilités - Logiciel RH 100% sécurisé et hors-ligne', Description: 'Baseline / mention globale en pied de page' },
    { Cle: 'Valeur_Point_Entreprise', Valeur: db.settings.pointValue, Description: 'Valeur du point en euros pour le calcul des grilles de salaire' },
    { Cle: 'Etablissement_Par_Defaut', Valeur: db.settings.defaultEstablishmentId || 'etab-1', Description: 'ID de l’établissement présélectionné par défaut' },
    { Cle: 'Raison_Sociale_Defaut', Valeur: db.settings.companyName, Description: 'Raison sociale par défaut' },
    { Cle: 'Adresse_Siege_Defaut', Valeur: db.settings.companyAddress, Description: 'Adresse du siège' },
    { Cle: 'Ville_Siege_Defaut', Valeur: db.settings.companyCity, Description: 'Code postal et ville' },
    { Cle: 'SIRET_Defaut', Valeur: db.settings.companySiret, Description: 'SIRET par défaut' },
    { Cle: 'Code_APE_Defaut', Valeur: db.settings.companyApe, Description: 'Code APE / NAF par défaut' },
    { Cle: 'Representant_Legal_Defaut', Valeur: db.settings.companyRepresentative, Description: 'Directeur ou représentant par défaut' },
    { Cle: 'Role_Representant_Defaut', Valeur: db.settings.representativeRole, Description: 'Qualité du représentant' },
    { Cle: 'Convention_Collective_Defaut', Valeur: db.settings.collectiveAgreement, Description: 'Convention collective par défaut' },
  ];
  const wsSettings = XLSX.utils.json_to_sheet(settingsRows);
  XLSX.utils.book_append_sheet(wb, wsSettings, 'Parametres');

  // 2. Feuille ETABLISSEMENTS (Gestion des établissements distincts et politique salariale)
  const establishmentsRows = (db.establishments || DEFAULT_ESTABLISHMENTS).map((etab) => ({
    ID: etab.id,
    Code: etab.code,
    Nom_Etablissement: etab.name,
    Nom_Court: etab.shortName || etab.name,
    Raison_Sociale: etab.companyName,
    Adresse: etab.address,
    Code_Postal: etab.postalCode,
    Ville: etab.city,
    SIRET: etab.siret,
    Code_APE: etab.ape,
    Directeur_Representant: etab.director,
    Role_Representant: etab.directorRole,
    Convention_Collective: etab.collectiveAgreement,
    Mode_Calcul_Salaire: etab.salaryCalculationMode === 'manual' ? 'MANUEL' : 'VALEUR_POINT',
    Valeur_Point: Number(etab.pointValue ?? db.settings.pointValue ?? 10.45),
    Logo_URL: etab.logoUrl || '',
    Mention_Pied_De_Page: etab.footerText || '',
    Periode_Essai_CDD_Moins_6M: etab.trialPeriods?.cddUnder6Months || '',
    Periode_Essai_CDD_Plus_6M: etab.trialPeriods?.cddOver6Months || '',
    Periode_Essai_CDI_Cadre: etab.trialPeriods?.cdiCadre || '',
    Periode_Essai_CDI_Maitrise: etab.trialPeriods?.cdiMaitrise || '',
    Periode_Essai_CDI_Conducteur: etab.trialPeriods?.cdiConducteur || '',
    Periode_Essai_CDI_Employe: etab.trialPeriods?.cdiEmploye || '',
    Periode_Essai_CDI_Ouvrier: etab.trialPeriods?.cdiOuvrier || '',
  }));
  const wsEstablishments = XLSX.utils.json_to_sheet(establishmentsRows);
  XLSX.utils.book_append_sheet(wb, wsEstablishments, 'Etablissements');

  // 3. Feuille PROCESSUS_WORKFLOW (Cases à cocher personnalisables du process de signature)
  const workflowRows = (db.workflowSteps || DEFAULT_WORKFLOW_STEPS).map((step, idx) => ({
    ID: step.id,
    Ordre: step.order || idx + 1,
    Titre_Etape: step.title,
    Sous_Titre_Explicatif: step.subtitle || '',
  }));
  const wsWorkflow = XLSX.utils.json_to_sheet(workflowRows);
  XLSX.utils.book_append_sheet(wb, wsWorkflow, 'Processus_Workflow');

  // 4. Feuille METIERS_COEFFICIENTS
  const jobsRows = db.jobs.map((job) => ({
    ID: job.id,
    Metier: job.title,
    Statut: job.category,
    Coefficient: job.coefficient,
    Salaire_Mensuel_Calcule: Number((job.coefficient * db.settings.pointValue).toFixed(2)),
    Heures_Hebdo: job.weeklyHours,
    Permis_Habilitations: job.requiredLicenses || '',
    Description: job.description || '',
  }));
  const wsJobs = XLSX.utils.json_to_sheet(jobsRows);
  XLSX.utils.book_append_sheet(wb, wsJobs, 'Metiers_Coefficients');

  // 5. Feuille ARTICLES_CLAUSES (Obligatoire uniquement, rattachement aux établissements)
  const articlesRows = db.articles.map((art) => ({
    ID: art.id,
    Code: art.code,
    Titre: art.title,
    Categorie: art.category,
    Ordre: art.order,
    Obligatoire: art.isMandatory ? 'OUI' : 'NON',
    Etablissements_Rattaches: (art.validEstablishmentIds && art.validEstablishmentIds.length > 0)
      ? art.validEstablishmentIds.join(', ')
      : 'TOUS',
    Obligatoire_Pour_Etablissements: (art.mandatoryEstablishmentIds && art.mandatoryEstablishmentIds.length > 0)
      ? art.mandatoryEstablishmentIds.join(', ')
      : (art.isMandatory ? 'TOUS' : 'AUCUN'),
    Types_Contrats_Valides: art.validContractTypes.join(', '),
    Statuts_Valides: art.validStatuses.join(', '),
    Regime_Temps_Travail: art.workTimeTarget || 'les_deux',
    Contenu_Article: art.content,
  }));
  const wsArticles = XLSX.utils.json_to_sheet(articlesRows);
  XLSX.utils.book_append_sheet(wb, wsArticles, 'Articles_Clauses');

  // 6. Feuille MODELES
  const templatesRows = db.templates.map((tpl) => ({
    ID: tpl.id,
    Nom_Modele: tpl.name,
    Description: tpl.description,
    Type_Contrat: tpl.contractType,
    Statut: tpl.status,
    Metier_Defaut: tpl.defaultJobTitle || '',
    Heures_Hebdo_Defaut: tpl.defaultWeeklyHours || 35,
    IDs_Articles_Inclus: tpl.articleIds.join(', '),
    Notes: tpl.notes || '',
  }));
  const wsTemplates = XLSX.utils.json_to_sheet(templatesRows);
  XLSX.utils.book_append_sheet(wb, wsTemplates, 'Modeles');

  // 7. Feuille HISTORIQUE_CONTRATS
  const workflowSteps = db.workflowSteps || DEFAULT_WORKFLOW_STEPS;
  const contractsRows = db.contracts.map((c) => {
    const row: Record<string, any> = {
      ID: c.id,
      Numero_Contrat: c.contractNumber,
      Date_Creation: c.createdAt,
      Statut_Global: c.status,
      // Établissement rattaché
      Etablissement_ID: c.employeeData.establishmentId || '',
      Etablissement_Nom: c.employeeData.establishmentName || '',
      Raison_Sociale_Employeur: c.employeeData.companyName,
      // Salarié
      Civilite: c.employeeData.civility,
      Nom: c.employeeData.lastName,
      Prenom: c.employeeData.firstName,
      Date_Naissance: c.employeeData.birthDate,
      Lieu_Naissance: c.employeeData.birthPlace,
      Nationalite: c.employeeData.nationality,
      Num_Secu: c.employeeData.socialSecurityNumber,
      Adresse: c.employeeData.address,
      Code_Postal: c.employeeData.postalCode,
      Ville: c.employeeData.city,
      // Contrat
      Type_Contrat: c.employeeData.contractType,
      Statut_Salarie: c.employeeData.status,
      Regime_Temps_Travail: c.employeeData.workTimeRegime === 'temps_partiel' ? 'TEMPS_PARTIEL' : 'TEMPS_PLEIN',
      Metier: c.employeeData.jobTitle,
      Coefficient: c.employeeData.coefficient,
      Mode_Calcul_Salaire: c.employeeData.salaryCalculationMode === 'manual' ? 'MANUEL' : 'VALEUR_POINT',
      Valeur_Point: c.employeeData.pointValue,
      Salaire_Mensuel_Brut: c.employeeData.monthlyGrossSalary,
      Taux_Horaire: c.employeeData.hourlyRate,
      Heures_Hebdo: c.employeeData.weeklyHours !== undefined ? c.employeeData.weeklyHours : '',
      Logo_Etablissement: c.employeeData.establishmentLogoUrl ? 'OUI' : 'NON',
      Pied_De_Page_Etablissement: c.employeeData.establishmentFooterText || '',
      Date_Debut: c.employeeData.startDate,
      Date_Fin: c.employeeData.endDate || '',
      Reprise_Anciennete: c.employeeData.seniorityDate || '',
      Motif_Recours_CDD: c.employeeData.cddReason || '',
      Periode_Essai: c.employeeData.trialPeriod,
      Lieu_Travail_Depot: c.employeeData.workplaceDepot,
      Zone_Mobilite: c.employeeData.mobilityZone,
      Permis_Requis: c.employeeData.requiredLicenses,
      Articles_Inclus: c.selectedArticleIds.join(', '),
    };

    // Dynamically write each workflow step checkbox
    workflowSteps.forEach((step) => {
      const isChecked = c.workflow.checklist?.[step.id] ?? Boolean((c.workflow as any)[step.id]);
      row[`Etape_${step.id}_${step.title.replace(/[\s\W]+/g, '_')}`] = isChecked ? 'OUI' : 'NON';
    });

    // Workflow metadata
    row['Date_Envoi'] = c.workflow.sentDate || '';
    row['Date_Signature_Collaborateur'] = c.workflow.employeeSignedDate || '';
    row['Date_Signature_Directeur'] = c.workflow.directorSignedDate || '';
    row['Lien_SharePoint'] = c.workflow.sharepointUrl || '';
    row['Commentaires_Suivi'] = c.workflow.notes || '';

    return row;
  });

  const wsContracts = XLSX.utils.json_to_sheet(contractsRows);
  XLSX.utils.book_append_sheet(wb, wsContracts, 'Historique_Contrats');

  const today = new Date().toISOString().slice(0, 10);
  const fullFilename = `${filenamePrefix}_${today}.xlsx`;

  try {
    XLSX.writeFile(wb, fullFilename);
  } catch (err) {
    console.warn('XLSX.writeFile standard failed, using Blob fallback:', err);
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fullFilename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 200);
  }
}

export function parseExcelToDatabase(dataBuffer: ArrayBuffer): AppDatabase {
  const wb = XLSX.read(dataBuffer, { type: 'array' });
  const newDb = createEmptyDatabase();

  // 1. Lire Parametres
  if (wb.SheetNames.includes('Parametres')) {
    const ws = wb.Sheets['Parametres'];
    const rows = XLSX.utils.sheet_to_json<{ Cle: string; Valeur: any }>(ws);
    rows.forEach((r) => {
      const key = String(r.Cle || '').trim();
      const val = r.Valeur;
      if (key === 'Valeur_Point_Entreprise') {
        const num = parseFloat(String(val).replace(',', '.'));
        if (!isNaN(num) && num > 0) newDb.settings.pointValue = num;
      } else if (key === 'Nom_Application') {
        if (val) newDb.settings.appName = String(val);
      } else if (key === 'Badge_Application') {
        if (val) newDb.settings.appBadge = String(val);
      } else if (key === 'Sous_Titre_Application') {
        if (val) newDb.settings.appSubtitle = String(val);
      } else if (key === 'Logo_Application_URL') {
        newDb.settings.appLogoUrl = String(val || '');
      } else if (key === 'Notice_Pied_De_Page') {
        if (val) newDb.settings.appFooterNotice = String(val);
      } else if (key === 'Etablissement_Par_Defaut') {
        if (val) newDb.settings.defaultEstablishmentId = String(val);
      } else if (key === 'Raison_Sociale' || key === 'Raison_Sociale_Defaut') {
        newDb.settings.companyName = String(val || '');
      } else if (key === 'Adresse_Siege' || key === 'Adresse_Siege_Defaut') {
        newDb.settings.companyAddress = String(val || '');
      } else if (key === 'Ville_Siege' || key === 'Ville_Siege_Defaut') {
        newDb.settings.companyCity = String(val || '');
      } else if (key === 'SIRET' || key === 'SIRET_Defaut') {
        newDb.settings.companySiret = String(val || '');
      } else if (key === 'Code_APE' || key === 'Code_APE_Defaut') {
        newDb.settings.companyApe = String(val || '');
      } else if (key === 'Representant_Legal' || key === 'Representant_Legal_Defaut') {
        newDb.settings.companyRepresentative = String(val || '');
      } else if (key === 'Role_Representant' || key === 'Role_Representant_Defaut') {
        newDb.settings.representativeRole = String(val || '');
      } else if (key === 'Convention_Collective' || key === 'Convention_Collective_Defaut') {
        newDb.settings.collectiveAgreement = String(val || '');
      }
    });
  }

  // 2. Lire Etablissements
  if (wb.SheetNames.includes('Etablissements')) {
    const ws = wb.Sheets['Etablissements'];
    const rows = XLSX.utils.sheet_to_json<any>(ws);
    if (rows.length > 0) {
      newDb.establishments = rows.map((r, idx) => ({
        id: String(r.ID || `etab-${idx + 1}`),
        code: String(r.Code || `ETAB-${idx + 1}`),
        name: String(r.Nom_Etablissement || r.name || `Établissement ${idx + 1}`),
        shortName: String(r.Nom_Court || r.shortName || r.Nom_Etablissement || ''),
        companyName: String(r.Raison_Sociale || r.companyName || newDb.settings.companyName),
        address: String(r.Adresse || r.address || ''),
        postalCode: String(r.Code_Postal || r.postalCode || '69000'),
        city: String(r.Ville || r.city || 'Lyon'),
        siret: String(r.SIRET || r.siret || ''),
        ape: String(r.Code_APE || r.ape || ''),
        director: String(r.Directeur_Representant || r.director || newDb.settings.companyRepresentative),
        directorRole: String(r.Role_Representant || r.directorRole || newDb.settings.representativeRole),
        collectiveAgreement: String(r.Convention_Collective || r.collectiveAgreement || newDb.settings.collectiveAgreement),
        salaryCalculationMode: String(r.Mode_Calcul_Salaire || '').toUpperCase() === 'MANUEL' ? 'manual' : 'point_value',
        pointValue: r.Valeur_Point !== undefined && r.Valeur_Point !== '' ? Number(r.Valeur_Point) : (newDb.settings.pointValue || 10.45),
        logoUrl: String(r.Logo_URL || r.logoUrl || ''),
        footerText: String(r.Mention_Pied_De_Page || r.footerText || ''),
        trialPeriods: {
          cddUnder6Months: String(r.Periode_Essai_CDD_Moins_6M || r.cddUnder6Months || '1 jour par semaine de contrat'),
          cddOver6Months: String(r.Periode_Essai_CDD_Plus_6M || r.cddOver6Months || '1 mois'),
          cdiCadre: String(r.Periode_Essai_CDI_Cadre || r.cdiCadre || '4 mois'),
          cdiMaitrise: String(r.Periode_Essai_CDI_Maitrise || r.cdiMaitrise || '3 mois'),
          cdiConducteur: String(r.Periode_Essai_CDI_Conducteur || r.cdiConducteur || '2 mois'),
          cdiEmploye: String(r.Periode_Essai_CDI_Employe || r.cdiEmploye || '2 mois'),
          cdiOuvrier: String(r.Periode_Essai_CDI_Ouvrier || r.cdiOuvrier || '2 mois'),
        },
      }));
    }
  }

  // 3. Lire Processus_Workflow (cases à cocher personnalisées)
  if (wb.SheetNames.includes('Processus_Workflow')) {
    const ws = wb.Sheets['Processus_Workflow'];
    const rows = XLSX.utils.sheet_to_json<any>(ws);
    if (rows.length > 0) {
      newDb.workflowSteps = rows.map((r, idx) => ({
        id: String(r.ID || `step-${idx + 1}`),
        order: Number(r.Ordre || idx + 1),
        title: String(r.Titre_Etape || r.title || `Étape ${idx + 1}`),
        subtitle: String(r.Sous_Titre_Explicatif || r.subtitle || ''),
      }));
    }
  }

  // 4. Lire Metiers_Coefficients
  if (wb.SheetNames.includes('Metiers_Coefficients')) {
    const ws = wb.Sheets['Metiers_Coefficients'];
    const rows = XLSX.utils.sheet_to_json<any>(ws);
    newDb.jobs = rows.map((r, idx) => ({
      id: String(r.ID || `job-${idx + 1}`),
      title: String(r.Metier || r.title || 'Poste non spécifié'),
      category: (String(r.Statut || r.category || 'conducteur').toLowerCase() as any),
      coefficient: Number(r.Coefficient || r.coefficient || 140),
      weeklyHours: Number(r.Heures_Hebdo || r.weeklyHours || 35),
      requiredLicenses: String(r.Permis_Habilitations || r.requiredLicenses || ''),
      description: String(r.Description || r.description || ''),
    }));
  }

  // 5. Lire Articles_Clauses
  if (wb.SheetNames.includes('Articles_Clauses')) {
    const ws = wb.Sheets['Articles_Clauses'];
    const rows = XLSX.utils.sheet_to_json<any>(ws);
    newDb.articles = rows.map((r, idx) => {
      const typesStr = String(r.Types_Contrats_Valides || r.validContractTypes || 'cdi, cdd');
      const validContractTypes = typesStr
        .split(',')
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean) as any;

      const statutsStr = String(r.Statuts_Valides || r.validStatuses || 'conducteur, employé');
      const validStatuses = statutsStr
        .split(',')
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean) as any;

      // Rattachement aux établissements
      const rawEtab = String(r.Etablissements_Rattaches || r.validEstablishmentIds || '').trim();
      let validEstablishmentIds: string[] | undefined = undefined;
      if (rawEtab && rawEtab.toUpperCase() !== 'TOUS') {
        validEstablishmentIds = rawEtab.split(',').map((s) => s.trim()).filter(Boolean);
      }

      // Établissements obligatoires
      const rawMandatory = String(r.Obligatoire_Pour_Etablissements || r.mandatoryEstablishmentIds || '').trim();
      let mandatoryEstablishmentIds: string[] | undefined = undefined;
      const isMandatoryGlobal = String(r.Obligatoire || '').toUpperCase() === 'OUI' || Boolean(r.isMandatory);
      if (rawMandatory && rawMandatory.toUpperCase() !== 'TOUS' && rawMandatory.toUpperCase() !== 'AUCUN') {
        mandatoryEstablishmentIds = rawMandatory.split(',').map((s) => s.trim()).filter(Boolean);
      }

      const rawWorkTime = String(r.Regime_Temps_Travail || r.workTimeTarget || '').toLowerCase();
      let workTimeTarget: any = 'les_deux';
      if (rawWorkTime.includes('partiel') || rawWorkTime === 'tp') {
        workTimeTarget = 'temps_partiel';
      } else if (rawWorkTime.includes('plein') || rawWorkTime.includes('complet') || rawWorkTime === 'tc') {
        workTimeTarget = 'temps_plein';
      }

      return {
        id: String(r.ID || `art-${idx + 1}`),
        code: String(r.Code || `ART-${idx + 1}`),
        title: String(r.Titre || r.title || 'Article sans titre'),
        category: String(r.Categorie || r.category || 'Général'),
        order: Number(r.Ordre || r.order || idx + 1),
        isMandatory: isMandatoryGlobal,
        validEstablishmentIds,
        mandatoryEstablishmentIds,
        workTimeTarget,
        validContractTypes: validContractTypes.length ? validContractTypes : ['cdi', 'cdd'],
        validStatuses: validStatuses.length ? validStatuses : ['conducteur'],
        content: String(r.Contenu_Article || r.content || ''),
      };
    });
  }

  // 6. Lire Modeles
  if (wb.SheetNames.includes('Modeles')) {
    const ws = wb.Sheets['Modeles'];
    const rows = XLSX.utils.sheet_to_json<any>(ws);
    newDb.templates = rows.map((r, idx) => ({
      id: String(r.ID || `tpl-${idx + 1}`),
      name: String(r.Nom_Modele || r.name || 'Modèle'),
      description: String(r.Description || r.description || ''),
      contractType: (String(r.Type_Contrat || r.contractType || 'cdi').toLowerCase() as any),
      status: (String(r.Statut || r.status || 'conducteur').toLowerCase() as any),
      defaultJobTitle: String(r.Metier_Defaut || r.defaultJobTitle || ''),
      defaultWeeklyHours: Number(r.Heures_Hebdo_Defaut || r.defaultWeeklyHours || 35),
      articleIds: String(r.IDs_Articles_Inclus || r.articleIds || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      notes: String(r.Notes || r.notes || ''),
    }));
  }

  // 7. Lire Historique_Contrats
  if (wb.SheetNames.includes('Historique_Contrats')) {
    const ws = wb.Sheets['Historique_Contrats'];
    const rows = XLSX.utils.sheet_to_json<any>(ws);
    newDb.contracts = rows.map((r, idx) => {
      // Find matching establishment if specified
      const etabId = String(r.Etablissement_ID || '');
      const matchedEtab = newDb.establishments.find((e) => e.id === etabId);

      const compName = String(r.Raison_Sociale_Employeur || matchedEtab?.companyName || newDb.settings.companyName);
      const compAddr = matchedEtab ? matchedEtab.address : newDb.settings.companyAddress;
      const compCity = matchedEtab ? `${matchedEtab.postalCode} ${matchedEtab.city}` : newDb.settings.companyCity;
      const compRep = matchedEtab ? matchedEtab.director : newDb.settings.companyRepresentative;
      const compRole = matchedEtab ? matchedEtab.directorRole : newDb.settings.representativeRole;
      const compAgreement = matchedEtab ? matchedEtab.collectiveAgreement : newDb.settings.collectiveAgreement;

      // Reconstruct dynamic workflow checklist
      const checklist: Record<string, boolean> = {};
      const knownSteps = newDb.workflowSteps.length > 0 ? newDb.workflowSteps : DEFAULT_WORKFLOW_STEPS;
      
      knownSteps.forEach((step) => {
        // Check for column starting with Etape_${step.id} or direct step ID or legacy column
        let foundVal: any = undefined;
        for (const key of Object.keys(r)) {
          if (key === step.id || key === `Etape_${step.id}` || key.startsWith(`Etape_${step.id}_`)) {
            foundVal = r[key];
            break;
          }
        }
        if (foundVal !== undefined) {
          checklist[step.id] = String(foundVal).toUpperCase() === 'OUI' || Boolean(foundVal);
        } else {
          // Check legacy names
          if (step.id === 'sentWithinDeadline') checklist[step.id] = String(r.Envoi_Dans_Les_Delais || '').toUpperCase() === 'OUI';
          if (step.id === 'employeeSigned') checklist[step.id] = String(r.Signature_Collaborateur || '').toUpperCase() === 'OUI';
          if (step.id === 'directorSigned') checklist[step.id] = String(r.Signature_Directeur || '').toUpperCase() === 'OUI';
          if (step.id === 'dpaeCompleted') checklist[step.id] = String(r.DPAE_Faite || '').toUpperCase() === 'OUI';
          if (step.id === 'medicalVisitCompleted') checklist[step.id] = String(r.Visite_Medicale || '').toUpperCase() === 'OUI';
          if (step.id === 'licensesVerified') checklist[step.id] = String(r.Titres_Permis_Verifies || '').toUpperCase() === 'OUI';
          if (step.id === 'storedInSharepoint') checklist[step.id] = String(r.Archive_SharePoint || '').toUpperCase() === 'OUI';
        }
      });

      return {
        id: String(r.ID || `contract-${idx + 1}`),
        contractNumber: String(r.Numero_Contrat || `TABM-${idx + 1}`),
        createdAt: String(r.Date_Creation || new Date().toISOString().slice(0, 10)),
        status: (String(r.Statut_Global || 'draft').toLowerCase() as any),
        employeeData: {
          civility: (String(r.Civilite || 'M.') as any),
          lastName: String(r.Nom || ''),
          firstName: String(r.Prenom || ''),
          birthDate: String(r.Date_Naissance || ''),
          birthPlace: String(r.Lieu_Naissance || ''),
          nationality: String(r.Nationalite || 'Française'),
          socialSecurityNumber: String(r.Num_Secu || ''),
          address: String(r.Adresse || ''),
          postalCode: String(r.Code_Postal || ''),
          city: String(r.Ville || ''),

          establishmentId: etabId || undefined,
          establishmentName: String(r.Etablissement_Nom || matchedEtab?.name || ''),
          establishmentSiret: matchedEtab?.siret,
          establishmentApe: matchedEtab?.ape,
          establishmentLogoUrl: matchedEtab?.logoUrl,
          establishmentFooterText: String(r.Pied_De_Page_Etablissement || matchedEtab?.footerText || ''),

          companyName: compName,
          companyAddress: compAddr,
          companyCity: compCity,
          companyRepresentative: compRep,
          representativeRole: compRole,
          collectiveAgreement: compAgreement,

          salaryCalculationMode: String(r.Mode_Calcul_Salaire || '').toUpperCase() === 'MANUEL' 
            ? 'manual' 
            : (matchedEtab?.salaryCalculationMode || 'point_value'),

          contractType: (String(r.Type_Contrat || 'cdi').toLowerCase() as any),
          status: (String(r.Statut_Salarie || 'conducteur').toLowerCase() as any),
          workTimeRegime: String(r.Regime_Temps_Travail || '').toLowerCase().includes('partiel') || String(r.Regime_Temps_Travail || '').toUpperCase() === 'TP'
            ? 'temps_partiel'
            : 'temps_plein',
          jobTitle: String(r.Metier || ''),
          coefficient: Number(r.Coefficient || 140),
          pointValue: Number(r.Valeur_Point || matchedEtab?.pointValue || newDb.settings.pointValue),
          monthlyGrossSalary: Number(r.Salaire_Mensuel_Brut || 0),
          hourlyRate: Number(r.Taux_Horaire || 0),
          weeklyHours: r.Heures_Hebdo !== undefined && r.Heures_Hebdo !== '' ? Number(r.Heures_Hebdo) : undefined,
          monthlyHours: r.Heures_Hebdo !== undefined && r.Heures_Hebdo !== '' ? Number((Number(r.Heures_Hebdo) * 52 / 12).toFixed(2)) : undefined,
          startDate: String(r.Date_Debut || ''),
          endDate: r.Date_Fin ? String(r.Date_Fin) : undefined,
          seniorityDate: r.Reprise_Anciennete ? String(r.Reprise_Anciennete) : undefined,
          cddReason: r.Motif_Recours_CDD ? String(r.Motif_Recours_CDD) : undefined,
          trialPeriod: String(r.Periode_Essai || '2 mois'),
          trialPeriodRenewal: 'renouvelable une fois selon accord',
          workplaceDepot: String(r.Lieu_Travail_Depot || 'Dépôt principal'),
          mobilityZone: String(r.Zone_Mobilite || 'Zone géographique d’exploitation'),
          requiredLicenses: String(r.Permis_Requis || ''),
        },
        selectedArticleIds: String(r.Articles_Inclus || '')
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        renderedFullText: '',
        workflow: {
          checklist,
          sentWithinDeadline: checklist['sentWithinDeadline'] ?? (String(r.Envoi_Dans_Les_Delais || '').toUpperCase() === 'OUI'),
          sentDate: r.Date_Envoi ? String(r.Date_Envoi) : undefined,
          employeeSigned: checklist['employeeSigned'] ?? (String(r.Signature_Collaborateur || '').toUpperCase() === 'OUI'),
          employeeSignedDate: r.Date_Signature_Collaborateur ? String(r.Date_Signature_Collaborateur) : undefined,
          directorSigned: checklist['directorSigned'] ?? (String(r.Signature_Directeur || '').toUpperCase() === 'OUI'),
          directorSignedDate: r.Date_Signature_Directeur ? String(r.Date_Signature_Directeur) : undefined,
          dpaeCompleted: checklist['dpaeCompleted'] ?? (String(r.DPAE_Faite || '').toUpperCase() === 'OUI'),
          medicalVisitCompleted: checklist['medicalVisitCompleted'] ?? (String(r.Visite_Medicale || '').toUpperCase() === 'OUI'),
          licensesVerified: checklist['licensesVerified'] ?? (String(r.Titres_Permis_Verifies || '').toUpperCase() === 'OUI'),
          storedInSharepoint: checklist['storedInSharepoint'] ?? (String(r.Archive_SharePoint || '').toUpperCase() === 'OUI'),
          sharepointUrl: r.Lien_SharePoint ? String(r.Lien_SharePoint) : undefined,
          notes: r.Commentaires_Suivi ? String(r.Commentaires_Suivi) : undefined,
        },
      };
    });
  }

  return newDb;
}
