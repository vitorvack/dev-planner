export type ItemStatus = 'todo' | 'doing' | 'done';
export type PriorityLevel = 'low' | 'medium' | 'high' | 'urgent';

export interface Project {
  id: string;
  name: string;
  description?: string;
  color: string; // Ex: '#6366f1'
  createdAt: string;
}

export interface Feature {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  color: string; // Ex: '#8b5cf6', '#3b82f6', '#10b981'
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  description?: string;
  isSystem?: boolean;
}

export interface PlannerItem {
  id: string;
  projectId: string;
  featureId: string;
  categoryId: string;
  title: string;
  description?: string;
  status: ItemStatus;
  priority: PriorityLevel;
  filesInvolved: string[]; // Lista de arquivos relacionados (ex: src/components/BottomNav.tsx)
  createdAt: string;
  updatedAt: string;
}

export interface FeatureDoc {
  id: string;
  projectId: string;
  featureId: string;
  overview: string;          // O que a feature faz
  currentBehavior: string;   // Como funciona atualmente no código
  expectedBehavior: string;  // O que deveria fazer / Comportamento esperado
  technicalNotes?: string;   // Dicas de arquitetura, estados, etc.
  filesInvolved: string[];   // Arquivos que compõem a feature
  updatedAt: string;
}
