export type ContractType = 
  | 'cdi' 
  | 'cdd' 
  | 'avenant_cdd' 
  | 'avenant_cdi' 
  | 'convention_tripartite';

export type EmployeeStatus = 
  | 'employé' 
  | 'conducteur' 
  | 'ouvrier' 
  | 'maitrise' 
  | 'haute_maitrise' 
  | 'cadre';

export type WorkTimeRegime = 'temps_plein' | 'temps_partiel';

export type ArticleWorkTimeTarget = 'les_deux' | 'temps_plein' | 'temps_partiel';

export interface EstablishmentTrialPeriods {
  cddUnder6Months?: string; // Par défaut: "1 jour par semaine de contrat"
  cddOver6Months?: string;  // Par défaut: "1 mois"
  cdiCadre?: string;        // Par défaut: "4 mois"
  cdiMaitrise?: string;     // Par défaut: "3 mois" (AMT)
  cdiConducteur?: string;   // Par défaut: "2 mois" (CDT)
  cdiEmploye?: string;      // Par défaut: "2 mois" (EMP)
  cdiOuvrier?: string;      // Par défaut: "2 mois" (OUV)
}

export interface Establishment {
  id: string; // e.g. "etab-1", "etab-2", "etab-3"
  code: string; // e.g. "ETAB-LYON-URBAIN", "ETAB-RHONE-INTER", "ETAB-TOURISME"
  name: string; // Nom usuel, ex: "Établissement Principal Lyon Urbain"
  shortName?: string; // Nom court, ex: "TABM Lyon Urbain"
  companyName: string; // Raison sociale exacte
  address: string;
  postalCode: string;
  city: string;
  siret: string;
  ape: string;
  director: string; // Directeur / Représentant légal
  directorRole: string; // Qualité (Directeur Général, Gérant...)
  collectiveAgreement: string; // Convention collective applicable
  logoUrl?: string; // Logo de l'établissement (URL ou data-URL base64)
  footerText?: string; // Mention personnalisée de pied de page
  salaryCalculationMode?: 'point_value' | 'manual'; // 'point_value' (Calcul par valeur du point) ou 'manual' (Grille propre / Saisie manuelle)
  pointValue?: number; // Valeur du point spécifique à l'établissement (ex: 10.45 €)
  trialPeriods?: EstablishmentTrialPeriods; // Durées des périodes d'essai personnalisables par établissement
}

export interface WorkflowStepConfig {
  id: string; // e.g. "sentWithinDeadline", "employeeSigned", "step-uniforme", etc.
  title: string; // Titre de la case à cocher
  subtitle?: string; // Sous-titre explicatif
  order: number;
}

export interface JobPosition {
  id: string;
  title: string;
  category: EmployeeStatus;
  coefficient: number;
  weeklyHours: number;
  description?: string;
  requiredLicenses?: string;
}

export interface ContractArticle {
  id: string;
  code: string; // e.g. "ART-01"
  title: string;
  category: string; // "Général", "Poste & Missions", "Rémunération", "Temps de travail", "Spécificités Transport", etc.
  content: string; // Contient des balises {{tags}}
  validContractTypes: ContractType[];
  validStatuses: EmployeeStatus[];
  validEstablishmentIds?: string[]; // IDs des établissements rattachés (ex: ['etab-1', 'etab-2', 'etab-3']). Si vide => tous
  workTimeTarget?: ArticleWorkTimeTarget; // 'les_deux' (par défaut, TC & TP), 'temps_plein' (TC uniquement) ou 'temps_partiel' (TP uniquement)
  isMandatory?: boolean; // Légalement obligatoire globalement
  mandatoryEstablishmentIds?: string[]; // IDs des établissements pour lesquels cet article est obligatoire
  order: number;
}

export interface ContractTemplate {
  id: string;
  name: string;
  description: string;
  contractType: ContractType;
  status: EmployeeStatus;
  articleIds: string[];
  defaultJobTitle?: string;
  defaultWeeklyHours?: number;
  notes?: string;
}

export interface ContractEmployeeData {
  // Salarié
  civility: 'M.' | 'Mme';
  lastName: string;
  firstName: string;
  birthDate: string;
  birthPlace: string;
  nationality: string;
  socialSecurityNumber: string;
  address: string;
  postalCode: string;
  city: string;

