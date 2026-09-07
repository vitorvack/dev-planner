import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HardDrive,
  Cloud,
  Zap,
  Shield,
  RefreshCw,
  Star,
  ChevronRight,
  Lock,
  Mail,
  User,
  AlertCircle,
  Loader2,
  X,
} from 'lucide-react';
import { authService } from '../services/authService';

const LOCAL_CHOICE_KEY = 'dev_planner_mode_choice';

export const WelcomePage: React.FC = () => {
  const navigate = useNavigate();
  const [showAuthPanel, setShowAuthPanel] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleUseLocal = () => {
    localStorage.setItem(LOCAL_CHOICE_KEY, 'local');
    navigate('/');
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    let res;
    if (authTab === 'login') {
      res = await authService.login(email, password);
    } else {
      res = await authService.register(name, email, password);
    }

    setLoading(false);

    if (res.success) {
      localStorage.setItem(LOCAL_CHOICE_KEY, 'cloud');
      navigate('/');
    } else {
      setError(res.error || 'Algo deu errado. Tente novamente.');
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] flex flex-col items-center justify-center p-6 relative overflow-hidden">

      {/* Background decorative blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-0 w-64 h-64 bg-indigo-900/20 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-2xl">

        {/* Badge VIP */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 text-sm font-medium backdrop-blur-sm">
            <Star size={14} className="fill-indigo-400 text-indigo-400" />
            <span>Acesso Exclusivo</span>
            <Star size={14} className="fill-indigo-400 text-indigo-400" />
          </div>
        </div>

        {/* Logo / App Name */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-600/30 mb-5">
            <Zap size={30} className="text-white" />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-2">
            Dev Planner
          </h1>
          <p className="text-slate-500 text-sm font-mono">by Thor</p>
        </div>

        {/* Mensagem especial */}
        <div className="mb-10 p-5 rounded-2xl bg-gradient-to-br from-indigo-600/15 to-violet-600/10 border border-indigo-500/20 backdrop-blur-sm text-center">
          <p className="text-slate-300 text-base leading-relaxed">
            Você está utilizando um projeto desenvolvido pelo{' '}
            <span className="text-indigo-400 font-bold">Thor</span>. Se você chegou até aqui é porque está numa{' '}
            <span className="text-violet-400 font-bold">lista top</span>. 🤙
          </p>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex-1 h-px bg-slate-800" />
          <span className="text-slate-500 text-xs font-semibold uppercase tracking-widest">
            Escolha como utilizar
          </span>
          <div className="flex-1 h-px bg-slate-800" />
        </div>

        {!showAuthPanel ? (
          /* === CARDS DE ESCOLHA === */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Opção Local */}
            <button
              id="btn-use-local"
              onClick={handleUseLocal}
              className="group relative flex flex-col items-start p-6 rounded-2xl bg-[#0d1322] border border-slate-800 hover:border-slate-600 hover:bg-[#111827] transition-all duration-200 text-left cursor-pointer"
            >
              <div className="flex items-center justify-between w-full mb-4">
                <div className="w-11 h-11 rounded-xl bg-slate-800 flex items-center justify-center group-hover:bg-slate-700 transition-colors">
                  <HardDrive size={22} className="text-slate-400 group-hover:text-slate-200 transition-colors" />
                </div>
                <ChevronRight size={16} className="text-slate-600 group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all" />
              </div>
              <h2 className="text-white font-bold text-lg mb-1.5">
                Usar Localmente
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                Tudo salvo no seu navegador. Sem login, sem nuvem. Começa a usar agora.
              </p>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  Sem cadastro necessário
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  Dados ficam no browser
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                  Não sincroniza entre dispositivos
                </div>
              </div>
            </button>

            {/* Opção Cloud */}
            <button
              id="btn-use-cloud"
              onClick={() => setShowAuthPanel(true)}
              className="group relative flex flex-col items-start p-6 rounded-2xl bg-gradient-to-br from-indigo-600/10 to-violet-600/10 border border-indigo-500/30 hover:border-indigo-400/50 hover:from-indigo-600/15 hover:to-violet-600/15 transition-all duration-200 text-left cursor-pointer"
            >
              {/* Glow effect */}
              <div className="absolute inset-0 rounded-2xl bg-indigo-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="flex items-center justify-between w-full mb-4 relative">
                <div className="w-11 h-11 rounded-xl bg-indigo-600/20 flex items-center justify-center group-hover:bg-indigo-600/30 transition-colors">
                  <Cloud size={22} className="text-indigo-400 group-hover:text-indigo-300 transition-colors" />
                </div>
                <ChevronRight size={16} className="text-indigo-600 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
              </div>
              <h2 className="text-white font-bold text-lg mb-1.5 relative">
                Entrar com Conta
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed mb-4 relative">
                Crie sua conta e sincronize tudo na nuvem. Acesse de qualquer dispositivo.
              </p>
              <div className="space-y-1.5 relative">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                  <Shield size={11} className="text-indigo-400" />
                  Login com email e senha
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                  <RefreshCw size={11} className="text-indigo-400" />
                  Sincronização automática
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                  <Cloud size={11} className="text-indigo-400" />
                  Acesse de qualquer lugar
                </div>
              </div>
            </button>
          </div>

        ) : (
          /* === PAINEL DE AUTH === */
          <div className="bg-[#0d1322] border border-slate-800 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-600/20 flex items-center justify-center">
                  <Cloud size={18} className="text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-base">
                    {authTab === 'login' ? 'Acessar Conta' : 'Criar Nova Conta'}
                  </h3>
                  <p className="text-slate-500 text-xs">Sincronize com a nuvem</p>
                </div>
              </div>
              <button
                id="btn-back-welcome"
                onClick={() => { setShowAuthPanel(false); setError(null); }}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 p-1 bg-slate-900/80 rounded-xl border border-slate-800 mb-5">
              <button
                type="button"
                id="tab-login"
                onClick={() => { setAuthTab('login'); setError(null); }}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-colors ${
                  authTab === 'login'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Entrar
              </button>
              <button
                type="button"
                id="tab-register"
                onClick={() => { setAuthTab('register'); setError(null); }}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-colors ${
                  authTab === 'register'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Cadastrar
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle size={14} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-3.5">
              {authTab === 'register' && (
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    Nome
                  </label>
                  <div className="relative">
                    <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                    <input
                      id="input-name"
                      type="text"
                      placeholder="Seu nome ou apelido"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  E-mail
                </label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                  <input
                    id="input-email"
                    type="email"
                    required
                    placeholder="seuemail@exemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  Senha
                </label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                  <input
                    id="input-password"
                    type="password"
                    required
                    placeholder="Mínimo 6 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <div className="pt-1">
                <button
                  id="btn-auth-submit"
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white py-3 rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/25 transition-all"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Autenticando...</span>
                    </>
                  ) : (
                    <span>{authTab === 'login' ? 'Entrar na Conta' : 'Criar Conta'}</span>
                  )}
                </button>
              </div>
            </form>

            <button
              type="button"
              onClick={handleUseLocal}
              className="w-full mt-3 py-2 text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              Prefiro usar sem conta →
            </button>
          </div>
        )}

        <p className="text-center text-slate-600 text-xs mt-8">
          Dev Planner · Feito com ♥ pelo Thor
        </p>
      </div>
    </div>
  );
};
