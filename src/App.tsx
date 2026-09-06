import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { KanbanPage } from './modules/kanban/KanbanPage';
import { FeaturesPage } from './modules/features/FeaturesPage';
import { ProjectsPage } from './modules/projects/ProjectsPage';
import { CategoriesPage } from './modules/categories/CategoriesPage';
import { DocsListPage } from './modules/docs/DocsListPage';
import { FeatureDocView } from './modules/docs/FeatureDocView';

export const App: React.FC = () => {
  return (
    <Routes>
      <Route element={<AppLayout />}>
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
