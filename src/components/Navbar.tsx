import React, { useRef } from 'react';
import { 
  FileText, 
  Layers, 
  Calculator, 
  History, 
  Download, 
  Upload, 
  HelpCircle, 
  Trash2, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle,
  Sliders,
  Bus
} from 'lucide-react';
import { AppDatabase } from '../types';

interface NavbarProps {
  activeTab: 'generator' | 'history' | 'articles' | 'matrix' | 'settings' | 'tags';
  setActiveTab: (tab: 'generator' | 'history' | 'articles' | 'matrix' | 'settings' | 'tags') => void;
  db: AppDatabase;
  onExportExcel: () => void;
  onImportExcel: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onLoadSampleData: () => void;
  onClearMemory: () => void;
  onOpenTagsModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  db,
  onExportExcel,
  onImportExcel,
  onLoadSampleData,
  onClearMemory,
  onOpenTagsModal,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isMemoryEmpty = db.articles.length === 0 && db.jobs.length === 0 && db.contracts.length === 0;

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center space-x-3">
            {db.settings.appLogoUrl ? (
              <img
                src={db.settings.appLogoUrl}
                alt="Logo Application"
                className="w-10 h-10 object-contain rounded-lg bg-white/10 p-1 border border-slate-700 shadow-inner"
              />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-inner font-bold text-xl tracking-tight">
                <Bus className="w-6 h-6" />
              </div>
            )}
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg tracking-tight font-display text-white">
                  {db.settings.appName || 'TABM-Contrats'}
                </span>
                <span className="bg-blue-500/20 text-blue-300 text-xs px-2 py-0.5 rounded font-medium border border-blue-500/30">
                  {db.settings.appBadge || 'RH Transport'}
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                {db.settings.appSubtitle || 'Génération & Suivi des contrats de travail • 100% Hors-ligne'}
              </p>
            </div>
          </div>

          {/* Quick Excel Action Buttons & Memory Status */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Memory indicator badge */}
            <div className="hidden lg:flex items-center text-xs px-2.5 py-1.5 rounded-md bg-slate-800/80 border border-slate-700 text-slate-300">
              {isMemoryEmpty ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-400 mr-2 animate-pulse"></span>
                  <span>Session vide (aucun fichier chargé)</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mr-1.5" />
                  <span>
                    {db.contracts.length} contrat{db.contracts.length > 1 ? 's' : ''} • {db.articles.length} article{db.articles.length > 1 ? 's' : ''} • {db.jobs.length} métier{db.jobs.length > 1 ? 's' : ''}
                  </span>
                </>
              )}
            </div>

            {/* Hidden File Input for Excel Import */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={onImportExcel}
              accept=".xlsx, .xls"
              className="hidden"
            />

            {/* Import Excel Button */}
            <button
              id="btn-import-excel"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition shadow-sm"
              title="Charger votre fichier Excel de sauvegarde"
            >
              <Upload className="w-3.5 h-3.5 mr-1.5 text-blue-400" />
              <span>Charger Excel</span>
            </button>

            {/* Export Excel Button */}
            <button
              id="btn-export-excel"
              onClick={onExportExcel}
              disabled={isMemoryEmpty}
              className={`inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-md transition shadow-sm ${
                isMemoryEmpty
                  ? 'bg-slate-800 text-slate-500 border border-slate-800 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/20'
              }`}
              title="Exporter l'ensemble de la base vers Excel pour conserver vos données"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              <span>Sauvegarder Excel</span>
            </button>

            {/* If empty, offer sample data button */}
            {isMemoryEmpty && (
              <button
                id="btn-load-demo"
                onClick={onLoadSampleData}
                className="inline-flex items-center px-2.5 py-1.5 text-xs font-semibold rounded-md bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 border border-blue-500/40 transition"
                title="Charger les données types pour société de transport"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1" />
                <span className="hidden md:inline">Données démo</span>
              </button>
            )}

            {/* Reset memory button */}
            {!isMemoryEmpty && (
              <button
                id="btn-clear-memory"
                onClick={onClearMemory}
                className="p-1.5 rounded-md text-slate-400 hover:text-red-400 hover:bg-slate-800 transition"
                title="Vider la mémoire locale (Fin de session)"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 sm:space-x-4 border-t border-slate-800/80 pt-1 overflow-x-auto no-scrollbar">
          <button
            id="tab-btn-generator"
            onClick={() => setActiveTab('generator')}
            className={`flex items-center px-3.5 py-2.5 text-sm font-semibold border-b-2 whitespace-nowrap transition ${
              activeTab === 'generator'
                ? 'border-blue-500 text-white bg-slate-800/50'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <FileText className="w-4 h-4 mr-2 text-blue-400" />
            Nouveau Contrat
          </button>

          <button
            id="tab-btn-history"
            onClick={() => setActiveTab('history')}
            className={`flex items-center px-3.5 py-2.5 text-sm font-semibold border-b-2 whitespace-nowrap transition relative ${
              activeTab === 'history'
                ? 'border-blue-500 text-white bg-slate-800/50'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <History className="w-4 h-4 mr-2 text-indigo-400" />
            Historique & Signatures
            {db.contracts.length > 0 && (
              <span className="ml-2 px-1.5 py-0.2 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {db.contracts.length}
              </span>
            )}
          </button>

          <button
            id="tab-btn-articles"
            onClick={() => setActiveTab('articles')}
            className={`flex items-center px-3.5 py-2.5 text-sm font-semibold border-b-2 whitespace-nowrap transition ${
              activeTab === 'articles'
                ? 'border-blue-500 text-white bg-slate-800/50'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Layers className="w-4 h-4 mr-2 text-emerald-400" />
            Bibliothèque d'Articles
            {db.articles.length > 0 && (
              <span className="ml-2 px-1.5 py-0.2 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {db.articles.length}
              </span>
            )}
          </button>

          <button
            id="tab-btn-matrix"
            onClick={() => setActiveTab('matrix')}
            className={`flex items-center px-3.5 py-2.5 text-sm font-semibold border-b-2 whitespace-nowrap transition ${
              activeTab === 'matrix'
                ? 'border-blue-500 text-white bg-slate-800/50'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Calculator className="w-4 h-4 mr-2 text-amber-400" />
            Métiers & Salaires
          </button>

          <button
            id="tab-btn-settings"
            onClick={() => setActiveTab('settings')}
            className={`flex items-center px-3.5 py-2.5 text-sm font-semibold border-b-2 whitespace-nowrap transition ${
              activeTab === 'settings'
                ? 'border-blue-500 text-white bg-slate-800/50'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Sliders className="w-4 h-4 mr-2 text-sky-400" />
            Paramètres
          </button>

          <button
            id="tab-btn-tags"
            onClick={onOpenTagsModal}
            className="flex items-center px-3.5 py-2.5 text-sm font-medium text-slate-400 hover:text-blue-300 border-b-2 border-transparent transition ml-auto"
          >
            <HelpCircle className="w-4 h-4 mr-1.5 text-slate-400" />
            Liste des Balises
          </button>
        </nav>
      </div>
    </header>
  );
};
