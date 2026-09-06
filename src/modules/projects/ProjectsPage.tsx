import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FolderKanban, 
  Plus, 
  Trash2, 
  Edit2, 
  ArrowRight, 
  Check, 
  X, 
  Bug, 
  Sparkles, 
  Layers
} from 'lucide-react';
import type { Project } from '../../types';
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

export const ProjectsPage: React.FC = () => {
  const navigate = useNavigate();

  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]);

  const loadData = () => {
    setProjects(storageAdapter.getProjects());
    setActiveProjectId(storageAdapter.getActiveProjectId());
  };

  useEffect(() => {
    loadData();
    const handleProjectChange = () => loadData();
    window.addEventListener('dev_planner_project_changed', handleProjectChange);
    return () => window.removeEventListener('dev_planner_project_changed', handleProjectChange);
  }, []);

  const handleOpenCreateModal = () => {
    setEditingProject(null);
    setName('');
    setDescription('');
    setColor(PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)]);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (proj: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingProject(proj);
    setName(proj.name);
    setDescription(proj.description || '');
    setColor(proj.color);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const projToSave: Project = {
      id: editingProject ? editingProject.id : `proj-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      color,
      createdAt: editingProject ? editingProject.createdAt : new Date().toISOString(),
    };

    storageAdapter.saveProject(projToSave);
    if (!editingProject) {
      storageAdapter.setActiveProjectId(projToSave.id);
    }
    setIsModalOpen(false);
    loadData();
  };

  const handleDelete = (id: string, projectName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (projects.length <= 1) {
      alert('Você precisa ter pelo menos um projeto ativo.');
      return;
    }
    if (confirm(`Tem certeza que deseja apagar o projeto "${projectName}"? Todas as features, bugs e documentações dele serão removidas.`)) {
      storageAdapter.deleteProject(id);
      loadData();
    }
  };

  const handleSelectProject = (id: string) => {
    storageAdapter.setActiveProjectId(id);
    navigate('/');
  };

  const allItems = storageAdapter.getRawItems();
  const allFeatures = storageAdapter.getRawFeatures();
  const categories = storageAdapter.getCategories();

  return (
    <div className="p-8 max-w-7xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <FolderKanban className="text-indigo-400" />
            Meus Projetos & Workspaces
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Isole cada software em seu próprio espaço de trabalho. Troque entre eles sem misturar bugs, features ou documentação.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl font-medium shadow-lg shadow-indigo-600/30 transition-all text-sm shrink-0"
        >
          <Plus size={18} />
          Novo Projeto
        </button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {projects.map((proj) => {
          const isActive = proj.id === activeProjectId;
          const projItems = allItems.filter(i => i.projectId === proj.id);
          const projFeatures = allFeatures.filter(f => f.projectId === proj.id);

          const bugsCount = projItems.filter(i => {
            const cat = categories.find(c => c.id === i.categoryId);
            return cat?.name.toLowerCase().includes('bug') && i.status !== 'done';
          }).length;

          const improvementsCount = projItems.filter(i => {
            const cat = categories.find(c => c.id === i.categoryId);
            return cat?.name.toLowerCase().includes('melhoria') && i.status !== 'done';
          }).length;

          const doneCount = projItems.filter(i => i.status === 'done').length;
          const totalCount = projItems.length;
          const progressPercent = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

          return (
            <div
              key={proj.id}
              onClick={() => handleSelectProject(proj.id)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group shadow-sm hover:shadow-md ${
                isActive
                  ? 'bg-slate-900/90 border-indigo-500/80 ring-1 ring-indigo-500/30'
                  : 'bg-[#0f172a]/70 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                {/* Top: Status Ativo & Ações */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full shrink-0 shadow-sm"
                      style={{ backgroundColor: proj.color }}
                    />
                    <div>
                      <h3 className="font-semibold text-base text-white group-hover:text-indigo-300 transition-colors flex items-center gap-2">
                        {proj.name}
                        {isActive && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-medium border border-indigo-500/30">
                            Ativo
                          </span>
                        )}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => handleOpenEditModal(proj, e)}
                      title="Editar projeto"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                    >
                      <Edit2 size={14} />
                    </button>
                    {projects.length > 1 && (
                      <button
                        onClick={(e) => handleDelete(proj.id, proj.name, e)}
                        title="Excluir projeto"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-400 min-h-[32px] line-clamp-2 mb-4 leading-relaxed">
                  {proj.description || 'Sem descrição cadastrada.'}
                </p>

                {/* Métricas do Projeto */}
                <div className="space-y-3 pt-1">
                  <div className="flex items-center gap-2 text-xs flex-wrap">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800/80 text-slate-300 text-[11px]">
                      <Layers size={12} className="text-indigo-400" /> {projFeatures.length} features
                    </span>

                    {bugsCount > 0 && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[11px] font-medium">
                        <Bug size={12} /> {bugsCount} {bugsCount === 1 ? 'bug' : 'bugs'}
                      </span>
                    )}

                    {improvementsCount > 0 && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[11px] font-medium">
                        <Sparkles size={12} /> {improvementsCount} {improvementsCount === 1 ? 'melhoria' : 'melhorias'}
                      </span>
                    )}
                  </div>

                  {/* Barra de Progresso */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Progresso ({doneCount}/{totalCount})</span>
                      <span className="font-semibold text-slate-300">{progressPercent}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${progressPercent}%`,
                          backgroundColor: proj.color,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Botão de Abrir */}
              <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[11px]">
                  {isActive ? 'Workspace atual' : 'Clique para alternar'}
                </span>
                <span className="inline-flex items-center gap-1 text-indigo-400 font-medium group-hover:translate-x-1 transition-transform">
                  Abrir Projeto <ArrowRight size={13} />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Criar / Editar Projeto */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-[#0f172a] border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl p-6 relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white">
                {editingProject ? 'Editar Projeto' : 'Novo Projeto (Workspace)'}
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
                  Nome do Projeto *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Dog Health Tracker, E-commerce, App Finanças..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Descrição Curta (Opcional)
                </label>
                <textarea
                  rows={2}
                  placeholder="O que este projeto faz ou qual é o seu objetivo..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 resize-none"
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
                      onClick={() => setColor(c)}
                      className="w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-110 relative"
                      style={{ backgroundColor: c }}
                    >
                      {color === c && <Check size={16} className="text-white drop-shadow" />}
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
                  Salvar Projeto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
