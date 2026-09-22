import React, { useState, useEffect, useRef } from 'react';
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
  FileCheck
} from 'lucide-react';
import { 
  AppDatabase, 
  ContractEmployeeData, 
  ContractType, 
  EmployeeStatus, 
  ContractTemplate, 
  GeneratedContract,
  ContractArticle
} from '../../types';
import { CONTRACT_TYPE_LABELS, EMPLOYEE_STATUS_LABELS } from '../../data/defaultData';
import { calculateSalary, formatEuro, stripArticlePrefix } from '../../utils/contractCompiler';
import { ContractPreviewModal } from './ContractPreviewModal';

interface ContractBlockConfig {
  id: string;
  typeKey?: ContractType;
  title: string;
  shortLabel: string;
  description: string;
  badgeColor: string;
  filterFn: (art: ContractArticle) => boolean;
}

const CONTRACT_BLOCKS: ContractBlockConfig[] = [
  {
    id: 'block-cdi',
    typeKey: 'cdi',
    title: '1. Contrat CDI',
    shortLabel: 'CDI',
    description: 'Clauses spécifiques au contrat à durée indéterminée',
    badgeColor: 'blue',
    filterFn: (art) => art.validContractTypes.includes('cdi') && (art.validContractTypes.length <= 2 || art.id.includes('cdi') || art.code.includes('CDI')),
  },
  {
    id: 'block-cdd',
    typeKey: 'cdd',
    title: '2. Contrat CDD',
    shortLabel: 'CDD',
    description: 'Terme précis, motif de recours légal, et remplacement',
    badgeColor: 'amber',
    filterFn: (art) => art.validContractTypes.includes('cdd') && (art.validContractTypes.length <= 2 || art.id.includes('cdd') || art.code.includes('CDD')),
  },
  {
    id: 'block-avenant-cdd',
    typeKey: 'avenant_cdd',
    title: '3. Avenant CDD',
    shortLabel: 'Avenant CDD',
    description: 'Renouvellement et prolongation de mission CDD',
    badgeColor: 'orange',
    filterFn: (art) => art.validContractTypes.includes('avenant_cdd') && (art.validContractTypes.length <= 2 || art.id.includes('avenant-cdd') || art.code.includes('AVENANT-CDD') || art.id.includes('cdd-duree')),
  },
  {
    id: 'block-avenant-cdi',
    typeKey: 'avenant_cdi',
    title: '4. Avenant passage en CDI',
    shortLabel: 'Passage en CDI',
    description: 'Transformation CDD en CDI et reprise d’ancienneté',
    badgeColor: 'purple',
    filterFn: (art) => art.validContractTypes.includes('avenant_cdi') && (art.validContractTypes.length <= 2 || art.id.includes('avenant-passage-cdi') || art.id.includes('avenant-cdi') || art.code.includes('AVENANT-CDI') || art.id.includes('non-concurrence')),
  },
  {
    id: 'block-tripartite',
    typeKey: 'convention_tripartite',
    title: '5. Convention Tripartite',
    shortLabel: 'Tripartite',
    description: 'Mutation inter-entreprises du transport et continuité',
    badgeColor: 'teal',
    filterFn: (art) => art.validContractTypes.includes('convention_tripartite') && (art.validContractTypes.length <= 2 || art.id.includes('tripartite') || art.code.includes('TRIPARTITE')),
  },
  {
    id: 'block-communs',
    title: '6. Clauses Communes & Générales',
    shortLabel: 'Clauses Communes',
    description: 'Engagement, rémunération coefficient/point, horaires, sécurité transport',
    badgeColor: 'emerald',
    filterFn: (art) => art.validContractTypes.length > 2 && !art.id.includes('cdi-prise-effet') && !art.id.includes('cdd-duree') && !art.id.includes('tripartite') && !art.id.includes('avenant'),
  },
];

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
  // Form State: Salarié & Poste
  const [formData, setFormData] = useState<ContractEmployeeData>({
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

    companyName: db.settings.companyName,
    companyAddress: db.settings.companyAddress,
    companyCity: db.settings.companyCity,
    companyRepresentative: db.settings.companyRepresentative,
    representativeRole: db.settings.representativeRole,

    contractType: 'cdi',
    status: 'conducteur',
    jobTitle: '',
    coefficient: 140,
    pointValue: db.settings.pointValue,
    monthlyGrossSalary: 0,
    hourlyRate: 0,
    weeklyHours: 35,
    monthlyHours: 151.67,
    additionalBonus: 0,
    bonusDetails: '',

    startDate: new Date().toISOString().slice(0, 10),
    endDate: '',
    cddReason: 'Surcroît temporaire d’activité de transport',
    replacedEmployeeName: '',
    replacedEmployeeRole: '',
    trialPeriod: '2 mois de travail effectif',
    trialPeriodRenewal: 'renouvelable une fois pour une durée maximale de 2 mois',
    workplaceDepot: 'Dépôt Central Vaise - Lyon',
    mobilityZone: 'Ensemble des lignes et dessertes du réseau TABM',
    requiredLicenses: 'Permis D en cours de validité, FIMO Voyageurs et Carte conducteur',
    collectiveAgreement: db.settings.collectiveAgreement,
    ...initialEmployeeData,
  });

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
  const [blockViewMode, setBlockViewMode] = useState<'focused' | 'all'>('focused');
  const [searchArticleQuery, setSearchArticleQuery] = useState('');
  const [expandedPreviewIds, setExpandedPreviewIds] = useState<string[]>([]);

  // 6 Contract Blocks state
  const getBlockIdForContractType = (type: ContractType): string => {
    switch (type) {
      case 'cdi': return 'block-cdi';
      case 'cdd': return 'block-cdd';
      case 'avenant_cdd': return 'block-avenant-cdd';
      case 'avenant_cdi': return 'block-avenant-cdi';
      case 'convention_tripartite': return 'block-tripartite';
      default: return 'block-cdi';
    }
  };

  const [expandedBlockIds, setExpandedBlockIds] = useState<string[]>(() => [
    getBlockIdForContractType(formData.contractType),
    'block-communs'
  ]);

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

  // Recalculate salary whenever coefficient, pointValue, or hours change
  useEffect(() => {
    const calc = calculateSalary(formData.coefficient, db.settings.pointValue, formData.additionalBonus, formData.weeklyHours);
    setFormData((prev) => ({
      ...prev,
      pointValue: db.settings.pointValue,
      monthlyGrossSalary: calc.monthlyGrossSalary,
      hourlyRate: calc.hourlyRate,
      monthlyHours: calc.monthlyHours,
    }));
  }, [formData.coefficient, db.settings.pointValue, formData.additionalBonus, formData.weeklyHours]);

  // Auto-suggest articles when contract type or status changes (unless applying a template / duplicated)
  useEffect(() => {
    if (isCustomSelectionRef.current) {
      isCustomSelectionRef.current = false;
      return;
    }

    const compatible = db.articles.filter(
      (art) =>
        art.validContractTypes.includes(formData.contractType) &&
        art.validStatuses.includes(formData.status)
    );
    setSelectedArticleIds(compatible.map((a) => a.id));

    const currentBlock = getBlockIdForContractType(formData.contractType);
    setExpandedBlockIds([currentBlock, 'block-communs']);
  }, [formData.contractType, formData.status, db.articles]);

  const toggleBlockExpanded = (blockId: string) => {
    setExpandedBlockIds((prev) =>
      prev.includes(blockId) ? prev.filter((id) => id !== blockId) : [...prev, blockId]
    );
  };

  const toggleArticlePreview = (articleId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedPreviewIds((prev) =>
      prev.includes(articleId) ? prev.filter((id) => id !== articleId) : [...prev, articleId]
    );
  };

  const handleSelectAllInBlock = (blockArticles: ContractArticle[]) => {
    const idsToAdd = blockArticles.map((a) => a.id);
    setSelectedArticleIds((prev) => Array.from(new Set([...prev, ...idsToAdd])));
  };

  const handleDeselectAllInBlock = (blockArticles: ContractArticle[]) => {
    const idsToRemove = new Set(blockArticles.map((a) => a.id));
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

  const getBlockArticles = (block: ContractBlockConfig): ContractArticle[] => {
    return db.articles
      .filter((art) => {
        if (block.filterFn(art)) return true;
        if (block.typeKey && art.validContractTypes.includes(block.typeKey) && art.validContractTypes.length === 1) {
          return true;
        }
        return false;
      })
      .sort((a, b) => a.order - b.order);
  };

  // Handlers
  const handleJobSelect = (title: string) => {
    const job = db.jobs.find((j) => j.title === title);
    if (job) {
      const calc = calculateSalary(job.coefficient, db.settings.pointValue, formData.additionalBonus, job.weeklyHours);
      setFormData((prev) => ({
        ...prev,
        jobTitle: job.title,
        status: job.category,
        coefficient: job.coefficient,
        weeklyHours: job.weeklyHours,
        requiredLicenses: job.requiredLicenses || prev.requiredLicenses,
        monthlyGrossSalary: calc.monthlyGrossSalary,
        hourlyRate: calc.hourlyRate,
      }));
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
    setExpandedBlockIds([getBlockIdForContractType(tpl.contractType), 'block-communs']);
  };

  const toggleArticleSelection = (articleId: string) => {
    setSelectedArticleIds((prev) =>
      prev.includes(articleId) ? prev.filter((id) => id !== articleId) : [...prev, articleId]
    );
  };

  const selectAllCompatibleArticles = () => {
    const compatible = db.articles.filter(
      (art) =>
        art.validContractTypes.includes(formData.contractType) &&
        art.validStatuses.includes(formData.status)
    );
    setSelectedArticleIds(compatible.map((a) => a.id));
  };

  // Legal safety check: applicable mandatory articles that are currently missing
  const applicableArticles = db.articles.filter(
    (art) =>
      art.validContractTypes.includes(formData.contractType) &&
      art.validStatuses.includes(formData.status)
  );

  const missingMandatoryArticles = applicableArticles.filter(
    (art) => art.isMandatory && !selectedArticleIds.includes(art.id)
  );

  const handleAddAllMandatoryArticles = () => {
    const mandatoryIds = applicableArticles.filter((art) => art.isMandatory).map((art) => art.id);
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

  // Filter blocks to show depending on blockViewMode
  const activeBlockId = getBlockIdForContractType(formData.contractType);
  const blocksToDisplay = CONTRACT_BLOCKS.filter((block) => {
    if (blockViewMode === 'focused') {
      return block.id === activeBlockId || block.id === 'block-communs';
    }
    return true;
  });

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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Salarié & Poste (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* SECTION 1: Informations Salarié */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
            <div className="px-5 py-3.5 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-1 rounded-md bg-blue-100 text-blue-700">
                  <User className="w-3.5 h-3.5" />
                </div>
                <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-wide">
                  1. Salarié & État Civil
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

          {/* SECTION 2: Poste, Métier & Calcul du Salaire */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
            <div className="px-5 py-3.5 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-1 rounded-md bg-amber-100 text-amber-700">
                  <Briefcase className="w-3.5 h-3.5" />
                </div>
                <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-wide">
                  2. Poste, Métier & Grille Salariale
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

              {/* Résultat du calcul de salaire épuré */}
              <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                      Rémunération conventionnelle calculée
                    </span>
                    <div className="text-xs text-slate-700">
                      Coeff <span className="font-bold text-slate-900">{formData.coefficient}</span> × Point <span className="font-bold text-slate-900">{formData.pointValue.toFixed(2)} €</span>
                      {(formData.additionalBonus || 0) > 0 && <span className="text-emerald-700 font-semibold"> + {formData.additionalBonus} € prime</span>}
                    </div>
                  </div>

                  <div className="sm:text-right">
                    <span className="text-lg font-black text-blue-700 tracking-tight block">
                      {formatEuro(formData.monthlyGrossSalary)} € <span className="text-xs font-medium text-slate-500">brut/mois</span>
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Taux : {formatEuro(formData.hourlyRate)} €/h sur base {formData.weeklyHours}h/sem
                    </span>
                  </div>
                </div>
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

              {/* Dates & Conditions */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Heures hebdo
                  </label>
                  <input
                    type="number"
                    value={formData.weeklyHours}
                    onChange={(e) => setFormData({ ...formData, weeklyHours: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Période d'essai
                  </label>
                  <input
                    type="text"
                    value={formData.trialPeriod}
                    onChange={(e) => setFormData({ ...formData, trialPeriod: e.target.value })}
                    placeholder="2 mois de travail effectif"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Lieu de travail & Transport */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Dépôt de rattachement
                  </label>
                  <input
                    type="text"
                    value={formData.workplaceDepot}
                    onChange={(e) => setFormData({ ...formData, workplaceDepot: e.target.value })}
                    placeholder="Dépôt Lyon Vaise"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
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
        </div>

        {/* Right Column: Sélection intuitive & épurée des clauses (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden sticky top-20">
            {/* Header selection articles */}
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider">
                  Clauses & Articles du Contrat
                </h3>
              </div>

              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                {selectedArticleIds.length} clause{selectedArticleIds.length > 1 ? 's' : ''}
              </span>
            </div>

            {/* Legal Safety Banner: Alert if mandatory clauses are missing */}
            {missingMandatoryArticles.length > 0 && (
              <div className="p-3 bg-rose-50 border-b border-rose-200 text-rose-900 flex flex-col gap-2">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="text-xs font-bold text-rose-800">
                      {missingMandatoryArticles.length} clause(s) obligatoire(s) non cochée(s)
                    </div>
                    <p className="text-[11px] text-rose-700 mt-0.5 leading-snug">
                      Pour éviter tout risque d'illicéité ou de requalification, incluez : {missingMandatoryArticles.map(a => stripArticlePrefix(a.title)).join(', ')}.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleAddAllMandatoryArticles}
                  className="self-start px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold rounded-lg shadow-2xs transition flex items-center gap-1"
                >
                  <Check className="w-3 h-3" />
                  <span>Cocher les clauses obligatoires manquantes</span>
                </button>
              </div>
            )}

            {/* Clean View Controls: Focused vs All Blocks + Search */}
            <div className="p-3 bg-slate-50 border-b border-slate-200 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5 text-xs">
                  <button
                    type="button"
                    onClick={() => setBlockViewMode('focused')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition ${
                      blockViewMode === 'focused'
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Blocs actifs ({CONTRACT_TYPE_LABELS[formData.contractType]} + Communes)
                  </button>
                  <button
                    type="button"
                    onClick={() => setBlockViewMode('all')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition ${
                      blockViewMode === 'all'
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Tous les 6 blocs
                  </button>
                </div>

                <div className="flex items-center space-x-2 text-[11px]">
                  <button
                    type="button"
                    onClick={selectAllCompatibleArticles}
                    className="text-blue-600 hover:underline font-semibold"
                  >
                    Tout cocher
                  </button>
                  <span className="text-slate-300">•</span>
                  <button
                    type="button"
                    onClick={() => setSelectedArticleIds([])}
                    className="text-slate-500 hover:underline"
                  >
                    Décocher
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
                  placeholder="Filtrer une clause par mot-clé (ex: préavis, sécurité, essai)..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Blocks & Articles List */}
            <div className="p-3 max-h-[500px] overflow-y-auto space-y-2.5 bg-slate-100/40">
              {blocksToDisplay.map((block) => {
                let blockArticles = getBlockArticles(block);
                if (searchArticleQuery.trim()) {
                  const q = searchArticleQuery.toLowerCase();
                  blockArticles = blockArticles.filter(
                    (a) => a.title.toLowerCase().includes(q) || a.code.toLowerCase().includes(q) || a.content.toLowerCase().includes(q)
                  );
                }

                const selectedInBlock = blockArticles.filter((a) => selectedArticleIds.includes(a.id));
                const isExpanded = expandedBlockIds.includes(block.id);
                const isCurrentType = block.typeKey === formData.contractType;
                const isCommon = block.id === 'block-communs';

                if (searchArticleQuery.trim() && blockArticles.length === 0) {
                  return null;
                }

                return (
                  <div
                    key={block.id}
                    className={`rounded-xl border transition shadow-2xs overflow-hidden ${
                      isCurrentType
                        ? 'border-blue-300 bg-white'
                        : isExpanded
                        ? 'border-slate-300 bg-white'
                        : 'border-slate-200 bg-white/90'
                    }`}
                  >
                    {/* Compact Block Header */}
                    <div
                      onClick={() => toggleBlockExpanded(block.id)}
                      className={`px-3.5 py-2.5 flex items-center justify-between cursor-pointer select-none transition ${
                        isCurrentType
                          ? 'bg-blue-50/50 hover:bg-blue-50'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <span
                          className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-[10px] ${
                            isCurrentType
                              ? 'bg-blue-600 text-white'
                              : isCommon
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {block.shortLabel.slice(0, 3)}
                        </span>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-xs font-bold text-slate-900">{block.title}</h4>
                            {isCurrentType && (
                              <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-blue-600 text-white shadow-2xs">
                                Actif
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-500 line-clamp-1">{block.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded-full font-mono ${
                            selectedInBlock.length > 0
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {selectedInBlock.length}/{blockArticles.length}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                        )}
                      </div>
                    </div>

                    {/* Block Articles List when Expanded */}
                    {isExpanded && (
                      <div className="p-2.5 border-t border-slate-100 bg-slate-50/40 space-y-1.5">
                        {blockArticles.length === 0 ? (
                          <p className="text-xs text-slate-400 italic py-2 text-center">
                            Aucune clause correspondante.
                          </p>
                        ) : (
                          blockArticles.map((art) => {
                            const isSelected = selectedArticleIds.includes(art.id);
                            const seqNum = getArticleSequenceNumber(art.id);
                            const isPreviewExpanded = expandedPreviewIds.includes(art.id);
                            const displayTitle = stripArticlePrefix(art.title);

                            return (
                              <div
                                key={art.id}
                                onClick={() => toggleArticleSelection(art.id)}
                                className={`p-2.5 rounded-lg border text-xs cursor-pointer transition ${
                                  isSelected
                                    ? 'bg-white border-blue-400 shadow-2xs ring-1 ring-blue-200'
                                    : 'bg-white/80 border-slate-200 hover:bg-white text-slate-600'
                                }`}
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={() => {}} // controlled via parent
                                      className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 cursor-pointer shrink-0"
                                    />

                                    {/* Incremental sequential number badge */}
                                    {isSelected && seqNum !== null ? (
                                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-600 text-white font-mono shrink-0">
                                        Art. {seqNum}
                                      </span>
                                    ) : (
                                      <span className="text-[10px] text-slate-400 font-mono shrink-0">
                                        {art.code}
                                      </span>
                                    )}

                                    <span className="font-semibold text-slate-900 truncate">
                                      {displayTitle}
                                    </span>
                                  </div>

                                  {/* Badges: Obligatoire */}
                                  <div className="flex items-center space-x-1.5 shrink-0">
                                    {(art.isMandatory || (formData.establishmentId && art.mandatoryEstablishmentIds?.includes(formData.establishmentId))) && (
                                      <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 shadow-2xs">
                                        Obligatoire
                                      </span>
                                    )}
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

                                {/* Text Preview (Hidden by default to keep interface épurée) */}
                                {isPreviewExpanded && (
                                  <div className="mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-600 bg-slate-50 p-2 rounded leading-relaxed font-sans animate-in fade-in">
                                    {art.content.replace(/\{\{[^}]+\}\}/g, '...')}
                                  </div>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
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
