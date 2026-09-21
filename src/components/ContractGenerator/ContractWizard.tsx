import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  User, 
  Briefcase, 
  Layers, 
  Calculator, 
  Eye, 
  Bookmark, 
  Check, 
  Sparkles, 
  Calendar, 
  MapPin, 
  Euro, 
  AlertCircle,
  Clock,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { 
  AppDatabase, 
  ContractEmployeeData, 
  ContractType, 
  EmployeeStatus, 
  ContractTemplate, 
  GeneratedContract 
} from '../../types';
import { CONTRACT_TYPE_LABELS, EMPLOYEE_STATUS_LABELS } from '../../data/defaultData';
import { calculateSalary, formatEuro } from '../../utils/contractCompiler';
import { ContractPreviewModal } from './ContractPreviewModal';

interface ContractWizardProps {
  db: AppDatabase;
  onSaveContract: (contract: GeneratedContract) => void;
  onSaveTemplate: (template: Omit<ContractTemplate, 'id'>) => void;
  onOpenTagsModal: () => void;
  initialEmployeeData?: Partial<ContractEmployeeData>;
}

export const ContractWizard: React.FC<ContractWizardProps> = ({
  db,
  onSaveContract,
  onSaveTemplate,
  onOpenTagsModal,
  initialEmployeeData,
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

  // Selected articles
  const [selectedArticleIds, setSelectedArticleIds] = useState<string[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');

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
    const calc = calculateSalary(formData.coefficient, db.settings.pointValue, formData.additionalBonus);
    setFormData((prev) => ({
      ...prev,
      pointValue: db.settings.pointValue,
      monthlyGrossSalary: calc.monthlyGrossSalary,
      hourlyRate: calc.hourlyRate,
      monthlyHours: calc.monthlyHours,
    }));
  }, [formData.coefficient, db.settings.pointValue, formData.additionalBonus, formData.weeklyHours]);

  // Auto-suggest articles when contract type or status changes
  useEffect(() => {
    // If no template is strictly locking the selection, auto-select all compatible articles
    const compatible = db.articles.filter(
      (art) =>
        art.validContractTypes.includes(formData.contractType) &&
        art.validStatuses.includes(formData.status)
    );
    setSelectedArticleIds(compatible.map((a) => a.id));
  }, [formData.contractType, formData.status, db.articles]);

  // Handlers
  const handleJobSelect = (title: string) => {
    const job = db.jobs.find((j) => j.title === title);
    if (job) {
      const calc = calculateSalary(job.coefficient, db.settings.pointValue, formData.additionalBonus);
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
    setSaveSuccessMsg(`Contrat ${contractNumber} créé et enregistré dans l'historique !`);
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

  // Filtered articles relevant to current profile
  const compatibleArticles = db.articles.filter(
    (art) =>
      art.validContractTypes.includes(formData.contractType) &&
      art.validStatuses.includes(formData.status)
  );

  const otherArticles = db.articles.filter(
    (art) =>
      !art.validContractTypes.includes(formData.contractType) ||
      !art.validStatuses.includes(formData.status)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header & Templates Bar */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-blue-600 text-xs font-bold uppercase tracking-wider mb-1">
              <FileText className="w-4 h-4" />
              <span>Générateur de Contrat de Travail</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Créer un Nouveau Contrat
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              Renseignez les détails du salarié et du poste, sélectionnez les clauses requises, puis visualisez et téléchargez le PDF officiel.
            </p>
          </div>

          {/* Template Quick Selector */}
          <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200 self-stretch sm:self-auto">
            <Bookmark className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="text-xs font-bold text-slate-700 whitespace-nowrap">
              Appliquer un Modèle :
            </span>
            <select
              value={selectedTemplateId}
              onChange={(e) => handleApplyTemplate(e.target.value)}
              className="text-xs bg-white border border-slate-300 rounded-md px-2.5 py-1.5 font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            >
              <option value="">-- Sélectionner un modèle --</option>
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form Salarié & Poste (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* SECTION 1: Informations Salarié */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center space-x-2.5">
              <div className="p-1.5 rounded-md bg-blue-100 text-blue-700">
                <User className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                1. Informations du Salarié
              </h2>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Civilité *
                  </label>
                  <select
                    value={formData.civility}
                    onChange={(e) => setFormData({ ...formData, civility: e.target.value as any })}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  >
                    <option value="M.">M.</option>
                    <option value="Mme">Mme</option>
                  </select>
                </div>
                <div className="sm:col-span-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Nom de famille *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    placeholder="DUPONT"
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden uppercase"
                  />
                </div>
                <div className="sm:col-span-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Prénom *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    placeholder="Marc"
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Date de naissance *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Lieu de naissance *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.birthPlace}
                    onChange={(e) => setFormData({ ...formData, birthPlace: e.target.value })}
                    placeholder="Lyon 3ème (69)"
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Nationalité
                  </label>
                  <input
                    type="text"
                    value={formData.nationality}
                    onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                    placeholder="Française"
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Numéro de Sécurité Sociale *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.socialSecurityNumber}
                    onChange={(e) => setFormData({ ...formData, socialSecurityNumber: e.target.value })}
                    placeholder="1 89 05 69 123 456 78"
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Adresse postale *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="15 Rue de la Paix"
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Code Postal *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    placeholder="69003"
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Ville *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Lyon"
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: Poste, Métier & Calcul du Salaire */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="p-1.5 rounded-md bg-amber-100 text-amber-700">
                  <Briefcase className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  2. Poste, Métier & Salaire par Coefficient
                </h2>
              </div>
              <span className="text-xs text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                Point : {db.settings.pointValue.toFixed(2)} €
              </span>
            </div>

            <div className="p-6 space-y-4">
              {/* Type de contrat & Statut */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Type de Contrat *
                  </label>
                  <select
                    value={formData.contractType}
                    onChange={(e) => setFormData({ ...formData, contractType: e.target.value as ContractType })}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-semibold text-slate-800"
                  >
                    {Object.entries(CONTRACT_TYPE_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Statut Collaborateur *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as EmployeeStatus })}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden capitalize"
                  >
                    {Object.entries(EMPLOYEE_STATUS_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Sélection du Métier depuis la table de correspondance */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div>
                  <label className="block text-xs font-bold text-blue-900 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                    Sélection du Métier dans la Table de Correspondance *
                  </label>
                  <select
                    value={formData.jobTitle}
                    onChange={(e) => handleJobSelect(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  >
                    <option value="">-- Choisir le métier dans l'entreprise --</option>
                    {db.jobs.map((job) => (
                      <option key={job.id} value={job.title}>
                        {job.title} — Coeff {job.coefficient} ({EMPLOYEE_STATUS_LABELS[job.category]})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Résultat du calcul de salaire en temps réel */}
                <div className="bg-white rounded-lg p-4 border border-blue-200 shadow-2xs">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-[11px] font-bold uppercase text-slate-500 tracking-wider block">
                        Calcul Automatique de la Rémunération
                      </span>
                      <div className="text-xs text-slate-700 font-mono mt-0.5">
                        Coefficient <strong className="text-blue-700 text-sm">{formData.coefficient}</strong> × Valeur du point <strong className="text-blue-700 text-sm">{formData.pointValue.toFixed(2)} €</strong>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xl font-extrabold text-blue-700 block">
                        {formatEuro(formData.monthlyGrossSalary)} €
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium">
                        Brut mensuel ({formatEuro(formData.hourlyRate)} €/h sur base {formData.weeklyHours}h)
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Spécificités CDD si CDD */}
              {formData.contractType === 'cdd' && (
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 space-y-3">
                  <div className="text-xs font-bold text-amber-900 uppercase flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    Mentions Légales Obligatoires pour CDD
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Date de fin de contrat *
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.endDate || ''}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Motif précis de recours *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.cddReason}
                        onChange={(e) => setFormData({ ...formData, cddReason: e.target.value })}
                        placeholder="Remplacement, surcroît..."
                        className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Salarié remplacé (le cas échéant)
                      </label>
                      <input
                        type="text"
                        value={formData.replacedEmployeeName || ''}
                        onChange={(e) => setFormData({ ...formData, replacedEmployeeName: e.target.value })}
                        placeholder="M. Jean DUPUIS"
                        className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Qualification du remplacé
                      </label>
                      <input
                        type="text"
                        value={formData.replacedEmployeeRole || ''}
                        onChange={(e) => setFormData({ ...formData, replacedEmployeeRole: e.target.value })}
                        placeholder="Conducteur Receveur"
                        className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Dates & Conditions */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Date de début / d'effet *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Durée de travail hebdo
                  </label>
                  <input
                    type="number"
                    value={formData.weeklyHours}
                    onChange={(e) => setFormData({ ...formData, weeklyHours: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Période d'essai
                  </label>
                  <input
                    type="text"
                    value={formData.trialPeriod}
                    onChange={(e) => setFormData({ ...formData, trialPeriod: e.target.value })}
                    placeholder="2 mois renouvelable"
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Lieu de travail & Transport */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Dépôt de rattachement / Lieu
                  </label>
                  <input
                    type="text"
                    value={formData.workplaceDepot}
                    onChange={(e) => setFormData({ ...formData, workplaceDepot: e.target.value })}
                    placeholder="Dépôt Lyon Vaise"
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Permis & Titres exigés
                  </label>
                  <input
                    type="text"
                    value={formData.requiredLicenses}
                    onChange={(e) => setFormData({ ...formData, requiredLicenses: e.target.value })}
                    placeholder="Permis D, FIMO..."
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Sélection intuitive des articles (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden sticky top-20">
            {/* Header selection articles */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <Layers className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="text-sm font-bold">Sélection des Articles & Clauses</h3>
                  <p className="text-[11px] text-slate-400">
                    Clauses adaptées au profil : <span className="text-emerald-300 font-semibold uppercase">{formData.contractType}</span> / <span className="text-blue-300 font-semibold capitalize">{formData.status}</span>
                  </p>
                </div>
              </div>

              <span className="text-xs font-bold px-2 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {selectedArticleIds.length} retenu{selectedArticleIds.length > 1 ? 's' : ''}
              </span>
            </div>

            {/* Quick action bar */}
            <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={selectAllCompatibleArticles}
                className="text-blue-600 hover:underline font-semibold"
              >
                Cocher tous les compatibles ({compatibleArticles.length})
              </button>
              <button
                type="button"
                onClick={() => setSelectedArticleIds([])}
                className="text-slate-500 hover:underline"
              >
                Tout désélectionner
              </button>
            </div>

            {/* List of articles */}
            <div className="p-4 max-h-[500px] overflow-y-auto space-y-2.5">
              {/* Compatible articles */}
              {compatibleArticles.map((art) => {
                const isSelected = selectedArticleIds.includes(art.id);
                return (
                  <div
                    key={art.id}
                    onClick={() => toggleArticleSelection(art.id)}
                    className={`p-3 rounded-lg border text-xs cursor-pointer transition flex items-start space-x-3 ${
                      isSelected
                        ? 'bg-blue-50/60 border-blue-300 shadow-2xs'
                        : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}} // Handled by parent div
                      className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                          {art.code}
                        </span>
                        {art.isMandatory && (
                          <span className="text-[9px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-1.5 rounded">
                            Recommandé
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-slate-900 text-xs">{art.title}</h4>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                        {art.content.replace(/\{\{[^}]+\}\}/g, '...')}
                      </p>
                    </div>
                  </div>
                );
              })}

              {/* Other articles (incompatible or optional) accordion */}
              {otherArticles.length > 0 && (
                <div className="pt-2 border-t border-slate-200">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Autres clauses facultatives ({otherArticles.length}) :
                  </div>
                  <div className="space-y-2">
                    {otherArticles.map((art) => {
                      const isSelected = selectedArticleIds.includes(art.id);
                      return (
                        <div
                          key={art.id}
                          onClick={() => toggleArticleSelection(art.id)}
                          className={`p-2.5 rounded-lg border text-xs cursor-pointer transition flex items-start space-x-2.5 opacity-80 hover:opacity-100 ${
                            isSelected
                              ? 'bg-indigo-50/60 border-indigo-300 shadow-2xs'
                              : 'bg-white border-slate-200 text-slate-500'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5 cursor-pointer"
                          />
                          <div className="flex-1">
                            <span className="font-mono text-[10px] text-slate-400 mr-1">{art.code}</span>
                            <span className="font-semibold text-slate-800">{art.title}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions Bar */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-2">
              <button
                id="btn-preview-and-generate"
                onClick={handleCreateContract}
                disabled={!formData.lastName.trim() || !formData.firstName.trim() || selectedArticleIds.length === 0}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-xs font-extrabold uppercase tracking-wider rounded-xl shadow-md transition flex items-center justify-center space-x-2"
              >
                <Eye className="w-4 h-4" />
                <span>Visualiser & Générer le PDF</span>
              </button>

              <button
                type="button"
                onClick={() => setIsSaveTemplateModalOpen(true)}
                className="w-full py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-bold rounded-lg transition flex items-center justify-center space-x-1.5"
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
              <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <Bookmark className="w-4 h-4 text-blue-400" />
                  Enregistrer un Nouveau Modèle
                </h3>
                <button
                  type="button"
                  onClick={() => setIsSaveTemplateModalOpen(false)}
                  className="text-slate-400 hover:text-white font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-4 text-xs">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Nom du modèle *
                  </label>
                  <input
                    type="text"
                    required
                    value={newTemplateName}
                    onChange={(e) => setNewTemplateName(e.target.value)}
                    placeholder="ex: CDD Conducteur Scolaire 24h"
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Description ou notes d'usage
                  </label>
                  <textarea
                    rows={3}
                    value={newTemplateDesc}
                    onChange={(e) => setNewTemplateDesc(e.target.value)}
                    placeholder="Précisez quand utiliser ce modèle..."
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-600">
                  Ce modèle mémorisera le type de contrat (<strong>{formData.contractType.toUpperCase()}</strong>), le statut (<strong>{formData.status}</strong>), le poste par défaut (<strong>{formData.jobTitle}</strong>) et la sélection de <strong>{selectedArticleIds.length}</strong> clauses.
                </div>
              </div>

              <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsSaveTemplateModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 rounded-lg transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition"
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
