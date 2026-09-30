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
    return null;
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
