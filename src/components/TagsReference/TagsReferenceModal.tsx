import React, { useState } from 'react';
import { X, Copy, Check, Search, Tag, Info } from 'lucide-react';
import { AVAILABLE_TAGS } from '../../data/defaultData';
import { TagInfo } from '../../types';

interface TagsReferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTag?: (tag: string) => void;
}

export const TagsReferenceModal: React.FC<TagsReferenceModalProps> = ({
  isOpen,
  onClose,
  onSelectTag,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copiedTag, setCopiedTag] = useState<string | null>(null);

  if (!isOpen) return null;

  const categories = ['all', 'Salarié', 'Poste & Salaire', 'Accords & Féminin', 'Dates & Durées', 'Transport', 'Entreprise'];

  const filteredTags = AVAILABLE_TAGS.filter((t) => {
    const matchesCat = selectedCategory === 'all' || t.category === selectedCategory;
    const matchesSearch =
      t.tag.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleCopy = (tag: string) => {
    navigator.clipboard.writeText(tag);
    setCopiedTag(tag);
    setTimeout(() => setCopiedTag(null), 1800);
    if (onSelectTag) {
      onSelectTag(tag);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-4xl rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-blue-600/30 text-blue-400 border border-blue-500/30">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Répertoire des Balises Dynamiques</h2>
              <p className="text-xs text-slate-400">
                Balises utilisables dans la rédaction de vos articles et modèles de contrats
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notices: Féminin & Salaire */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x border-b border-slate-200 bg-slate-50 text-xs">
          <div className="p-3 bg-pink-50/60 flex items-start space-x-2.5">
            <Info className="w-4 h-4 text-pink-600 mt-0.5 shrink-0" />
            <div className="text-slate-700">
              <strong className="text-pink-900 font-bold block mb-0.5">Accords au féminin automatiques (si Mme) :</strong>
              Utilisez <code className="bg-pink-100 text-pink-800 px-1 py-0.2 rounded font-mono font-bold">{'{{e}}'}</code> pour accorder un mot (ex : <em>engagé{'{{e}}'}</em>), ou <code className="bg-pink-100 text-pink-800 px-1 py-0.2 rounded font-mono font-bold">{'{{accord:masculin|féminin}}'}</code> (ex : <em>{'{{accord:le salarié|la salariée}}'}</em>).
            </div>
          </div>

          <div className="p-3 bg-blue-50/60 flex items-start space-x-2.5">
            <Info className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
            <div className="text-slate-700">
              <strong className="text-blue-900 font-bold block mb-0.5">Calcul automatique du salaire :</strong>
              <code className="bg-blue-100 text-blue-900 px-1 py-0.2 rounded font-mono font-bold">{'{{salaire_mensuel}}'}</code> est calculé selon : <span className="font-medium text-blue-950">Coefficient × Valeur du point</span>.
            </div>
          </div>
        </div>

        {/* Filter bar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher une balise..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-wrap gap-1 w-full sm:w-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {cat === 'all' ? 'Toutes' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Tags List Table */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredTags.map((tagInfo) => {
              const isCopied = copiedTag === tagInfo.tag;
              return (
                <div
                  key={tagInfo.tag}
                  className="p-3.5 rounded-lg border border-slate-200 bg-white hover:border-blue-300 hover:shadow-xs transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <code className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                        {tagInfo.tag}
                      </code>
                      <span className="text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {tagInfo.category}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-800 mb-1">{tagInfo.label}</h4>
                    <p className="text-xs text-slate-500 leading-relaxed mb-2">{tagInfo.description}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-400 italic truncate max-w-[200px]" title={`Exemple : ${tagInfo.example}`}>
                      Ex: {tagInfo.example}
                    </span>
                    <button
                      onClick={() => handleCopy(tagInfo.tag)}
                      className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-medium transition ${
                        isCopied
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                          Copié !
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 mr-1" />
                          Copier
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredTags.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <Tag className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">Aucune balise ne correspond à votre recherche.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold shadow-sm transition"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
