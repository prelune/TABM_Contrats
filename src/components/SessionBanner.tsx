import React, { useRef } from 'react';
import { ShieldCheck, Upload, Download, Sparkles, AlertCircle, RefreshCw, FileSpreadsheet } from 'lucide-react';
import { AppDatabase } from '../types';

interface SessionBannerProps {
  db: AppDatabase;
  onExportExcel: () => void;
  onImportExcel: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onLoadSampleData: () => void;
  onClearMemory: () => void;
}

export const SessionBanner: React.FC<SessionBannerProps> = ({
  db,
  onExportExcel,
  onImportExcel,
  onLoadSampleData,
  onClearMemory,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isMemoryEmpty = db.articles.length === 0 && db.jobs.length === 0 && db.contracts.length === 0;

  if (isMemoryEmpty) {
    return (
      <div className="bg-amber-50 border-b border-amber-200 px-4 py-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start space-x-3">
            <div className="p-2 rounded-lg bg-amber-100 text-amber-800 shrink-0 mt-0.5">
              <ShieldCheck className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-900">
                Mode Sécurisé Zéro-Cloud • Mémoire de session vierge
              </h3>
              <p className="text-xs text-amber-700 mt-0.5 max-w-3xl">
                Conformément à votre politique RH, aucune donnée n'est stockée en ligne. Pour commencer à travailler, chargez votre précédent fichier de sauvegarde Excel, ou démarrez immédiatement avec notre jeu de données démo dédié au transport.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto shrink-0">
            <input
              type="file"
              ref={fileInputRef}
              onChange={onImportExcel}
              accept=".xlsx, .xls"
              className="hidden"
            />
            <button
              id="banner-btn-import-excel"
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center px-4 py-2 text-xs font-bold rounded-lg bg-white border border-amber-300 text-amber-900 hover:bg-amber-100/50 shadow-sm transition"
            >
              <Upload className="w-4 h-4 mr-1.5 text-amber-700" />
              Charger mon Excel
            </button>
            <button
              id="banner-btn-load-demo"
              onClick={onLoadSampleData}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center px-4 py-2 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition"
            >
              <Sparkles className="w-4 h-4 mr-1.5" />
              Charger données démo TABM
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-100/90 border-b border-slate-200 px-4 py-2.5 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-600">
        <div className="flex items-center space-x-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-medium text-slate-700">
            Session active en mémoire locale :
          </span>
          <span className="text-slate-600">
            <strong>{db.contracts.length}</strong> contrat(s) • <strong>{db.articles.length}</strong> clauses • <strong>{db.jobs.length}</strong> métiers référencés (Point : <strong>{db.settings.pointValue.toFixed(2)} €</strong>)
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <span className="text-slate-500 hidden md:inline">
            Pensez à exporter vos données avant de fermer la session.
          </span>
          <button
            onClick={onExportExcel}
            className="inline-flex items-center font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 mr-1 text-emerald-600" />
            Télécharger Excel
          </button>
          <span className="text-slate-300">|</span>
          <button
            onClick={onClearMemory}
            className="text-red-600 hover:text-red-700 hover:underline"
          >
            Vider la session
          </button>
        </div>
      </div>
    </div>
  );
};