  // Établissement & Entreprise
  establishmentId?: string; // Rattaché à l'un des 3 établissements
  establishmentName?: string;
  establishmentSiret?: string;
  establishmentApe?: string;
  establishmentLogoUrl?: string;
  establishmentFooterText?: string;

  companyName: string; // Raison sociale
  companyAddress: string;
  companyCity: string;
  companyRepresentative: string;
  representativeRole: string;

  // Poste & Contrat
  contractType: ContractType;
  status: EmployeeStatus;
  workTimeRegime: WorkTimeRegime; // 'temps_plein' (TC) ou 'temps_partiel' (TP)
  jobTitle: string;
  coefficient: number;
  salaryCalculationMode?: 'point_value' | 'manual';
  pointValue: number;
  monthlyGrossSalary: number;
  hourlyRate: number;
  weeklyHours?: number; // Facultatif
  monthlyHours?: number; // Facultatif
  additionalBonus?: number;
  bonusDetails?: string;

  startDate: string;
  endDate?: string; // Si CDD
  seniorityDate?: string; // Date de reprise d'ancienneté (facultatif)
  cddReason?: string; // Si CDD
  replacedEmployeeName?: string; // Si remplacement
  replacedEmployeeRole?: string;
  trialPeriod: string;
  trialPeriodRenewal: string;
  workplaceDepot: string;
  mobilityZone: string;
  requiredLicenses: string;
  collectiveAgreement: string;
}

export interface ContractWorkflowSteps {
  // Liste dynamique des cases cochées : idÉtape -> booléen
  checklist?: Record<string, boolean>;

  // Métadonnées temporelles et champs usuels
  sentWithinDeadline?: boolean; // Envoyé dans les délais (ex: 48h)
  sentDate?: string;
  employeeSigned?: boolean;
  employeeSignedDate?: string;
  directorSigned?: boolean;
  directorSignedDate?: string;
  dpaeCompleted?: boolean;
  medicalVisitCompleted?: boolean;
  licensesVerified?: boolean;
  storedInSharepoint?: boolean;
  sharepointUrl?: string;
  notes?: string;
}

export interface GeneratedContract {
  id: string;
  contractNumber: string;
  createdAt: string;
  employeeData: ContractEmployeeData;
  selectedArticleIds: string[];
  customArticlesContent?: Record<string, string>; // Si modifié spécifiquement
  renderedFullText: string;
  status: 'draft' | 'pending_signature' | 'partially_signed' | 'fully_signed' | 'archived';
  workflow: ContractWorkflowSteps;
}

export interface AppSettings {
  // Personnalisation de l'application & Baselines (configurables depuis Excel)
  appName: string; // ex: "TABM-Contrats"
  appBadge: string; // ex: "RH Transport"
  appSubtitle: string; // ex: "Génération & Suivi des contrats de travail • 100% Hors-ligne"
  appLogoUrl?: string; // Logo de l'application (URL ou data-URI base64)
  appFooterNotice: string; // Mention de bas de page globale

  // Paramètres généraux
  pointValue: number; // Valeur du point entreprise (ex: 10.92 €)
  defaultEstablishmentId?: string;

  // Données par défaut société
  companyName: string;
  companyAddress: string;
  companyCity: string;
  companySiret: string;
  companyApe: string;
  companyRepresentative: string;
  representativeRole: string;
  collectiveAgreement: string;
  companyLogoUrl?: string;
}

export interface AppDatabase {
  version: string;
  exportedAt: string;
  settings: AppSettings;
  establishments: Establishment[];
  workflowSteps: WorkflowStepConfig[];
  jobs: JobPosition[];
  articles: ContractArticle[];
  templates: ContractTemplate[];
  contracts: GeneratedContract[];
}

export interface TagInfo {
  tag: string;
  label: string;
  category: 'Salarié' | 'Poste & Salaire' | 'Accords & Féminin' | 'Dates & Durées' | 'Entreprise' | 'Transport';
  description: string;
  example: string;
}

export const WORK_TIME_REGIME_LABELS: Record<WorkTimeRegime, string> = {
  temps_plein: 'Temps Complet (TC)',
  temps_partiel: 'Temps Partiel (TP)',
};

export const ARTICLE_WORK_TIME_TARGET_LABELS: Record<ArticleWorkTimeTarget, string> = {
  les_deux: 'TC & TP (Les deux)',
  temps_plein: 'Temps Complet (TC) uniquement',
  temps_partiel: 'Temps Partiel (TP) uniquement',
};

