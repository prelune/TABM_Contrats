import * as XLSX from 'xlsx';
import { AppDatabase, AppSettings, JobPosition, ContractArticle, ContractTemplate, GeneratedContract } from '../types';
import { DEFAULT_SETTINGS, DEFAULT_JOBS, DEFAULT_ARTICLES, DEFAULT_TEMPLATES } from '../data/defaultData';

export function createEmptyDatabase(): AppDatabase {
  return {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    settings: { ...DEFAULT_SETTINGS },
    jobs: [],
    articles: [],
    templates: [],
    contracts: [],
  };
}

export function createSampleDatabase(): AppDatabase {
  return {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    settings: { ...DEFAULT_SETTINGS },
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
          companyName: 'TABM Transport & Mobilités SAS',
          companyAddress: '14 Boulevard des Transports, Z.I. Nord',
          companyCity: '69000 Lyon',
          companyRepresentative: 'Laurent DUPONT',
          representativeRole: 'Directeur Général',
          contractType: 'cdi',
          status: 'conducteur',
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
          mobilityZone: 'Réseau métropolitain et couronne lyonnaise',
          requiredLicenses: 'Permis D, FIMO Voyageurs, Carte de qualification conducteur valide',
          collectiveAgreement: 'Convention Collective Nationale des Transports Routiers (IDCC 16)',
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
          'art-secret-loyaute',
          'art-prevoyance-sante',
        ],
        renderedFullText: '',
        status: 'partially_signed',
        workflow: {
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
          notes: 'Permis D vérifié le 15/09. En attente signature finale de la direction.',
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
          companyName: 'TABM Transport & Mobilités SAS',
          companyAddress: '14 Boulevard des Transports, Z.I. Nord',
          companyCity: '69000 Lyon',
          companyRepresentative: 'Laurent DUPONT',
          representativeRole: 'Directeur Général',
          contractType: 'cdi',
          status: 'maitrise',
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
          mobilityZone: 'Ensemble des dépôts et centres d’exploitation TABM',
          requiredLicenses: 'Attestation de formation SAEIV et régulation trafic',
          collectiveAgreement: 'Convention Collective Nationale des Transports Routiers (IDCC 16)',
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
          notes: 'Contrat transmis par e-mail en attente du retour signé de Mme Benali.',
        },
      },
    ],
  };
}

