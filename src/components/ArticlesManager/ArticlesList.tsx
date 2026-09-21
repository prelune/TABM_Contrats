import React, { useState } from 'react';
import { 
  Layers, 
  Plus, 
  Trash2, 
  Edit3, 
  Search, 
  CheckSquare, 
  Square, 
  Tag, 
  HelpCircle,
  FileText,
  Filter
} from 'lucide-react';
import { ContractArticle, ContractType, EmployeeStatus } from '../../types';
import { CONTRACT_TYPE_LABELS, EMPLOYEE_STATUS_LABELS } from '../../data/defaultData';

interface ArticlesListProps {
  articles: ContractArticle[];
  onAddArticle: (article: Omit<ContractArticle, 'id'>) => void;
  onUpdateArticle: (id: string, updated: Partial<ContractArticle>) => void;
  onDeleteArticle: (id: string) => void;
  onOpenTagsModal: () => void;
}

const ALL_CONTRACT_TYPES: ContractType[] = [
  'cdi',
  'cdd',
  'avenant_cdd',
  'avenant_cdi',
  'convention_tripartite',
];

const ALL_STATUSES: EmployeeStatus[] = [
  'employé',
  'conducteur',
  'ouvrier',
  'maitrise',
  'haute_maitrise',
  'cadre',
];

