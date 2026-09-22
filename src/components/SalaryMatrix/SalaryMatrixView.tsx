import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  Plus, 
  Trash2, 
  Edit3, 
  Search, 
  Save, 
  Check, 
  Euro, 
  Info, 
  Briefcase,
  AlertCircle,
  Building2,
  Sliders,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import { JobPosition, EmployeeStatus, AppSettings, Establishment } from '../../types';
import { EMPLOYEE_STATUS_LABELS } from '../../data/defaultData';
import { formatEuro } from '../../utils/contractCompiler';

interface SalaryMatrixViewProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  establishments?: Establishment[];
  onUpdateEstablishment?: (id: string, updated: Partial<Establishment>) => void;
  jobs: JobPosition[];
  onAddJob: (job: Omit<JobPosition, 'id'>) => void;
  onUpdateJob: (id: string, updated: Partial<JobPosition>) => void;
  onDeleteJob: (id: string) => void;
}

export const SalaryMatrixView: React.FC<SalaryMatrixViewProps> = ({
  settings,
  onUpdateSettings,
  establishments = [],
  onUpdateEstablishment,
  jobs,
  onAddJob,
  onUpdateJob,
  onDeleteJob,
}) => {
  // Active establishment for salary projection / configuration
  const [selectedEstId, setSelectedEstId] = useState<string>(
    settings.defaultEstablishmentId || establishments[0]?.id || ''
  );

  const selectedEst = establishments.find((e) => e.id === selectedEstId) || establishments[0];
  const isPointMode = (selectedEst?.salaryCalculationMode || 'point_value') === 'point_value';
  const effectivePointValue = selectedEst?.pointValue ?? settings.pointValue ?? 10.45;

  const [pointValueInput, setPointValueInput] = useState<string>(String(effectivePointValue));
  const [pointSavedNotification, setPointSavedNotification] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Sync point input when selected establishment changes
  useEffect(() => {
    if (selectedEst) {
      setPointValueInput(String(selectedEst.pointValue ?? settings.pointValue ?? 10.45));
    }
  }, [selectedEstId, selectedEst?.pointValue]);

  // Modal for new / edit job
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [jobForm, setJobForm] = useState({
    title: '',
    category: 'conducteur' as EmployeeStatus,
    coefficient: 140,
    weeklyHours: 35,
    requiredLicenses: '',
    description: '',
  });

  const handleSavePointValue = () => {
    const val = parseFloat(pointValueInput.replace(',', '.'));
    if (!isNaN(val) && val > 0 && selectedEst) {
      if (onUpdateEstablishment) {
        onUpdateEstablishment(selectedEst.id, { pointValue: val, salaryCalculationMode: 'point_value' });
      }
      onUpdateSettings({ ...settings, pointValue: val });
      setPointSavedNotification(true);
      setTimeout(() => setPointSavedNotification(false), 2500);
    }
  };

  const handleSwitchMode = (mode: 'point_value' | 'manual') => {
    if (selectedEst && onUpdateEstablishment) {
      onUpdateEstablishment(selectedEst.id, { salaryCalculationMode: mode });
    }
  };

  const openAddModal = () => {
    setEditingJobId(null);
    setJobForm({
      title: '',
      category: 'conducteur',
      coefficient: 140,
      weeklyHours: 35,
      requiredLicenses: 'Permis D, FIMO/FCO Voyageurs',
      description: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (job: JobPosition) => {
    setEditingJobId(job.id);
    setJobForm({
      title: job.title,
      category: job.category,
      coefficient: job.coefficient,
      weeklyHours: job.weeklyHours,
      requiredLicenses: job.requiredLicenses || '',
      description: job.description || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmitJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobForm.title.trim()) return;

    if (editingJobId) {
      onUpdateJob(editingJobId, {
        title: jobForm.title,
        category: jobForm.category,
        coefficient: Number(jobForm.coefficient),
        weeklyHours: Number(jobForm.weeklyHours),
        requiredLicenses: jobForm.requiredLicenses,
        description: jobForm.description,
      });
    } else {
      onAddJob({
        title: jobForm.title,
        category: jobForm.category,
        coefficient: Number(jobForm.coefficient),
        weeklyHours: Number(jobForm.weeklyHours),
        requiredLicenses: jobForm.requiredLicenses,
        description: jobForm.description,
      });
    }

    setIsModalOpen(false);
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.requiredLicenses && job.requiredLicenses.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || job.category === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Title & Context */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Calculator className="w-7 h-7 text-blue-600" />
            Table de Correspondance Métiers & Salaires
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Définissez les coefficients conventionnels et la valeur du point d'entreprise pour le calcul automatique des salaires.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-sm transition"
        >
          <Plus className="w-4 h-4 mr-2" />
          Ajouter un métier à la table
        </button>
      </div>

      {/* Establishment Selector & Salary Policy Header Card */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 mb-8 space-y-5">
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-slate-200">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" />
                Établissement de Référence pour les Salaires
              </span>
              <h2 className="text-base font-bold text-slate-900 mt-0.5">
                Sélectionnez un établissement pour visualiser et ajuster sa politique salariale
              </h2>
            </div>
            <span className="text-xs text-slate-500">
              Les coefficients métiers restent communs à l'ensemble du groupe.
            </span>
          </div>

          {/* Establishment Switcher Tabs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-3">
            {establishments.map((est) => {
              const isSelected = est.id === selectedEstId;
              const estMode = est.salaryCalculationMode || 'point_value';
              const estPoint = est.pointValue ?? 10.45;

              return (
                <button
                  key={est.id}
                  type="button"
                  onClick={() => setSelectedEstId(est.id)}
                  className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                    isSelected
                      ? 'bg-blue-50/70 border-blue-500 shadow-xs ring-2 ring-blue-500/20'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-1">
                    <span className="font-bold text-xs text-slate-900 line-clamp-1">
                      {est.shortName || est.name}
                    </span>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-1" />
                    )}
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      estMode === 'point_value'
                        ? 'bg-blue-100/70 text-blue-800 border-blue-200'
                        : 'bg-purple-100/70 text-purple-800 border-purple-200'
                    }`}>
                      {estMode === 'point_value' ? `Point : ${estPoint.toFixed(2)} €` : 'Grille propre / Manuel'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {est.code}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Establishment Configuration Detail */}
        {selectedEst && (
          <div className={`p-4 rounded-xl border ${
            isPointMode ? 'bg-blue-50/40 border-blue-200' : 'bg-purple-50/40 border-purple-200'
          }`}>
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
              <div className="space-y-1 max-w-2xl">
                <div className="flex items-center space-x-2">
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    isPointMode ? 'bg-blue-600 text-white' : 'bg-purple-600 text-white'
                  }`}>
                    {isPointMode ? 'Mode : Calcul automatique par Valeur du Point' : 'Mode : Saisie Manuelle / Grille Propre'}
                  </span>
                  <span className="text-xs font-bold text-slate-800">
                    {selectedEst.name}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed mt-1">
                  {isPointMode ? (
                    <>
                      Pour cet établissement, le salaire brut mensuel de base est obtenu via :{' '}
                      <code className="bg-white px-1.5 py-0.5 rounded font-mono text-blue-900 border border-blue-200 font-bold">
                        Coefficient métier × {effectivePointValue.toFixed(2)} €
                      </code>.
                    </>
                  ) : (
                    <>
                      Cet établissement applique sa propre grille ou des salaires négociés. Le salaire brut est renseigné <strong>à la main</strong> lors de la création d'un contrat sans être contraint par une valeur de point.
                    </>
                  )}
                </p>
              </div>

              {/* Controls */}
              <div className="flex flex-wrap items-center gap-3">
                {isPointMode ? (
                  <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200 shadow-2xs">
                    <div>
                      <label htmlFor="input-point-val" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        Valeur du point ({selectedEst.shortName || 'Établissement'})
                      </label>
                      <div className="relative mt-0.5">
                        <input
                          id="input-point-val"
                          type="text"
                          value={pointValueInput}
                          onChange={(e) => setPointValueInput(e.target.value)}
                          className="w-28 px-2 py-1 text-sm font-bold text-slate-900 bg-slate-50 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-hidden text-right pr-6"
                          placeholder="10.45"
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                          €
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={handleSavePointValue}
                      className={`px-3 py-2 rounded-lg text-xs font-bold transition flex items-center shrink-0 self-end ${
                        pointSavedNotification
                          ? 'bg-emerald-600 text-white'
                          : 'bg-blue-600 hover:bg-blue-700 text-white shadow-2xs'
                      }`}
                    >
                      {pointSavedNotification ? (
                        <>
                          <Check className="w-3.5 h-3.5 mr-1" />
                          Enregistré !
                        </>
                      ) : (
                        <>
                          <Save className="w-3.5 h-3.5 mr-1" />
                          Sauvegarder
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleSwitchMode('point_value')}
                    className="px-3.5 py-2 rounded-lg text-xs font-bold bg-white border border-purple-300 hover:bg-purple-100 text-purple-900 transition flex items-center shadow-2xs"
                  >
                    <Euro className="w-3.5 h-3.5 mr-1.5 text-purple-700" />
                    Basculer cet établissement en calcul par point
                  </button>
                )}

                {isPointMode && (
                  <button
                    onClick={() => handleSwitchMode('manual')}
                    className="px-3 py-2 rounded-lg text-xs font-semibold bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 transition"
                  >
                    Passer en saisie manuelle
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Job Positions Table Section */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        {/* Filter bar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filtrer un métier, permis..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
            <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Statut :</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            >
              <option value="all">Tous les statuts</option>
              {Object.entries(EMPLOYEE_STATUS_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-100/70 text-slate-600 uppercase text-[10px] tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Intitulé du Métier</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3 text-center">Coefficient</th>
                <th className="px-4 py-3 text-right">
                  Salaire Brut Base ({selectedEst?.shortName || 'Établissement'})
                </th>
                <th className="px-4 py-3 text-right">Taux Horaire</th>
                <th className="px-4 py-3">Permis / Titres Exigés</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredJobs.map((job) => {
                const monthlySalary = job.coefficient * effectivePointValue;
                const monthlyHours = (job.weeklyHours * 52) / 12;
                const hourlyRate = monthlyHours > 0 ? monthlySalary / monthlyHours : 0;

                return (
                  <tr key={job.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-900 text-sm">{job.title}</div>
                      {job.description && (
                        <div className="text-slate-500 text-xs mt-0.5 max-w-md line-clamp-1">
                          {job.description}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200 capitalize">
                        {EMPLOYEE_STATUS_LABELS[job.category] || job.category}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center font-mono font-bold text-sm text-blue-700">
                      {job.coefficient}
                    </td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      {isPointMode ? (
                        <>
                          <div className="font-bold text-slate-900 text-sm">
                            {formatEuro(monthlySalary)} €
                          </div>
                          <span className="block text-[10px] font-normal text-slate-400">
                            {job.weeklyHours}h/sem ({monthlyHours.toFixed(1)}h/mois)
                          </span>
                        </>
                      ) : (
                        <div>
                          <span className="inline-block px-2 py-0.5 text-[10.5px] font-semibold bg-purple-50 text-purple-700 border border-purple-200 rounded">
                            Grille d'établissement
                          </span>
                          <span className="block text-[10px] text-slate-500 mt-0.5">
                            Saisie manuelle contrat
                          </span>
                          <span className="block text-[9px] text-slate-400 italic">
                            (Réf. indicatif : {formatEuro(monthlySalary)} €)
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-right font-medium text-slate-600 whitespace-nowrap">
                      {isPointMode ? (
                        <span>{formatEuro(hourlyRate)} €/h</span>
                      ) : (
                        <span className="text-slate-400 italic text-xs">Selon contrat</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      {job.requiredLicenses ? (
                        <span className="text-xs text-slate-600 bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded">
                          {job.requiredLicenses}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic text-xs">Aucun titre requis</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => openEditModal(job)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                          title="Modifier le métier"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteJob(job.id)}
                          className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded transition"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredJobs.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <Briefcase className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">Aucun métier ne correspond aux critères.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Add / Edit Job */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
            <form onSubmit={handleSubmitJob}>
              <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
                <h3 className="text-base font-bold flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-blue-400" />
                  {editingJobId ? 'Modifier le Métier' : 'Ajouter un Nouveau Métier'}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-white text-lg font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Intitulé du poste *
                  </label>
                  <input
                    type="text"
                    required
                    value={jobForm.title}
                    onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                    placeholder="ex: Conducteur(trice) Lignes Scolaires"
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Statut Collaborateur *
                    </label>
                    <select
                      value={jobForm.category}
                      onChange={(e) => setJobForm({ ...jobForm, category: e.target.value as EmployeeStatus })}
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    >
                      {Object.entries(EMPLOYEE_STATUS_LABELS).map(([k, v]) => (
                        <option key={k} value={k}>
                          {v}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Coefficient *
                    </label>
                    <input
                      type="number"
                      required
                      min={100}
                      max={800}
                      value={jobForm.coefficient}
                      onChange={(e) => setJobForm({ ...jobForm, coefficient: Number(e.target.value) })}
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* Live salary simulation */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-900">
                  <div className="flex justify-between items-center">
                    <span>Salaire mensuel brut calculé :</span>
                    <strong className="text-sm font-bold text-blue-700">
                      {formatEuro(jobForm.coefficient * settings.pointValue)} €
                    </strong>
                  </div>
                  <div className="text-[11px] text-blue-600 mt-0.5">
                    ({jobForm.coefficient} × {settings.pointValue} €)
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Durée hebdomadaire (heures)
                    </label>
                    <input
                      type="number"
                      value={jobForm.weeklyHours}
                      onChange={(e) => setJobForm({ ...jobForm, weeklyHours: Number(e.target.value) })}
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Permis & Titres requis
                    </label>
                    <input
                      type="text"
                      value={jobForm.requiredLicenses}
                      onChange={(e) => setJobForm({ ...jobForm, requiredLicenses: e.target.value })}
                      placeholder="Permis D, FIMO..."
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Missions & Description succincte
                  </label>
                  <textarea
                    rows={2}
                    value={jobForm.description}
                    onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                    placeholder="Brève description du poste..."
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 rounded-lg transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition"
                >
                  {editingJobId ? 'Enregistrer les modifications' : 'Ajouter le métier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
