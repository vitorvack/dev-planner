import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, ChevronRight, Layers, CheckCircle2, Clock } from 'lucide-react';
import type { Feature, FeatureDoc } from '../../types';
import { storageAdapter } from '../../services/storageAdapter';

export const DocsListPage: React.FC = () => {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [docs, setDocs] = useState<FeatureDoc[]>([]);

  const loadData = () => {
    setFeatures(storageAdapter.getFeatures());
    setDocs(storageAdapter.getAllDocs());
  };

  useEffect(() => {
    loadData();
    const handleProjectChange = () => loadData();
    window.addEventListener('dev_planner_project_changed', handleProjectChange);
    return () => window.removeEventListener('dev_planner_project_changed', handleProjectChange);
  }, []);

  return (
    <div className="p-8 max-w-5xl mx-auto w-full space-y-6">
      <div className="border-b border-slate-800/80 pb-6">
        <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
          <FileText className="text-indigo-400" />
          Documentação de Features
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Documente detalhadamente como cada módulo funciona, o comportamento esperado e os arquivos envolvidos no código.
        </p>
      </div>

      {features.length === 0 ? (
        <div className="text-center py-16 px-4 bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl">
          <Layers size={28} className="text-indigo-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-200">Nenhuma feature cadastrada</h3>
          <p className="text-sm text-slate-400 mt-1 mb-5">
            Cadastre features primeiro para criar a documentação de cada uma.
          </p>
          <Link
            to="/features"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
          >
            Ir para Features
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {features.map((feat) => {
            const doc = docs.find(d => d.featureId === feat.id);
            const hasContent = doc && (doc.overview || doc.currentBehavior || doc.expectedBehavior);

            return (
              <Link
                key={feat.id}
                to={`/docs/${feat.id}`}
                className="p-5 rounded-2xl bg-[#0f172a]/70 border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between group block"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                    style={{ backgroundColor: feat.color }}
                  />
                  <div>
                    <h3 className="font-semibold text-base text-white group-hover:text-indigo-300 transition-colors flex items-center gap-2">
                      {feat.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                      {feat.description || 'Clique para visualizar ou preencher a documentação técnica.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {hasContent ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
                      <CheckCircle2 size={13} />
                      Documentada
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium">
                      <Clock size={13} />
                      Pendente
                    </span>
                  )}

                  <ChevronRight size={18} className="text-slate-500 group-hover:text-slate-300 group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};
