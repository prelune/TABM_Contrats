import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  FileText, 
  User, 
  Briefcase, 
  Layers, 
  Calculator, 
  Eye, 
  EyeOff,
  Bookmark, 
  Check, 
  Sparkles, 
  Calendar, 
  MapPin, 
  Euro, 
  AlertCircle,
  Clock,
  ArrowRight,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  RefreshCw,
  Network,
  CheckSquare,
  Square,
  Search,
  AlertTriangle,
  Info,
  SlidersHorizontal,
  ChevronRight,
  ShieldCheck,
  FileCheck,
  Building2
} from 'lucide-react';
import { 
  AppDatabase, 
  ContractEmployeeData, 
  ContractType, 
  EmployeeStatus, 
  ContractTemplate, 
  GeneratedContract,
  ContractArticle,
  WorkTimeRegime,
  WORK_TIME_REGIME_LABELS
} from '../../types';
import { CONTRACT_TYPE_LABELS, EMPLOYEE_STATUS_LABELS } from '../../data/defaultData';
import { calculateSalary, formatEuro, stripArticlePrefix, computeDefaultTrialPeriod, formatDateFrench } from '../../utils/contractCompiler';
import { ContractPreviewModal } from './ContractPreviewModal';

export interface ArticleCategoryStyle {
  bg: string;
  hoverBg: string;
  text: string;
  border: string;
  tag: string;
  badge: string;
  iconColor: string;
}

export interface ArticleCategoryGroup {
  id: string;
  name: string;
  minOrder: number;
  style: ArticleCategoryStyle;
}

export const getCategoryStyle = (categoryName: string): ArticleCategoryStyle => {
  const norm = categoryName.toLowerCase().trim();
  if (norm.includes('général') || norm.includes('general') || norm.includes('engagement') || norm.includes('préambule')) {
    return {
      bg: 'bg-blue-50/70',
      hoverBg: 'hover:bg-blue-50',
      text: 'text-blue-900',
      border: 'border-blue-200',
      tag: 'bg-blue-600 text-white',
      badge: 'bg-blue-100 text-blue-800 border-blue-200',
      iconColor: 'text-blue-600',
    };
  }
  if (norm.includes('poste') || norm.includes('mission') || norm.includes('qualification') || norm.includes('lieu') || norm.includes('mobilité') || norm.includes('mobilite')) {
    return {
      bg: 'bg-amber-50/70',
      hoverBg: 'hover:bg-amber-50',
      text: 'text-amber-900',
      border: 'border-amber-200',
      tag: 'bg-amber-600 text-white',
      badge: 'bg-amber-100 text-amber-800 border-amber-200',
      iconColor: 'text-amber-600',
    };
  }
  if (norm.includes('temps') || norm.includes('durée') || norm.includes('duree') || norm.includes('horaire')) {
    return {
      bg: 'bg-purple-50/70',
      hoverBg: 'hover:bg-purple-50',
      text: 'text-purple-900',
      border: 'border-purple-200',
      tag: 'bg-purple-600 text-white',
      badge: 'bg-purple-100 text-purple-800 border-purple-200',
      iconColor: 'text-purple-600',
    };
  }
  if (norm.includes('rémunération') || norm.includes('remuneration') || norm.includes('salaire') || norm.includes('prime')) {
    return {
      bg: 'bg-emerald-50/70',
      hoverBg: 'hover:bg-emerald-50',
      text: 'text-emerald-900',
      border: 'border-emerald-200',
      tag: 'bg-emerald-600 text-white',
      badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      iconColor: 'text-emerald-600',
    };
  }
  if (norm.includes('transport') || norm.includes('sécurité') || norm.includes('securite') || norm.includes('conduite') || norm.includes('véhicule') || norm.includes('vehicule')) {
    return {
      bg: 'bg-teal-50/70',
      hoverBg: 'hover:bg-teal-50',
      text: 'text-teal-900',
      border: 'border-teal-200',
      tag: 'bg-teal-600 text-white',
      badge: 'bg-teal-100 text-teal-800 border-teal-200',
      iconColor: 'text-teal-600',
    };
  }
  if (norm.includes('encadrement') || norm.includes('cadre') || norm.includes('maîtrise') || norm.includes('maitrise')) {
    return {
      bg: 'bg-indigo-50/70',
      hoverBg: 'hover:bg-indigo-50',
      text: 'text-indigo-900',
      border: 'border-indigo-200',
      tag: 'bg-indigo-600 text-white',
      badge: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      iconColor: 'text-indigo-600',
    };
  }
  if (norm.includes('établissement') || norm.includes('etablissement') || norm.includes('site') || norm.includes('urbain') || norm.includes('régional') || norm.includes('regional') || norm.includes('tourisme')) {
    return {
      bg: 'bg-cyan-50/70',
      hoverBg: 'hover:bg-cyan-50',
      text: 'text-cyan-900',
      border: 'border-cyan-200',
      tag: 'bg-cyan-600 text-white',
      badge: 'bg-cyan-100 text-cyan-800 border-cyan-200',
      iconColor: 'text-cyan-600',
    };
  }
  if (norm.includes('avenant') || norm.includes('mutation') || norm.includes('renouvellement')) {
    return {
      bg: 'bg-orange-50/70',
      hoverBg: 'hover:bg-orange-50',
      text: 'text-orange-900',
      border: 'border-orange-200',
      tag: 'bg-orange-600 text-white',
      badge: 'bg-orange-100 text-orange-800 border-orange-200',
      iconColor: 'text-orange-600',
    };
  }
  return {
    bg: 'bg-slate-50/70',
    hoverBg: 'hover:bg-slate-50',
    text: 'text-slate-900',
    border: 'border-slate-200',
    tag: 'bg-slate-700 text-white',
    badge: 'bg-slate-100 text-slate-800 border-slate-200',
    iconColor: 'text-slate-600',
  };
};

interface ContractWizardProps {
  db: AppDatabase;
  onSaveContract: (contract: GeneratedContract) => void;
  onSaveTemplate: (template: Omit<ContractTemplate, 'id'>) => void;
  onOpenTagsModal: () => void;
  initialEmployeeData?: Partial<ContractEmployeeData>;
  initialArticleIds?: string[];
}