export function exportDatabaseToExcel(db: AppDatabase, filenamePrefix = 'TABM_Contrats_Sauvegarde'): void {
  const wb = XLSX.utils.book_new();

  // 1. Feuille PARAMETRES
  const settingsRows = [
    { Cle: 'Version', Valeur: db.version || '1.0' },
    { Cle: 'Date_Sauvegarde', Valeur: new Date().toISOString() },
    { Cle: 'Valeur_Point_Entreprise', Valeur: db.settings.pointValue },
    { Cle: 'Raison_Sociale', Valeur: db.settings.companyName },
    { Cle: 'Adresse_Siege', Valeur: db.settings.companyAddress },
    { Cle: 'Ville_Siege', Valeur: db.settings.companyCity },
    { Cle: 'SIRET', Valeur: db.settings.companySiret },
    { Cle: 'Code_APE', Valeur: db.settings.companyApe },
    { Cle: 'Representant_Legal', Valeur: db.settings.companyRepresentative },
    { Cle: 'Role_Representant', Valeur: db.settings.representativeRole },
    { Cle: 'Convention_Collective', Valeur: db.settings.collectiveAgreement },
  ];
  const wsSettings = XLSX.utils.json_to_sheet(settingsRows);
  XLSX.utils.book_append_sheet(wb, wsSettings, 'Parametres');

  // 2. Feuille METIERS_COEFFICIENTS
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

  // 3. Feuille ARTICLES_CLAUSES
  const articlesRows = db.articles.map((art) => ({
    ID: art.id,
    Code: art.code,
    Titre: art.title,
    Categorie: art.category,
    Ordre: art.order,
    Obligatoire: art.isMandatory ? 'OUI' : 'NON',
    Types_Contrats_Valides: art.validContractTypes.join(', '),
    Statuts_Valides: art.validStatuses.join(', '),
    Contenu_Article: art.content,
  }));
  const wsArticles = XLSX.utils.json_to_sheet(articlesRows);
  XLSX.utils.book_append_sheet(wb, wsArticles, 'Articles_Clauses');

  // 4. Feuille MODELES
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

  // 5. Feuille HISTORIQUE_CONTRATS
  const contractsRows = db.contracts.map((c) => ({
    ID: c.id,
    Numero_Contrat: c.contractNumber,
    Date_Creation: c.createdAt,
    Statut_Global: c.status,
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
    Metier: c.employeeData.jobTitle,
    Coefficient: c.employeeData.coefficient,
    Valeur_Point: c.employeeData.pointValue,
    Salaire_Mensuel_Brut: c.employeeData.monthlyGrossSalary,
    Taux_Horaire: c.employeeData.hourlyRate,
    Heures_Hebdo: c.employeeData.weeklyHours,
    Date_Debut: c.employeeData.startDate,
    Date_Fin: c.employeeData.endDate || '',
    Motif_Recours_CDD: c.employeeData.cddReason || '',
    Periode_Essai: c.employeeData.trialPeriod,
    Lieu_Travail_Depot: c.employeeData.workplaceDepot,
    Zone_Mobilite: c.employeeData.mobilityZone,
    Permis_Requis: c.employeeData.requiredLicenses,
    Articles_Inclus: c.selectedArticleIds.join(', '),
    // Workflow & Signatures
    Envoi_Dans_Les_Delais: c.workflow.sentWithinDeadline ? 'OUI' : 'NON',
    Date_Envoi: c.workflow.sentDate || '',
    Signature_Collaborateur: c.workflow.employeeSigned ? 'OUI' : 'NON',
    Date_Signature_Collaborateur: c.workflow.employeeSignedDate || '',
    Signature_Directeur: c.workflow.directorSigned ? 'OUI' : 'NON',
    Date_Signature_Directeur: c.workflow.directorSignedDate || '',
    DPAE_Faite: c.workflow.dpaeCompleted ? 'OUI' : 'NON',
    Visite_Medicale: c.workflow.medicalVisitCompleted ? 'OUI' : 'NON',
    Titres_Permis_Verifies: c.workflow.licensesVerified ? 'OUI' : 'NON',
    Archive_SharePoint: c.workflow.storedInSharepoint ? 'OUI' : 'NON',
    Lien_SharePoint: c.workflow.sharepointUrl || '',
    Commentaires_Suivi: c.workflow.notes || '',
  }));
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
      } else if (key === 'Raison_Sociale') {
        newDb.settings.companyName = String(val || '');
      } else if (key === 'Adresse_Siege') {
        newDb.settings.companyAddress = String(val || '');
      } else if (key === 'Ville_Siege') {
        newDb.settings.companyCity = String(val || '');
      } else if (key === 'SIRET') {
        newDb.settings.companySiret = String(val || '');
      } else if (key === 'Code_APE') {
        newDb.settings.companyApe = String(val || '');
      } else if (key === 'Representant_Legal') {
        newDb.settings.companyRepresentative = String(val || '');
      } else if (key === 'Role_Representant') {
        newDb.settings.representativeRole = String(val || '');
      } else if (key === 'Convention_Collective') {
        newDb.settings.collectiveAgreement = String(val || '');
      }
    });
  }

  // 2. Lire Metiers_Coefficients
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

  // 3. Lire Articles_Clauses
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

      return {
        id: String(r.ID || `art-${idx + 1}`),
        code: String(r.Code || `ART-${idx + 1}`),
        title: String(r.Titre || r.title || 'Article sans titre'),
        category: String(r.Categorie || r.category || 'Général'),
        order: Number(r.Ordre || r.order || idx + 1),
        isMandatory: String(r.Obligatoire || '').toUpperCase() === 'OUI' || Boolean(r.isMandatory),
        validContractTypes: validContractTypes.length ? validContractTypes : ['cdi', 'cdd'],
        validStatuses: validStatuses.length ? validStatuses : ['conducteur'],
        content: String(r.Contenu_Article || r.content || ''),
      };
    });
  }

  // 4. Lire Modeles
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

  // 5. Lire Historique_Contrats
  if (wb.SheetNames.includes('Historique_Contrats')) {
    const ws = wb.Sheets['Historique_Contrats'];
    const rows = XLSX.utils.sheet_to_json<any>(ws);
    newDb.contracts = rows.map((r, idx) => ({
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
        companyName: newDb.settings.companyName,
        companyAddress: newDb.settings.companyAddress,
        companyCity: newDb.settings.companyCity,
        companyRepresentative: newDb.settings.companyRepresentative,
        representativeRole: newDb.settings.representativeRole,
        contractType: (String(r.Type_Contrat || 'cdi').toLowerCase() as any),
        status: (String(r.Statut_Salarie || 'conducteur').toLowerCase() as any),
        jobTitle: String(r.Metier || ''),
        coefficient: Number(r.Coefficient || 140),
        pointValue: Number(r.Valeur_Point || newDb.settings.pointValue),
        monthlyGrossSalary: Number(r.Salaire_Mensuel_Brut || 0),
        hourlyRate: Number(r.Taux_Horaire || 0),
        weeklyHours: Number(r.Heures_Hebdo || 35),
        monthlyHours: Number((Number(r.Heures_Hebdo || 35) * 52 / 12).toFixed(2)),
        startDate: String(r.Date_Debut || ''),
        endDate: r.Date_Fin ? String(r.Date_Fin) : undefined,
        cddReason: r.Motif_Recours_CDD ? String(r.Motif_Recours_CDD) : undefined,
        trialPeriod: String(r.Periode_Essai || '2 mois'),
        trialPeriodRenewal: 'renouvelable une fois selon accord',
        workplaceDepot: String(r.Lieu_Travail_Depot || 'Dépôt principal'),
        mobilityZone: String(r.Zone_Mobilite || 'Zone géographique d’exploitation'),
        requiredLicenses: String(r.Permis_Requis || ''),
        collectiveAgreement: newDb.settings.collectiveAgreement,
      },
      selectedArticleIds: String(r.Articles_Inclus || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      renderedFullText: '',
      workflow: {
        sentWithinDeadline: String(r.Envoi_Dans_Les_Delais || '').toUpperCase() === 'OUI',
        sentDate: r.Date_Envoi ? String(r.Date_Envoi) : undefined,
        employeeSigned: String(r.Signature_Collaborateur || '').toUpperCase() === 'OUI',
        employeeSignedDate: r.Date_Signature_Collaborateur ? String(r.Date_Signature_Collaborateur) : undefined,
        directorSigned: String(r.Signature_Directeur || '').toUpperCase() === 'OUI',
        directorSignedDate: r.Date_Signature_Directeur ? String(r.Date_Signature_Directeur) : undefined,
        dpaeCompleted: String(r.DPAE_Faite || '').toUpperCase() === 'OUI',
        medicalVisitCompleted: String(r.Visite_Medicale || '').toUpperCase() === 'OUI',
        licensesVerified: String(r.Titres_Permis_Verifies || '').toUpperCase() === 'OUI',
        storedInSharepoint: String(r.Archive_SharePoint || '').toUpperCase() === 'OUI',
        sharepointUrl: r.Lien_SharePoint ? String(r.Lien_SharePoint) : undefined,
        notes: r.Commentaires_Suivi ? String(r.Commentaires_Suivi) : undefined,
      },
    }));
  }

  return newDb;
}