export const ArticlesList: React.FC<ArticlesListProps> = ({
  articles,
  onAddArticle,
  onUpdateArticle,
  onDeleteArticle,
  onOpenTagsModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterContractType, setFilterContractType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    code: string;
    title: string;
    category: string;
    content: string;
    validContractTypes: ContractType[];
    validStatuses: EmployeeStatus[];
    isMandatory: boolean;
    isRecommended: boolean;
    order: number;
  }>({
    code: '',
    title: '',
    category: 'Général',
    content: '',
    validContractTypes: ['cdi', 'cdd'],
    validStatuses: ['conducteur', 'employé', 'ouvrier', 'maitrise', 'haute_maitrise', 'cadre'],
    isMandatory: false,
    isRecommended: false,
    order: 1,
  });

  const openAddModal = () => {
    setEditingArticleId(null);
    setFormData({
      code: `ART-${(articles.length + 1).toString().padStart(2, '0')}`,
      title: '',
      category: 'Général',
      content: '',
      validContractTypes: ['cdi', 'cdd'],
      validStatuses: ['conducteur', 'employé', 'ouvrier', 'maitrise', 'haute_maitrise', 'cadre'],
      isMandatory: false,
      isRecommended: false,
      order: articles.length + 1,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (article: ContractArticle) => {
    setEditingArticleId(article.id);
    setFormData({
      code: article.code,
      title: article.title,
      category: article.category,
      content: article.content,
      validContractTypes: [...article.validContractTypes],
      validStatuses: [...article.validStatuses],
      isMandatory: !!article.isMandatory,
      isRecommended: !!article.isRecommended,
      order: article.order,
    });
    setIsModalOpen(true);
  };

  const toggleContractType = (type: ContractType) => {
    setFormData((prev) => {
      const exists = prev.validContractTypes.includes(type);
      if (exists) {
        return {
          ...prev,
          validContractTypes: prev.validContractTypes.filter((t) => t !== type),
        };
      } else {
        return {
          ...prev,
          validContractTypes: [...prev.validContractTypes, type],
        };
      }
    });
  };

  const toggleStatus = (status: EmployeeStatus) => {
    setFormData((prev) => {
      const exists = prev.validStatuses.includes(status);
      if (exists) {
        return {
          ...prev,
          validStatuses: prev.validStatuses.filter((s) => s !== status),
        };
      } else {
        return {
          ...prev,
          validStatuses: [...prev.validStatuses, status],
        };
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) return;

    if (editingArticleId) {
      onUpdateArticle(editingArticleId, {
        code: formData.code,
        title: formData.title,
        category: formData.category,
        content: formData.content,
        validContractTypes: formData.validContractTypes,
        validStatuses: formData.validStatuses,
        isMandatory: formData.isMandatory,
        isRecommended: formData.isRecommended,
        order: Number(formData.order),
      });
    } else {
      onAddArticle({
        code: formData.code,
        title: formData.title,
        category: formData.category,
        content: formData.content,
        validContractTypes: formData.validContractTypes,
        validStatuses: formData.validStatuses,
        isMandatory: formData.isMandatory,
        isRecommended: formData.isRecommended,
        order: Number(formData.order),
      });
    }

    setIsModalOpen(false);
  };

  const filteredArticles = articles.filter((art) => {
    const matchesSearch =
      art.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      art.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      art.content.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType =
      filterContractType === 'all' || art.validContractTypes.includes(filterContractType as ContractType);

    const matchesStatus =
      filterStatus === 'all' || art.validStatuses.includes(filterStatus as EmployeeStatus);

    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Layers className="w-7 h-7 text-emerald-600" />
            Bibliothèque des Articles & Clauses
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Gérez l'ensemble des clauses disponibles avec leurs conditions de validité par type de contrat et profil salarié.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenTagsModal}
            className="inline-flex items-center px-3.5 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition shadow-2xs"
          >
            <Tag className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
            Aide Balises
          </button>
          <button
            onClick={openAddModal}
            className="inline-flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold shadow-sm transition"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouvel Article
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher par titre, code ou texte..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-hidden"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Type :</span>
            <select
              value={filterContractType}
              onChange={(e) => setFilterContractType(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-hidden"
            >
              <option value="all">Tous les types de contrat</option>
              {Object.entries(CONTRACT_TYPE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <span>Statut :</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-hidden"
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
      </div>

      {/* Articles Grid / List */}
      <div className="space-y-4">
        {filteredArticles.map((art) => (
          <div
            key={art.id}
            className="bg-white rounded-xl border border-slate-200 shadow-2xs hover:shadow-xs transition p-5 flex flex-col justify-between"
          >
            <div>
              {/* Header of card */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {art.code}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                    {art.category}
                  </span>
                  {art.isMandatory && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200">
                      Obligatoire
                    </span>
                  )}
                  {art.isRecommended && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                      Recommandé
                    </span>
                  )}
                  <span className="text-xs text-slate-400">Ordre #{art.order}</span>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => openEditModal(art)}
                    className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
                    title="Modifier l'article"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeleteArticle(art.id)}
                    className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="Supprimer l'article"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Title */}
              <h3 className="text-base font-bold text-slate-900 mb-2">{art.title}</h3>

              {/* Content snippet */}
              <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-700 font-mono whitespace-pre-line leading-relaxed mb-4 border border-slate-100 max-h-40 overflow-y-auto">
                {art.content}
              </div>
            </div>

            {/* Badges of Validity */}
            <div className="pt-3 border-t border-slate-100 flex flex-wrap gap-4 text-xs">
              <div>
                <span className="text-slate-400 font-medium block text-[10px] uppercase mb-1">
                  Types de contrat valides :
                </span>
                <div className="flex flex-wrap gap-1">
                  {art.validContractTypes.map((type) => (
                    <span
                      key={type}
                      className="px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-100 uppercase"
                    >
                      {type.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-slate-400 font-medium block text-[10px] uppercase mb-1">
                  Statuts salariés valides :
                </span>
                <div className="flex flex-wrap gap-1">
                  {art.validStatuses.map((st) => (
                    <span
                      key={st}
                      className="px-2 py-0.5 rounded text-[11px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-100 capitalize"
                    >
                      {EMPLOYEE_STATUS_LABELS[st] || st}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredArticles.length === 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500">
            <Layers className="w-10 h-10 mx-auto mb-3 text-slate-300" />
            <h3 className="text-base font-bold text-slate-800 mb-1">Aucun article trouvé</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">
              Aucune clause ne correspond à vos filtres actuels. Modifiez votre recherche ou ajoutez un nouvel article.
            </p>
            <button
              onClick={openAddModal}
              className="inline-flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Créer un premier article
            </button>
          </div>
        )}
      </div>

      {/* Modal Add / Edit Article */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150 overflow-y-auto">
          <div className="bg-white w-full max-w-3xl rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-8">
            <form onSubmit={handleSubmit}>
              {/* Modal Header */}
              <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-base font-bold">
                    {editingArticleId ? 'Modifier la Clause' : 'Ajouter un Nouvel Article'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-white font-bold text-lg"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
                {/* Identification */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Code Référence *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      placeholder="ex: ART-01"
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Titre de l'article *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="ex: Article 7 - Titres Professionnels et Obligations Conduite"
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Catégorie
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    >
                      <option value="Général">Général</option>
                      <option value="Poste & Missions">Poste & Missions</option>
                      <option value="Rémunération">Rémunération</option>
                      <option value="Temps de travail">Temps de travail</option>
                      <option value="Transport & Sécurité">Transport & Sécurité</option>
                      <option value="Spécifique Encadrement">Spécifique Encadrement</option>
                      <option value="Mutation">Mutation</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Ordre d'apparition
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={formData.order}
                      onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* Legal / Operational Status */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <label className="flex items-center space-x-3 p-2 bg-white rounded-lg border border-slate-200 cursor-pointer hover:border-rose-300 transition">
                    <input
                      type="checkbox"
                      checked={formData.isMandatory}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setFormData({
                          ...formData,
                          isMandatory: checked,
                          isRecommended: checked ? false : formData.isRecommended,
                        });
                      }}
                      className="rounded border-slate-300 text-rose-600 focus:ring-rose-500 w-4 h-4"
                    />
                    <div>
                      <span className="text-xs font-bold text-rose-800 flex items-center">
                        <span className="w-2 h-2 rounded-full bg-rose-500 mr-1.5"></span>
                        Clause Obligatoire
                      </span>
                      <p className="text-[11px] text-slate-500">Exigée par la loi / convention</p>
                    </div>
                  </label>

                  <label className="flex items-center space-x-3 p-2 bg-white rounded-lg border border-slate-200 cursor-pointer hover:border-amber-300 transition">
                    <input
                      type="checkbox"
                      checked={formData.isRecommended}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setFormData({
                          ...formData,
                          isRecommended: checked,
                          isMandatory: checked ? false : formData.isMandatory,
                        });
                      }}
                      className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 w-4 h-4"
                    />
                    <div>
                      <span className="text-xs font-bold text-amber-800 flex items-center">
                        <span className="w-2 h-2 rounded-full bg-amber-500 mr-1.5"></span>
                        Clause Recommandée
                      </span>
                      <p className="text-[11px] text-slate-500">Sécurité transport / loyauté</p>
                    </div>
                  </label>
                </div>

                {/* Requirements: Valid Contract Types (Multi-choice) */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Types de contrat valides * (plusieurs choix possibles)
                    </label>
                    <div className="space-x-2 text-[11px]">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, validContractTypes: [...ALL_CONTRACT_TYPES] })}
                        className="text-blue-600 hover:underline font-semibold"
                      >
                        Tout cocher
                      </button>
                      <span>•</span>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, validContractTypes: [] })}
                        className="text-slate-500 hover:underline"
                      >
                        Tout décocher
                      </button>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 mb-3">
                    Cette clause ne sera proposée que pour les contrats sélectionnés ci-dessous :
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {ALL_CONTRACT_TYPES.map((type) => {
                      const isChecked = formData.validContractTypes.includes(type);
                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => toggleContractType(type)}
                          className={`flex items-start text-left p-2.5 rounded-lg border text-xs transition ${
                            isChecked
                              ? 'bg-blue-50 border-blue-300 text-blue-900 font-semibold'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4 text-blue-600 mr-2 shrink-0 mt-0.5" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-400 mr-2 shrink-0 mt-0.5" />
                          )}
                          <span>{CONTRACT_TYPE_LABELS[type]}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Requirements: Valid Employee Statuses (Multi-choice) */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Statuts collaborateurs valides * (plusieurs choix possibles)
                    </label>
                    <div className="space-x-2 text-[11px]">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, validStatuses: [...ALL_STATUSES] })}
                        className="text-indigo-600 hover:underline font-semibold"
                      >
                        Tout cocher
                      </button>
                      <span>•</span>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, validStatuses: [] })}
                        className="text-slate-500 hover:underline"
                      >
                        Tout décocher
                      </button>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 mb-3">
                    Cette clause ne sera proposée que pour les statuts suivants :
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {ALL_STATUSES.map((status) => {
                      const isChecked = formData.validStatuses.includes(status);
                      return (
                        <button
                          key={status}
                          type="button"
                          onClick={() => toggleStatus(status)}
                          className={`flex items-center text-left p-2 rounded-lg border text-xs transition ${
                            isChecked
                              ? 'bg-indigo-50 border-indigo-300 text-indigo-900 font-semibold'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4 text-indigo-600 mr-2 shrink-0" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                          )}
                          <span>{EMPLOYEE_STATUS_LABELS[status]}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Text Content */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Contenu de l'article (avec balises) *
                    </label>
                    <button
                      type="button"
                      onClick={onOpenTagsModal}
                      className="text-xs text-blue-600 hover:underline flex items-center font-medium"
                    >
                      <Tag className="w-3 h-3 mr-1" />
                      Insérer une balise
                    </button>
                  </div>
                  <textarea
                    required
                    rows={6}
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Rédigez le texte de l'article en utilisant les balises comme {{nom}}, {{prenom}}, {{salaire_mensuel}}, {{coefficient}}..."
                    className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden leading-relaxed"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Les balises écrites sous la forme <code className="text-blue-600 font-bold">{'{{balise}}'}</code> seront automatiquement remplacées par les données réelles du salarié lors de la génération du contrat.
                  </p>
                </div>
              </div>

              {/* Modal Footer */}
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
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition"
                >
                  {editingArticleId ? 'Enregistrer les modifications' : 'Créer cet article'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
