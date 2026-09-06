import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Layers, 
  FileText, 
  Tag, 
  FolderKanban,
  Download, 
  Upload,
  CheckCircle2, 
  Bug, 
  Sparkles, 
  Lightbulb,
  ChevronDown,
  Plus,
  Check,
  X,
  Sun,
  Moon,
  Cloud,
  LogOut,
  RefreshCw
} from 'lucide-react';
import type { Project } from '../../types';
import { storageAdapter } from '../../services/storageAdapter';
import { authService, type UserSession } from '../../services/authService';
import { AuthModal } from '../auth/AuthModal';

const PRESET_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', 
  '#ef4444', '#f97316', '#eab308', '#10b981', '#06b6d4', '#3b82f6'
];

interface SidebarProps {
  onDataRefresh?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onDataRefresh }) => {
  const navigate = useNavigate();

  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false);
  const [importMessage, setImportMessage] = useState<string | null>(null);

  // New project modal states
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [newProjectColor, setNewProjectColor] = useState(PRESET_COLORS[0]);

  const loadData = () => {
    const projs = storageAdapter.getProjects();
    setProjects(projs);
    setActiveProject(storageAdapter.getActiveProject());
  };

  // Theme state
  const [isDark, setIsDark] = useState(() => {
    return document.documentElement.classList.contains('dark') || localStorage.getItem('theme') !== 'light';
  });

  const toggleTheme = () => {
    const nextTheme = !isDark;
    setIsDark(nextTheme);
    if (nextTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  // Auth & Cloud states
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserSession | null>(() => authService.getUser());
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  const handleSync = async () => {
    setIsSyncing(true);
    const ok = await authService.syncToCloud();
    setIsSyncing(false);
    if (ok) {
      setSyncStatus('Nuvem atualizada!');
      setTimeout(() => setSyncStatus(null), 3000);
    } else {
      setSyncStatus('Modo local (MongoDB não conectado)');
      setTimeout(() => setSyncStatus(null), 3000);
    }
  };

  useEffect(() => {
    loadData();
    const handleProjectChanged = () => loadData();
    const handleAuthChanged = () => setCurrentUser(authService.getUser());

    window.addEventListener('dev_planner_project_changed', handleProjectChanged);
    window.addEventListener('dev_planner_auth_changed', handleAuthChanged);

    return () => {
      window.removeEventListener('dev_planner_project_changed', handleProjectChanged);
      window.removeEventListener('dev_planner_auth_changed', handleAuthChanged);
    };
  }, []);

  const navItems = [
    { to: '/', label: 'Quadro Kanban', icon: LayoutDashboard },
    { to: '/features', label: 'Minhas Features', icon: Layers },
    { to: '/docs', label: 'Documentação', icon: FileText },
    { to: '/projects', label: 'Meus Projetos', icon: FolderKanban },
    { to: '/categories', label: 'Tags & Tipos', icon: Tag },
  ];

  const handleSwitchProject = (projectId: string) => {
    storageAdapter.setActiveProjectId(projectId);
    setIsProjectDropdownOpen(false);
    navigate('/');
    if (onDataRefresh) onDataRefresh();
  };

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    const newProj: Project = {
      id: `proj-${Date.now()}`,
      name: newProjectName.trim(),
      description: newProjectDesc.trim(),
      color: newProjectColor,
      createdAt: new Date().toISOString(),
    };

    storageAdapter.saveProject(newProj);
    storageAdapter.setActiveProjectId(newProj.id);
    setIsCreateProjectModalOpen(false);
    setIsProjectDropdownOpen(false);
    setNewProjectName('');
    setNewProjectDesc('');
    loadData();
    navigate('/');
  };

  const handleExport = () => {
    const data = storageAdapter.exportBackup();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dev-planner-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (storageAdapter.importBackup(content)) {
        setImportMessage('Backup restaurado!');
        setTimeout(() => setImportMessage(null), 3000);
        if (onDataRefresh) onDataRefresh();
        window.location.reload();
      } else {
        alert('Arquivo de backup inválido.');
      }
    };
    reader.readAsText(file);
  };

  // Itens do projeto ativo
  const items = storageAdapter.getItems();
  const categories = storageAdapter.getCategories();

  const bugsCount = items.filter(i => {
    const cat = categories.find(c => c.id === i.categoryId);
    return cat?.name.toLowerCase().includes('bug') && i.status !== 'done';
  }).length;

  const improvementsCount = items.filter(i => {
    const cat = categories.find(c => c.id === i.categoryId);
    return cat?.name.toLowerCase().includes('melhoria') && i.status !== 'done';
  }).length;

  const ideasCount = items.filter(i => {
    const cat = categories.find(c => c.id === i.categoryId);
    return cat?.name.toLowerCase().includes('ideia') && i.status !== 'done';
  }).length;

  const totalOpen = bugsCount + improvementsCount + ideasCount;

  return (
    <aside className="w-64 bg-[#0d1322] border-r border-slate-800 flex flex-col justify-between h-screen sticky top-0 z-20">
      {/* Top Header */}
      <div>
        <div className="p-4 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white font-bold shrink-0">
              <Sparkles size={18} />
            </div>
            <div>
              <h1 className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
                Dev Planner
              </h1>
              <p className="text-[11px] text-slate-400">Bugs & Specs Tracker</p>
            </div>
          </div>

          {/* Seletor de Workspace / Projeto no Topo */}
          <div className="relative mt-3">
            <button
              onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
              className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700/70 hover:border-slate-600 text-left transition-all group"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
                  style={{ backgroundColor: activeProject?.color || '#6366f1' }}
                />
                <span className="text-xs font-semibold text-white truncate">
                  {activeProject?.name || 'Selecione um Projeto'}
                </span>
              </div>
              <ChevronDown 
                size={14} 
                className={`text-slate-400 group-hover:text-slate-200 transition-transform shrink-0 ${
                  isProjectDropdownOpen ? 'rotate-180' : ''
                }`} 
              />
            </button>

            {/* Dropdown de Projetos */}
            {isProjectDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-[#0f172a] border border-slate-700 rounded-xl shadow-2xl p-1.5 z-50 animate-in fade-in space-y-1">
                <div className="px-2 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Projetos / Workspaces
                </div>

                <div className="max-h-48 overflow-y-auto space-y-0.5">
                  {projects.map((proj) => {
                    const isCurrent = proj.id === activeProject?.id;
                    return (
                      <button
                        key={proj.id}
                        onClick={() => handleSwitchProject(proj.id)}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                          isCurrent
                            ? 'bg-indigo-600/20 text-indigo-300 font-medium'
                            : 'text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: proj.color }}
                          />
                          <span className="truncate">{proj.name}</span>
                        </div>
                        {isCurrent && <Check size={13} className="text-indigo-400 shrink-0 ml-1" />}
                      </button>
                    );
                  })}
                </div>

                <div className="pt-1 border-t border-slate-800">
                  <button
                    onClick={() => {
                      setIsProjectDropdownOpen(false);
                      setIsCreateProjectModalOpen(true);
                    }}
                    className="w-full flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-indigo-400 hover:bg-indigo-600/10 font-medium transition-colors"
                  >
                    <Plus size={14} />
                    <span>Novo Projeto</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick status counter (Bugs, Melhorias, Ideias do projeto ativo) */}
        {totalOpen > 0 && (
          <div className="mx-3 mt-3 p-3 rounded-2xl bg-slate-900/90 border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
              <span>Em Aberto</span>
              <span className="text-slate-500 font-normal">{totalOpen} total</span>
            </div>

            <div className="grid grid-cols-3 gap-1.5 pt-0.5">
              <div className="flex flex-col items-center justify-center p-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
                <div className="flex items-center gap-1 text-xs font-bold">
                  <Bug size={13} />
                  <span>{bugsCount}</span>
                </div>
                <span className="text-[10px] text-rose-300/80 mt-0.5 font-medium">Bugs</span>
              </div>

              <div className="flex flex-col items-center justify-center p-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                <div className="flex items-center gap-1 text-xs font-bold">
                  <Sparkles size={13} />
                  <span>{improvementsCount}</span>
                </div>
                <span className="text-[10px] text-blue-300/80 mt-0.5 font-medium">Melhorias</span>
              </div>

              <div className="flex flex-col items-center justify-center p-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <div className="flex items-center gap-1 text-xs font-bold">
                  <Lightbulb size={13} />
                  <span>{ideasCount}</span>
                </div>
                <span className="text-[10px] text-emerald-300/80 mt-0.5 font-medium">Ideias</span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Menu */}
        <nav className="p-3 space-y-1 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`
                }
              >
                <Icon size={17} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Actions & Backup */}
      <div className="p-4 border-t border-slate-800/80 space-y-2">
        {importMessage && (
          <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-1.5">
            <CheckCircle2 size={14} />
            {importMessage}
          </div>
        )}

        {/* Cloud Login & Sync Area */}
        {currentUser ? (
          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-700/60 flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                {currentUser.name ? currentUser.name[0].toUpperCase() : 'U'}
              </div>
              <div className="truncate">
                <p className="text-[11px] font-semibold text-white truncate leading-tight">{currentUser.name}</p>
                <p className="text-[9px] text-slate-400 truncate">{currentUser.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={handleSync}
                title="Sincronizar com MongoDB"
                className="p-1 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition-colors"
              >
                <RefreshCw size={13} className={isSyncing ? 'animate-spin text-indigo-400' : ''} />
              </button>
              <button
                onClick={() => authService.logout()}
                title="Sair da conta"
                className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
              >
                <LogOut size={13} />
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 text-xs font-semibold transition-colors border border-indigo-500/20"
          >
            <Cloud size={14} />
            <span>Conectar Nuvem / Login</span>
          </button>
        )}

        {syncStatus && (
          <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[10px] text-center font-medium">
            {syncStatus}
          </div>
        )}

        {/* Alternador de Tema Claro / Escuro */}
        <button
          onClick={toggleTheme}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-xs text-slate-300 transition-colors border border-slate-700/60"
        >
          <span className="flex items-center gap-2">
            {isDark ? <Moon size={14} className="text-indigo-400" /> : <Sun size={14} className="text-amber-400" />}
            <span className="font-medium">{isDark ? 'Tema Escuro' : 'Tema Claro'}</span>
          </span>
          <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
            {isDark ? 'Dark' : 'Light'}
          </span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            title="Exportar backup completo em JSON"
            className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-xs text-slate-300 transition-colors border border-slate-700/60"
          >
            <Download size={14} />
            <span>Backup</span>
          </button>

          <label
            title="Importar backup"
            className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-xs text-slate-300 transition-colors border border-slate-700/60 cursor-pointer"
          >
            <Upload size={14} />
            <span>Restaurar</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </label>
        </div>

        <div className="pt-2 text-center text-[11px] text-slate-400">
          Dados salvos localmente & prontos p/ nuvem
        </div>
      </div>

      {/* Modal Rápido de Novo Projeto */}
      {isCreateProjectModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-[#0f172a] border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl p-6 relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white">
                Novo Projeto (Workspace)
              </h3>
              <button
                onClick={() => setIsCreateProjectModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Nome do Projeto *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: E-commerce, App Finanças, Landing Page..."
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Descrição (Opcional)
                </label>
                <textarea
                  rows={2}
                  placeholder="O que este projeto faz..."
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
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
                      onClick={() => setNewProjectColor(c)}
                      className="w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-110 relative"
                      style={{ backgroundColor: c }}
                    >
                      {newProjectColor === c && <Check size={16} className="text-white drop-shadow" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateProjectModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-colors"
                >
                  Criar Projeto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Autenticação e Sincronização */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </aside>
  );
};