export const ContractWizard: React.FC<ContractWizardProps> = ({
  db,
  onSaveContract,
  onSaveTemplate,
  onOpenTagsModal,
  initialEmployeeData,
  initialArticleIds,
}) => {
  // Find initial establishment
  const initialEst = db.establishments.find(
    (e) => e.id === (initialEmployeeData?.establishmentId || db.settings.defaultEstablishmentId)
  ) || db.establishments[0];

  const initialTrial = computeDefaultTrialPeriod({
    contractType: initialEmployeeData?.contractType || 'cdi',
    status: initialEmployeeData?.status || 'conducteur',
    startDate: initialEmployeeData?.startDate || new Date().toISOString().slice(0, 10),
    endDate: initialEmployeeData?.endDate,
    establishment: initialEst,
  });

  // Form State: Salarié & Poste
  const [formData, setFormData] = useState<ContractEmployeeData>(() => ({
    civility: 'M.',
    lastName: '',
    firstName: '',
    birthDate: '1990-01-01',
    birthPlace: 'Lyon (69)',
    nationality: 'Française',
    socialSecurityNumber: '',
    address: '',
    postalCode: '69000',
    city: 'Lyon',

    establishmentId: initialEst?.id || 'etab-1',
    establishmentName: initialEst?.name || '',
    establishmentSiret: initialEst?.siret || db.settings.companySiret,
    establishmentApe: initialEst?.ape || db.settings.companyApe,
    establishmentLogoUrl: initialEst?.logoUrl,
    establishmentFooterText: initialEst?.footerText,

    companyName: initialEst?.companyName || db.settings.companyName,
    companyAddress: initialEst?.address || db.settings.companyAddress,
    companyCity: initialEst ? `${initialEst.postalCode} ${initialEst.city}` : db.settings.companyCity,
    companyRepresentative: initialEst?.director || db.settings.companyRepresentative,
    representativeRole: initialEst?.directorRole || db.settings.representativeRole,
    collectiveAgreement: initialEst?.collectiveAgreement || db.settings.collectiveAgreement,

    contractType: 'cdi',
    status: 'conducteur',
    workTimeRegime: initialEmployeeData?.workTimeRegime || 'temps_plein',
    jobTitle: '',
    coefficient: 140,
    salaryCalculationMode: initialEst?.salaryCalculationMode || 'point_value',
    pointValue: initialEst?.pointValue ?? db.settings.pointValue,
    monthlyGrossSalary: 0,
    hourlyRate: 0,
    weeklyHours: initialEmployeeData?.weeklyHours !== undefined ? initialEmployeeData.weeklyHours : 35,
    monthlyHours: 151.67,
    additionalBonus: 0,
    bonusDetails: '',

    startDate: new Date().toISOString().slice(0, 10),
    endDate: '',
    seniorityDate: initialEmployeeData?.seniorityDate || '',
    cddReason: 'Surcroît temporaire d’activité de transport',
    replacedEmployeeName: '',
    replacedEmployeeRole: '',
    trialPeriod: initialEmployeeData?.trialPeriod || initialTrial.trialPeriod,
    trialPeriodRenewal: initialEmployeeData?.trialPeriodRenewal || initialTrial.trialPeriodRenewal,
    workplaceDepot: initialEmployeeData?.workplaceDepot || initialEst?.name || 'Dépôt principal',
    mobilityZone: 'Ensemble des lignes et dessertes du réseau TABM',
    requiredLicenses: 'Permis D en cours de validité, FIMO Voyageurs et Carte conducteur',
    ...initialEmployeeData,
  }));

  // Track if user explicitly customized the trial period string manually
  const [hasManualTrialPeriod, setHasManualTrialPeriod] = useState<boolean>(Boolean(initialEmployeeData?.trialPeriod));

  // Active establishment helper
  const currentEst = db.establishments.find((e) => e.id === formData.establishmentId) || db.establishments[0];
  const isEstPointMode = (formData.salaryCalculationMode || currentEst?.salaryCalculationMode || 'point_value') === 'point_value';
  const effectivePointValue = formData.pointValue || currentEst?.pointValue || db.settings.pointValue || 10.45;

  // Real-time calculated trial period based on current contract type, status, dates & establishment
  const calculatedTrial = computeDefaultTrialPeriod({
    contractType: formData.contractType,
    status: formData.status,
    startDate: formData.startDate,
    endDate: formData.endDate,
    establishment: currentEst,
  });

  // Automatically update trial period if user hasn't manually customized it
  useEffect(() => {
    if (!hasManualTrialPeriod) {
      setFormData((prev) => ({
        ...prev,
        trialPeriod: calculatedTrial.trialPeriod,
        trialPeriodRenewal: calculatedTrial.trialPeriodRenewal,
      }));
    }
  }, [
    formData.contractType,
    formData.status,
    formData.startDate,
    formData.endDate,
    formData.establishmentId,
    hasManualTrialPeriod,
    calculatedTrial.trialPeriod,
    calculatedTrial.trialPeriodRenewal,
  ]);

  const applyCalculatedTrialPeriod = () => {
    setHasManualTrialPeriod(false);
    setFormData((prev) => ({
      ...prev,
      trialPeriod: calculatedTrial.trialPeriod,
      trialPeriodRenewal: calculatedTrial.trialPeriodRenewal,
    }));
  };

  // Handle switching establishment of affiliation
  const handleEstablishmentSelect = (estId: string) => {
    const est = db.establishments.find((e) => e.id === estId);
    if (!est) return;

    const estMode = est.salaryCalculationMode || 'point_value';
    const estPoint = est.pointValue ?? db.settings.pointValue;

    setFormData((prev) => {
      let nextMonthly = prev.monthlyGrossSalary;
      let nextHourly = prev.hourlyRate;

      if (estMode === 'point_value') {
        const calc = calculateSalary(prev.coefficient, estPoint, prev.additionalBonus, prev.weeklyHours);
        nextMonthly = calc.monthlyGrossSalary;
        nextHourly = calc.hourlyRate;
      }

      // Check if current workplaceDepot was default or previous establishment name
      const prevEst = db.establishments.find((e) => e.id === prev.establishmentId);
      const isDefaultDepot =
        !prev.workplaceDepot ||
        prev.workplaceDepot === prevEst?.name ||
        prev.workplaceDepot === 'Dépôt Central Vaise - Lyon' ||
        prev.workplaceDepot === 'Dépôt principal';
      const nextDepot = isDefaultDepot ? est.name : prev.workplaceDepot;

      return {
        ...prev,
        establishmentId: est.id,
        establishmentName: est.name,
        companyName: est.companyName,
        companyAddress: est.address,
        companyCity: `${est.postalCode} ${est.city}`,
        establishmentSiret: est.siret,
        establishmentApe: est.ape,
        companyRepresentative: est.director,
        representativeRole: est.directorRole,
        collectiveAgreement: est.collectiveAgreement,
        establishmentLogoUrl: est.logoUrl,
        establishmentFooterText: est.footerText,
        salaryCalculationMode: estMode,
        pointValue: estPoint,
        monthlyGrossSalary: nextMonthly,
        hourlyRate: nextHourly,
        workplaceDepot: nextDepot,
      };
    });

    // Update selected articles to reflect establishment
    setSelectedArticleIds((prev) => {
      const valid = prev.filter((id) => {
        const art = db.articles.find((a) => a.id === id);
        if (!art) return false;
        return (
          !art.validEstablishmentIds ||
          art.validEstablishmentIds.length === 0 ||
          art.validEstablishmentIds.includes(est.id)
        );
      });

      const mandatoryForEst = db.articles
        .filter(
          (a) =>
            a.validContractTypes.includes(formData.contractType) &&
            a.validStatuses.includes(formData.status) &&
            (a.isMandatory || a.mandatoryEstablishmentIds?.includes(est.id))
        )
        .map((a) => a.id);

      return Array.from(new Set([...valid, ...mandatoryForEst]));
    });
  };

  // Selected articles state
  const [selectedArticleIds, setSelectedArticleIds] = useState<string[]>(() => {
    if (initialArticleIds && initialArticleIds.length > 0) {
      return initialArticleIds;
    }
    return [];
  });
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');

  // Flag to prevent automatic effect from overwriting deliberate template / duplication choices
  const isCustomSelectionRef = useRef<boolean>(Boolean(initialArticleIds && initialArticleIds.length > 0));

  // UI display modes for clean & readable experience
  // Filter to current profile (the 4 dimensions: contractType, status, establishment, workTimeRegime)
  const [filterToProfileOnly, setFilterToProfileOnly] = useState<boolean>(true);
  const [groupingMode, setGroupingMode] = useState<'sections' | 'requirements'>('sections');
  const [searchArticleQuery, setSearchArticleQuery] = useState('');
  const [expandedPreviewIds, setExpandedPreviewIds] = useState<string[]>([]);

  // Dynamic categories extracted directly from the actual articles in the database
  // The rubriques are ordered naturally according to the min article order in each category
  const categoryGroups = useMemo<ArticleCategoryGroup[]>(() => {
    const map = new Map<string, { minOrder: number; totalCount: number }>();

    db.articles.forEach((art) => {
      const cat = (art.category && art.category.trim()) ? art.category.trim() : 'Général';
      if (!map.has(cat)) {
        map.set(cat, { minOrder: art.order ?? 999, totalCount: 0 });
      }
      const entry = map.get(cat)!;
      entry.totalCount += 1;
      if (typeof art.order === 'number' && art.order < entry.minOrder) {
        entry.minOrder = art.order;
      }
    });

    const groups: ArticleCategoryGroup[] = Array.from(map.entries()).map(([catName, data]) => {
      const id = `cat-${catName.toLowerCase().replace(/[^a-z0-9]/gi, '-')}`;
      return {
        id,
        name: catName,
        minOrder: data.minOrder,
        style: getCategoryStyle(catName),
      };
    });

    groups.sort((a, b) => {
      if (a.minOrder !== b.minOrder) return a.minOrder - b.minOrder;
      return a.name.localeCompare(b.name, 'fr');
    });

    return groups;
  }, [db.articles]);

  // Expanded sections / categories state (default: all open for clear overview)
  const [expandedSectionIds, setExpandedSectionIds] = useState<string[]>(() =>
    categoryGroups.map((s: ArticleCategoryGroup) => s.id)
  );

  // Keep expandedSectionIds in sync when articles or categories change
  useEffect(() => {
    setExpandedSectionIds((prev) => {
      const allIds = categoryGroups.map((c: ArticleCategoryGroup) => c.id);
      if (prev.length === 0) return allIds;
      const set = new Set([...prev, ...allIds]);
      return Array.from(set);
    });
  }, [categoryGroups]);

  // Modals
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [generatedContractNumber, setGeneratedContractNumber] = useState('');
  const [isSaveTemplateModalOpen, setIsSaveTemplateModalOpen] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateDesc, setNewTemplateDesc] = useState('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Initialize or update calculation on load / job change
  useEffect(() => {
    if (db.jobs.length > 0 && !formData.jobTitle) {
      const defaultJob = db.jobs.find((j) => j.category === formData.status) || db.jobs[0];
      if (defaultJob) {
        handleJobSelect(defaultJob.title);
      }
    }
  }, [db.jobs]);

  // Recalculate salary when coefficient, pointValue, or hours change
  useEffect(() => {
    if (isEstPointMode) {
      const calc = calculateSalary(formData.coefficient, effectivePointValue, formData.additionalBonus, formData.weeklyHours);
      setFormData((prev) => ({
        ...prev,
        pointValue: effectivePointValue,
        monthlyGrossSalary: calc.monthlyGrossSalary,
        hourlyRate: calc.hourlyRate,
        monthlyHours: calc.monthlyHours,
      }));
    } else {
      // In manual / company grid mode: update hourly rate based on manual monthly salary and hours
      const effectiveHours = formData.weeklyHours || 35;
      const monthlyHours = (effectiveHours * 52) / 12;
      const hourlyRate = monthlyHours > 0 ? (formData.monthlyGrossSalary + (formData.additionalBonus || 0)) / monthlyHours : 0;
      setFormData((prev) => ({
        ...prev,
        monthlyHours: Math.round(monthlyHours * 100) / 100,
        hourlyRate: Math.round(hourlyRate * 100) / 100,
      }));
    }
  }, [formData.coefficient, effectivePointValue, formData.additionalBonus, formData.weeklyHours, isEstPointMode]);

  // Helper: check if an article is compatible with the active 4 dimensions + seniority rule
  const isArticleCompatibleWithProfile = (art: ContractArticle, employeeData: ContractEmployeeData = formData): boolean => {
    // 1. Contract Type
    if (!art.validContractTypes.includes(employeeData.contractType)) return false;
    // 2. Status
    if (!art.validStatuses.includes(employeeData.status)) return false;
    // 3. Work Time Regime (TC / TP)
    if (art.workTimeTarget && art.workTimeTarget !== 'les_deux' && art.workTimeTarget !== employeeData.workTimeRegime) return false;
    // 4. Establishment
    if (employeeData.establishmentId && art.validEstablishmentIds && art.validEstablishmentIds.length > 0 && !art.validEstablishmentIds.includes(employeeData.establishmentId)) return false;

    // Seniority rule: ART-02A vs ART-02B for CDI
    if (employeeData.contractType === 'cdi') {
      const hasSeniority = Boolean(employeeData.seniorityDate?.trim());
      if (art.code === 'ART-02A' && hasSeniority) return false;
      if (art.code === 'ART-02B' && !hasSeniority) return false;
    }

    return true;
  };

  // Helper: check if an article is strictly mandatory for THIS contract
  const isArticleMandatoryForCurrent = (art: ContractArticle): boolean => {
    // Must strictly match the 4 dimensions
    if (!art.validContractTypes.includes(formData.contractType)) return false;
    if (!art.validStatuses.includes(formData.status)) return false;
    if (art.workTimeTarget && art.workTimeTarget !== 'les_deux' && art.workTimeTarget !== formData.workTimeRegime) return false;
    if (formData.establishmentId && art.validEstablishmentIds && art.validEstablishmentIds.length > 0 && !art.validEstablishmentIds.includes(formData.establishmentId)) return false;

    // Seniority rule for ART-02A and ART-02B in CDI
    if (art.code === 'ART-02A') {
      return formData.contractType === 'cdi' && !Boolean(formData.seniorityDate?.trim());
    }
    if (art.code === 'ART-02B') {
      return formData.contractType === 'cdi' && Boolean(formData.seniorityDate?.trim());
    }

    // General mandatory rules
    if (art.isMandatory) return true;
    if (formData.establishmentId && art.mandatoryEstablishmentIds?.includes(formData.establishmentId)) {
      return true;
    }
    return false;
  };

  // Auto-switch ART-02A and ART-02B when seniorityDate changes for CDI
  useEffect(() => {
    if (formData.contractType !== 'cdi') return;
    const hasSeniority = Boolean(formData.seniorityDate?.trim());
    const art2A = db.articles.find((a) => a.code === 'ART-02A');
    const art2B = db.articles.find((a) => a.code === 'ART-02B');
    if (!art2A && !art2B) return;

    setSelectedArticleIds((prev) => {
      let next = [...prev];
      if (hasSeniority) {
        if (art2A) next = next.filter((id) => id !== art2A.id);
        if (art2B && !next.includes(art2B.id)) next.push(art2B.id);
      } else {
        if (art2B) next = next.filter((id) => id !== art2B.id);
        if (art2A && !next.includes(art2A.id)) next.push(art2A.id);
      }
      return next;
    });
  }, [formData.seniorityDate, formData.contractType, db.articles]);

  // Auto-suggest articles when contract type, status, work time regime or establishment changes (unless applying a template / duplicated)
  useEffect(() => {
    if (isCustomSelectionRef.current) {
      isCustomSelectionRef.current = false;
      return;
    }

    const compatible = db.articles.filter((art) => isArticleCompatibleWithProfile(art, formData));
    setSelectedArticleIds(compatible.map((a) => a.id));
  }, [formData.contractType, formData.status, formData.workTimeRegime, formData.establishmentId, db.articles]);

  const toggleSectionExpanded = (sectionId: string) => {
    setExpandedSectionIds((prev) =>
      prev.includes(sectionId) ? prev.filter((id) => id !== sectionId) : [...prev, sectionId]
    );
  };

  const toggleArticlePreview = (articleId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedPreviewIds((prev) =>
      prev.includes(articleId) ? prev.filter((id) => id !== articleId) : [...prev, articleId]
    );
  };

  const handleSelectAllInList = (articlesList: ContractArticle[]) => {
    const idsToAdd = articlesList.map((a) => a.id);
    setSelectedArticleIds((prev) => Array.from(new Set([...prev, ...idsToAdd])));
  };

  const handleDeselectAllInList = (articlesList: ContractArticle[]) => {
    const idsToRemove = new Set(articlesList.map((a) => a.id));
    setSelectedArticleIds((prev) => prev.filter((id) => !idsToRemove.has(id)));
  };

  // Calculate sequential position for each selected article (1, 2, 3...)
  const sortedSelectedArticles = db.articles
    .filter((a) => selectedArticleIds.includes(a.id))
    .sort((a, b) => a.order - b.order);

  const getArticleSequenceNumber = (articleId: string): number | null => {
    const idx = sortedSelectedArticles.findIndex((a) => a.id === articleId);
    return idx !== -1 ? idx + 1 : null;
  };

  const getCategoryArticles = (categoryName: string): ContractArticle[] => {
    return db.articles
      .filter((art) => {
        const cat = (art.category && art.category.trim()) ? art.category.trim() : 'Général';
        if (cat !== categoryName) return false;
        if (filterToProfileOnly && !isArticleCompatibleWithProfile(art, formData)) {
          return false;
        }
        return true;
      })
      .sort((a, b) => a.order - b.order);
  };

  // Handlers
  const handleJobSelect = (title: string) => {
    const job = db.jobs.find((j) => j.title === title);
    if (job) {
      setFormData((prev) => {
        const est = db.establishments.find((e) => e.id === prev.establishmentId) || db.establishments[0];
        const mode = prev.salaryCalculationMode || est?.salaryCalculationMode || 'point_value';
        const point = prev.pointValue || est?.pointValue || db.settings.pointValue || 10.45;

        let nextSalary = prev.monthlyGrossSalary;
        let nextRate = prev.hourlyRate;

        if (mode === 'point_value') {
          const calc = calculateSalary(job.coefficient, point, prev.additionalBonus, job.weeklyHours);
          nextSalary = calc.monthlyGrossSalary;
          nextRate = calc.hourlyRate;
        } else {
          // If manual and salary is not yet set (or 0), calculate a default starting baseline
          if (nextSalary === 0) {
            const calc = calculateSalary(job.coefficient, point, prev.additionalBonus, job.weeklyHours);
            nextSalary = calc.monthlyGrossSalary;
            nextRate = calc.hourlyRate;
          }
        }

        return {
          ...prev,
          jobTitle: job.title,
          status: job.category,
          coefficient: job.coefficient,
          weeklyHours: job.weeklyHours,
          requiredLicenses: job.requiredLicenses || prev.requiredLicenses,
          monthlyGrossSalary: nextSalary,
          hourlyRate: nextRate,
        };
      });
    }
  };

  const handleApplyTemplate = (tplId: string) => {
    setSelectedTemplateId(tplId);
    const tpl = db.templates.find((t) => t.id === tplId);
    if (!tpl) return;

    isCustomSelectionRef.current = true;

    setFormData((prev) => {
      let updatedJob = prev.jobTitle;
      let updatedCoeff = prev.coefficient;

      if (tpl.defaultJobTitle) {
        const foundJob = db.jobs.find((j) => j.title === tpl.defaultJobTitle);
        if (foundJob) {
          updatedJob = foundJob.title;
          updatedCoeff = foundJob.coefficient;
        }
      }

      return {
        ...prev,
        contractType: tpl.contractType,
        status: tpl.status,
        jobTitle: updatedJob,
        coefficient: updatedCoeff,
        weeklyHours: tpl.defaultWeeklyHours || prev.weeklyHours,
      };
    });

    setSelectedArticleIds(tpl.articleIds);
    setExpandedSectionIds(categoryGroups.map((s: ArticleCategoryGroup) => s.id));
  };

  const toggleArticleSelection = (articleId: string) => {
    setSelectedArticleIds((prev) =>
      prev.includes(articleId) ? prev.filter((id) => id !== articleId) : [...prev, articleId]
    );
  };

  const selectAllCompatibleArticles = () => {
    const compatible = db.articles.filter((art) => isArticleCompatibleWithProfile(art, formData));
    setSelectedArticleIds(compatible.map((a) => a.id));
  };

  // Missing mandatory articles check (filtered strictly for this contract & profile)
  const missingMandatoryArticles = db.articles.filter(
    (art) => isArticleMandatoryForCurrent(art) && !selectedArticleIds.includes(art.id)
  );

  const handleAddAllMandatoryArticles = () => {
    const mandatoryIds = db.articles
      .filter((art) => isArticleMandatoryForCurrent(art))
      .map((art) => art.id);
    setSelectedArticleIds((prev) => Array.from(new Set([...prev, ...mandatoryIds])));
  };

  const handleCreateContract = () => {
    const contractNumber = `TABM-${new Date().getFullYear()}-${(db.contracts.length + 1).toString().padStart(3, '0')}`;
    setGeneratedContractNumber(contractNumber);
    const newContract: GeneratedContract = {
      id: `contract-${Date.now()}`,
      contractNumber,
      createdAt: new Date().toISOString().slice(0, 10),
      employeeData: { ...formData },
      selectedArticleIds: [...selectedArticleIds],
      renderedFullText: '',
      status: 'pending_signature',
      workflow: {
        sentWithinDeadline: true,
        sentDate: new Date().toISOString().slice(0, 10),
        employeeSigned: false,
        directorSigned: false,
        dpaeCompleted: false,
        medicalVisitCompleted: false,
        licensesVerified: true,
        storedInSharepoint: false,
        sharepointUrl: '',
        notes: `Généré le ${new Date().toLocaleDateString('fr-FR')}`,
      },
    };

    onSaveContract(newContract);
    setSaveSuccessMsg(`Contrat ${contractNumber} généré et archivé dans votre historique !`);
    setTimeout(() => setSaveSuccessMsg(null), 4000);
    setIsPreviewOpen(true);
  };

  const handleSaveAsTemplateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTemplateName.trim()) return;

    onSaveTemplate({
      name: newTemplateName,
      description: newTemplateDesc || `Modèle pour ${formData.jobTitle} (${formData.contractType.toUpperCase()})`,
      contractType: formData.contractType,
      status: formData.status,
      defaultJobTitle: formData.jobTitle,
      defaultWeeklyHours: formData.weeklyHours,
      articleIds: [...selectedArticleIds],
    });

    setIsSaveTemplateModalOpen(false);
    setNewTemplateName('');
    setNewTemplateDesc('');
    setSaveSuccessMsg('Nouveau modèle sauvegardé avec succès !');
    setTimeout(() => setSaveSuccessMsg(null), 3500);
  };

  const renderArticleCard = (art: ContractArticle) => {
    const isSelected = selectedArticleIds.includes(art.id);
    const seqNum = getArticleSequenceNumber(art.id);
    const isPreviewExpanded = expandedPreviewIds.includes(art.id);
    const displayTitle = stripArticlePrefix(art.title);
    const isMandatory = isArticleMandatoryForCurrent(art);
    const isCompatible = isArticleCompatibleWithProfile(art, formData);

    // Contextual badge info for the 4 dimensions
    const isContractTypeMatch = art.validContractTypes.includes(formData.contractType);
    const isStatusMatch = art.validStatuses.includes(formData.status);
    const isEtabMatch = !art.validEstablishmentIds || art.validEstablishmentIds.length === 0 || !formData.establishmentId || art.validEstablishmentIds.includes(formData.establishmentId);
    const isWorkTimeMatch = !art.workTimeTarget || art.workTimeTarget === 'les_deux' || art.workTimeTarget === formData.workTimeRegime;

    return (
      <div
        key={art.id}
        onClick={() => toggleArticleSelection(art.id)}
        className={`p-2.5 rounded-lg border text-xs cursor-pointer transition ${
          isSelected
            ? 'bg-white border-blue-400 shadow-2xs ring-1 ring-blue-200'
            : !isCompatible
            ? 'bg-slate-50/80 border-slate-200 text-slate-500 hover:bg-white'
            : 'bg-white/80 border-slate-200 hover:bg-white text-slate-700'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          {/* Main Title & Checkbox */}
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => {}} // controlled via parent container click
              className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 cursor-pointer shrink-0"
            />

            {/* Incremental sequential number badge */}
            {isSelected && seqNum !== null ? (
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-600 text-white font-mono shrink-0 shadow-2xs">
                Art. {seqNum}
              </span>
            ) : (
              <span className="text-[10px] text-slate-400 font-mono shrink-0">
                {art.code}
              </span>
            )}

            <div className="min-w-0 flex-1">
              <span className={`font-semibold truncate block ${isSelected ? 'text-slate-900 font-bold' : 'text-slate-700'}`}>
                {displayTitle}
              </span>
              <span className="text-[10px] text-slate-400 line-clamp-1">
                {art.category}
              </span>
            </div>
          </div>

          {/* 4 Dimensions Badges & Requirement */}
          <div className="flex flex-wrap items-center gap-1.5 shrink-0 self-start sm:self-center">
            {/* Dimension 1: Contrats */}
            <span
              className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                isContractTypeMatch
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-slate-100 text-slate-500 border-slate-200'
              }`}
              title={`Types de contrat valides : ${art.validContractTypes.map((t) => CONTRACT_TYPE_LABELS[t] || t).join(', ')}`}
            >
              {art.validContractTypes.length === 1
                ? CONTRACT_TYPE_LABELS[art.validContractTypes[0]] || art.validContractTypes[0]
                : art.validContractTypes.length >= 4
                ? 'Tous contrats'
                : art.validContractTypes.map((t) => (t === 'cdi' ? 'CDI' : t === 'cdd' ? 'CDD' : t)).join('/')}
            </span>

            {/* Dimension 2: Statut */}
            <span
              className={`text-[9px] font-bold capitalize px-1.5 py-0.5 rounded border ${
                isStatusMatch
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : 'bg-slate-100 text-slate-500 border-slate-200'
              }`}
              title={`Statuts applicables : ${art.validStatuses.map((s) => EMPLOYEE_STATUS_LABELS[s] || s).join(', ')}`}
            >
              {art.validStatuses.length === 1
                ? EMPLOYEE_STATUS_LABELS[art.validStatuses[0]] || art.validStatuses[0]
                : art.validStatuses.length >= 5
                ? 'Tous statuts'
                : art.validStatuses.map((s) => s.slice(0, 4)).join(', ')}
            </span>

            {/* Dimension 3: Établissement (si spécifique) */}
            {art.validEstablishmentIds && art.validEstablishmentIds.length > 0 && art.validEstablishmentIds.length < db.establishments.length && (
              <span
                className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                  isEtabMatch
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-slate-100 text-slate-500 border-slate-200'
                }`}
                title="Clause spécifique à certains établissements"
              >
                {art.validEstablishmentIds.length === 1
                  ? db.establishments.find((e) => e.id === art.validEstablishmentIds![0])?.shortName || 'Site spécifique'
                  : `${art.validEstablishmentIds.length} sites`}
              </span>
            )}

            {/* Dimension 4: Régime de travail (TC / TP) */}
            {art.workTimeTarget && art.workTimeTarget !== 'les_deux' && (
              <span
                className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                  art.workTimeTarget === 'temps_plein'
                    ? isWorkTimeMatch
                      ? 'bg-blue-100 text-blue-800 border-blue-300'
                      : 'bg-slate-100 text-slate-500 border-slate-200'
                    : isWorkTimeMatch
                    ? 'bg-purple-100 text-purple-800 border-purple-300'
                    : 'bg-slate-100 text-slate-500 border-slate-200'
                }`}
                title={art.workTimeTarget === 'temps_plein' ? 'Temps Complet uniquement' : 'Temps Partiel uniquement'}
              >
                {art.workTimeTarget === 'temps_plein' ? 'TC seul' : 'TP seul'}
              </span>
            )}

            {/* Obligatoire badge strictly computed for active contract */}
            {isMandatory && (
              <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 shadow-2xs">
                ★ Obligatoire
              </span>
            )}

            {!isCompatible && (
              <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200">
                Non applicable
              </span>
            )}

            {/* Preview toggle */}
            <button
              type="button"
              onClick={(e) => toggleArticlePreview(art.id, e)}
              className="text-slate-400 hover:text-blue-600 p-0.5"
              title={isPreviewExpanded ? 'Masquer le texte' : 'Aperçu du texte'}
            >
              {isPreviewExpanded ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Text Preview */}
        {isPreviewExpanded && (
          <div className="mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded leading-relaxed font-sans animate-in fade-in">
            <div className="text-[10px] text-slate-400 font-mono mb-1">
              Code: {art.code} • Ordre contractuel: #{art.order}
            </div>
            {art.content.replace(/\{\{[^}]+\}\}/g, '...')}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header & Quick Template Bar */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-blue-600 text-xs font-bold uppercase tracking-wider mb-1">
              <FileText className="w-4 h-4" />
              <span>Générateur de Contrat de Travail</span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-500 font-normal">RH Transport Urbain & Interurbain</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Créer un Contrat de Travail
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              Renseignez les données du salarié, ajustez les clauses requises, puis téléchargez directement en PDF officiel ou Word (.doc).
            </p>
          </div>

          {/* Template Quick Selector */}
          <div className="flex items-center gap-2.5 bg-slate-50 p-2 rounded-xl border border-slate-200 self-stretch sm:self-auto">
            <Bookmark className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="text-xs font-bold text-slate-700 whitespace-nowrap">
              Modèle rapide :
            </span>
            <select
              value={selectedTemplateId}
              onChange={(e) => handleApplyTemplate(e.target.value)}
              className="text-xs bg-white border border-slate-300 rounded-lg px-3 py-1.5 font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            >
              <option value="">-- Choisir un modèle enregistré --</option>
              {db.templates.map((tpl) => (
                <option key={tpl.id} value={tpl.id}>
                  {tpl.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {saveSuccessMsg && (
          <div className="mt-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between animate-in fade-in">
            <span className="font-semibold">{saveSuccessMsg}</span>
          </div>
        )}
      </div>

      <div className="space-y-6">
          {/* SECTION 1: Établissement de Rattachement (Sélection obligatoire) */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
            <div className="px-5 py-3.5 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-1 rounded-md bg-blue-100 text-blue-700">
                  <Building2 className="w-3.5 h-3.5" />
                </div>
                <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-wide">
                  1. Établissement de Rattachement
                </h2>
              </div>
              <span className="text-[11px] text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                Entité Juridique TABM
              </span>
            </div>

            <div className="p-5 space-y-4">
              <p className="text-xs text-slate-600">
                Sélectionnez l'établissement auquel ce contrat est rattaché. La raison sociale officielle, le SIRET, le logo d'en-tête et les mentions de pied de page configurées s'appliqueront automatiquement au document.
              </p>

              {/* Establishments Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {db.establishments.map((est) => {
                  const isSelected = est.id === formData.establishmentId;

                  return (
                    <button
                      key={est.id}
                      type="button"
                      onClick={() => handleEstablishmentSelect(est.id)}
                      className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between ${
                        isSelected
                          ? 'bg-blue-50/80 border-blue-500 shadow-xs ring-2 ring-blue-500/20'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-1.5 mb-2">
                          <div className="flex items-center space-x-2">
                            <div
                              className={`w-7 h-7 rounded-md flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden ${
                                isSelected
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-slate-100 text-slate-600 border border-slate-200'
                              }`}
                            >
                              {est.logoUrl ? (
                                <img src={est.logoUrl} alt="Logo" className="w-full h-full object-contain p-0.5" />
                              ) : (
                                <Building2 className="w-4 h-4" />
                              )}
                            </div>
                            <span className="text-xs font-bold text-slate-900 line-clamp-1">
                              {est.shortName || est.name}
                            </span>
                          </div>

                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                              isSelected ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 bg-white'
                            }`}
                          >
                            {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                          </div>
                        </div>

                        <p className="text-[11px] text-slate-600 font-medium line-clamp-2">
                          {est.companyName}
                        </p>

                        <div className="mt-2">
                          <span className={`inline-block text-[9.5px] font-bold px-2 py-0.5 rounded border ${
                            (est.salaryCalculationMode || 'point_value') === 'point_value'
                              ? 'bg-blue-100/80 text-blue-800 border-blue-200'
                              : 'bg-purple-100/80 text-purple-800 border-purple-200'
                          }`}>
                            {(est.salaryCalculationMode || 'point_value') === 'point_value'
                              ? `Point : ${(est.pointValue || 10.45).toFixed(2)} €`
                              : 'Grille propre / Manuel'}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-500">
                        <span className="font-mono">SIRET: {est.siret ? est.siret.slice(0, 9) + '...' : '-'}</span>
                        <span className="font-semibold text-slate-700">{est.city}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Active corporate summary box */}
              {formData.establishmentId && (
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs">
                  <div className="space-y-0.5">
                    <div className="text-slate-800 font-bold flex items-center gap-1.5">
                      <span className="text-blue-700">Raison Sociale :</span> {formData.companyName}
                    </div>
                    <div className="text-[11px] text-slate-600">
                      SIRET : <span className="font-mono font-medium">{formData.establishmentSiret || '-'}</span> • Code APE : <span className="font-mono">{formData.establishmentApe || '-'}</span> • Directeur : <span className="font-medium">{formData.companyRepresentative} ({formData.representativeRole})</span>
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {formData.collectiveAgreement}
                    </div>
                    <div className="text-[10.5px] font-semibold text-slate-700 pt-0.5">
                      Politique Salariale :{' '}
                      <span className={formData.salaryCalculationMode === 'manual' ? 'text-purple-700 font-bold' : 'text-blue-700 font-bold'}>
                        {formData.salaryCalculationMode === 'manual'
                          ? 'Saisie manuelle libre / Grille propre d\'établissement'
                          : `Calcul par valeur du point d'établissement (${(formData.pointValue || 10.45).toFixed(2)} €)`}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                    {formData.establishmentLogoUrl ? (
                      <span className="inline-flex items-center text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Logo personnalisé
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        Logo standard
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* SECTION 2: Informations Salarié */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
            <div className="px-5 py-3.5 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-1 rounded-md bg-blue-100 text-blue-700">
                  <User className="w-3.5 h-3.5" />
                </div>
                <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-wide">
                  2. Salarié & État Civil
                </h2>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">Champs obligatoires *</span>
            </div>

            <div className="p-5 space-y-3.5">
              {/* Civilité, Nom, Prénom */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-3">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Civilité *
                  </label>
                  <select
                    value={formData.civility}
                    onChange={(e) => setFormData({ ...formData, civility: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-medium"
                  >
                    <option value="M.">M.</option>
                    <option value="Mme">Mme</option>
                  </select>
                </div>
                <div className="sm:col-span-5">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Nom de famille *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    placeholder="DUPONT"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden uppercase font-semibold text-slate-900"
                  />
                </div>
                <div className="sm:col-span-4">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Prénom *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    placeholder="Marc"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-semibold text-slate-900"
                  />
                </div>
              </div>

              {/* Date & Lieu de naissance, Nationalité */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-4">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Date de naissance *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-medium"
                  />
                </div>
                <div className="sm:col-span-5">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Lieu de naissance *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.birthPlace}
                    onChange={(e) => setFormData({ ...formData, birthPlace: e.target.value })}
                    placeholder="Lyon 3ème (69)"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Nationalité
                  </label>
                  <input
                    type="text"
                    value={formData.nationality}
                    onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                    placeholder="Française"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* N° Sécurité Sociale & Adresse */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-5">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    N° Sécurité Sociale *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.socialSecurityNumber}
                    onChange={(e) => setFormData({ ...formData, socialSecurityNumber: e.target.value })}
                    placeholder="1 89 05 69 123 456 78"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono text-slate-900"
                  />
                </div>
                <div className="sm:col-span-7">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Adresse postale *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="15 Rue de la Paix"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Code postal & Ville */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-4">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Code Postal *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    placeholder="69003"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
                <div className="sm:col-span-8">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Ville *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Lyon"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: Poste, Métier & Calcul du Salaire */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
            <div className="px-5 py-3.5 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-1 rounded-md bg-amber-100 text-amber-700">
                  <Briefcase className="w-3.5 h-3.5" />
                </div>
                <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-wide">
                  3. Poste, Métier & Grille Salariale
                </h2>
              </div>
              <span className="text-[11px] text-blue-700 font-bold bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                Valeur point : {db.settings.pointValue.toFixed(2)} €
              </span>
            </div>

            <div className="p-5 space-y-4">
              {/* Type de contrat & Statut */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Type de Contrat *
                  </label>
                  <select
                    value={formData.contractType}
                    onChange={(e) => {
                      const newType = e.target.value as ContractType;
                      setFormData((prev) => ({ ...prev, contractType: newType }));
                    }}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-bold text-slate-900"
                  >
                    {Object.entries(CONTRACT_TYPE_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Statut Collaborateur *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => {
                      const newStatus = e.target.value as EmployeeStatus;
                      setFormData((prev) => ({ ...prev, status: newStatus }));
                    }}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden capitalize font-semibold text-slate-800"
                  >
                    {Object.entries(EMPLOYEE_STATUS_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Sélection du Métier depuis la table */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span>Métier dans l'Entreprise (Table de correspondance) *</span>
                  <span className="text-[10px] text-blue-600 font-normal">Assigne automatiquement coefficient & heures</span>
                </label>
                <select
                  value={formData.jobTitle}
                  onChange={(e) => handleJobSelect(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                >
                  <option value="">-- Choisir le métier dans la grille --</option>
                  {db.jobs.map((job) => (
                    <option key={job.id} value={job.title}>
                      {job.title} — Coeff {job.coefficient} ({EMPLOYEE_STATUS_LABELS[job.category]})
                    </option>
                  ))}
                </select>
              </div>

              {/* Bloc Rémunération adapté à la politique de l'établissement */}
              <div className="bg-slate-50/90 rounded-xl p-4 border border-slate-200 space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200/80 pb-2.5">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                      Politique de Rémunération ({currentEst?.shortName || 'Établissement'})
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      isEstPointMode
                        ? 'bg-blue-100 text-blue-800 border-blue-200'
                        : 'bg-purple-100 text-purple-800 border-purple-200'
                    }`}>
                      {isEstPointMode ? 'Mode Valeur du Point' : 'Mode Saisie Manuelle / Grille'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        const newMode = isEstPointMode ? 'manual' : 'point_value';
                        if (newMode === 'point_value') {
                          const calc = calculateSalary(formData.coefficient, effectivePointValue, formData.additionalBonus, formData.weeklyHours);
                          setFormData((prev) => ({
                            ...prev,
                            salaryCalculationMode: 'point_value',
                            pointValue: effectivePointValue,
                            monthlyGrossSalary: calc.monthlyGrossSalary,
                            hourlyRate: calc.hourlyRate,
                          }));
                        } else {
                          setFormData((prev) => ({
                            ...prev,
                            salaryCalculationMode: 'manual',
                          }));
                        }
                      }}
                      className="text-[10.5px] font-semibold text-slate-600 hover:text-blue-700 bg-white hover:bg-slate-100 px-2 py-1 rounded border border-slate-200 transition"
                    >
                      {isEstPointMode ? 'Bascule en saisie libre' : 'Bascule en calcul par point'}
                    </button>
                  </div>
                </div>

                {isEstPointMode ? (
                  /* MODE VALEUR DU POINT */
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                      <div className="sm:col-span-4">
                        <label className="block text-[10.5px] font-bold text-slate-600 uppercase mb-1">
                          Valeur du Point ({currentEst?.shortName})
                        </label>
                        <div className="px-3 py-2 text-xs font-mono font-bold bg-white border border-slate-200 rounded-lg text-slate-800">
                          {effectivePointValue.toFixed(2)} €
                        </div>
                      </div>

                      <div className="sm:col-span-4">
                        <label className="block text-[10.5px] font-bold text-slate-600 uppercase mb-1">
                          Coefficient Métier
                        </label>
                        <div className="px-3 py-2 text-xs font-mono font-bold bg-white border border-slate-200 rounded-lg text-blue-700">
                          {formData.coefficient}
                        </div>
                      </div>

                      <div className="sm:col-span-4">
                        <label className="block text-[10.5px] font-bold text-slate-600 uppercase mb-1">
                          Primes / Bonus mensuels (€)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="10"
                          value={formData.additionalBonus || ''}
                          onChange={(e) => setFormData({ ...formData, additionalBonus: parseFloat(e.target.value) || 0 })}
                          placeholder="0.00"
                          className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono"
                        />
                      </div>
                    </div>

                    <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="text-xs text-blue-900">
                        <div className="font-semibold">Calcul automatique d'après la grille de l'établissement :</div>
                        <div className="text-[11px] text-blue-700 mt-0.5">
                          {formData.coefficient} × {effectivePointValue.toFixed(2)} €
                          {(formData.additionalBonus || 0) > 0 && ` + ${formData.additionalBonus} € prime`}
                          {' = '}
                          <span className="font-bold">{formatEuro(formData.monthlyGrossSalary)} € brut</span>
                        </div>
                      </div>

                      <div className="sm:text-right">
                        <span className="text-base font-black text-blue-800 tracking-tight block">
                          {formatEuro(formData.monthlyGrossSalary)} € <span className="text-xs font-medium text-slate-600">brut/mois</span>
                        </span>
                        <span className="text-[10.5px] text-slate-500">
                          Taux : {formatEuro(formData.hourlyRate)} €/h ({formData.weeklyHours}h/sem)
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* MODE SAISIE MANUELLE / GRILLE PROPRE */
                  <div className="space-y-3">
                    <p className="text-xs text-slate-600">
                      Cet établissement applique sa propre grille salariale. Saisissez directement le salaire brut convenu ou appliquez une valeur indicative.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                      <div className="sm:col-span-6">
                        <label className="block text-[11px] font-bold text-purple-900 uppercase tracking-wider mb-1">
                          Salaire Brut Mensuel de Base (€) *
                        </label>
                        <input
                          type="number"
                          step="10"
                          min="0"
                          required
                          value={formData.monthlyGrossSalary || ''}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            const monthlyHours = ((formData.weeklyHours || 35) * 52) / 12;
                            const rate = monthlyHours > 0 ? (val + (formData.additionalBonus || 0)) / monthlyHours : 0;
                            setFormData({
                              ...formData,
                              monthlyGrossSalary: val,
                              hourlyRate: Math.round(rate * 100) / 100,
                            });
                          }}
                          placeholder="Ex: 2450.00"
                          className="w-full px-3 py-2 text-xs bg-white border-2 border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-hidden font-bold text-slate-900 text-sm"
                        />
                      </div>

                      <div className="sm:col-span-6">
                        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Primes Complémentaires (€)
                        </label>
                        <input
                          type="number"
                          step="10"
                          min="0"
                          value={formData.additionalBonus || ''}
                          onChange={(e) => {
                            const bonus = parseFloat(e.target.value) || 0;
                            const monthlyHours = ((formData.weeklyHours || 35) * 52) / 12;
                            const rate = monthlyHours > 0 ? (formData.monthlyGrossSalary + bonus) / monthlyHours : 0;
                            setFormData({
                              ...formData,
                              additionalBonus: bonus,
                              hourlyRate: Math.round(rate * 100) / 100,
                            });
                          }}
                          placeholder="0.00"
                          className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-hidden font-mono"
                        />
                      </div>
                    </div>

                    <div className="p-3 bg-purple-50/70 rounded-xl border border-purple-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div>
                        <div className="text-xs font-bold text-purple-900">
                          Rémunération Brute Contractuelle
                        </div>
                        <div className="text-[11px] text-purple-700">
                          Taux horaire calculé : <span className="font-bold">{formatEuro(formData.hourlyRate)} €/h</span> (sur {formData.weeklyHours}h/sem • {formData.monthlyHours}h/mois)
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const calc = calculateSalary(formData.coefficient, effectivePointValue, formData.additionalBonus, formData.weeklyHours);
                            setFormData((prev) => ({
                              ...prev,
                              monthlyGrossSalary: calc.monthlyGrossSalary,
                              hourlyRate: calc.hourlyRate,
                            }));
                          }}
                          className="text-[10px] font-semibold text-purple-700 hover:text-purple-900 bg-white px-2.5 py-1 rounded border border-purple-300 hover:bg-purple-100/50 transition"
                        >
                          Remplir avec valeur indicative ({effectivePointValue.toFixed(2)} €)
                        </button>

                        <div className="text-right">
                          <span className="text-base font-black text-purple-900 tracking-tight block">
                            {formatEuro(formData.monthlyGrossSalary + (formData.additionalBonus || 0))} €
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Spécificités CDD si CDD / Avenant CDD */}
              {(formData.contractType === 'cdd' || formData.contractType === 'avenant_cdd') && (
                <div className="p-4 bg-amber-50/70 rounded-xl border border-amber-200 space-y-3 animate-in fade-in">
                  <div className="text-[11px] font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                    Mentions Légales du CDD / Remplacement
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Date de fin de contrat *
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.endDate || ''}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Motif précis de recours *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.cddReason}
                        onChange={(e) => setFormData({ ...formData, cddReason: e.target.value })}
                        placeholder="Surcroît saisonnier, remplacement..."
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Salarié remplacé (le cas échéant)
                      </label>
                      <input
                        type="text"
                        value={formData.replacedEmployeeName || ''}
                        onChange={(e) => setFormData({ ...formData, replacedEmployeeName: e.target.value })}
                        placeholder="M. Jean DUPUIS"
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Qualification du salarié remplacé
                      </label>
                      <input
                        type="text"
                        value={formData.replacedEmployeeRole || ''}
                        onChange={(e) => setFormData({ ...formData, replacedEmployeeRole: e.target.value })}
                        placeholder="Conducteur de car Voyageurs"
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Régime de travail (TC / TP) & Durée du travail */}
              <div className="p-4 bg-slate-50/90 rounded-xl border border-slate-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                  <label className="block text-[11px] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                    Régime de Travail (Temps Complet ou Partiel) *
                  </label>
                  <span className="text-[10.5px] text-slate-500">
                    Adapte les clauses et le titre du contrat
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        workTimeRegime: 'temps_plein',
                        weeklyHours: prev.weeklyHours || 35,
                      }));
                    }}
                    className={`p-3 rounded-lg border text-left transition flex items-center justify-between ${
                      formData.workTimeRegime === 'temps_plein'
                        ? 'bg-blue-50 border-blue-500 text-blue-950 ring-2 ring-blue-500/20 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <input
                        type="radio"
                        name="contractWorkTimeRegimeChoice"
                        checked={formData.workTimeRegime === 'temps_plein'}
                        onChange={() => {
                          setFormData((prev) => ({
                            ...prev,
                            workTimeRegime: 'temps_plein',
                            weeklyHours: prev.weeklyHours || 35,
                          }));
                        }}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <div className="text-xs font-bold text-slate-900">Temps Complet (TC)</div>
                        <div className="text-[10.5px] text-slate-500">Durée de référence (35h hebdo)</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-800">TC</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        workTimeRegime: 'temps_partiel',
                      }));
                    }}
                    className={`p-3 rounded-lg border text-left transition flex items-center justify-between ${
                      formData.workTimeRegime === 'temps_partiel'
                        ? 'bg-purple-50 border-purple-500 text-purple-950 ring-2 ring-purple-500/20 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <input
                        type="radio"
                        name="contractWorkTimeRegimeChoice"
                        checked={formData.workTimeRegime === 'temps_partiel'}
                        onChange={() => {
                          setFormData((prev) => ({
                            ...prev,
                            workTimeRegime: 'temps_partiel',
                          }));
                        }}
                        className="text-purple-600 focus:ring-purple-500"
                      />
                      <div>
                        <div className="text-xs font-bold text-slate-900">Temps Partiel (TP)</div>
                        <div className="text-[10.5px] text-slate-500">Durée inférieure au temps plein</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-purple-100 text-purple-800">TP</span>
                  </button>
                </div>
              </div>

              {/* Dates & Conditions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Date de début / prise d'effet *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-medium"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Prise d'effet du contrat
                  </span>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                      Reprise d'ancienneté
                    </label>
                    {formData.seniorityDate ? (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, seniorityDate: '' })}
                        className="text-[10px] text-rose-600 hover:text-rose-800 font-bold cursor-pointer"
                        title="Supprimer la date de reprise"
                      >
                        Effacer
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-semibold">(Facultatif)</span>
                    )}
                  </div>
                  <input
                    type="date"
                    value={formData.seniorityDate || ''}
                    onChange={(e) => setFormData({ ...formData, seniorityDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-medium text-slate-800"
                  />
                  <div className="mt-1 text-[10px]">
                    {formData.seniorityDate ? (
                      <span className="text-emerald-700 font-semibold flex items-center gap-1">
                        <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span>Clause <strong>ART-02B</strong> obligatoire</span>
                      </span>
                    ) : (
                      <span className="text-slate-400">
                        Sans reprise ➔ clause <strong>ART-02A</strong> obligatoire
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                      Heures hebdo
                    </label>
                    <span className="text-[10px] text-slate-400 font-semibold">(Facultatif)</span>
                  </div>
                  <input
                    type="number"
                    min="1"
                    step="0.5"
                    value={formData.weeklyHours !== undefined && formData.weeklyHours !== null ? formData.weeklyHours : ''}
                    onChange={(e) => {
                      const val = e.target.value === '' ? undefined : Number(e.target.value);
                      const mHours = val !== undefined ? Math.round((val * 52 / 12) * 100) / 100 : undefined;
                      setFormData({
                        ...formData,
                        weeklyHours: val,
                        monthlyHours: mHours,
                      });
                    }}
                    placeholder={formData.workTimeRegime === 'temps_partiel' ? 'Facultatif (ex: 20, 24, 28...)' : 'Facultatif (défaut : 35)'}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    {formData.workTimeRegime === 'temps_partiel' ? 'Temps Partiel' : 'Temps Complet (35h)'}
                  </span>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                      Période d'essai
                    </label>
                    <button
                      type="button"
                      onClick={applyCalculatedTrialPeriod}
                      className="text-[10px] text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 cursor-pointer"
                      title="Recalculer selon le statut, type de contrat et établissement"
                    >
                      <Sparkles className="w-3 h-3" />
                      Recalculer
                    </button>
                  </div>
                  <input
                    type="text"
                    value={formData.trialPeriod}
                    onChange={(e) => {
                      setHasManualTrialPeriod(true);
                      setFormData({ ...formData, trialPeriod: e.target.value });
                    }}
                    placeholder="ex: 2 mois"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-medium text-slate-800"
                  />
                  <div className="mt-1 flex items-center gap-1 text-[10px] text-slate-500">
                    <Info className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate" title={calculatedTrial.explanation}>
                      {calculatedTrial.explanation}
                    </span>
                  </div>
                </div>
              </div>

              {/* Lieu de travail & Transport */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                      Dépôt de rattachement
                    </label>
                    {currentEst && formData.workplaceDepot !== currentEst.name && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, workplaceDepot: currentEst.name })}
                        className="text-[10px] text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
                        title={`Réinitialiser sur "${currentEst.shortName || currentEst.name}"`}
                      >
                        Nom établissement
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={formData.workplaceDepot}
                    onChange={(e) => setFormData({ ...formData, workplaceDepot: e.target.value })}
                    placeholder={currentEst?.name || "Dépôt principal"}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-medium text-slate-800"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Par défaut le nom de l'établissement ({currentEst?.shortName || currentEst?.name}). Modifiable si nécessaire.
                  </p>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Permis & Titres professionnels requis
                  </label>
                  <input
                    type="text"
                    value={formData.requiredLicenses}
                    onChange={(e) => setFormData({ ...formData, requiredLicenses: e.target.value })}
                    placeholder="Permis D, FIMO..."
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>
          </div>
        {/* SECTION 4: Briques Articles & Clauses du Contrat */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
          {/* Header selection articles */}
          <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider">
                  4. Clauses & Briques Articles du Contrat
                </h3>
              </div>
            </div>

            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
              {selectedArticleIds.length} clause{selectedArticleIds.length > 1 ? 's' : ''} sélectionnée{selectedArticleIds.length > 1 ? 's' : ''}
            </span>
          </div>

          {/* Active 4-Dimensions Profile Banner */}
          <div className="p-3.5 bg-blue-50/70 border-b border-blue-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
              <div className="space-y-1">
                <div className="text-[10.5px] font-extrabold uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />
                  <span>Profil sélectionné pour ce contrat (4 dimensions) :</span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-white border border-blue-200 text-blue-900 font-bold shadow-2xs">
                    <span className="text-slate-400 mr-1 text-[10px]">Contrat :</span>
                    {CONTRACT_TYPE_LABELS[formData.contractType]}
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-white border border-amber-200 text-amber-900 font-bold shadow-2xs">
                    <span className="text-slate-400 mr-1 text-[10px]">Statut :</span>
                    {EMPLOYEE_STATUS_LABELS[formData.status]}
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-white border border-emerald-200 text-emerald-900 font-bold shadow-2xs">
                    <span className="text-slate-400 mr-1 text-[10px]">Site :</span>
                    {currentEst?.shortName || currentEst?.name}
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-white border border-purple-200 text-purple-900 font-bold shadow-2xs">
                    <span className="text-slate-400 mr-1 text-[10px]">Horaire :</span>
                    {WORK_TIME_REGIME_LABELS[formData.workTimeRegime]}
                  </span>
                  {formData.seniorityDate ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-100 border border-emerald-300 text-emerald-900 font-bold shadow-2xs">
                      <Calendar className="w-3 h-3 mr-1 text-emerald-700" />
                      Reprise : {formatDateFrench(formData.seniorityDate)}
                      <span className="ml-1 text-[10px] text-emerald-800 font-mono">(ART-02B requis)</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-700 font-medium shadow-2xs text-[11px]">
                      Sans reprise ancienneté
                      <span className="ml-1 text-[10px] text-blue-700 font-mono">(ART-02A requis)</span>
                    </span>
                  )}
                </div>
              </div>

              <div className="shrink-0 self-start sm:self-center">
                <span className="text-[11px] font-semibold text-blue-800 bg-white/80 px-2 py-1 rounded-lg border border-blue-200">
                  {db.articles.filter((a) => isArticleCompatibleWithProfile(a, formData)).length} clauses adaptées disponibles
                </span>
              </div>
            </div>
          </div>

          {/* Legal Safety Banner: Alert if mandatory clauses are missing */}
          {missingMandatoryArticles.length > 0 && (
            <div className="p-3 bg-rose-50 border-b border-rose-200 text-rose-900 flex flex-col gap-2 animate-in fade-in">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="text-xs font-bold text-rose-800">
                    {missingMandatoryArticles.length} clause(s) obligatoire(s) non cochée(s) pour ce profil
                  </div>
                  <p className="text-[11px] text-rose-700 mt-0.5 leading-snug">
                    Pour la conformité juridique du contrat : {missingMandatoryArticles.map((a) => `${stripArticlePrefix(a.title)} (${a.code})`).join(', ')}.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleAddAllMandatoryArticles}
                className="self-start px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold rounded-lg shadow-2xs transition flex items-center gap-1 cursor-pointer"
              >
                <Check className="w-3 h-3" />
                <span>Cocher les clauses obligatoires manquantes</span>
              </button>
            </div>
          )}

          {/* View Controls: Filter profile vs All + Grouping mode + Search */}
          <div className="p-3 bg-slate-50 border-b border-slate-200 space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              {/* Filter mode button group */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5 text-xs shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setFilterToProfileOnly(true)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition flex items-center gap-1 ${
                      filterToProfileOnly
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Clauses adaptées au profil</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterToProfileOnly(false)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition flex items-center gap-1 ${
                      !filterToProfileOnly
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <span>Tout le catalogue ({db.articles.length})</span>
                  </button>
                </div>

                {/* Grouping mode */}
                <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5 text-xs shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setGroupingMode('sections')}
                    className={`px-2 py-1 rounded-md text-[10.5px] font-semibold transition ${
                      groupingMode === 'sections'
                        ? 'bg-slate-800 text-white'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Par Catégories (Rubriques)
                  </button>
                  <button
                    type="button"
                    onClick={() => setGroupingMode('requirements')}
                    className={`px-2 py-1 rounded-md text-[10.5px] font-semibold transition ${
                      groupingMode === 'requirements'
                        ? 'bg-slate-800 text-white'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Par Niveau d'Exigence
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2 text-[11px]">
                <button
                  type="button"
                  onClick={selectAllCompatibleArticles}
                  className="text-blue-600 hover:underline font-semibold cursor-pointer"
                >
                  Tout cocher (profil)
                </button>
                <span className="text-slate-300">•</span>
                <button
                  type="button"
                  onClick={() => setSelectedArticleIds([])}
                  className="text-slate-500 hover:underline cursor-pointer"
                >
                  Décocher tout
                </button>
              </div>
            </div>

            {/* Quick Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={searchArticleQuery}
                onChange={(e) => setSearchArticleQuery(e.target.value)}
                placeholder="Filtrer une clause par mot-clé (ex: préavis, ancienneté, sécurité, essai, SAEIV)..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Articles Container */}
          <div className="p-3 max-h-[520px] overflow-y-auto space-y-3 bg-slate-100/40">
            {groupingMode === 'sections' ? (
              /* DYNAMIC GROUPING BY ARTICLE CATEGORIES */
              categoryGroups.map((catGroup: ArticleCategoryGroup, idx: number) => {
                let catArticles = getCategoryArticles(catGroup.name);
                if (searchArticleQuery.trim()) {
                  const q = searchArticleQuery.toLowerCase();
                  catArticles = catArticles.filter(
                    (a) =>
                      a.title.toLowerCase().includes(q) ||
                      a.code.toLowerCase().includes(q) ||
                      a.content.toLowerCase().includes(q)
                  );
                }

                if (catArticles.length === 0) return null;

                const selectedInCat = catArticles.filter((a) => selectedArticleIds.includes(a.id));
                const isExpanded = expandedSectionIds.includes(catGroup.id);

                return (
                  <div
                    key={catGroup.id}
                    className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden"
                  >
                    {/* Section Header */}
                    <div
                      onClick={() => toggleSectionExpanded(catGroup.id)}
                      className={`px-3.5 py-2.5 flex items-center justify-between cursor-pointer select-none transition ${catGroup.style.bg} ${catGroup.style.hoverBg}`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <span className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs ${catGroup.style.tag}`}>
                          {idx + 1}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className={`text-xs font-bold ${catGroup.style.text}`}>
                              {catGroup.name}
                            </h4>
                            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/80 border border-slate-200/80 text-slate-500 font-medium">
                              Rubrique
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 line-clamp-1">
                            {catArticles.length} clause(s) disponible(s) dans cette catégorie
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded-full font-mono ${
                            selectedInCat.length > 0
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-white text-slate-500 border border-slate-200'
                          }`}
                        >
                          {selectedInCat.length}/{catArticles.length}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                        )}
                      </div>
                    </div>

                    {/* Articles list */}
                    {isExpanded && (
                      <div className="p-2.5 border-t border-slate-100 bg-slate-50/30 space-y-1.5">
                        <div className="flex items-center justify-between px-1 pb-1 text-[10.5px]">
                          <span className="text-slate-400">
                            {catArticles.length} clause(s) dans la rubrique « {catGroup.name} »
                          </span>
                          <div className="flex items-center space-x-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectAllInList(catArticles);
                              }}
                              className="text-blue-600 hover:underline font-semibold cursor-pointer"
                            >
                              Tout cocher
                            </button>
                            <span className="text-slate-300">•</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeselectAllInList(catArticles);
                              }}
                              className="text-slate-400 hover:underline cursor-pointer"
                            >
                              Décocher
                            </button>
                          </div>
                        </div>

                        {catArticles.map((art) => renderArticleCard(art))}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              /* GROUPING BY REQUIREMENT LEVEL (Obligatoire / Recommandé / Hors profil) */
              [
                {
                  id: 'req-mandatory',
                  title: '1. Clauses Obligatoires pour ce Contrat',
                  description: 'Clauses requises légalement, conventionnellement ou selon l’ancienneté',
                  badgeColor: 'rose',
                  articles: db.articles.filter((art) => isArticleMandatoryForCurrent(art)),
                },
                {
                  id: 'req-recommended',
                  title: '2. Clauses Recommandées & Spécificités (Métier & Établissement)',
                  description: 'Clauses adaptées au statut, au réseau de l’établissement et aux horaires',
                  badgeColor: 'blue',
                  articles: db.articles.filter(
                    (art) =>
                      isArticleCompatibleWithProfile(art, formData) &&
                      !isArticleMandatoryForCurrent(art)
                  ),
                },
                ...(!filterToProfileOnly
                  ? [
                      {
                        id: 'req-other',
                        title: '3. Autres Clauses du Référentiel (Hors Profil Actuel)',
                        description: 'Clauses destinées à d’autres statuts, d’autres types de contrats ou d’autres sites',
                        badgeColor: 'slate',
                        articles: db.articles.filter(
                          (art) => !isArticleCompatibleWithProfile(art, formData)
                        ),
                      },
                    ]
                  : []),
              ].map((grp) => {
                let grpArticles = grp.articles;
                if (searchArticleQuery.trim()) {
                  const q = searchArticleQuery.toLowerCase();
                  grpArticles = grpArticles.filter(
                    (a) =>
                      a.title.toLowerCase().includes(q) ||
                      a.code.toLowerCase().includes(q) ||
                      a.content.toLowerCase().includes(q)
                  );
                }

                if (grpArticles.length === 0) return null;

                const selectedInGrp = grpArticles.filter((a) => selectedArticleIds.includes(a.id));
                const isExpanded = expandedSectionIds.includes(grp.id);

                return (
                  <div
                    key={grp.id}
                    className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden"
                  >
                    <div
                      onClick={() => toggleSectionExpanded(grp.id)}
                      className="px-3.5 py-2.5 flex items-center justify-between cursor-pointer select-none bg-slate-50/70 hover:bg-slate-50 transition"
                    >
                      <div className="flex items-center space-x-2.5">
                        <span
                          className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-[10px] ${
                            grp.id === 'req-mandatory'
                              ? 'bg-rose-600 text-white'
                              : grp.id === 'req-recommended'
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-400 text-white'
                          }`}
                        >
                          {grp.id === 'req-mandatory' ? '!' : grp.id === 'req-recommended' ? '★' : '•'}
                        </span>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">{grp.title}</h4>
                          <p className="text-[10px] text-slate-500 line-clamp-1">{grp.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded-full font-mono ${
                            selectedInGrp.length > 0
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {selectedInGrp.length}/{grpArticles.length}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                        )}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="p-2.5 border-t border-slate-100 bg-slate-50/30 space-y-1.5">
                        {grpArticles.map((art) => renderArticleCard(art))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

            {/* Incremental Order Ribbon of the final contract */}
            {sortedSelectedArticles.length > 0 && (
              <div className="p-3 bg-slate-50 border-t border-slate-200">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Ordre d'apparition final ({sortedSelectedArticles.length} clauses) :</span>
                  <span className="text-emerald-700 font-bold font-mono">1 ➔ {sortedSelectedArticles.length}</span>
                </div>
                <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                  {sortedSelectedArticles.map((art, index) => (
                    <span
                      key={art.id}
                      className="inline-flex items-center text-[10px] bg-white border border-slate-200 rounded px-1.5 py-0.5 text-slate-800"
                      title={art.title}
                    >
                      <strong className="text-blue-700 font-mono mr-1">{index + 1}.</strong>
                      <span className="max-w-[110px] truncate">{stripArticlePrefix(art.title)}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Actions Bar */}
            <div className="p-4 bg-white border-t border-slate-200 space-y-2">
              <button
                id="btn-preview-and-generate"
                onClick={handleCreateContract}
                disabled={!formData.lastName.trim() || !formData.firstName.trim() || selectedArticleIds.length === 0}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition flex items-center justify-center space-x-2"
              >
                <Eye className="w-4 h-4" />
                <span>Visualiser & Générer le Contrat (PDF & Word)</span>
              </button>

              <button
                type="button"
                onClick={() => setIsSaveTemplateModalOpen(true)}
                className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-semibold rounded-lg transition flex items-center justify-center space-x-1.5"
              >
                <Bookmark className="w-3.5 h-3.5 text-blue-600" />
                <span>Sauvegarder cette sélection comme modèle</span>
              </button>
            </div>
        </div>
      </div>

      {/* Contract Preview Modal */}
      <ContractPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        employeeData={formData}
        articles={db.articles}
        selectedArticleIds={selectedArticleIds}
        contractNumber={generatedContractNumber || `TABM-${new Date().getFullYear()}-${db.contracts.length.toString().padStart(3, '0')}`}
      />

      {/* Save Template Modal */}
      {isSaveTemplateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
            <form onSubmit={handleSaveAsTemplateSubmit}>
              <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                  <Bookmark className="w-4 h-4 text-blue-400" />
                  Enregistrer un Nouveau Modèle
                </h3>
                <button
                  type="button"
                  onClick={() => setIsSaveTemplateModalOpen(false)}
                  className="text-slate-400 hover:text-white font-bold text-sm"
                >
                  ✕
                </button>
              </div>

              <div className="p-5 space-y-3.5 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Nom du modèle *
                  </label>
                  <input
                    type="text"
                    required
                    value={newTemplateName}
                    onChange={(e) => setNewTemplateName(e.target.value)}
                    placeholder="ex: CDD Conducteur Scolaire 24h"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Description ou notes d'usage
                  </label>
                  <textarea
                    rows={2}
                    value={newTemplateDesc}
                    onChange={(e) => setNewTemplateDesc(e.target.value)}
                    placeholder="Précisez quand utiliser ce modèle..."
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-600 text-[11px] leading-relaxed">
                  Ce modèle mémorisera le type de contrat (<strong>{formData.contractType.toUpperCase()}</strong>), le statut (<strong>{formData.status}</strong>), le poste par défaut (<strong>{formData.jobTitle}</strong>) et la sélection de <strong>{selectedArticleIds.length}</strong> clauses.
                </div>
              </div>

              <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSaveTemplateModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-2xs transition"
                >
                  Enregistrer le modèle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
