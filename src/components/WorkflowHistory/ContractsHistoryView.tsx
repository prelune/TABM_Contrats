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
  FileCheck
} from 'lucide-react';
import { GeneratedContract, ContractWorkflowSteps, ContractArticle } from '../../types';
import { CONTRACT_TYPE_LABELS, EMPLOYEE_STATUS_LABELS } from '../../data/defaultData';
import { formatEuro, formatDateFrench } from '../../utils/contractCompiler';
import { ContractPreviewModal } from '../ContractGenerator/ContractPreviewModal';

interface ContractsHistoryViewProps {
  contracts: GeneratedContract[];
  articles: ContractArticle[];
  onUpdateContractWorkflow: (contractId: string, updatedWorkflow: Partial<ContractWorkflowSteps>) => void;
  onUpdateContractStatus: (contractId: string, status: GeneratedContract['status']) => void;
  onDeleteContract: (contractId: string) => void;
  onDuplicateForNewContract: (contract: GeneratedContract) => void;
}

export const ContractsHistoryView: React.FC<ContractsHistoryViewProps> = ({
  contracts,
  articles,
  onUpdateContractWorkflow,
  onUpdateContractStatus,
  onDeleteContract,
  onDuplicateForNewContract,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [activePreviewContract, setActivePreviewContract] = useState<GeneratedContract | null>(null);

  // Toggle step helper
  const handleToggleStep = (
    contract: GeneratedContract,
    field: keyof ContractWorkflowSteps
  ) => {
    const currentVal = !!contract.workflow[field];
    const newVal = !currentVal;

    const updatedWorkflow: Partial<ContractWorkflowSteps> = {
      [field]: newVal,
    };

    // Auto set date stamps
    if (field === 'sentWithinDeadline' && newVal && !contract.workflow.sentDate) {
      updatedWorkflow.sentDate = new Date().toISOString().slice(0, 10);
    }
    if (field === 'employeeSigned' && newVal && !contract.workflow.employeeSignedDate) {
      updatedWorkflow.employeeSignedDate = new Date().toISOString().slice(0, 10);
    }
    if (field === 'directorSigned' && newVal && !contract.workflow.directorSignedDate) {
      updatedWorkflow.directorSignedDate = new Date().toISOString().slice(0, 10);
    }

    onUpdateContractWorkflow(contract.id, updatedWorkflow);

    // Auto calculate new status
    const isEmpSigned = field === 'employeeSigned' ? newVal : contract.workflow.employeeSigned;
    const isDirSigned = field === 'directorSigned' ? newVal : contract.workflow.directorSigned;
    const isStored = field === 'storedInSharepoint' ? newVal : contract.workflow.storedInSharepoint;

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

              {/* Workflow Checkboxes Grid (The exact user requirement) */}
              <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200">
                <div className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-3 flex items-center justify-between">
                  <span>Étapes de Suivi RH & Signatures (Cochez au fil de l'avancement) :</span>
                  {isFullySigned && (
                    <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-bold text-[10px] flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Signatures Complètes
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                  {/* Step 1: Envoi dans les délais */}
                  <label className="flex items-start space-x-2.5 p-2 rounded-lg bg-white border border-slate-200 cursor-pointer hover:border-slate-300 transition">
                    <input
                      type="checkbox"
                      checked={c.workflow.sentWithinDeadline}
                      onChange={() => handleToggleStep(c, 'sentWithinDeadline')}
                      className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                    />
                    <div>
                      <span className="font-bold text-slate-800 block">Envoi dans les délais légaux</span>
                      <span className="text-[11px] text-slate-500">
                        {c.workflow.sentWithinDeadline ? `Envoyé le ${formatDateFrench(c.workflow.sentDate)}` : 'À transmettre au salarié'}
                      </span>
                    </div>
                  </label>

                  {/* Step 2: Signature Collaborateur */}
                  <label className="flex items-start space-x-2.5 p-2 rounded-lg bg-white border border-slate-200 cursor-pointer hover:border-slate-300 transition">
                    <input
                      type="checkbox"
                      checked={c.workflow.employeeSigned}
                      onChange={() => handleToggleStep(c, 'employeeSigned')}
                      className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                    />
                    <div>
                      <span className="font-bold text-slate-800 block">Signature du collaborateur</span>
                      <span className="text-[11px] text-slate-500">
                        {c.workflow.employeeSigned ? `Signé le ${formatDateFrench(c.workflow.employeeSignedDate)}` : 'En attente de signature'}
                      </span>
                    </div>
                  </label>

                  {/* Step 3: Signature Directeur */}
                  <label className="flex items-start space-x-2.5 p-2 rounded-lg bg-white border border-slate-200 cursor-pointer hover:border-slate-300 transition">
                    <input
                      type="checkbox"
                      checked={c.workflow.directorSigned}
                      onChange={() => handleToggleStep(c, 'directorSigned')}
                      className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                    />
                    <div>
                      <span className="font-bold text-slate-800 block">Signature de la direction</span>
                      <span className="text-[11px] text-slate-500">
                        {c.workflow.directorSigned ? `Signé le ${formatDateFrench(c.workflow.directorSignedDate)}` : 'En attente paraphe DG'}
                      </span>
                    </div>
                  </label>

                  {/* Step 4: DPAE */}
                  <label className="flex items-start space-x-2.5 p-2 rounded-lg bg-white border border-slate-200 cursor-pointer hover:border-slate-300 transition">
                    <input
                      type="checkbox"
                      checked={c.workflow.dpaeCompleted}
                      onChange={() => handleToggleStep(c, 'dpaeCompleted')}
                      className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                    />
                    <div>
                      <span className="font-bold text-slate-800 block">DPAE URSSAF déclarée</span>
                      <span className="text-[11px] text-slate-500">
                        {c.workflow.dpaeCompleted ? 'Déclaration confirmée' : 'À déclarer avant prise de poste'}
                      </span>
                    </div>
                  </label>

                  {/* Step 5: Visite Médicale */}
                  <label className="flex items-start space-x-2.5 p-2 rounded-lg bg-white border border-slate-200 cursor-pointer hover:border-slate-300 transition">
                    <input
                      type="checkbox"
                      checked={c.workflow.medicalVisitCompleted}
                      onChange={() => handleToggleStep(c, 'medicalVisitCompleted')}
                      className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                    />
                    <div>
                      <span className="font-bold text-slate-800 block">Visite médicale d'embauche</span>
                      <span className="text-[11px] text-slate-500">
                        {c.workflow.medicalVisitCompleted ? 'Aptitude médicale validée' : 'À planifier avec la médecine du travail'}
                      </span>
                    </div>
                  </label>

                  {/* Step 6: SharePoint Storage */}
                  <label className="flex items-start space-x-2.5 p-2 rounded-lg bg-white border border-slate-200 cursor-pointer hover:border-slate-300 transition">
                    <input
                      type="checkbox"
                      checked={c.workflow.storedInSharepoint}
                      onChange={() => handleToggleStep(c, 'storedInSharepoint')}
                      className="mt-0.5 rounded text-purple-600 focus:ring-purple-500 w-4 h-4 cursor-pointer"
                    />
                    <div>
                      <span className="font-bold text-slate-800 block">Archivé sur SharePoint</span>
                      <span className="text-[11px] text-slate-500">
                        {c.workflow.storedInSharepoint ? 'Document classé dans le dossier RH' : 'À archiver une fois finalisé'}
                      </span>
                    </div>
                  </label>
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
    </div>
  );
};
