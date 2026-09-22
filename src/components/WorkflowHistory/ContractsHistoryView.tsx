import React, { useState } from 'react';
import { 
  History, 
  Search, 
  CheckCircle2, 
  Clock, 
  FileText, 
  ExternalLink, 
  Printer, 
  Download, 
  Trash2, 
  Copy, 
  Eye, 
  AlertCircle,
  Share2,
  CheckSquare,
  Square,
  ShieldCheck,
  Send,
  Building2,
  FileCheck,
  Settings,
  Plus,
  ArrowUpDown
} from 'lucide-react';
import { GeneratedContract, ContractWorkflowSteps, ContractArticle, WorkflowStepConfig } from '../../types';
import { CONTRACT_TYPE_LABELS, EMPLOYEE_STATUS_LABELS, DEFAULT_WORKFLOW_STEPS } from '../../data/defaultData';
import { formatEuro, formatDateFrench } from '../../utils/contractCompiler';
import { ContractPreviewModal } from '../ContractGenerator/ContractPreviewModal';

interface ContractsHistoryViewProps {
  contracts: GeneratedContract[];
  articles: ContractArticle[];
  workflowSteps?: WorkflowStepConfig[];
  onUpdateWorkflowStepConfig?: (steps: WorkflowStepConfig[]) => void;
  onUpdateContractWorkflow: (contractId: string, updatedWorkflow: Partial<ContractWorkflowSteps>) => void;
  onUpdateContractStatus: (contractId: string, status: GeneratedContract['status']) => void;
  onDeleteContract: (contractId: string) => void;
  onDuplicateForNewContract: (contract: GeneratedContract) => void;
}

