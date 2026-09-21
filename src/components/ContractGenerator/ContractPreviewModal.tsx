import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Printer, 
  FileCheck, 
  CheckCircle2, 
  ExternalLink,
  Bus,
  ShieldCheck
} from 'lucide-react';
import { ContractEmployeeData, ContractArticle } from '../../types';
import { generateContractDocument } from '../../utils/contractCompiler';
import { downloadContractAsPdf, printContractDocument } from '../../utils/pdfGenerator';

interface ContractPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  employeeData: ContractEmployeeData;
  articles: ContractArticle[];
  selectedArticleIds: string[];
  contractNumber?: string;
  onSavedToHistory?: () => void;
}

export const ContractPreviewModal: React.FC<ContractPreviewModalProps> = ({
  isOpen,
  onClose,
  employeeData,
  articles,
  selectedArticleIds,
  contractNumber = 'TABM-CONTRAT',
  onSavedToHistory,
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen) return null;

  const doc = generateContractDocument(employeeData, articles, selectedArticleIds);

  const cleanFilename = `${contractNumber}_${employeeData.lastName.toUpperCase()}_${employeeData.firstName}.pdf`;

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await downloadContractAsPdf('contract-document-preview', cleanFilename);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
      if (onSavedToHistory) onSavedToHistory();
    } catch (err) {
      console.error(err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    printContractDocument('contract-document-preview');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-slate-100 w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-300 flex flex-col max-h-[94vh] overflow-hidden">
        {/* Top Control Bar */}
        <div className="px-6 py-3.5 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-blue-600/30 text-blue-400 border border-blue-500/30">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-sm text-white">Visualisation du Document Contractuel</span>
                <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                  {contractNumber}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {employeeData.firstName} {employeeData.lastName.toUpperCase()} • {employeeData.jobTitle}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              title="Imprimer le contrat"
            >
              <Printer className="w-4 h-4 mr-1.5" />
              Imprimer
            </button>

            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className={`inline-flex items-center px-4 py-1.5 text-xs font-bold rounded-lg shadow-sm transition ${
                downloadSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-blue-600 hover:bg-blue-500 text-white'
              }`}
            >
              {isDownloading ? (
                <>Génération en cours...</>
              ) : downloadSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-1.5" />
                  Téléchargé !
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-1.5" />
                  Télécharger le PDF
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Preview Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-200/70 flex justify-center">
          {/* Printable A4 Paper Container */}
          <div
            id="contract-document-preview"
            className="w-full max-w-3xl bg-white shadow-xl rounded-sm p-8 sm:p-14 text-slate-900 border border-slate-300 min-h-[1100px] flex flex-col justify-between text-xs sm:text-sm leading-relaxed"
            style={{ fontFamily: 'Georgia, Cambria, "Times New Roman", Times, serif' }}
          >
            <div>
              {/* Header Letterhead */}
              <div className="border-b-2 border-slate-900 pb-4 mb-6 flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2 text-slate-900">
                    <Bus className="w-5 h-5 text-blue-700" />
                    <span className="font-bold text-base sm:text-lg tracking-wider font-sans">
                      {employeeData.companyName.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 font-sans mt-1">
                    {employeeData.companyAddress}, {employeeData.companyCity}
                  </p>
                  <p className="text-[10px] text-slate-500 font-sans">
                    {employeeData.collectiveAgreement}
                  </p>
                </div>
                <div className="text-right font-sans">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Réf. Contrat</span>
                  <span className="text-xs font-mono font-bold text-blue-900">{contractNumber}</span>
                  <span className="text-[10px] text-slate-500 block mt-1">Édition RH Sécurisée</span>
                </div>
              </div>

              {/* Document Title */}
              <div className="text-center my-6 py-3 border-y border-slate-300">
                <h1 className="text-base sm:text-lg font-bold tracking-wide uppercase font-sans text-slate-900">
                  {doc.title}
                </h1>
                <p className="text-xs text-slate-600 font-sans mt-1">
                  Statut : {employeeData.status.toUpperCase()} • Métier : {employeeData.jobTitle}
                </p>
              </div>

              {/* Parties */}
              <div className="my-6 whitespace-pre-line text-justify text-xs sm:text-[13px] leading-relaxed bg-slate-50/50 p-4 rounded border border-slate-200">
                {doc.partiesHtml}
              </div>

              {/* Articles */}
              <div className="space-y-6 my-6">
                {doc.compiledArticles.map((art) => (
                  <div key={art.id} className="article-block text-justify">
                    <h3 className="font-bold text-xs sm:text-sm font-sans uppercase text-slate-900 border-b border-slate-200 pb-1 mb-2">
                      {art.title}
                    </h3>
                    <div className="whitespace-pre-line text-xs sm:text-[13px] leading-relaxed text-slate-800">
                      {art.text}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Signatures */}
            <div className="signatures-block mt-12 pt-6 border-t-2 border-slate-900">
              <div className="whitespace-pre-line text-xs mb-8">
                Fait à {employeeData.companyCity || 'Lyon'}, le {new Date().toLocaleDateString('fr-FR')}, en deux exemplaires originaux.
                <br />
                <em className="text-[11px] text-slate-500">
                  (Faire précéder chaque signature de la mention manuscrite « Bon pour accord, lu et approuvé »)
                </em>
              </div>

              <div className="grid grid-cols-2 gap-8 pt-4 pb-12">
                <div className="border border-slate-300 rounded p-4 h-40 flex flex-col justify-between">
                  <div>
                    <span className="font-bold font-sans text-xs uppercase block text-slate-900">
                      Pour la Société {employeeData.companyName}
                    </span>
                    <span className="text-[11px] text-slate-600 font-sans block">
                      {employeeData.companyRepresentative} ({employeeData.representativeRole})
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 italic font-sans">
                    Date et Signature autorisée :
                  </div>
                </div>

                <div className="border border-slate-300 rounded p-4 h-40 flex flex-col justify-between">
                  <div>
                    <span className="font-bold font-sans text-xs uppercase block text-slate-900">
                      Le Salarié
                    </span>
                    <span className="text-[11px] text-slate-600 font-sans block">
                      {employeeData.civility} {employeeData.firstName} {employeeData.lastName.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 italic font-sans">
                    Date et Signature :
                  </div>
                </div>
              </div>

              {/* Bottom legal notice */}
              <div className="text-center text-[10px] text-slate-400 font-sans border-t border-slate-200 pt-2 flex justify-between">
                <span>Paraphe Employeur : _______</span>
                <span>Document contractuel soumis au Code du Travail & IDCC 16</span>
                <span>Paraphe Salarié : _______</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer with reminder */}
        <div className="px-6 py-3 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>
              Après téléchargement, envoyez le document en signature puis tracez les étapes dans l'onglet <strong>Historique</strong>.
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-bold text-xs transition"
          >
            Fermer l'aperçu
          </button>
        </div>
      </div>
    </div>
  );
};
