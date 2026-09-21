import React, { useState } from 'react';
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
  AlertCircle
} from 'lucide-react';
import { JobPosition, EmployeeStatus, AppSettings } from '../../types';
import { EMPLOYEE_STATUS_LABELS } from '../../data/defaultData';
import { formatEuro } from '../../utils/contractCompiler';

interface SalaryMatrixViewProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  jobs: JobPosition[];
  onAddJob: (job: Omit<JobPosition, 'id'>) => void;
  onUpdateJob: (id: string, updated: Partial<JobPosition>) => void;
  onDeleteJob: (id: string) => void;
}

export const SalaryMatrixView: React.FC<SalaryMatrixViewProps> = ({
  settings,
  onUpdateSettings,
  jobs,
  onAddJob,
  onUpdateJob,
  onDeleteJob,
}) => {
  const [pointValueInput, setPointValueInput] = useState<string>(String(settings.pointValue));
  const [pointSavedNotification, setPointSavedNotification] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

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
    if (!isNaN(val) && val > 0) {
      onUpdateSettings({ ...settings, pointValue: val });
      setPointSavedNotification(true);
      setTimeout(() => setPointSavedNotification(false), 2500);
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

      {/* Point Value Card */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 mb-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center space-x-2 text-blue-700 font-bold text-sm mb-1">
              <Euro className="w-4 h-4" />
              <span>Paramètre Fondamental de Rémunération</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              Valeur Actuelle du Point d'Entreprise
            </h2>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Le salaire brut mensuel de chaque collaborateur est calculé en multipliant le{' '}
              <strong className="text-slate-800">coefficient rattaché à son métier</strong> par la{' '}
              <strong className="text-slate-800">valeur du point</strong> fixée par la direction :{' '}
              <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-800 font-semibold">
                Salaire Brut = Coefficient × Valeur du Point
              </code>.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 self-stretch sm:self-auto">
            <div className="relative">
              <label htmlFor="input-point-val" className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Valeur du point (€)
              </label>
              <div className="relative rounded-md shadow-xs">
                <input
                  id="input-point-val"
                  type="text"
                  value={pointValueInput}
                  onChange={(e) => setPointValueInput(e.target.value)}
                  className="w-36 px-3 py-2 text-base font-bold text-slate-900 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  placeholder="ex: 10.92"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                  €
                </span>
              </div>
            </div>

            <button
              onClick={handleSavePointValue}
              className={`mt-5 px-4 py-2 rounded-lg text-xs font-bold transition flex items-center ${
                pointSavedNotification
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs'
              }`}
            >
              {pointSavedNotification ? (
                <>
                  <Check className="w-4 h-4 mr-1.5 text-white" />
                  Enregistré !
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-1.5" />
                  Mettre à jour
                </>
              )}
            </button>
          </div>
        </div>
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
                <th className="px-4 py-3 text-right">Salaire Brut Base</th>
                <th className="px-4 py-3 text-right">Taux Horaire</th>
                <th className="px-4 py-3">Permis / Titres Exigés</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredJobs.map((job) => {
                const monthlySalary = job.coefficient * settings.pointValue;
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
                    <td className="px-4 py-3.5 text-right font-bold text-slate-900 text-sm whitespace-nowrap">
                      {formatEuro(monthlySalary)} €
                      <span className="block text-[10px] font-normal text-slate-400">
                        {job.weeklyHours}h/sem ({monthlyHours.toFixed(1)}h/mois)
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right font-medium text-slate-600 whitespace-nowrap">
                      {formatEuro(hourlyRate)} €/h
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
