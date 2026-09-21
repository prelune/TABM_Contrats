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
  content: string; // Contains {{tags}}
  validContractTypes: ContractType[];
  validStatuses: EmployeeStatus[];
  isMandatory?: boolean; // Légalement obligatoire (Code du travail, convention collective)
  isRecommended?: boolean; // Recommandé (bonnes pratiques d'exploitation transport)
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

  // Entreprise
  companyName: string;
  companyAddress: string;
  companyCity: string;
  companyRepresentative: string;
  representativeRole: string;

  // Poste & Contrat
  contractType: ContractType;
  status: EmployeeStatus;
  jobTitle: string;
  coefficient: number;
  pointValue: number;
  monthlyGrossSalary: number;
  hourlyRate: number;
  weeklyHours: number;
  monthlyHours: number;
  additionalBonus?: number;
  bonusDetails?: string;

  startDate: string;
  endDate?: string; // If CDD
  cddReason?: string; // If CDD
  replacedEmployeeName?: string; // If replacement
  replacedEmployeeRole?: string;
  trialPeriod: string;
  trialPeriodRenewal: string;
  workplaceDepot: string;
  mobilityZone: string;
  requiredLicenses: string;
  collectiveAgreement: string;
}

export interface ContractWorkflowSteps {
  sentWithinDeadline: boolean; // Envoyé dans les délais (ex: 48h)
  sentDate?: string;
  employeeSigned: boolean;
  employeeSignedDate?: string;
  directorSigned: boolean;
  directorSignedDate?: string;
  dpaeCompleted: boolean;
  medicalVisitCompleted: boolean;
  licensesVerified: boolean;
  storedInSharepoint: boolean;
  sharepointUrl?: string;
  notes?: string;
}

export interface GeneratedContract {
  id: string;
  contractNumber: string;
  createdAt: string;
  employeeData: ContractEmployeeData;
  selectedArticleIds: string[];
  customArticlesContent?: Record<string, string>; // If modified specifically for this contract
  renderedFullText: string;
  status: 'draft' | 'pending_signature' | 'partially_signed' | 'fully_signed' | 'archived';
  workflow: ContractWorkflowSteps;
}

export interface AppSettings {
  pointValue: number; // Valeur du point entreprise (ex: 10.42 €)
  companyName: string;
  companyAddress: string;
  companyCity: string;
  companySiret: string;
  companyApe: string;
  companyRepresentative: string;
  representativeRole: string;
  collectiveAgreement: string;
}

export interface AppDatabase {
  version: string;
  exportedAt: string;
  settings: AppSettings;
  jobs: JobPosition[];
  articles: ContractArticle[];
  templates: ContractTemplate[];
  contracts: GeneratedContract[];
}

export interface TagInfo {
  tag: string;
  label: string;
  category: 'Salarié' | 'Poste & Salaire' | 'Dates & Durées' | 'Entreprise' | 'Transport';
  description: string;
  example: string;
}
