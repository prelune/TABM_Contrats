import React, { useState, useRef } from 'react';
import { 
  Building2, 
  Upload, 
  Trash2, 
  Check, 
  Image as ImageIcon, 
  FileText, 
  ShieldCheck, 
  Info, 
  Sparkles,
  ExternalLink,
  Bus,
  Save,
  Sliders,
  CheckCircle2,
  Calculator,
  Euro,
  Edit3,
  Scale,
  Clock,
  Calendar
} from 'lucide-react';
import { Establishment, AppSettings } from '../../types';

interface SettingsViewProps {
  establishments: Establishment[];
  settings: AppSettings;
  onUpdateEstablishment: (id: string, updated: Partial<Establishment>) => void;
  onUpdateSettings: (newSettings: AppSettings) => void;
  onExportExcel: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  establishments,
  settings,
  onUpdateEstablishment,
  onUpdateSettings,
  onExportExcel,
}) => {
  // Active selected establishment
  const [selectedEstId, setSelectedEstId] = useState<string>(
    settings.defaultEstablishmentId || establishments[0]?.id || 'etab-1'
  );

  const activeEstablishment = establishments.find((e) => e.id === selectedEstId) || establishments[0];

  // Local form state for selected establishment
  const [formData, setFormData] = useState<Establishment>({
    ...activeEstablishment,
  });

  // Track if active establishment changed to sync local state
  const prevEstIdRef = useRef<string>(selectedEstId);
  if (prevEstIdRef.current !== selectedEstId) {
    prevEstIdRef.current = selectedEstId;
    const nextEst = establishments.find((e) => e.id === selectedEstId) || establishments[0];
    setFormData({ ...nextEst });
  }

  const [isDragging, setIsDragging] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Switch active establishment
  const handleSelectEstablishment = (id: string) => {
    setSelectedEstId(id);
    const est = establishments.find((e) => e.id === id);
    if (est) {
      setFormData({ ...est });
    }
    setSaveSuccess(false);
  };

  // Handle Logo Upload with automatic lightweight compression (max 380px width, ~30KB)
  // Évite l'explosion de la mémoire, les crashs html2canvas et le dépassement de quota localStorage
  const processImageFile = (file: File) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (!dataUrl) return;

      const img = new Image();
      img.onload = () => {
        // Redimensionnement proportionnel : max 380px de large ou 140px de haut
        const maxW = 380;
        const maxH = 140;
        let targetW = img.width;
        let targetH = img.height;

        if (targetW > maxW || targetH > maxH) {
          const ratio = Math.min(maxW / targetW, maxH / targetH);
          targetW = Math.round(targetW * ratio);
          targetH = Math.round(targetH * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, targetW, targetH);
          // Export PNG optimisé
          const optimizedDataUrl = canvas.toDataURL('image/png');
          setFormData((prev) => ({
            ...prev,
            logoUrl: optimizedDataUrl,
          }));
        } else {
          setFormData((prev) => ({
            ...prev,
            logoUrl: dataUrl,
          }));
        }
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleRemoveLogo = () => {
    setFormData((prev) => ({
      ...prev,
      logoUrl: '',
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Quick preset footers
  const applyPresetFooter = (type: 'rcs' | 'full' | 'rgpd') => {
    if (type === 'rcs') {
      setFormData((prev) => ({
        ...prev,
        footerText: `${prev.companyName} — SIRET ${prev.siret || '482 910 324 00028'} — RCS Lyon B ${prev.siret ? prev.siret.slice(0, 9) : '482 910 324'} — Code APE ${prev.ape || '4939A'} — Siège social : ${prev.address}, ${prev.postalCode} ${prev.city}`,
      }));
    } else if (type === 'full') {
      setFormData((prev) => ({
        ...prev,
        footerText: `${prev.companyName}, SAS au capital de 500 000 € — SIRET ${prev.siret || '482 910 324 00028'} — Code APE ${prev.ape || '4939A'}\nSiège d'exploitation : ${prev.address}, ${prev.postalCode} ${prev.city} — Tél : 04 72 00 00 00 — Courriel : rh@tabm-transport.fr\nDocument contractuel soumis aux dispositions du Code du travail et de la convention collective applicable.`,
      }));
    } else if (type === 'rgpd') {
      setFormData((prev) => ({
        ...prev,
        footerText: `${prev.companyName} • SIRET ${prev.siret} • ${prev.collectiveAgreement}\nProtection des données : Les données collectées font l'objet d'un traitement RH sécurisé pour la gestion du contrat de travail conformément au RGPD.`,
      }));
    }
  };

  // Submit and save
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateEstablishment(formData.id, formData);

    // If this is default, also keep appSettings in sync
    if (settings.defaultEstablishmentId === formData.id) {
      onUpdateSettings({
        ...settings,
        companyName: formData.companyName,
        companyAddress: formData.address,
        companyCity: `${formData.postalCode} ${formData.city}`,
        companySiret: formData.siret,
        companyApe: formData.ape,
        companyRepresentative: formData.director,
        representativeRole: formData.directorRole,
        collectiveAgreement: formData.collectiveAgreement,
        companyLogoUrl: formData.logoUrl,
      });
    }

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3500);
  };

  const handleSetDefault = () => {
    onUpdateSettings({
      ...settings,
      defaultEstablishmentId: formData.id,
      companyName: formData.companyName,
      companyAddress: formData.address,
      companyCity: `${formData.postalCode} ${formData.city}`,
      companySiret: formData.siret,
      companyApe: formData.ape,
      companyRepresentative: formData.director,
      representativeRole: formData.directorRole,
      collectiveAgreement: formData.collectiveAgreement,
      companyLogoUrl: formData.logoUrl,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-blue-600 text-xs font-bold uppercase tracking-wider mb-1">
              <Sliders className="w-4 h-4" />
              <span>Paramétrage & Identité de l'Entreprise</span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-500 font-normal">En-tête, Logo & Pied de page</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Paramètres des Établissements
            </h1>
            <p className="text-xs text-slate-600 mt-1 max-w-3xl">
              Personnalisez pour chaque entité la <strong>raison sociale</strong>, le <strong>logo PNG d'en-tête</strong> et le <strong>bloc de texte en pied de page</strong>. Ces éléments alimentent directement vos exports Word (.doc), vos PDF officiels et sont sauvegardés dans votre fichier Excel.
            </p>
          </div>

          <button
            onClick={onExportExcel}
            className="inline-flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-xs self-start md:self-auto shrink-0"
            title="Télécharger la sauvegarde Excel intégrant les logos et mentions de pied de page"
          >
            <DownloadIcon className="w-4 h-4 mr-2" />
            Exporter vers Excel
          </button>
        </div>

        {saveSuccess && (
          <div className="mt-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between animate-in fade-in">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">
                Modifications enregistrées avec succès ! Elles seront utilisées pour tous les futurs contrats et exports.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Select Establishment Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {establishments.map((est) => {
          const isSelected = est.id === selectedEstId;
          const isDefault = settings.defaultEstablishmentId === est.id;

          return (
            <button
              key={est.id}
              type="button"
              onClick={() => handleSelectEstablishment(est.id)}
              className={`p-4 rounded-xl border text-left transition flex flex-col justify-between ${
                isSelected
                  ? 'bg-blue-50/70 border-blue-500 shadow-xs ring-2 ring-blue-500/20'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center space-x-2.5">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 overflow-hidden ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    {est.logoUrl ? (
                      <img src={est.logoUrl} alt="Logo" className="w-full h-full object-contain p-0.5" />
                    ) : (
                      <Building2 className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 leading-tight">
                      {est.shortName || est.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 line-clamp-1">{est.companyName}</p>
                  </div>
                </div>

                {isDefault && (
                  <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 border border-blue-200 shrink-0">
                    Par défaut
                  </span>
                )}
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                <span>SIRET : {est.siret ? est.siret.slice(0, 9) + '...' : 'Non renseigné'}</span>
                <span className="font-semibold text-slate-700">{est.city}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Configuration Form & Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form settings column (7 cols) */}
        <form onSubmit={handleSave} className="lg:col-span-7 space-y-6">
          {/* SECTION 1: Logo d'En-tête (PNG) */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
            <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-1 rounded-md bg-blue-100 text-blue-700">
                  <ImageIcon className="w-3.5 h-3.5" />
                </div>
                <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-wide">
                  1. Logo d'En-tête (Image PNG)
                </h2>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">Pour {formData.shortName || formData.name}</span>
            </div>

            <div className="p-5 space-y-4">
              <p className="text-xs text-slate-600">
                Chargez le logo officiel de cet établissement au format <strong>PNG</strong> (idéalement avec transparence) ou JPEG. Ce logo sera intégré en haut du document Word et du PDF officiel.
              </p>

              {/* Logo Drag & Drop Box */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition ${
                  isDragging
                    ? 'border-blue-500 bg-blue-50/50'
                    : formData.logoUrl
                    ? 'border-emerald-300 bg-emerald-50/20 hover:border-blue-400'
                    : 'border-slate-300 hover:border-blue-400 bg-slate-50/50'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileInputChange}
                  accept="image/png, image/jpeg, image/jpg, image/svg+xml, image/webp"
                  className="hidden"
                />

                {formData.logoUrl ? (
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    {/* Image preview with checkerboard pattern for transparency */}
                    <div 
                      className="w-32 h-20 bg-white rounded-lg border border-slate-200 shadow-2xs p-2 flex items-center justify-center relative overflow-hidden"
                      style={{
                        backgroundImage: 'radial-gradient(#e2e8f0 1px, transparent 1px)',
                        backgroundSize: '8px 8px',
                      }}
                    >
                      <img
                        src={formData.logoUrl}
                        alt="Logo Établissement"
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>

                    <div className="text-center sm:text-left">
                      <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-800">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Logo chargé et actif</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Cliquez ou glissez une autre image pour remplacer.
                      </p>
                      <div className="mt-2 flex items-center justify-center sm:justify-start gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            fileInputRef.current?.click();
                          }}
                          className="px-2.5 py-1 text-xs font-semibold bg-white border border-slate-300 rounded text-slate-700 hover:bg-slate-50"
                        >
                          Changer le logo
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveLogo();
                          }}
                          className="px-2.5 py-1 text-xs font-semibold bg-red-50 border border-red-200 rounded text-red-700 hover:bg-red-100 flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          Supprimer
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 py-3">
                    <div className="w-12 h-12 mx-auto rounded-full bg-blue-100/70 text-blue-600 flex items-center justify-center">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-blue-600 hover:underline">
                        Cliquez pour importer un logo PNG
                      </span>
                      <span className="text-xs text-slate-600"> ou glissez-déposez l'image ici</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      PNG avec fond transparent conseillé • Format recommandé : max 400x150 px • Taille max : 1 Mo
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* SECTION 2: Raison Sociale & Données Légales */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
            <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-1 rounded-md bg-indigo-100 text-indigo-700">
                  <Building2 className="w-3.5 h-3.5" />
                </div>
                <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-wide">
                  2. Raison Sociale & Identité Juridique
                </h2>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">Champs obligatoires *</span>
            </div>

            <div className="p-5 space-y-4">
              {/* Raison Sociale & Nom d'usage */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-8">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Raison Sociale Officielle (Entité Contractante) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    placeholder="ex: TABM Mobilités & Transport Urbain SAS"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-bold text-slate-900"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Nom exact figurant sur l'extrait K-bis de la société
                  </p>
                </div>

                <div className="sm:col-span-4">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Nom Court Usuel *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.shortName || ''}
                    onChange={(e) => setFormData({ ...formData, shortName: e.target.value })}
                    placeholder="ex: TABM Lyon Urbain"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-semibold text-slate-800"
                  />
                </div>
              </div>

              {/* SIRET & Code APE */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Numéro SIRET *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.siret}
                    onChange={(e) => setFormData({ ...formData, siret: e.target.value })}
                    placeholder="482 910 324 00028"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Code APE / NAF *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.ape}
                    onChange={(e) => setFormData({ ...formData, ape: e.target.value })}
                    placeholder="4939A (Transports urbains)"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              {/* Adresse, Code Postal, Ville */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-6">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Adresse d'exploitation / Siège *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="14 Boulevard des Transports"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Code Postal *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    placeholder="69009"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Ville *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Lyon"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Représentant légal & Qualité */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Directeur / Représentant Légal *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.director}
                    onChange={(e) => setFormData({ ...formData, director: e.target.value })}
                    placeholder="Laurent DUPONT"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-semibold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Qualité / Rôle de signature *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.directorRole}
                    onChange={(e) => setFormData({ ...formData, directorRole: e.target.value })}
                    placeholder="Directeur Général"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Convention Collective */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Convention Collective Applicable *
                </label>
                <input
                  type="text"
                  required
                  value={formData.collectiveAgreement}
                  onChange={(e) => setFormData({ ...formData, collectiveAgreement: e.target.value })}
                  placeholder="Convention Collective Nationale des Réseaux de Transports Urbains de Voyageurs (IDCC 1424)"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: Politique Salariale & Rémunération de l'Établissement */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
            <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-1 rounded-md bg-emerald-100 text-emerald-700">
                  <Calculator className="w-3.5 h-3.5" />
                </div>
                <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-wide">
                  3. Politique Salariale & Rémunération de l'Établissement
                </h2>
              </div>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${
                (formData.salaryCalculationMode || 'point_value') === 'point_value'
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-purple-50 text-purple-700 border-purple-200'
              }`}>
                {(formData.salaryCalculationMode || 'point_value') === 'point_value'
                  ? `Valeur du point : ${(formData.pointValue || 10.45).toFixed(2)} €`
                  : 'Saisie manuelle / Grille propre'}
              </span>
            </div>

            <div className="p-5 space-y-5">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Méthode de calcul des rémunérations pour cet établissement *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Option 1 : Calcul par Valeur du Point */}
                  <div
                    onClick={() => setFormData((prev) => ({ ...prev, salaryCalculationMode: 'point_value' }))}
                    className={`p-4 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                      (formData.salaryCalculationMode || 'point_value') === 'point_value'
                        ? 'bg-blue-50/70 border-blue-500 shadow-xs ring-2 ring-blue-500/20'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg ${
                        (formData.salaryCalculationMode || 'point_value') === 'point_value'
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        <Euro className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-slate-900">
                            Calcul automatique par Valeur du Point
                          </span>
                          {(formData.salaryCalculationMode || 'point_value') === 'point_value' && (
                            <span className="w-2 h-2 rounded-full bg-blue-600" />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                          Le salaire brut de base est calculé automatiquement à partir du coefficient conventionnel du métier choisi :
                        </p>
                        <code className="inline-block mt-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-white text-blue-900 border border-blue-200">
                          Salaire Brut = Coeff × Valeur du Point
                        </code>
                      </div>
                    </div>
                  </div>

                  {/* Option 2 : Saisie Manuelle / Grille propre */}
                  <div
                    onClick={() => setFormData((prev) => ({ ...prev, salaryCalculationMode: 'manual' }))}
                    className={`p-4 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                      formData.salaryCalculationMode === 'manual'
                        ? 'bg-purple-50/70 border-purple-500 shadow-xs ring-2 ring-purple-500/20'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg ${
                        formData.salaryCalculationMode === 'manual'
                          ? 'bg-purple-600 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        <Edit3 className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-slate-900">
                            Saisie manuelle / Grille propre d'établissement
                          </span>
                          {formData.salaryCalculationMode === 'manual' && (
                            <span className="w-2 h-2 rounded-full bg-purple-600" />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                          Cet établissement applique sa propre grille de salaires ou des montants négociés. Le salaire brut est saisi directement à la main lors de la création du contrat.
                        </p>
                        <span className="inline-block mt-1.5 text-[10px] font-semibold text-purple-700 bg-white px-2 py-0.5 rounded border border-purple-200">
                          Non contraint par la valeur du point
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Point Value Input for this establishment */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="space-y-1 max-w-md">
                    <label htmlFor="est-point-val" className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                      Valeur du Point de cet Établissement (€) *
                    </label>
                    <p className="text-[11px] text-slate-500 leading-normal">
                      {(formData.salaryCalculationMode || 'point_value') === 'point_value'
                        ? `Cette valeur sera directement multipliée par le coefficient du poste pour générer les salaires de ${formData.shortName || formData.name}.`
                        : `Conservée à titre de référence indicative pour cet établissement (le mode manuel reste actif pour la saisie directe).`}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="relative">
                      <input
                        id="est-point-val"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.pointValue ?? 10.45}
                        onChange={(e) => setFormData({ ...formData, pointValue: parseFloat(e.target.value) || 0 })}
                        className="w-32 px-3 py-2 text-sm font-bold text-slate-900 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden text-right font-mono"
                      />
                      <span className="absolute right-8 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                        €
                      </span>
                    </div>
                  </div>
                </div>

                {/* Live Simulation for this establishment */}
                <div className="mt-3 pt-3 border-t border-slate-200 text-xs flex flex-wrap items-center justify-between gap-2 text-slate-600">
                  <span className="text-[11px] text-slate-500">
                    Exemple de simulation pour cet établissement :
                  </span>
                  <div className="flex items-center gap-3 text-[11px]">
                    <span className="font-mono">
                      Conducteur (Coeff 140) :{' '}
                      <strong className="text-slate-900">
                        {((140 * (formData.pointValue || 10.45))).toFixed(2)} € brut
                      </strong>
                    </span>
                    <span className="font-mono">
                      Ouvrier (Coeff 150) :{' '}
                      <strong className="text-slate-900">
                        {((150 * (formData.pointValue || 10.45))).toFixed(2)} € brut
                      </strong>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 4: Bloc de Texte du Pied de Page */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
            <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-1 rounded-md bg-amber-100 text-amber-700">
                  <FileText className="w-3.5 h-3.5" />
                </div>
                <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-wide">
                  4. Bloc de Texte de Pied de Page
                </h2>
              </div>
              <span className="text-[11px] text-slate-500">Mention légale personnalisée</span>
            </div>

            <div className="p-5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Texte imprimé en bas de chaque page de contrat
                </label>
                <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                  <span className="text-slate-400">Modèles rapides :</span>
                  <button
                    type="button"
                    onClick={() => applyPresetFooter('rcs')}
                    className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                  >
                    Standard RCS
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPresetFooter('full')}
                    className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                  >
                    Complet & Capital
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPresetFooter('rgpd')}
                    className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                  >
                    RGPD
                  </button>
                </div>
              </div>

              <textarea
                rows={3}
                value={formData.footerText || ''}
                onChange={(e) => setFormData({ ...formData, footerText: e.target.value })}
                placeholder="ex: TABM Mobilités & Transport Urbain SAS - SIRET 482 910 324 00028 - RCS Lyon B 482 910 324 - APE 4939A - Siège social..."
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono leading-relaxed"
              />

              <p className="text-[11px] text-slate-500">
                Ce bloc apparaîtra sous les signatures officielles dans le PDF et le fichier Word (.doc), et sera sauvegardé dans la colonne <strong>Mention_Pied_De_Page</strong> du fichier Excel.
              </p>
            </div>
          </div>

          {/* SECTION 5: Périodes d'essai par établissement */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
            <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-1 rounded-md bg-purple-100 text-purple-700">
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-wide">
                  5. Périodes d'Essai par Défaut de l'Établissement
                </h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setFormData((prev) => ({
                    ...prev,
                    trialPeriods: {
                      cddUnder6Months: '1 jour par semaine de contrat',
                      cddOver6Months: '1 mois',
                      cdiCadre: '4 mois',
                      cdiMaitrise: '3 mois',
                      cdiConducteur: '2 mois',
                      cdiEmploye: '2 mois',
                      cdiOuvrier: '2 mois',
                    },
                  }));
                }}
                className="text-[11px] text-purple-700 hover:text-purple-900 font-semibold flex items-center gap-1 cursor-pointer transition"
              >
                <Sparkles className="w-3 h-3" />
                Rétablir durées légales
              </button>
            </div>

            <div className="p-5 space-y-5">
              <p className="text-xs text-slate-600 leading-relaxed">
                Configurez les durées de période d'essai qui s'appliqueront et se pré-rempliront automatiquement lors de la création d'un contrat rattaché à <strong>{formData.shortName || formData.name}</strong>. Lors de la rédaction, la durée sera calculée en temps réel tout en restant modifiable.
              </p>

              {/* Bloc CDD */}
              <div className="p-3.5 bg-amber-50/50 rounded-xl border border-amber-200/70 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-amber-700" />
                    Contrats à Durée Déterminée (CDD)
                  </span>
                  <span className="text-[10px] font-semibold text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded">
                    Calcul automatique selon dates début / fin
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      CDD de moins de 6 mois
                    </label>
                    <input
                      type="text"
                      value={formData.trialPeriods?.cddUnder6Months ?? '1 jour par semaine de contrat'}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          trialPeriods: {
                            ...formData.trialPeriods,
                            cddUnder6Months: e.target.value,
                          },
                        })
                      }
                      placeholder="1 jour par semaine de contrat"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-hidden font-medium text-slate-800"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">
                      Calculé en jours réels (ex : 4 semaines = 4 jours ouvrés).
                    </p>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      CDD de plus de 6 mois
                    </label>
                    <input
                      type="text"
                      value={formData.trialPeriods?.cddOver6Months ?? '1 mois'}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          trialPeriods: {
                            ...formData.trialPeriods,
                            cddOver6Months: e.target.value,
                          },
                        })
                      }
                      placeholder="1 mois"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-hidden font-medium text-slate-800"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">
                      Durée forfaitaire légale pour les CDD &gt; 6 mois.
                    </p>
                  </div>
                </div>
              </div>

              {/* Bloc CDI par statut */}
              <div className="p-3.5 bg-blue-50/50 rounded-xl border border-blue-200/70 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-blue-700" />
                    Contrats à Durée Indéterminée (CDI) selon le statut
                  </span>
                  <span className="text-[10px] font-semibold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded">
                    Renouvelable selon accord de branche
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center justify-between">
                      <span>Cadre</span>
                      <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-purple-100 text-purple-800 font-bold">CADRE</span>
                    </label>
                    <input
                      type="text"
                      value={formData.trialPeriods?.cdiCadre ?? '4 mois'}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          trialPeriods: {
                            ...formData.trialPeriods,
                            cdiCadre: e.target.value,
                          },
                        })
                      }
                      placeholder="4 mois"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-hidden font-medium text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center justify-between">
                      <span>Maîtrise & Tech. (AMT)</span>
                      <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-indigo-100 text-indigo-800 font-bold">AMT</span>
                    </label>
                    <input
                      type="text"
                      value={formData.trialPeriods?.cdiMaitrise ?? '3 mois'}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          trialPeriods: {
                            ...formData.trialPeriods,
                            cdiMaitrise: e.target.value,
                          },
                        })
                      }
                      placeholder="3 mois"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-hidden font-medium text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center justify-between">
                      <span>Conducteur (CDT)</span>
                      <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold">CDT</span>
                    </label>
                    <input
                      type="text"
                      value={formData.trialPeriods?.cdiConducteur ?? '2 mois'}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          trialPeriods: {
                            ...formData.trialPeriods,
                            cdiConducteur: e.target.value,
                          },
                        })
                      }
                      placeholder="2 mois"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-hidden font-medium text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center justify-between">
                      <span>Employé (EMP)</span>
                      <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-blue-100 text-blue-800 font-bold">EMP</span>
                    </label>
                    <input
                      type="text"
                      value={formData.trialPeriods?.cdiEmploye ?? '2 mois'}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          trialPeriods: {
                            ...formData.trialPeriods,
                            cdiEmploye: e.target.value,
                          },
                        })
                      }
                      placeholder="2 mois"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-hidden font-medium text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center justify-between">
                      <span>Ouvrier (OUV)</span>
                      <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-amber-100 text-amber-800 font-bold">OUV</span>
                    </label>
                    <input
                      type="text"
                      value={formData.trialPeriods?.cdiOuvrier ?? '2 mois'}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          trialPeriods: {
                            ...formData.trialPeriods,
                            cdiOuvrier: e.target.value,
                          },
                        })
                      }
                      placeholder="2 mois"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-hidden font-medium text-slate-800"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              {settings.defaultEstablishmentId !== formData.id && (
                <button
                  type="button"
                  onClick={handleSetDefault}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 transition"
                >
                  Définir comme établissement par défaut
                </button>
              )}
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition shadow-sm space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Enregistrer les paramètres de cet établissement</span>
            </button>
          </div>
        </form>

        {/* Live Preview Column (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden sticky top-20">
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-blue-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider">Aperçu Réel du Document</h3>
              </div>
              <span className="text-[10px] bg-blue-600/30 text-blue-300 border border-blue-400/30 px-2 py-0.5 rounded font-mono">
                PDF & Word (.doc)
              </span>
            </div>

            <div className="p-4 sm:p-6 bg-slate-200/70">
              {/* Mock Document Page */}
              <div 
                className="bg-white shadow-md border border-slate-300 p-5 rounded-xs text-slate-900 space-y-4 text-xs"
                style={{ fontFamily: 'Georgia, Cambria, "Times New Roman", Times, serif' }}
              >
                {/* 1. Header with Logo & Corporate Identity */}
                <div className="border-b-2 border-slate-900 pb-3 flex items-start justify-between gap-3">
                  <div className="flex items-start space-x-3">
                    {formData.logoUrl ? (
                      <div className="h-12 w-24 shrink-0 flex items-center justify-center bg-white p-0.5">
                        <img
                          src={formData.logoUrl}
                          alt="Logo"
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="p-2 rounded bg-blue-50 border border-blue-200 shrink-0">
                        <Bus className="w-6 h-6 text-blue-700" />
                      </div>
                    )}
                    <div>
                      <div className="font-bold text-sm tracking-wide text-blue-950 font-sans">
                        {formData.companyName || 'RAISON SOCIALE NON DÉFINIE'}
                      </div>
                      {formData.shortName && (
                        <div className="text-[10px] font-semibold text-blue-900 font-sans">
                          {formData.shortName}
                        </div>
                      )}
                      <p className="text-[10px] text-slate-600 font-sans mt-0.5">
                        {formData.address || 'Adresse'}, {formData.postalCode} {formData.city}
                      </p>
                      <p className="text-[9px] text-slate-500 font-sans">
                        {formData.collectiveAgreement}
                      </p>
                    </div>
                  </div>

                  <div className="text-right font-sans shrink-0">
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">Réf. Contrat</span>
                    <span className="text-[10px] font-mono font-bold text-blue-900">TABM-2026-001</span>
                  </div>
                </div>

                {/* 2. Mock Contract Title & Body */}
                <div className="py-1 text-center border-y border-slate-200">
                  <div className="text-xs font-bold uppercase font-sans tracking-wide text-slate-900">
                    CONTRAT DE TRAVAIL À DURÉE INDÉTERMINÉE
                  </div>
                  <div className="text-[10px] text-slate-500 font-sans">
                    Statut : CONDUCTEUR • Métier : Conducteur de car Voyageurs
                  </div>
                </div>

                {/* Short Parties snippet */}
                <div className="text-[11px] leading-relaxed text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-200">
                  <strong>ENTRE LES SOUSSIGNÉS :</strong><br />
                  La Société <strong>{formData.companyName}</strong>, représentée par {formData.director} en sa qualité de {formData.directorRole}.
                </div>

                {/* Remuneration clause snippet showing establishment mode */}
                <div className="text-[10.5px] leading-relaxed text-slate-700 bg-blue-50/50 p-2.5 rounded border border-blue-200">
                  <div className="font-bold text-blue-950 font-sans uppercase text-[10px] mb-0.5">
                    Article Rémunération ({formData.shortName || formData.name}) :
                  </div>
                  {(formData.salaryCalculationMode || 'point_value') === 'point_value' ? (
                    <div>
                      Rémunération mensuelle brute calculée sur la base du coefficient conventionnel <strong>140</strong> multiplié par la valeur du point d'établissement fixée à <strong>{(formData.pointValue || 10.45).toFixed(2)} €</strong>, soit un salaire de base de <strong>{((140 * (formData.pointValue || 10.45))).toFixed(2)} €</strong> pour 35h.
                    </div>
                  ) : (
                    <div>
                      Rémunération mensuelle brute déterminée selon la grille propre et les forfaits d'exploitation de l'établissement (saisie manuelle sans application de la formule du point).
                    </div>
                  )}
                </div>

                {/* Content mockup lines */}
                <div className="space-y-1.5 py-1">
                  <div className="h-2 bg-slate-200 rounded w-11/12"></div>
                  <div className="h-2 bg-slate-200 rounded w-full"></div>
                  <div className="h-2 bg-slate-200 rounded w-4/5"></div>
                </div>

                {/* 3. Signatures Box */}
                <div className="pt-3 border-t border-slate-300">
                  <div className="grid grid-cols-2 gap-3 text-[10px] font-sans">
                    <div className="border border-slate-300 p-2 rounded h-16 flex flex-col justify-between">
                      <span className="font-bold uppercase text-[9px] text-slate-800 line-clamp-1">
                        Pour la Société {formData.companyName}
                      </span>
                      <span className="text-[8px] text-slate-400 italic">Signature autorisée</span>
                    </div>
                    <div className="border border-slate-300 p-2 rounded h-16 flex flex-col justify-between">
                      <span className="font-bold uppercase text-[9px] text-slate-800">
                        Le Salarié
                      </span>
                      <span className="text-[8px] text-slate-400 italic">Signature et mention manuscrite</span>
                    </div>
                  </div>
                </div>

                {/* 4. Footer with custom text */}
                <div className="border-t-2 border-slate-900 pt-2 text-[9px] text-center font-sans space-y-1 text-slate-500">
                  <div>
                    Raison Sociale : <strong className="text-slate-700">{formData.companyName}</strong> — SIRET : {formData.siret} — APE : {formData.ape}
                  </div>
                  <div>
                    Siège : {formData.address}, {formData.postalCode} {formData.city}
                  </div>
                  {formData.footerText && (
                    <div className="p-1.5 rounded bg-slate-100 text-slate-600 font-mono text-[8.5px] border border-slate-200/80 mt-1 whitespace-pre-line text-left">
                      {formData.footerText}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
              <span>L'aperçu s'adapte en temps réel aux champs modifiés.</span>
              <span className="text-blue-600 font-semibold">100% Hors-ligne</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function DownloadIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  );
}
