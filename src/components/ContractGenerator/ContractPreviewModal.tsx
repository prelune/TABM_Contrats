import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Printer, 
  FileCheck, 
  CheckCircle2, 
  Bus,
  ShieldCheck,
  FileText,
  Copy,
  Check
} from 'lucide-react';
import { ContractEmployeeData, ContractArticle } from '../../types';
import { 
  generateContractDocument, 
  getContractFileName, 
  exportContractToWordDocument, 
  getContractAsPlainText 
} from '../../utils/contractCompiler';
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
  const [copiedSuccess, setCopiedSuccess] = useState(false);
  const [wordExportSuccess, setWordExportSuccess] = useState(false);

  if (!isOpen) return null;

  const doc = generateContractDocument(employeeData, articles, selectedArticleIds);

  // Exact filename format requested: "prenom - nom - contrat de travail"
  const pdfFilename = getContractFileName(employeeData.firstName, employeeData.lastName, 'pdf');
  const wordFilename = getContractFileName(employeeData.firstName, employeeData.lastName, 'doc');

  const handleDownloadPdf = async () => {
    setIsDownloading(true);
    try {
      await downloadContractAsPdf('contract-document-preview', pdfFilename);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3500);
      if (onSavedToHistory) onSavedToHistory();
    } catch (err) {
      console.error(err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleExportWord = () => {
    try {
      exportContractToWordDocument(employeeData, articles, selectedArticleIds, wordFilename);
      setWordExportSuccess(true);
      setTimeout(() => setWordExportSuccess(false), 3500);
      if (onSavedToHistory) onSavedToHistory();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopyText = async () => {
    try {
      const fullText = getContractAsPlainText(employeeData, articles, selectedArticleIds);
      await navigator.clipboard.writeText(fullText);
      setCopiedSuccess(true);
      setTimeout(() => setCopiedSuccess(false), 3000);
    } catch (err) {
      console.error('Erreur lors de la copie du texte:', err);
    }
  };

  const handlePrint = () => {
    printContractDocument('contract-document-preview');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-slate-100 w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-300 flex flex-col max-h-[96vh] overflow-hidden">
        {/* Top Control Bar */}
        <div className="px-4 sm:px-6 py-3 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
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

          <div className="flex flex-wrap items-center gap-2">
            {/* Copy to Word Button */}
            <button
              onClick={handleCopyText}
              className={`inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg border transition ${
                copiedSuccess
                  ? 'bg-emerald-600 text-white border-emerald-500'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
              title="Copier l'intégralité du texte formaté pour le coller directement dans Word"
            >
              {copiedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 mr-1.5 text-white" />
                  Copié pour Word !
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 mr-1.5 text-slate-300" />
                  Copier le texte (Word)
                </>
              )}
            </button>

            {/* Word Export Button */}
            <button
              onClick={handleExportWord}
              className={`inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg border transition ${
                wordExportSuccess
                  ? 'bg-emerald-600 text-white border-emerald-500'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
              title="Télécharger directement au format Word (.doc) léger et transférable (~15 Ko, compatible Word 365, LibreOffice, Google Docs)"
            >
              {wordExportSuccess ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-white" />
                  Word (.doc) généré !
                </>
              ) : (
                <>
                  <FileText className="w-3.5 h-3.5 mr-1.5 text-blue-400" />
                  Exporter Word (.doc)
                </>
              )}
            </button>

            {/* Print & Vector PDF Button */}
            <button
              onClick={handlePrint}
              className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-700 hover:bg-indigo-600 text-white border border-indigo-600 shadow-xs transition"
              title="Recommandé : Ouvre la boîte de dialogue pour imprimer ou 'Enregistrer au format PDF'. Texte 100% vectoriel, fichier léger et 0 plantage."
            >
              <Printer className="w-3.5 h-3.5 mr-1.5" />
              Imprimer / Enregistrer PDF
            </button>

            {/* Direct Download PDF Button */}
            <button
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              className={`inline-flex items-center px-3.5 py-1.5 text-xs font-bold rounded-lg shadow-sm transition ${
                downloadSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-blue-600 hover:bg-blue-500 text-white'
              }`}
              title={`Télécharger directement le fichier ${pdfFilename}`}
            >
              {isDownloading ? (
                <>
                  <span className="w-3 h-3 mr-1.5 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block"></span>
                  Génération PDF...
                </>
              ) : downloadSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-1.5" />
                  PDF Téléchargé !
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 mr-1.5" />
                  Télécharger PDF
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Preview Area with solid background */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-300/80">
          <div className="max-w-4xl mx-auto w-full flex flex-col items-center">
            {/* Printable A4 Paper Container - Solid white background covering the full length of the document */}
            <div
              id="contract-document-preview"
              className="w-full max-w-3xl bg-white shadow-2xl rounded-sm p-8 sm:p-14 text-slate-900 border border-slate-300 h-auto block text-xs sm:text-sm leading-relaxed"
              style={{ fontFamily: 'Georgia, Cambria, "Times New Roman", Times, serif' }}
            >
              {/* Header Letterhead */}
              <div className="border-b-2 border-slate-900 pb-4 mb-6 flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  {employeeData.establishmentLogoUrl ? (
                    <img 
                      src={employeeData.establishmentLogoUrl} 
                      alt="Logo Entreprise" 
                      className="h-12 max-w-[140px] object-contain shrink-0 rounded"
                    />
                  ) : (
                    <div className="p-2 rounded-lg bg-blue-50 border border-blue-200 shrink-0">
                      <Bus className="w-6 h-6 text-blue-700" />
                    </div>
                  )}
                  <div>
                    <div className="flex items-center space-x-2 text-slate-900">
                      <span className="font-bold text-base sm:text-lg tracking-wider font-sans">
                        {employeeData.companyName.toUpperCase()}
                      </span>
                    </div>
                    {employeeData.establishmentName && (
                      <p className="text-[11px] font-semibold text-blue-900 font-sans">
                        {employeeData.establishmentName}
                      </p>
                    )}
                    <p className="text-[11px] text-slate-600 font-sans mt-0.5">
                      {employeeData.companyAddress}, {employeeData.companyCity}
                    </p>
                    <p className="text-[10px] text-slate-500 font-sans">
                      {employeeData.collectiveAgreement}
                    </p>
                  </div>
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
              <div className="my-6 whitespace-pre-line text-left text-xs sm:text-[13px] leading-relaxed bg-slate-50 p-4 rounded border border-slate-200">
                {doc.partiesHtml}
              </div>

              {/* Articles strictly numbered sequentially */}
              <div className="space-y-6 my-6">
                {doc.compiledArticles.map((art) => (
                  <div key={art.id} className="article-block text-left">
                    <h3 className="font-bold text-xs sm:text-sm font-sans uppercase text-slate-900 border-b border-slate-200 pb-1 mb-2 text-left">
                      {art.title}
                    </h3>
                    <div className="whitespace-pre-line text-xs sm:text-[13px] leading-relaxed text-slate-800 text-left">
                      {art.text}
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer Signatures */}
              <div className="signatures-block mt-12 pt-6 border-t-2 border-slate-900">
                <div className="whitespace-pre-line text-xs mb-6 text-left">
                  Fait à {employeeData.companyCity || 'Lyon'}, le {new Date().toLocaleDateString('fr-FR')}, en deux exemplaires originaux.
                  <br />
                  <em className="text-[11px] text-slate-500">
                    (Faire précéder chaque signature de la mention manuscrite « Bon pour accord, lu et approuvé »)
                  </em>
                </div>

                <div className="grid grid-cols-2 gap-8 pt-2 pb-10">
                  <div className="border-2 border-slate-400 bg-slate-50/50 rounded-lg p-5 h-48 sm:h-52 flex flex-col justify-between">
                    <div>
                      <span className="font-bold font-sans text-xs uppercase block text-slate-900">
                        Pour la Société {employeeData.companyName}
                      </span>
                      <span className="text-[11px] text-slate-600 font-sans block">
                        {employeeData.companyRepresentative} ({employeeData.representativeRole})
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 italic font-sans border-t border-dashed border-slate-300 pt-2">
                      Date, mention manuscrite et signature autorisée :
                    </div>
                  </div>

                  <div className="border-2 border-slate-400 bg-slate-50/50 rounded-lg p-5 h-48 sm:h-52 flex flex-col justify-between">
                    <div>
                      <span className="font-bold font-sans text-xs uppercase block text-slate-900">
                        Le Salarié
                      </span>
                      <span className="text-[11px] text-slate-600 font-sans block">
                        {employeeData.civility} {employeeData.firstName} {employeeData.lastName.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 italic font-sans border-t border-dashed border-slate-300 pt-2">
                      Date, mention manuscrite et signature :
                    </div>
                  </div>
                </div>

                {/* Bottom legal notice */}
                <div className="border-t border-slate-300 pt-3 flex flex-col space-y-2 text-[10px] text-slate-500 font-sans">
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Paraphe Employeur : _______</span>
                    <span>{employeeData.collectiveAgreement}</span>
                    <span>Paraphe Salarié : _______</span>
                  </div>
                  <div className="text-center pt-2 border-t border-slate-200 text-slate-600 font-medium">
                    Raison Sociale : <strong className="text-slate-800">{employeeData.companyName}</strong> — SIRET : {employeeData.establishmentSiret || '482 910 324 00028'} — Code APE : {employeeData.establishmentApe || '4939A'}
                    <br />
                    Siège d'exploitation : {employeeData.companyAddress}, {employeeData.companyCity}
                    {employeeData.establishmentFooterText && (
                      <span className="block text-[9px] text-slate-400 mt-0.5">{employeeData.establishmentFooterText}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="px-6 py-3 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>
              Nom du fichier d'export : <strong className="text-slate-800">{pdfFilename}</strong>
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

