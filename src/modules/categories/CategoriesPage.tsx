import React, { useState, useEffect } from 'react';
import { Tag, Plus, Edit2, Trash2, X, Check } from 'lucide-react';
import type { Category } from '../../types';
import { storageAdapter } from '../../services/storageAdapter';

const PRESET_COLORS = [
  '#ef4444', // Vermelho
  '#3b82f6', // Azul
  '#10b981', // Verde
  '#f59e0b', // Âmbar
  '#8b5cf6', // Roxo
  '#ec4899', // Rosa
  '#06b6d4', // Ciano
  '#64748b', // Slate
];

export const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]);

  const loadData = () => {
    setCategories(storageAdapter.getCategories());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setColor(PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)]);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setDescription(cat.description || '');
    setColor(cat.color);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const catToSave: Category = {
      id: editingCategory ? editingCategory.id : `cat-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      color: color,
    };

    storageAdapter.saveCategory(catToSave);
    setIsModalOpen(false);
    loadData();
  };

  const handleDelete = (id: string, catName: string) => {
    if (confirm(`Tem certeza que deseja apagar a tag "${catName}"?`)) {
      storageAdapter.deleteCategory(id);
      loadData();
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto w-full space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Tag className="text-indigo-400" />
            Tags & Tipos Personalizados
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Você tem total liberdade para renomear, criar ou excluir categorias (Bug, Melhoria, Ideia, Refatoração, etc.).
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl font-medium shadow-lg shadow-indigo-600/30 transition-all text-sm shrink-0"
        >
          <Plus size={18} />
          Nova Tag
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="p-4 rounded-2xl bg-[#0f172a]/70 border border-slate-800 flex items-center justify-between gap-4 hover:border-slate-700 transition-all"
          >
            <div className="flex items-center gap-3">
              <span
                className="w-4 h-4 rounded-full shrink-0 shadow-sm"
                style={{ backgroundColor: cat.color }}
              />
              <div>
                <span className="font-semibold text-sm text-white">{cat.name}</span>
                {cat.description && (
                  <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{cat.description}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => handleOpenEdit(cat)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                title="Editar tag"
              >
                <Edit2 size={15} />
              </button>
              <button
                onClick={() => handleDelete(cat.id, cat.name)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                title="Excluir tag"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#0f172a] border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl p-6 relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white">
                {editingCategory ? 'Editar Tag' : 'Nova Tag'}
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
                  Nome da Tag *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Bug Crítico, Refatoração, Dívida Técnica..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Descrição (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Para que serve essa tag..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Cor da Tag
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
                  Salvar Tag
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
