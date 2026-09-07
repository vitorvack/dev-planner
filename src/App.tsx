import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { KanbanPage } from './modules/kanban/KanbanPage';
import { FeaturesPage } from './modules/features/FeaturesPage';
import { ProjectsPage } from './modules/projects/ProjectsPage';
import { CategoriesPage } from './modules/categories/CategoriesPage';
import { DocsListPage } from './modules/docs/DocsListPage';
import { FeatureDocView } from './modules/docs/FeatureDocView';
import { WelcomePage } from './pages/WelcomePage';
import { authService } from './services/authService';

const LOCAL_CHOICE_KEY = 'dev_planner_mode_choice';

// Guard: se o usuário ainda não escolheu como usar (local ou cloud), manda para /welcome
const AppGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const modeChoice = localStorage.getItem(LOCAL_CHOICE_KEY);
  const isAuthenticated = authService.isAuthenticated();

  useEffect(() => {
    if (!modeChoice && !isAuthenticated) {
      navigate('/welcome', { replace: true });
    }
  }, [modeChoice, isAuthenticated, navigate]);

  if (!modeChoice && !isAuthenticated) {
    return null; // Evita flash de conteúdo antes do redirect
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <Routes>
      {/* Tela inicial de boas-vindas / escolha de modo */}
      <Route path="/welcome" element={<WelcomePage />} />

      {/* Rotas protegidas pelo guard */}
      <Route
        element={
          <AppGuard>
            <AppLayout />
          </AppGuard>
        }
      >
        <Route path="/" element={<KanbanPage />} />
        <Route path="/board" element={<Navigate to="/" replace />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/docs" element={<DocsListPage />} />
        <Route path="/docs/:featureId" element={<FeatureDocView />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};
