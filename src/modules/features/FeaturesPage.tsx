import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Layers, 
  Trash2, 
  Edit2, 
  BookOpen, 
  LayoutDashboard, 
  Check, 
  X,
  Bug,
  Sparkles,
  Lightbulb,
  Clock,
  Zap,
  CheckCircle2
} from 'lucide-react';
import type { Feature, PlannerItem, Category } from '../../types';
import { storageAdapter } from '../../services/storageAdapter';

const PRESET_COLORS = [
  '#6366f1', // Indigo
  '#8b5cf6', // Roxo
  '#ec4899', // Rosa
  '#f43f5e', // Rose
  '#ef4444', // Vermelho
  '#f97316', // Laranja
  '#eab308', // Amarelo
  '#10b981', // Esmeralda
  '#06b6d4', // Ciano
  '#3b82f6', // Azul
];

export const FeaturesPage: React.FC = () => {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [items, setItems] = useState<PlannerItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFeature, setEditingFeature] = useState<Feature | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);

  const loadData = () => {
    setFeatures(storageAdapter.getFeatures());
    setItems(storageAdapter.getItems());
    setCategories(storageAdapter.getCategories());
  };

  useEffect(() => {
    loadData();
    const handleProjectChange = () => loadData();
    window.addEventListener('dev_planner_project_changed', handleProjectChange);
    return () => window.removeEventListener('dev_planner_project_changed', handleProjectChange);
  }, []);

  const handleOpenCreateModal = () => {
    setEditingFeature(null);
    setName('');
    setDescription('');
    setSelectedColor(PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)]);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (feat: Feature) => {
    setEditingFeature(feat);
    setName(feat.name);
    setDescription(feat.description || '');
    setSelectedColor(feat.color);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const featureToSave: Feature = {
      id: editingFeature ? editingFeature.id : `feat-${Date.now()}`,
      projectId: editingFeature ? editingFeature.projectId : storageAdapter.getActiveProjectId(),
      name: name.trim(),
      description: description.trim(),
      color: selectedColor,
      createdAt: editingFeature ? editingFeature.createdAt : new Date().toISOString(),
    };

    storageAdapter.saveFeature(featureToSave);
    setIsModalOpen(false);
    loadData();
  };

  const handleDelete = (id: string, featureName: string) => {
    if (confirm(`Tem certeza que deseja apagar a feature "${featureName}"? Todos os bugs e tarefas atrelados a ela também serão excluídos.`)) {
      storageAdapter.deleteFeature(id);
      loadData();
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto w-full space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Layers className="text-indigo-400" />
            Minhas Features
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Defina os módulos do seu sistema (ex: Remédios, Vacinas, Dashboard, Autenticação) para organizar bugs e documentação.
          </p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl font-medium shadow-lg shadow-indigo-600/30 transition-all text-sm shrink-0"
        >
          <Plus size={18} />
          Nova Feature
        </button>
      </div>

      {/* Empty State */}
      {features.length === 0 ? (
        <div className="text-center py-16 px-4 bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto mb-4">
            <Layers size={28} />
          </div>
          <h3 className="text-lg font-semibold text-slate-200">Nenhuma feature cadastrada ainda</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto mt-1 mb-6">
            Crie sua primeira feature para começar a taggear bugs, melhorias e documentar como cada parte do seu sistema funciona.
          </p>
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-indigo-600/30 transition-all text-sm"
          >
            <Plus size={18} />
            Criar Primeira Feature
          </button>
        </div>
      ) : (
        /* Feature Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feat) => {
            const featItems = items.filter(i => i.featureId === feat.id);

            // Contagem por Status do Kanban
            const todoCount = featItems.filter(i => i.status === 'todo').length;
            const doingCount = featItems.filter(i => i.status === 'doing').length;
            const doneCount = featItems.filter(i => i.status === 'done').length;

            // Contagem por Categoria/Tag
            const bugsCount = featItems.filter(i => {
              const cat = categories.find(c => c.id === i.categoryId);
              return cat?.name.toLowerCase().includes('bug');
            }).length;

            const improvementsCount = featItems.filter(i => {
              const cat = categories.find(c => c.id === i.categoryId);
              return cat?.name.toLowerCase().includes('melhoria');
            }).length;

            const ideasCount = featItems.filter(i => {
              const cat = categories.find(c => c.id === i.categoryId);
              return cat?.name.toLowerCase().includes('ideia');
            }).length;

            const otherTagsCount = featItems.filter(i => {
              const cat = categories.find(c => c.id === i.categoryId);
              const name = cat?.name.toLowerCase() || '';
              return !name.includes('bug') && !name.includes('melhoria') && !name.includes('ideia');
            }).length;

            return (
              <div 
                key={feat.id}
                className="bg-[#0f172a]/70 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all flex flex-col justify-between group shadow-sm hover:shadow-md"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full shrink-0 shadow-sm"
                        style={{ backgroundColor: feat.color }}
                      />
                      <h3 className="font-semibold text-base text-white group-hover:text-indigo-300 transition-colors">
                        {feat.name}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleOpenEditModal(feat)}
                        title="Editar feature"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(feat.id, feat.name)}
                        title="Excluir feature"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 min-h-[32px] line-clamp-2 mb-3">
                    {feat.description || 'Sem descrição cadastrada.'}
                  </p>

                  {/* 1. Contadores por Tag / Tipo */}
                  <div className="flex items-center gap-1.5 flex-wrap mb-2.5">
                    {bugsCount > 0 ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 font-medium text-[11px]">
                        <Bug size={12} /> {bugsCount} {bugsCount === 1 ? 'bug' : 'bugs'}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-800/60 text-slate-500 text-[11px]">
                        0 bugs
                      </span>
                    )}

                    {improvementsCount > 0 ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 font-medium text-[11px]">
                        <Sparkles size={12} /> {improvementsCount} {improvementsCount === 1 ? 'melhoria' : 'melhorias'}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-800/60 text-slate-500 text-[11px]">
                        0 melhorias
                      </span>
                    )}

                    {ideasCount > 0 ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-medium text-[11px]">
                        <Lightbulb size={12} /> {ideasCount} {ideasCount === 1 ? 'ideia' : 'ideias'}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-800/60 text-slate-500 text-[11px]">
                        0 ideias
                      </span>
                    )}

                    {otherTagsCount > 0 && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[11px]">
                        +{otherTagsCount} outras
                      </span>
                    )}
                  </div>

                  {/* 2. Status Real no Kanban */}
                  <div className="flex items-center justify-between gap-1 mb-4 text-[11px] bg-slate-900/80 px-3 py-2 rounded-xl border border-slate-800/80">
                    <span className="inline-flex items-center gap-1 text-amber-400 font-medium">
                      <Clock size={12} /> {todoCount} a fazer
                    </span>
                    <span className="text-slate-700">•</span>
                    <span className="inline-flex items-center gap-1 text-indigo-400 font-medium">
                      <Zap size={12} /> {doingCount} em andamento
                    </span>
                    <span className="text-slate-700">•</span>
                    <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                      <CheckCircle2 size={12} /> {doneCount} resolvidos
                    </span>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-4 border-t border-slate-800/80 flex items-center gap-2">
                  <Link
                    to={`/?feature=${feat.id}`}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors"
                  >
                    <LayoutDashboard size={14} />
                    Ver no Kanban
                  </Link>
                  <Link
                    to={`/docs/${feat.id}`}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 text-xs font-medium transition-colors"
                  >
                    <BookOpen size={14} />
                    Documentação
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Criar / Editar Feature */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-[#0f172a] border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl p-6 relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white">
                {editingFeature ? 'Editar Feature' : 'Nova Feature'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Nome da Feature *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Remédios, Vacinas, Autenticação, Perfil..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Descrição Curta (Opcional)
                </label>
                <textarea
                  rows={2}
                  placeholder="O que esse módulo abrange no seu sistema..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Cor de Identificação
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setSelectedColor(c)}
                      className="w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-110 relative"
                      style={{ backgroundColor: c }}
                    >
                      {selectedColor === c && <Check size={16} className="text-white drop-shadow" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-colors"
                >
                  Salvar Feature
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
