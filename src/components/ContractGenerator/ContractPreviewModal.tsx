import React, { useState } from 'react';
import { 
  X, 
  Printer, 
  FileCheck, 
  ShieldCheck, 
  Copy, 
  Check 
} from 'lucide-react';
import { ContractEmployeeData, ContractArticle } from '../../types';
import { 
  generateContractDocument, 
  getContractFileName, 
  getContractAsPlainText 
} from '../../utils/contractCompiler';
import { printContractDocument } from '../../utils/pdfGenerator';

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
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  if (!isOpen) return null;

  const doc = generateContractDocument(employeeData, articles, selectedArticleIds);
  const pdfFilename = getContractFileName(employeeData.firstName, employeeData.lastName, 'pdf');

  const handleCopyText = async () => {
    try {
      const fullText = getContractAsPlainText(employeeData, articles, selectedArticleIds);
      await navigator.clipboard.writeText(fullText);
      setCopiedSuccess(true);
      setTimeout(() => setCopiedSuccess(false), 3000);
      if (onSavedToHistory) onSavedToHistory();
    } catch (err) {
      console.error('Erreur lors de la copie du texte :', err);
    }
  };

  const handlePrint = () => {
    printContractDocument('contract-document-preview');
    if (onSavedToHistory) onSavedToHistory();
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
            {/* Bouton 1 : Copier le texte formaté pour Word */}
            <button
              onClick={handleCopyText}
              className={`inline-flex items-center px-3.5 py-1.5 text-xs font-semibold rounded-lg border transition ${
                copiedSuccess
                  ? 'bg-emerald-600 text-white border-emerald-500'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
              title="Copier l'intégralité du texte formaté pour le coller directement dans Word ou un traitement de texte"
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

            {/* Bouton 2 : Imprimer / Enregistrer en PDF (Format fidèle à la prévisualisation) */}
            <button
              onClick={handlePrint}
              className="inline-flex items-center px-4 py-1.5 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition"
              title="Ouvre la boîte de dialogue pour imprimer ou 'Enregistrer au format PDF'. Format exact conforme à la prévisualisation."
            >
              <Printer className="w-4 h-4 mr-1.5" />
              Imprimer / Enregistrer en PDF
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Preview Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-300/80">
          <div className="max-w-4xl mx-auto w-full flex flex-col items-center">
            {/* Printable A4 Paper Container - Solid white background covering the full length of the document */}
            <div
              id="contract-document-preview"
              className="w-full max-w-3xl bg-white shadow-2xl rounded-sm p-8 sm:p-14 text-slate-900 border border-slate-300 h-auto block leading-relaxed"
              style={{ fontFamily: 'Verdana, Geneva, sans-serif', fontSize: '10pt', color: '#0f172a' }}
            >
              {/* Header: Photo / Logo uniquement */}
              {employeeData.establishmentLogoUrl ? (
                <div 
                  className="pb-4 mb-6 border-b border-slate-200 flex items-center justify-start"
                  style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}
                >
                  <img 
                    src={employeeData.establishmentLogoUrl} 
                    alt="Logo" 
                    className="max-h-14 max-w-[180px] object-contain rounded"
                    style={{ maxHeight: '56px', maxWidth: '180px', objectFit: 'contain' }}
                  />
                </div>
              ) : null}

              {/* Document Title */}
              <div 
                className="text-center my-6 py-3 border-y border-slate-300"
                style={{ textAlign: 'center', margin: '1.5rem 0', padding: '0.75rem 0', borderTop: '1px solid #cbd5e1', borderBottom: '1px solid #cbd5e1' }}
              >
                <h1 
                  className="font-bold tracking-wide uppercase text-slate-900"
                  style={{ fontFamily: 'Verdana, Geneva, sans-serif', fontSize: '12pt', fontWeight: 'bold', letterSpacing: '0.025em', textTransform: 'uppercase', color: '#0f172a', margin: 0 }}
                >
                  {doc.title}
                </h1>
                <p 
                  className="text-slate-600 mt-1"
                  style={{ fontFamily: 'Verdana, Geneva, sans-serif', fontSize: '9pt', color: '#475569', marginTop: '4px', marginBottom: 0 }}
                >
                  Statut : {employeeData.status.toUpperCase()} • Métier : {employeeData.jobTitle} • {employeeData.workTimeRegime === 'temps_partiel' ? 'Temps Partiel (TP)' : 'Temps Complet (TC)'}{employeeData.weeklyHours ? ` (${employeeData.weeklyHours}h/sem)` : ''}
                </p>
              </div>

              {/* Parties */}
              <div 
                className="my-6 whitespace-pre-line text-left leading-relaxed bg-slate-50 p-4 rounded border border-slate-200"
                style={{ fontFamily: 'Verdana, Geneva, sans-serif', fontSize: '10pt', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.375rem', padding: '1rem', margin: '1.5rem 0', whiteSpace: 'pre-line', textAlign: 'left', lineHeight: '1.5', color: '#1e293b' }}
              >
                {doc.partiesHtml}
              </div>

              {/* Articles strictly numbered sequentially */}
              <div className="space-y-6 my-6" style={{ margin: '1.5rem 0' }}>
                {doc.compiledArticles.map((art) => (
                  <div 
                    key={art.id} 
                    className="article-block text-left"
                    style={{ pageBreakInside: 'avoid', breakInside: 'avoid', marginBottom: '1.5rem', textAlign: 'left', fontFamily: 'Verdana, Geneva, sans-serif', fontSize: '10pt' }}
                  >
                    <h3 
                      className="font-bold uppercase text-slate-900 border-b border-slate-200 pb-1 mb-2 text-left"
                      style={{ fontFamily: 'Verdana, Geneva, sans-serif', fontSize: '10.5pt', fontWeight: 'bold', textTransform: 'uppercase', color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.25rem', marginBottom: '0.5rem', textAlign: 'left' }}
                    >
                      {art.title}
                    </h3>
                    <div 
                      className="whitespace-pre-line leading-relaxed text-slate-800 text-left"
                      style={{ fontFamily: 'Verdana, Geneva, sans-serif', fontSize: '10pt', whiteSpace: 'pre-line', textAlign: 'left', lineHeight: '1.5', color: '#1e293b' }}
                    >
                      {art.text}
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer Signatures */}
              <div 
                className="signatures-block mt-12 pt-6 border-t-2 border-slate-900"
                style={{ fontFamily: 'Verdana, Geneva, sans-serif', fontSize: '10pt', marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '2px solid #0f172a', pageBreakInside: 'avoid', breakInside: 'avoid' }}
              >
                <div 
                  className="whitespace-pre-line mb-6 text-left text-slate-700"
                  style={{ fontFamily: 'Verdana, Geneva, sans-serif', fontSize: '9.5pt', whiteSpace: 'pre-line', marginBottom: '1.25rem', textAlign: 'left', color: '#334155' }}
                >
                  Fait à {employeeData.companyCity || 'Lyon'}, le {new Date().toLocaleDateString('fr-FR')}, en deux exemplaires originaux.
                  <br />
                  <em 
                    style={{ fontFamily: 'Verdana, Geneva, sans-serif', fontSize: '8.5pt', color: '#64748b', fontStyle: 'italic' }}
                  >
                    (Faire précéder chaque signature de la mention manuscrite « Bon pour accord, lu et approuvé »)
                  </em>
                </div>

                <div 
                  className="grid grid-cols-2 gap-8 pt-2 pb-10 signature-grid"
                  style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', paddingTop: '0.5rem', paddingBottom: '2rem' }}
                >
                  {/* Cadre signature employeur */}
                  <div 
                    className="border-2 border-slate-400 bg-slate-50/50 rounded-lg p-5 h-48 sm:h-52 flex flex-col justify-between"
                    style={{ border: '2px solid #94a3b8', backgroundColor: '#f8fafc', borderRadius: '0.5rem', padding: '1.25rem', height: '13rem', minHeight: '13rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box' }}
                  >
                    <div>
                      <span 
                        className="font-bold uppercase block text-slate-900"
                        style={{ fontFamily: 'Verdana, Geneva, sans-serif', fontWeight: 'bold', fontSize: '9.5pt', textTransform: 'uppercase', color: '#0f172a', display: 'block' }}
                      >
                        Pour la Société {employeeData.companyName}
                      </span>
                      <span 
                        className="text-slate-600 block mt-1"
                        style={{ fontFamily: 'Verdana, Geneva, sans-serif', fontSize: '9pt', color: '#475569', display: 'block', marginTop: '2px' }}
                      >
                        {employeeData.companyRepresentative} ({employeeData.representativeRole})
                      </span>
                    </div>
                    <div 
                      className="text-slate-400 italic border-t border-dashed border-slate-300 pt-2"
                      style={{ fontFamily: 'Verdana, Geneva, sans-serif', fontSize: '8.5pt', color: '#94a3b8', fontStyle: 'italic', borderTop: '1px dashed #cbd5e1', paddingTop: '0.5rem' }}
                    >
                      Date, mention manuscrite et signature autorisée :
                    </div>
                  </div>

                  {/* Cadre signature salarié */}
                  <div 
                    className="border-2 border-slate-400 bg-slate-50/50 rounded-lg p-5 h-48 sm:h-52 flex flex-col justify-between"
                    style={{ border: '2px solid #94a3b8', backgroundColor: '#f8fafc', borderRadius: '0.5rem', padding: '1.25rem', height: '13rem', minHeight: '13rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box' }}
                  >
                    <div>
                      <span 
                        className="font-bold uppercase block text-slate-900"
                        style={{ fontFamily: 'Verdana, Geneva, sans-serif', fontWeight: 'bold', fontSize: '9.5pt', textTransform: 'uppercase', color: '#0f172a', display: 'block' }}
                      >
                        Le Salarié
                      </span>
                      <span 
                        className="text-slate-600 block mt-1"
                        style={{ fontFamily: 'Verdana, Geneva, sans-serif', fontSize: '9pt', color: '#475569', display: 'block', marginTop: '2px' }}
                      >
                        {employeeData.civility} {employeeData.firstName} {employeeData.lastName.toUpperCase()}
                      </span>
                    </div>
                    <div 
                      className="text-slate-400 italic border-t border-dashed border-slate-300 pt-2"
                      style={{ fontFamily: 'Verdana, Geneva, sans-serif', fontSize: '8.5pt', color: '#94a3b8', fontStyle: 'italic', borderTop: '1px dashed #cbd5e1', paddingTop: '0.5rem' }}
                    >
                      Date, mention manuscrite et signature :
                    </div>
                  </div>
                </div>

                {/* Bottom legal notice */}
                <div 
                  className="border-t border-slate-300 pt-3 flex flex-col space-y-2 text-slate-500"
                  style={{ borderTop: '1px solid #cbd5e1', paddingTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontFamily: 'Verdana, Geneva, sans-serif', fontSize: '8.5pt', color: '#64748b' }}
                >
                  <div 
                    className="flex justify-between items-center text-slate-400"
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#94a3b8' }}
                  >
                    <span>Paraphe Employeur : _______</span>
                    <span>{employeeData.collectiveAgreement}</span>
                    <span>Paraphe Salarié : _______</span>
                  </div>
                  {employeeData.establishmentFooterText && (
                    <div 
                      className="print-footer-text text-left pt-2 border-t border-slate-200 text-slate-600 font-medium whitespace-pre-line"
                      style={{ textAlign: 'left', paddingTop: '0.5rem', borderTop: '1px solid #e2e8f0', color: '#475569', fontWeight: 500, fontSize: '9pt', whiteSpace: 'pre-line', fontFamily: 'Verdana, Geneva, sans-serif' }}
                    >
                      {employeeData.establishmentFooterText}
                    </div>
                  )}
                  {/* Pagination de bas de page */}
                  <div 
                    className="flex justify-between items-center text-slate-400 pt-2 border-t border-slate-100"
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '8.5pt', color: '#94a3b8', paddingTop: '0.5rem', marginTop: '0.25rem', borderTop: '1px solid #f1f5f9', fontFamily: 'Verdana, Geneva, sans-serif' }}
                  >
                    <span>Document confidentiel RH</span>
                    <span className="print-fixed-pagination">Page 1</span>
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
              Nom suggéré du document : <strong className="text-slate-800">{pdfFilename}</strong>
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
