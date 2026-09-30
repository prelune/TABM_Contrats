/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  AppDatabase, 
  ContractArticle, 
  ContractTemplate, 
  ContractWorkflowSteps, 
  GeneratedContract, 
  JobPosition, 
  AppSettings,
  ContractEmployeeData,
  WorkflowStepConfig,
  Establishment
} from './types';
import { 
  createEmptyDatabase, 
  createSampleDatabase, 
  exportDatabaseToExcel, 
  parseExcelToDatabase 
} from './utils/excelStorage';
import { Navbar } from './components/Navbar';
import { SessionBanner } from './components/SessionBanner';
import { ContractWizard } from './components/ContractGenerator/ContractWizard';
import { ContractsHistoryView } from './components/WorkflowHistory/ContractsHistoryView';
import { ArticlesList } from './components/ArticlesManager/ArticlesList';
import { SalaryMatrixView } from './components/SalaryMatrix/SalaryMatrixView';
import { SettingsView } from './components/SettingsManager/SettingsView';
import { TagsReferenceModal } from './components/TagsReference/TagsReferenceModal';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Upload, 
  ShieldCheck, 
  Download, 
  Layers,
  FileText,
  Lightbulb
} from 'lucide-react';

export default function App() {
  // Start with empty database as requested by the user ("quand l'utilisateur se connecte, l'outil est entièrement vide")
  // But also allow 1-click loading of realistic transport demo data
  const [db, setDb] = useState<AppDatabase>(() => {
    // Check if session storage has state, otherwise empty
    return createEmptyDatabase();
  });

  const [activeTab, setActiveTab] = useState<'generator' | 'history' | 'articles' | 'matrix' | 'settings' | 'tags'>('generator');
  const [isTagsModalOpen, setIsTagsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'info' | 'error'; text: string } | null>(null);
  
  // Data for wizard when duplicating an existing contract
  const [wizardPrefillData, setWizardPrefillData] = useState<Partial<ContractEmployeeData> | undefined>(undefined);
  const [wizardPrefillArticles, setWizardPrefillArticles] = useState<string[] | undefined>(undefined);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // --- Excel Import / Export Handlers ---
  const handleExportExcel = () => {
    if (db.articles.length === 0 && db.jobs.length === 0 && db.contracts.length === 0) {
      showToast('La base est vide, rien à exporter.', 'info');
      return;
    }
    try {
      exportDatabaseToExcel(db, 'TABM_Contrats_Sauvegarde');
      showToast('Sauvegarde Excel téléchargée avec succès sur votre poste !', 'success');
    } catch (error) {
      console.error('Erreur export Excel:', error);
      showToast("Erreur lors de l'export Excel.", 'error');
    }
  };

  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const buffer = evt.target?.result as ArrayBuffer;
        const loadedDb = parseExcelToDatabase(buffer);
        setDb(loadedDb);
        showToast(
          `Mémoire chargée : ${loadedDb.contracts.length} contrat(s), ${loadedDb.articles.length} articles, ${loadedDb.jobs.length} métiers.`,
          'success'
        );
      } catch (error) {
        console.error('Erreur import Excel:', error);
        showToast('Erreur lors de la lecture du fichier Excel. Format non reconnu.', 'error');
      }
    };
    reader.readAsArrayBuffer(file);
    // Reset file input value to allow re-uploading the same file if needed
    e.target.value = '';
  };

  const handleClearMemory = () => {
    if (window.confirm('Voulez-vous réinitialiser et vider la mémoire locale de votre session ? Assurez-vous d’avoir sauvegardé votre fichier Excel au préalable.')) {
      setDb(createEmptyDatabase());
      showToast('Session réinitialisée. La mémoire de l’outil est vide.', 'info');
    }
  };

  // --- Contract Handlers ---
  const handleSaveContract = (newContract: GeneratedContract) => {
    setDb((prev) => ({
      ...prev,
      contracts: [newContract, ...prev.contracts],
    }));
    showToast(`Contrat ${newContract.contractNumber} enregistré dans l'historique !`, 'success');
  };

  const handleSaveTemplate = (newTemplate: Omit<ContractTemplate, 'id'>) => {
    const templateWithId: ContractTemplate = {
      ...newTemplate,
      id: `tpl-${Date.now()}`,
    };
    setDb((prev) => ({
      ...prev,
      templates: [...prev.templates, templateWithId],
    }));
    showToast(`Modèle « ${newTemplate.name} » enregistré avec succès !`, 'success');
  };

  const handleDuplicateForNewContract = (contract: GeneratedContract) => {
    setWizardPrefillData({
      ...contract.employeeData,
      startDate: new Date().toISOString().slice(0, 10),
      // If duplicating a CDD, maybe they want an avenant or CDI
      contractType: contract.employeeData.contractType === 'cdd' ? 'avenant_cdi' : contract.employeeData.contractType,
    });
    setWizardPrefillArticles([...contract.selectedArticleIds]);
    setActiveTab('generator');
    showToast(`Données de ${contract.employeeData.firstName} ${contract.employeeData.lastName} pré-remplies pour un nouveau contrat.`, 'info');
  };

  const handleUpdateContractWorkflow = (contractId: string, updatedWorkflow: Partial<ContractWorkflowSteps>) => {
    setDb((prev) => ({
      ...prev,
      contracts: prev.contracts.map((c) =>
        c.id === contractId
          ? {
              ...c,
              workflow: {
                ...c.workflow,
                ...updatedWorkflow,
              },
            }
          : c
      ),
    }));
  };

  const handleUpdateContractStatus = (contractId: string, status: GeneratedContract['status']) => {
    setDb((prev) => ({
      ...prev,
      contracts: prev.contracts.map((c) => (c.id === contractId ? { ...c, status } : c)),
    }));
  };

  const handleDeleteContract = (contractId: string) => {
    if (window.confirm('Êtes-vous certain de vouloir supprimer ce contrat de l’historique ?')) {
      setDb((prev) => ({
        ...prev,
        contracts: prev.contracts.filter((c) => c.id !== contractId),
      }));
      showToast('Contrat supprimé de l’historique.', 'info');
    }
  };

  // --- Articles Handlers ---
  const handleAddArticle = (articleData: Omit<ContractArticle, 'id'>) => {
    const newArt: ContractArticle = {
      ...articleData,
      id: `art-${Date.now()}`,
    };
    setDb((prev) => ({
      ...prev,
      articles: [...prev.articles, newArt],
    }));
    showToast(`Article ${newArt.code} créé avec succès !`, 'success');
  };

  const handleUpdateArticle = (id: string, updated: Partial<ContractArticle>) => {
    setDb((prev) => ({
      ...prev,
      articles: prev.articles.map((a) => (a.id === id ? { ...a, ...updated } : a)),
    }));
    showToast('Article mis à jour.', 'success');
  };

  const handleDeleteArticle = (id: string) => {
    if (window.confirm('Supprimer cet article de la base ?')) {
      setDb((prev) => ({
        ...prev,
        articles: prev.articles.filter((a) => a.id !== id),
      }));
      showToast('Article supprimé.', 'info');
    }
  };

  // --- Salary & Matrix Handlers ---
  const handleUpdateSettings = (newSettings: AppSettings) => {
    setDb((prev) => ({
      ...prev,
      settings: newSettings,
    }));
    showToast(`Valeur du point d'entreprise fixée à ${newSettings.pointValue.toFixed(2)} €`, 'success');
  };

  const handleAddJob = (jobData: Omit<JobPosition, 'id'>) => {
    const newJob: JobPosition = {
      ...jobData,
      id: `job-${Date.now()}`,
    };
    setDb((prev) => ({
      ...prev,
      jobs: [...prev.jobs, newJob],
    }));
    showToast(`Métier ${newJob.title} ajouté à la table des coefficients !`, 'success');
  };

  const handleUpdateJob = (id: string, updated: Partial<JobPosition>) => {
    setDb((prev) => ({
      ...prev,
      jobs: prev.jobs.map((j) => (j.id === id ? { ...j, ...updated } : j)),
    }));
    showToast('Métier mis à jour.', 'success');
  };

  const handleDeleteJob = (id: string) => {
    if (window.confirm('Supprimer ce métier de la table de correspondance ?')) {
      setDb((prev) => ({
        ...prev,
        jobs: prev.jobs.filter((j) => j.id !== id),
      }));
      showToast('Métier supprimé.', 'info');
    }
  };

  const handleUpdateWorkflowStepConfig = (steps: WorkflowStepConfig[]) => {
    setDb((prev) => ({
      ...prev,
      workflowSteps: steps,
    }));
    showToast('Étapes du processus de signature mises à jour !', 'success');
  };

  const handleUpdateEstablishment = (id: string, updated: Partial<Establishment>) => {
    setDb((prev) => ({
      ...prev,
      establishments: prev.establishments.map((e) => (e.id === id ? { ...e, ...updated } : e)),
    }));
    showToast('Paramètres de l’établissement enregistrés !', 'success');
  };

  const isMemoryEmpty = db.articles.length === 0 && db.jobs.length === 0 && db.contracts.length === 0;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-200">
          <div
            className={`px-4 py-3 rounded-xl shadow-xl border flex items-center space-x-3 text-xs font-bold ${
              toastMessage.type === 'success'
                ? 'bg-slate-900 text-white border-slate-700'
                : toastMessage.type === 'error'
                ? 'bg-red-900 text-white border-red-700'
                : 'bg-blue-900 text-white border-blue-700'
            }`}
          >
            {toastMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
            {toastMessage.type === 'error' && <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />}
            {toastMessage.type === 'info' && <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Main Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        db={db}
        onExportExcel={handleExportExcel}
        onImportExcel={handleImportExcel}
        onClearMemory={handleClearMemory}
        onOpenTagsModal={() => setIsTagsModalOpen(true)}
      />

      {/* Session Memory Banner */}
      <SessionBanner
        db={db}
        onExportExcel={handleExportExcel}
        onClearMemory={handleClearMemory}
      />

      {/* Tab Content */}
      <main className="flex-1">
        {isMemoryEmpty ? (
          /* Empty Session State Welcome Card */
          <div className="max-w-4xl mx-auto px-4 py-16 text-center">
            <div className="bg-white rounded-2xl p-8 sm:p-12 shadow-sm border border-slate-200 space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                  data powered
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-3">
                  Bienvenue !
                </h2>
                <p className="text-sm text-slate-600 max-w-xl mx-auto mt-2 leading-relaxed">
                  Votre outil autonome de rédaction automatisée des contrats de travail, calcul de salaire par coefficient et suivi des signatures.
                </p>
              </div>

              {/* Confidentiality promise box */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left max-w-lg mx-auto text-xs text-slate-700 space-y-2">
                <div className="font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Stockage exclusivement en local
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Aucune donnée de collaborateur n'est transmise sur un serveur distant. Pensez à insérer la sauvegarde la plus récente et à l'extraire en fin de sesssion.
                </p>
              </div>

              {/* Actions to start */}
              <div className="pt-2 flex items-center justify-center">
                <label className="inline-flex items-center justify-center px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl cursor-pointer shadow-md transition">
                  <Upload className="w-4 h-4 mr-2 text-blue-400" />
                  <span>Charger la dernière sauvegarde</span>
                  <input
                    type="file"
                    onChange={handleImportExcel}
                    accept=".xlsx, .xls"
                    className="hidden"
                  />
                </label>
              </div>

              {/* Ligne informative épurée avec icône ampoule */}
              <div className="pt-6 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-500">
                <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
                <span>La dernière sauvegarde est stockée sur le Teams TABM Application (Ressources humaines &gt Partagé &gt Sauvegardes Contrats).</span>
              </div>
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'generator' && (
              <ContractWizard
                db={db}
                onSaveContract={handleSaveContract}
                onSaveTemplate={handleSaveTemplate}
                onOpenTagsModal={() => setIsTagsModalOpen(true)}
                initialEmployeeData={wizardPrefillData}
                initialArticleIds={wizardPrefillArticles}
              />
            )}

            {activeTab === 'history' && (
              <ContractsHistoryView
                contracts={db.contracts}
                articles={db.articles}
                workflowSteps={db.workflowSteps}
                onUpdateWorkflowStepConfig={handleUpdateWorkflowStepConfig}
                onUpdateContractWorkflow={handleUpdateContractWorkflow}
                onUpdateContractStatus={handleUpdateContractStatus}
                onDeleteContract={handleDeleteContract}
                onDuplicateForNewContract={handleDuplicateForNewContract}
              />
            )}

            {activeTab === 'articles' && (
              <ArticlesList
                articles={db.articles}
                establishments={db.establishments}
                onAddArticle={handleAddArticle}
                onUpdateArticle={handleUpdateArticle}
                onDeleteArticle={handleDeleteArticle}
                onOpenTagsModal={() => setIsTagsModalOpen(true)}
              />
            )}

            {activeTab === 'matrix' && (
              <SalaryMatrixView
                settings={db.settings}
                onUpdateSettings={handleUpdateSettings}
                establishments={db.establishments}
                onUpdateEstablishment={handleUpdateEstablishment}
                jobs={db.jobs}
                onAddJob={handleAddJob}
                onUpdateJob={handleUpdateJob}
                onDeleteJob={handleDeleteJob}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsView
                establishments={db.establishments}
                settings={db.settings}
                onUpdateEstablishment={handleUpdateEstablishment}
                onUpdateSettings={handleUpdateSettings}
                onExportExcel={handleExportExcel}
              />
            )}
          </>
        )}
      </main>

      {/* Global Tags Modal */}
      <TagsReferenceModal
        isOpen={isTagsModalOpen}
        onClose={() => setIsTagsModalOpen(false)}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-800 font-display">
              {db.settings.appName || 'Contrats'}
            </span>
            <span>—</span>
            <span>{db.settings.appFooterNotice || "Système d'édition et de suivi des contrats de travail"}</span>
          </div>

          <div className="flex items-center space-x-4 text-[11px] text-slate-400">
            <span>Stockage sur mémoire locale</span>
            <span>•</span>
            <span>{db.settings.collectiveAgreement || 'Convention Collective Nationale des Transports Routiers'}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