export const ContractsHistoryView: React.FC<ContractsHistoryViewProps> = ({
  contracts,
  articles,
  workflowSteps,
  onUpdateWorkflowStepConfig,
  onUpdateContractWorkflow,
  onUpdateContractStatus,
  onDeleteContract,
  onDuplicateForNewContract,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [activePreviewContract, setActivePreviewContract] = useState<GeneratedContract | null>(null);
  const [isStepsConfigOpen, setIsStepsConfigOpen] = useState(false);

  // Active workflow steps (custom or default)
  const activeSteps: WorkflowStepConfig[] = (workflowSteps && workflowSteps.length > 0)
    ? [...workflowSteps].sort((a, b) => a.order - b.order)
    : DEFAULT_WORKFLOW_STEPS;

  // New step creation state in config modal
  const [newStepTitle, setNewStepTitle] = useState('');
  const [newStepSubtitle, setNewStepSubtitle] = useState('');

  // Helper to get checked state of a step for a contract
  const isStepChecked = (contract: GeneratedContract, step: WorkflowStepConfig): boolean => {
    if (contract.workflow.checklist && typeof contract.workflow.checklist[step.id] === 'boolean') {
      return contract.workflow.checklist[step.id];
    }
    // Fallback to legacy fields
    switch (step.id) {
      case 'sent_delay': return !!contract.workflow.sentWithinDeadline;
      case 'sign_emp': return !!contract.workflow.employeeSigned;
      case 'sign_dir': return !!contract.workflow.directorSigned;
      case 'dpae': return !!contract.workflow.dpaeCompleted;
      case 'med_visit': return !!contract.workflow.medicalVisitCompleted;
      case 'sharepoint': return !!contract.workflow.storedInSharepoint;
      default: return false;
    }
  };

  // Toggle dynamic step
  const handleToggleDynamicStep = (contract: GeneratedContract, step: WorkflowStepConfig) => {
    const currentVal = isStepChecked(contract, step);
    const newVal = !currentVal;

    const currentChecklist = contract.workflow.checklist || {};
    const updatedChecklist = {
      ...currentChecklist,
      [step.id]: newVal,
    };

    const updatedWorkflow: Partial<ContractWorkflowSteps> = {
      checklist: updatedChecklist,
    };

    // Keep legacy properties in sync for backward compatibility & status calculation
    if (step.id === 'sent_delay') {
      updatedWorkflow.sentWithinDeadline = newVal;
      if (newVal && !contract.workflow.sentDate) {
        updatedWorkflow.sentDate = new Date().toISOString().slice(0, 10);
      }
    }
    if (step.id === 'sign_emp') {
      updatedWorkflow.employeeSigned = newVal;
      if (newVal && !contract.workflow.employeeSignedDate) {
        updatedWorkflow.employeeSignedDate = new Date().toISOString().slice(0, 10);
      }
    }
    if (step.id === 'sign_dir') {
      updatedWorkflow.directorSigned = newVal;
      if (newVal && !contract.workflow.directorSignedDate) {
        updatedWorkflow.directorSignedDate = new Date().toISOString().slice(0, 10);
      }
    }
    if (step.id === 'dpae') updatedWorkflow.dpaeCompleted = newVal;
    if (step.id === 'med_visit') updatedWorkflow.medicalVisitCompleted = newVal;
    if (step.id === 'sharepoint') updatedWorkflow.storedInSharepoint = newVal;

    onUpdateContractWorkflow(contract.id, updatedWorkflow);

    // Auto-calculate new status
    const isEmpSigned = step.id === 'sign_emp' ? newVal : contract.workflow.employeeSigned;
    const isDirSigned = step.id === 'sign_dir' ? newVal : contract.workflow.directorSigned;
    const isStored = step.id === 'sharepoint' ? newVal : contract.workflow.storedInSharepoint;

    if (isStored) {
      onUpdateContractStatus(contract.id, 'archived');
    } else if (isEmpSigned && isDirSigned) {
      onUpdateContractStatus(contract.id, 'fully_signed');
    } else if (isEmpSigned || isDirSigned) {
      onUpdateContractStatus(contract.id, 'partially_signed');
    } else {
      onUpdateContractStatus(contract.id, 'pending_signature');
    }
  };

  const handleAddCustomStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStepTitle.trim() || !onUpdateWorkflowStepConfig) return;

    const newStep: WorkflowStepConfig = {
      id: `step_${Date.now()}`,
      title: newStepTitle.trim(),
      subtitle: newStepSubtitle.trim() || 'Étape du processus RH',
      order: activeSteps.length + 1,
    };

    onUpdateWorkflowStepConfig([...activeSteps, newStep]);
    setNewStepTitle('');
    setNewStepSubtitle('');
  };

  const handleDeleteStep = (stepId: string) => {
    if (!onUpdateWorkflowStepConfig) return;
    if (window.confirm('Voulez-vous supprimer cette case du processus ?')) {
      const filtered = activeSteps.filter((s) => s.id !== stepId);
      onUpdateWorkflowStepConfig(filtered);
    }
  };

  const handleSharepointUrlChange = (contractId: string, url: string) => {
    onUpdateContractWorkflow(contractId, { sharepointUrl: url });
  };

  const handleNotesChange = (contractId: string, notes: string) => {
    onUpdateContractWorkflow(contractId, { notes });
  };

  // Stats
  const totalContracts = contracts.length;
  const pendingEmployeeSignatures = contracts.filter((c) => !c.workflow.employeeSigned).length;
  const pendingDirectorSignatures = contracts.filter((c) => !c.workflow.directorSigned).length;
  const archivedSharepoint = contracts.filter((c) => c.workflow.storedInSharepoint).length;

  const filteredContracts = contracts.filter((c) => {
    const matchesSearch =
      c.contractNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.employeeData.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.employeeData.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.employeeData.jobTitle.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'pending' && (!c.workflow.employeeSigned || !c.workflow.directorSigned)) ||
      (filterStatus === 'signed' && c.workflow.employeeSigned && c.workflow.directorSigned) ||
      (filterStatus === 'archived' && c.workflow.storedInSharepoint);

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <History className="w-7 h-7 text-indigo-600" />
            Historique & Suivi des Signatures
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Tracez l'envoi dans les délais, les signatures des collaborateurs et de la direction, ainsi que l'archivage SharePoint.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsStepsConfigOpen(true)}
          className="inline-flex items-center px-3.5 py-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-bold shadow-2xs transition self-start md:self-auto"
        >
          <Settings className="w-3.5 h-3.5 mr-1.5 text-indigo-600" />
          <span>Personnaliser les étapes du processus ({activeSteps.length})</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Total Contrats</span>
            <FileText className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{totalContracts}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Générés dans la session</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-amber-600 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Attente Salarié</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-amber-700">{pendingEmployeeSignatures}</div>
          <div className="text-[11px] text-amber-600/80 mt-0.5">À faire signer</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-indigo-600 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Attente Direction</span>
            <Building2 className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-extrabold text-indigo-700">{pendingDirectorSignatures}</div>
          <div className="text-[11px] text-indigo-600/80 mt-0.5">Contreseing employeur</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-emerald-600 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Archivés SharePoint</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-700">{archivedSharepoint}</div>
          <div className="text-[11px] text-emerald-600/80 mt-0.5">Dossiers RH clôturés</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher par nom, réf contrat, poste..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-500 font-medium">Statut :</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-medium text-slate-700 focus:outline-hidden"
          >
            <option value="all">Tous les contrats</option>
            <option value="pending">En attente de signature(s)</option>
            <option value="signed">Totalement signés</option>
            <option value="archived">Archivés sur SharePoint</option>
          </select>
        </div>
      </div>

      {/* Contracts List */}
      <div className="space-y-4">
        {filteredContracts.map((c) => {
          const isFullySigned = c.workflow.employeeSigned && c.workflow.directorSigned;
          return (
            <div
              key={c.id}
              className="bg-white rounded-xl border border-slate-200 shadow-2xs hover:shadow-xs transition p-6 space-y-4"
            >
              {/* Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100 font-mono font-bold text-xs">
                    {c.contractNumber}
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">
                      {c.employeeData.civility} {c.employeeData.firstName} {c.employeeData.lastName.toUpperCase()}
                    </h3>
                    <div className="text-xs text-slate-500 flex flex-wrap items-center gap-2 mt-0.5">
                      <span className="font-semibold text-slate-700">{c.employeeData.jobTitle}</span>
                      <span>•</span>
                      <span>Coeff {c.employeeData.coefficient}</span>
                      <span>•</span>
                      <span>{formatEuro(c.employeeData.monthlyGrossSalary)} € brut</span>
                      <span>•</span>
                      <span className="uppercase text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.2 rounded border border-blue-100">
                        {c.employeeData.contractType}
                      </span>
                      {c.employeeData.establishmentName && (
                        <>
                          <span>•</span>
                          <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-slate-500" />
                            {c.employeeData.establishmentName}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status and Action Buttons */}
                <div className="flex items-center space-x-2 self-end sm:self-center">
                  <button
                    onClick={() => setActivePreviewContract(c)}
                    className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 transition"
                    title="Visualiser et réimprimer"
                  >
                    <Eye className="w-3.5 h-3.5 mr-1 text-slate-600" />
                    Visualiser PDF
                  </button>

                  <button
                    onClick={() => onDuplicateForNewContract(c)}
                    className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 transition"
                    title="Dupliquer pour créer un avenant ou nouveau contrat"
                  >
                    <Copy className="w-3.5 h-3.5 mr-1" />
                    Dupliquer
                  </button>

                  <button
                    onClick={() => onDeleteContract(c.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Dynamic Workflow Checkboxes Grid */}
              <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200">
                <div className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-3 flex items-center justify-between">
                  <span>Étapes de Suivi RH & Signatures ({activeSteps.length} étapes configurées) :</span>
                  {isFullySigned && (
                    <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-bold text-[10px] flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Signatures Complètes
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                  {activeSteps.map((step) => {
                    const checked = isStepChecked(c, step);
                    return (
                      <label
                        key={step.id}
                        className={`flex items-start space-x-2.5 p-2.5 rounded-lg border cursor-pointer transition ${
                          checked
                            ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950 shadow-2xs'
                            : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => handleToggleDynamicStep(c, step)}
                          className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <span className="font-bold block truncate">{step.title}</span>
                          <span className="text-[11px] text-slate-500 block line-clamp-1">
                            {checked ? 'Validé' : step.subtitle}
                          </span>
                        </div>
                      </label>
                    );
                  })}
                </div>

                {/* SharePoint link & notes row */}
                <div className="mt-3 pt-3 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                      Lien ou Répertoire SharePoint du contrat signé
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="https://tabm.sharepoint.com/rh/..."
                        value={c.workflow.sharepointUrl || ''}
                        onChange={(e) => handleSharepointUrlChange(c.id, e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                      />
                      {c.workflow.sharepointUrl && (
                        <a
                          href={c.workflow.sharepointUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-indigo-600 hover:text-indigo-800"
                          title="Ouvrir le lien SharePoint"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                      Notes de suivi RH
                    </label>
                    <input
                      type="text"
                      placeholder="Commentaires, avenant à prévoir, permis en attente..."
                      value={c.workflow.notes || ''}
                      onChange={(e) => handleNotesChange(c.id, e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filteredContracts.length === 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500">
            <History className="w-10 h-10 mx-auto mb-3 text-slate-300" />
            <h3 className="text-base font-bold text-slate-800 mb-1">Aucun contrat dans l'historique</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Les contrats générés apparaîtront ici pour vous permettre de tracer leurs étapes de signature et d'archivage.
            </p>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {activePreviewContract && (
        <ContractPreviewModal
          isOpen={true}
          onClose={() => setActivePreviewContract(null)}
          employeeData={activePreviewContract.employeeData}
          articles={articles}
          selectedArticleIds={activePreviewContract.selectedArticleIds}
          contractNumber={activePreviewContract.contractNumber}
        />
      )}

      {/* Workflow Steps Customization Modal */}
      {isStepsConfigOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <Settings className="w-5 h-5 text-indigo-400" />
                <div>
                  <h3 className="text-base font-bold">Personnalisation des cases à cocher (Processus)</h3>
                  <p className="text-xs text-slate-400">
                    Définissez le nombre de cases, leurs titres et sous-titres selon votre propre process RH
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsStepsConfigOpen(false)}
                className="text-slate-400 hover:text-white transition p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {/* Notice Excel */}
              <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-xs">
                  <FileText className="w-4 h-4 text-blue-600" />
                  Synchronisation Excel 100% Automatique
                </div>
                <p className="text-[11px] text-blue-800 leading-relaxed">
                  Toutes ces cases sont également sauvegardées et modifiables dans l'onglet <strong>Processus_Workflow</strong> de votre export Excel (colonnes <em>ID_Etape, Titre, Sous_Titre, Ordre</em>). Vous pouvez y ajouter autant de cases que souhaité !
                </p>
              </div>

              {/* Current steps list */}
              <div>
                <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider mb-2">
                  Cases actuelles du processus ({activeSteps.length})
                </h4>
                <div className="space-y-2">
                  {activeSteps.map((step, idx) => (
                    <div
                      key={step.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-white transition"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-800 font-bold flex items-center justify-center text-[11px]">
                          {idx + 1}
                        </span>
                        <div>
                          <div className="font-bold text-slate-800 text-xs">{step.title}</div>
                          <div className="text-[11px] text-slate-500">{step.subtitle}</div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteStep(step.id)}
                        className="text-slate-400 hover:text-red-600 p-1.5 hover:bg-red-50 rounded transition"
                        title="Supprimer cette case"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add step form */}
              <form onSubmit={handleAddCustomStep} className="pt-4 border-t border-slate-200 space-y-3">
                <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-indigo-600" />
                  Ajouter une nouvelle case au processus
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Titre de la case à cocher *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="ex: Transmission badge & clés"
                      value={newStepTitle}
                      onChange={(e) => setNewStepTitle(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Sous-titre / Consigne d'action
                    </label>
                    <input
                      type="text"
                      placeholder="ex: Remis contre émargement"
                      value={newStepSubtitle}
                      onChange={(e) => setNewStepSubtitle(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs shadow-xs transition"
                  >
                    <Plus className="w-4 h-4 mr-1.5" />
                    Ajouter cette étape
                  </button>
                </div>
              </form>
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setIsStepsConfigOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-lg transition"
              >
                Fermer & Appliquer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
