import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Trash2, 
  Edit2, 
  X, 
  FileCode,
  Layers,
  Sparkles
} from 'lucide-react';
import type { Feature, Category, PlannerItem, ItemStatus, PriorityLevel } from '../../types';
import { storageAdapter } from '../../services/storageAdapter';

export const KanbanPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Dados
  const [features, setFeatures] = useState<Feature[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<PlannerItem[]>([]);

  // Filtros ativos
  const selectedFeatureId = searchParams.get('feature') || 'all';
  const selectedCategoryId = searchParams.get('category') || 'all';
  const [searchQuery, setSearchQuery] = useState('');

  // Modais
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PlannerItem | null>(null);

  // Form states do item
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [featureId, setFeatureId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [status, setStatus] = useState<ItemStatus>('todo');
  const [priority, setPriority] = useState<PriorityLevel>('medium');
  const [filesInput, setFilesInput] = useState('');

  const loadData = () => {
    const loadedFeatures = storageAdapter.getFeatures();
    const loadedCategories = storageAdapter.getCategories();
    const loadedItems = storageAdapter.getItems();

    setFeatures(loadedFeatures);
    setCategories(loadedCategories);
    setItems(loadedItems);

    if (loadedFeatures.length > 0 && !featureId) {
      setFeatureId(loadedFeatures[0].id);
    }
    if (loadedCategories.length > 0 && !categoryId) {
      setCategoryId(loadedCategories[0].id);
    }
  };

  useEffect(() => {
    loadData();
    const handleProjectChange = () => {
      loadData();
      const params = new URLSearchParams(searchParams);
      params.delete('feature');
      setSearchParams(params);
    };
    window.addEventListener('dev_planner_project_changed', handleProjectChange);
    return () => window.removeEventListener('dev_planner_project_changed', handleProjectChange);
  }, []);

  // Manipular query parameters na URL para filtros
  const handleFeatureFilterChange = (fId: string) => {
    const params = new URLSearchParams(searchParams);
    if (fId === 'all') {
      params.delete('feature');
    } else {
      params.set('feature', fId);
    }
    setSearchParams(params);
  };

  const handleCategoryFilterChange = (cId: string) => {
    const params = new URLSearchParams(searchParams);
    if (cId === 'all') {
      params.delete('category');
    } else {
      params.set('category', cId);
    }
    setSearchParams(params);
  };

  // Abrir modal de criação
  const handleOpenCreateModal = (initialStatus: ItemStatus = 'todo') => {
    setEditingItem(null);
    setTitle('');
    setDescription('');
    setStatus(initialStatus);
    setPriority('medium');
    setFilesInput('');
    if (selectedFeatureId !== 'all') {
      setFeatureId(selectedFeatureId);
    } else if (features.length > 0) {
      setFeatureId(features[0].id);
    }
    if (selectedCategoryId !== 'all') {
      setCategoryId(selectedCategoryId);
    } else if (categories.length > 0) {
      setCategoryId(categories[0].id);
    }
    setIsItemModalOpen(true);
  };

  // Abrir modal de edição
  const handleOpenEditModal = (item: PlannerItem) => {
    setEditingItem(item);
    setTitle(item.title);
    setDescription(item.description || '');
    setFeatureId(item.featureId);
    setCategoryId(item.categoryId);
    setStatus(item.status);
    setPriority(item.priority);
    setFilesInput(item.filesInvolved.join(', '));
    setIsItemModalOpen(true);
  };

  // Salvar Item
  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !featureId || !categoryId) return;

    const filesArray = filesInput
      .split(',')
      .map(f => f.trim())
      .filter(Boolean);

    const itemToSave: PlannerItem = {
      id: editingItem ? editingItem.id : `item-${Date.now()}`,
      projectId: editingItem ? editingItem.projectId : storageAdapter.getActiveProjectId(),
      title: title.trim(),
      description: description.trim(),
      featureId,
      categoryId,
      status,
      priority,
      filesInvolved: filesArray,
      createdAt: editingItem ? editingItem.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    storageAdapter.saveItem(itemToSave);
    setIsItemModalOpen(false);
    loadData();
  };

  // Mudar status do item rápido
  const handleMoveStatus = (id: string, newStatus: ItemStatus) => {
    storageAdapter.updateItemStatus(id, newStatus);
    loadData();
  };

  // Deletar item
  const handleDeleteItem = (id: string) => {
    if (confirm('Deseja excluir este item?')) {
      storageAdapter.deleteItem(id);
      loadData();
    }
  };

  // Itens filtrados
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // Filtro de feature
      if (selectedFeatureId !== 'all' && item.featureId !== selectedFeatureId) {
        return false;
      }
      // Filtro de categoria
      if (selectedCategoryId !== 'all' && item.categoryId !== selectedCategoryId) {
        return false;
      }
      // Filtro de busca de texto
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(query);
        const matchesDesc = (item.description || '').toLowerCase().includes(query);
        const matchesFile = item.filesInvolved.some(f => f.toLowerCase().includes(query));
        return matchesTitle || matchesDesc || matchesFile;
      }
      return true;
    });
  }, [items, selectedFeatureId, selectedCategoryId, searchQuery]);

  const columns: { id: ItemStatus; label: string; icon: any; color: string }[] = [
    { id: 'todo', label: 'A Fazer', icon: Clock, color: 'text-amber-400' },
    { id: 'doing', label: 'Em Andamento', icon: AlertTriangle, color: 'text-indigo-400' },
    { id: 'done', label: 'Resolvido', icon: CheckCircle2, color: 'text-emerald-400' },
  ];

  return (
    <div className="p-8 max-w-[1600px] mx-auto w-full space-y-6">
      {/* Header com Ações */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Sparkles className="text-indigo-400" />
            Quadro Kanban
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Anote bugs, melhorias e tarefas navegando pelo seu código. Filtre por feature ou tag para manter o foco.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {features.length === 0 ? (
            <Link
              to="/features"
              className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all shadow-lg shadow-amber-600/20"
            >
              <Plus size={18} />
              Criar sua 1ª Feature primeiro
            </Link>
          ) : (
            <button
              onClick={() => handleOpenCreateModal('todo')}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl text-sm font-medium shadow-lg shadow-indigo-600/30 transition-all"
            >
              <Plus size={18} />
              Novo Bug / Tarefa
            </button>
          )}
        </div>
      </div>

      {/* Barra de Filtros Inteligentes (Features + Tags + Busca) */}
      <div className="bg-[#0f172a]/60 border border-slate-800/90 rounded-2xl p-4 space-y-3.5">
        {/* Filtro por Features */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1.5 shrink-0 mr-1">
            <Layers size={14} className="text-indigo-400" /> Feature:
          </span>

          <button
            onClick={() => handleFeatureFilterChange('all')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all shrink-0 ${
              selectedFeatureId === 'all'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-800/70 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            Todas ({items.length})
          </button>

          {features.map((feat) => {
            const count = items.filter(i => i.featureId === feat.id).length;
            const isSelected = selectedFeatureId === feat.id;

            return (
              <button
                key={feat.id}
                onClick={() => handleFeatureFilterChange(feat.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-all shrink-0 ${
                  isSelected
                    ? 'bg-slate-700 text-white shadow-sm ring-1 ring-white/20'
                    : 'bg-slate-800/70 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: feat.color }}
                />
                <span>{feat.name}</span>
                <span className="text-[11px] opacity-70">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Linha 2: Filtro por Categorias/Tags + Busca */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-800/60">
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
            <span className="text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1 shrink-0 mr-1">
              <Filter size={13} className="text-slate-400" /> Tag:
            </span>

            <button
              onClick={() => handleCategoryFilterChange('all')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all shrink-0 ${
                selectedCategoryId === 'all'
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              Todas
            </button>

            {categories.map((cat) => {
              const isSelected = selectedCategoryId === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryFilterChange(cat.id)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-all shrink-0 ${
                    isSelected
                      ? 'bg-slate-700 text-white ring-1 ring-white/10'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>

          {/* Busca por texto */}
          <div className="relative w-full sm:w-64">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar título, bug ou arquivo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700/60 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Grid das 3 Colunas Kanban */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map((col) => {
          const colItems = filteredItems.filter(i => i.status === col.id);
          const ColIcon = col.icon;

          return (
            <div
              key={col.id}
              className="bg-[#0b101d] border border-slate-800/90 rounded-2xl flex flex-col min-h-[500px]"
            >
              {/* Topo da Coluna */}
              <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ColIcon size={18} className={col.color} />
                  <h3 className="font-semibold text-sm text-slate-200">{col.label}</h3>
                  <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[11px] font-bold text-slate-400">
                    {colItems.length}
                  </span>
                </div>

                <button
                  onClick={() => handleOpenCreateModal(col.id)}
                  title={`Adicionar item em ${col.label}`}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>

              {/* Lista de Cards da Coluna */}
              <div className="p-3 space-y-3 flex-1 overflow-y-auto max-h-[calc(100vh-280px)]">
                {colItems.length === 0 ? (
                  <div className="text-center py-12 px-2 border border-dashed border-slate-800/60 rounded-xl">
                    <p className="text-xs text-slate-500">Nenhum item nesta coluna</p>
                  </div>
                ) : (
                  colItems.map((item) => {
                    const feat = features.find(f => f.id === item.featureId);
                    const cat = categories.find(c => c.id === item.categoryId);

                    return (
                      <div
                        key={item.id}
                        className="bg-[#0f172a] border border-slate-800/90 hover:border-slate-700 rounded-xl p-4 transition-all shadow-sm group hover:shadow-md space-y-3"
                      >
                        {/* Header do Card: Feature Tag + Categoria Tag */}
                        <div className="flex items-center justify-between gap-2 text-xs">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {feat && (
                              <span
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-medium text-[11px] text-white shadow-xs"
                                style={{ backgroundColor: `${feat.color}25`, border: `1px solid ${feat.color}50` }}
                              >
                                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: feat.color }} />
                                {feat.name}
                              </span>
                            )}

                            {cat && (
                              <span
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-medium text-[11px]"
                                style={{
                                  backgroundColor: `${cat.color}20`,
                                  color: cat.color,
                                  border: `1px solid ${cat.color}40`,
                                }}
                              >
                                {cat.name}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleOpenEditModal(item)}
                              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
                              title="Editar item"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
                              title="Excluir item"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>

                        {/* Título & Descrição */}
                        <div>
                          <h4 className="font-semibold text-sm text-white leading-snug">
                            {item.title}
                          </h4>
                          {item.description && (
                            <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                              {item.description}
                            </p>
                          )}
                        </div>

                        {/* Arquivos do Código Envolvidos */}
                        {item.filesInvolved.length > 0 && (
                          <div className="flex items-center gap-1.5 flex-wrap pt-1">
                            {item.filesInvolved.map((file, idx) => (
                              <span
                                key={idx}
                                title={file}
                                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono text-indigo-300 max-w-[200px] truncate"
                              >
                                <FileCode size={11} className="shrink-0 text-slate-500" />
                                {file.split('/').pop()}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Ações de Mover de Coluna */}
                        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                          {item.status !== 'todo' ? (
                            <button
                              onClick={() => handleMoveStatus(item.id, item.status === 'done' ? 'doing' : 'todo')}
                              className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 transition-colors"
                            >
                              <ArrowLeft size={12} />
                              <span>{item.status === 'done' ? 'Voltar p/ Andamento' : 'A Fazer'}</span>
                            </button>
                          ) : (
                            <div />
                          )}

                          {item.status !== 'done' && (
                            <button
                              onClick={() => handleMoveStatus(item.id, item.status === 'todo' ? 'doing' : 'done')}
                              className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-400 hover:text-indigo-300 transition-colors ml-auto"
                            >
                              <span>{item.status === 'todo' ? 'Mover p/ Andamento' : 'Resolver'}</span>
                              <ArrowRight size={12} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de Criação / Edição de Item */}
      {isItemModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-[#0f172a] border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl p-6 relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white">
                {editingItem ? 'Editar Item' : 'Novo Item (Bug, Melhoria, Ideia)'}
              </h3>
              <button
                onClick={() => setIsItemModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Título do Item / Bug *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Botão de salvar não persiste no localStorage ao dar F5..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Feature Pertencente *
                  </label>
                  <select
                    value={featureId}
                    onChange={(e) => setFeatureId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
                  >
                    {features.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Tag / Categoria *
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Coluna / Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ItemStatus)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
                  >
                    <option value="todo">A Fazer</option>
                    <option value="doing">Em Andamento</option>
                    <option value="done">Resolvido</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Prioridade
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
                  >
                    <option value="low">Baixa</option>
                    <option value="medium">Média</option>
                    <option value="high">Alta</option>
                    <option value="urgent">Urgente</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Descrição / O que aconteceu (Opcional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Explique o que causou o bug, comportamento inesperado ou como reproduzir..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Arquivos do Código Envolvidos (separados por vírgula)
                </label>
                <input
                  type="text"
                  placeholder="Ex: src/components/layout/BottomNav.tsx, src/services/storageService.ts"
                  value={filesInput}
                  onChange={(e) => setFilesInput(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsItemModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-colors"
                >
                  Salvar Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
