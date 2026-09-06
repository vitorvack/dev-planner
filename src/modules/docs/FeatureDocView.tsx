import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  X, 
  FileCode, 
  CheckCircle2, 
  LayoutDashboard,
  Bug
} from 'lucide-react';
import type { Feature, FeatureDoc, PlannerItem } from '../../types';
import { storageAdapter } from '../../services/storageAdapter';

export const FeatureDocView: React.FC = () => {
  const { featureId } = useParams<{ featureId: string }>();
  const navigate = useNavigate();

  const [feature, setFeature] = useState<Feature | null>(null);
  const [doc, setDoc] = useState<FeatureDoc | null>(null);
  const [linkedItems, setLinkedItems] = useState<PlannerItem[]>([]);

  // Form states
  const [overview, setOverview] = useState('');
  const [currentBehavior, setCurrentBehavior] = useState('');
  const [expectedBehavior, setExpectedBehavior] = useState('');
  const [technicalNotes, setTechnicalNotes] = useState('');
  const [filesInvolved, setFilesInvolved] = useState<string[]>([]);
  const [newFileTag, setNewFileTag] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (!featureId) return;

    const feats = storageAdapter.getFeatures();
    const currentFeat = feats.find(f => f.id === featureId);
    if (!currentFeat) {
      navigate('/docs');
      return;
    }
    setFeature(currentFeat);

    // Carrega doc existente ou prepara novo
    const existingDoc = storageAdapter.getDocByFeatureId(featureId);
    if (existingDoc) {
      setDoc(existingDoc);
      setOverview(existingDoc.overview || '');
      setCurrentBehavior(existingDoc.currentBehavior || '');
      setExpectedBehavior(existingDoc.expectedBehavior || '');
      setTechnicalNotes(existingDoc.technicalNotes || '');
      setFilesInvolved(existingDoc.filesInvolved || []);
    }

    // Carrega itens vinculados a essa feature
    const items = storageAdapter.getItems().filter(i => i.featureId === featureId);
    setLinkedItems(items);
  }, [featureId, navigate]);

  const handleAddFile = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    if (!newFileTag.trim()) return;
    if (!filesInvolved.includes(newFileTag.trim())) {
      setFilesInvolved([...filesInvolved, newFileTag.trim()]);
    }
    setNewFileTag('');
  };

  const handleRemoveFile = (fileName: string) => {
    setFilesInvolved(filesInvolved.filter(f => f !== fileName));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!featureId) return;

    const docToSave: FeatureDoc = {
      id: doc ? doc.id : `doc-${featureId}`,
      projectId: feature?.projectId || storageAdapter.getActiveProjectId(),
      featureId,
      overview,
      currentBehavior,
      expectedBehavior,
      technicalNotes,
      filesInvolved,
      updatedAt: new Date().toISOString(),
    };

    storageAdapter.saveDoc(docToSave);
    setDoc(docToSave);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  if (!feature) {
    return null;
  }

  const openBugs = linkedItems.filter(i => {
    const cat = storageAdapter.getCategories().find(c => c.id === i.categoryId);
    return cat?.name.toLowerCase().includes('bug') && i.status !== 'done';
  });

  return (
    <div className="p-8 max-w-5xl mx-auto w-full space-y-6">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div className="flex items-center gap-3">
          <Link
            to="/docs"
            className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-700/80 text-slate-300 transition-colors"
            title="Voltar para a lista"
          >
            <ArrowLeft size={18} />
          </Link>
          <div className="flex items-center gap-2.5">
            <span
              className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
              style={{ backgroundColor: feature.color }}
            />
            <h2 className="text-2xl font-bold tracking-tight text-white">
              {feature.name}
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
              /docs/{feature.id}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to={`/?feature=${feature.id}`}
            className="inline-flex items-center gap-1.5 py-2 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors"
          >
            <LayoutDashboard size={14} />
            Ver no Kanban
          </Link>

          <button
            onClick={handleSave}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-medium shadow-lg shadow-indigo-600/30 transition-all"
          >
            <Save size={15} />
            Salvar Alterações
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 size={18} className="text-emerald-400" />
          Documentação salva com sucesso!
        </div>
      )}

      {/* Form Grid */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* 1. Visão Geral */}
        <div className="p-6 rounded-2xl bg-[#0f172a]/70 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-white flex items-center gap-2">
              <span className="text-indigo-400 font-mono">01.</span> O que essa feature faz? (Visão Geral)
            </label>
          </div>
          <p className="text-xs text-slate-400">
            Resuma o objetivo desse módulo em poucas frases para você nunca esquecer o propósito dele.
          </p>
          <textarea
            rows={3}
            placeholder="Ex: Este módulo permite ao usuário registrar quando ministrou medicamentos para o pet, com horário, dose e observações..."
            value={overview}
            onChange={(e) => setOverview(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors resize-y leading-relaxed"
          />
        </div>

        {/* 2. Como Funciona Atualmente vs Comportamento Esperado */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="p-6 rounded-2xl bg-[#0f172a]/70 border border-slate-800 space-y-3">
            <label className="text-sm font-semibold text-rose-300 flex items-center gap-2">
              <span className="text-rose-400 font-mono">02.</span> Como está no código hoje? (Atual)
            </label>
            <p className="text-xs text-slate-400">
              Anote o estado atual e o que está quebrado ou incompleto.
            </p>
            <textarea
              rows={5}
              placeholder="Ex: No momento o botão 'Salvar' não valida campos vazios e ao recarregar a tela o horário volta para 00:00..."
              value={currentBehavior}
              onChange={(e) => setCurrentBehavior(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-rose-500 transition-colors resize-y leading-relaxed"
            />
          </div>

          <div className="p-6 rounded-2xl bg-[#0f172a]/70 border border-slate-800 space-y-3">
            <label className="text-sm font-semibold text-emerald-300 flex items-center gap-2">
              <span className="text-emerald-400 font-mono">03.</span> O que deveria fazer? (Esperado)
            </label>
            <p className="text-xs text-slate-400">
              Como deve se comportar quando estiver 100% pronto e sem bugs.
            </p>
            <textarea
              rows={5}
              placeholder="Ex: Deve exibir uma mensagem de confirmação verde, atualizar o contador no menu inferior e persistir o log com timestamp local..."
              value={expectedBehavior}
              onChange={(e) => setExpectedBehavior(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors resize-y leading-relaxed"
            />
          </div>
        </div>

        {/* 3. Arquivos do Código Envolvidos */}
        <div className="p-6 rounded-2xl bg-[#0f172a]/70 border border-slate-800 space-y-3">
          <label className="text-sm font-semibold text-white flex items-center gap-2">
            <span className="text-indigo-400 font-mono">04.</span> Arquivos do Código Envolvidos
          </label>
          <p className="text-xs text-slate-400">
            Adicione os caminhos dos arquivos do seu projeto onde essa feature mora (ex: <code className="text-indigo-300 font-mono">src/components/layout/BottomNav.tsx</code>).
          </p>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Ex: src/components/medications/MedicationsView.tsx"
              value={newFileTag}
              onChange={(e) => setNewFileTag(e.target.value)}
              onKeyDown={handleAddFile}
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm font-mono focus:outline-none focus:border-indigo-500"
            />
            <button
              type="button"
              onClick={handleAddFile}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors inline-flex items-center gap-1.5 shrink-0"
            >
              <Plus size={16} /> Adicionar Arquivo
            </button>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {filesInvolved.map((file) => (
              <span
                key={file}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/90 border border-slate-700 text-xs font-mono text-indigo-300"
              >
                <FileCode size={13} className="text-slate-400" />
                {file}
                <button
                  type="button"
                  onClick={() => handleRemoveFile(file)}
                  className="hover:text-rose-400 transition-colors ml-1"
                >
                  <X size={13} />
                </button>
              </span>
            ))}
            {filesInvolved.length === 0 && (
              <p className="text-xs text-slate-400 italic">Nenhum arquivo adicionado ainda.</p>
            )}
          </div>
        </div>

        {/* 4. Notas Técnicas / Anotações Livres */}
        <div className="p-6 rounded-2xl bg-[#0f172a]/70 border border-slate-800 space-y-3">
          <label className="text-sm font-semibold text-white flex items-center gap-2">
            <span className="text-indigo-400 font-mono">05.</span> Notas Técnicas & Detalhes Extras
          </label>
          <p className="text-xs text-slate-400">
            Estrutura de dados, funções auxiliares, pegadinhas encontradas ou dicas do seu amigo vibe coder.
          </p>
          <textarea
            rows={4}
            placeholder="Ex: Cuidado com a função getTodayString() porque o timezone pode causar diferença de 1 dia após as 21h..."
            value={technicalNotes}
            onChange={(e) => setTechnicalNotes(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors resize-y leading-relaxed font-mono"
          />
        </div>

        {/* 5. Bugs e Tarefas em Aberto vinculados */}
        {openBugs.length > 0 && (
          <div className="p-6 rounded-2xl bg-rose-500/5 border border-rose-500/20 space-y-3">
            <div className="flex items-center gap-2 text-rose-400 font-semibold text-sm">
              <Bug size={16} />
              Bugs abertos cadastrados para esta feature ({openBugs.length})
            </div>
            <div className="space-y-2">
              {openBugs.map(bug => (
                <div key={bug.id} className="p-3 rounded-xl bg-slate-900/80 border border-rose-500/10 flex items-center justify-between text-xs">
                  <span className="text-slate-200 font-medium">{bug.title}</span>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 uppercase font-semibold">
                    {bug.status === 'todo' ? 'A Fazer' : 'Em Andamento'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl text-sm font-medium shadow-lg shadow-indigo-600/30 transition-all"
          >
            <Save size={16} />
            Salvar Documentação
          </button>
        </div>
      </form>
    </div>
  );
};
