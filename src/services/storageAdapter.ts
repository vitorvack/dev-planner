import type { Project, Feature, Category, PlannerItem, FeatureDoc, ItemStatus } from '../types';

const STORAGE_KEYS = {
  PROJECTS: 'dev_planner_projects',
  ACTIVE_PROJECT_ID: 'dev_planner_active_project_id',
  FEATURES: 'dev_planner_features',
  CATEGORIES: 'dev_planner_categories',
  ITEMS: 'dev_planner_items',
  DOCS: 'dev_planner_docs',
};

const DEFAULT_PROJECT: Project = {
  id: 'proj-dog-health-tracker',
  name: 'Dog Health Tracker',
  description: 'Controle de saúde, vacinas e rotina de pets',
  color: '#8b5cf6', // Roxo elegante
  createdAt: new Date().toISOString(),
};

const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 'cat-bug',
    name: 'Bug',
    color: '#ef4444',
    description: 'Comportamento incorreto, crash ou falha visual',
    isSystem: true,
  },
  {
    id: 'cat-improvement',
    name: 'Melhoria',
    color: '#3b82f6',
    description: 'Refatoração, melhoria de UX ou otimização',
    isSystem: true,
  },
  {
    id: 'cat-idea',
    name: 'Ideia',
    color: '#10b981',
    description: 'Novas ideias e sugestões futuras',
    isSystem: true,
  },
];

export const storageAdapter = {
  // === PROJETOS / WORKSPACES ===
  getProjects(): Project[] {
    const raw = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    if (!raw) {
      const initial = [DEFAULT_PROJECT];
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(initial));
      this.setActiveProjectId(DEFAULT_PROJECT.id);
      return initial;
    }
    try {
      const list: Project[] = JSON.parse(raw);
      if (list.length === 0) {
        localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify([DEFAULT_PROJECT]));
        this.setActiveProjectId(DEFAULT_PROJECT.id);
        return [DEFAULT_PROJECT];
      }
      return list;
    } catch {
      return [DEFAULT_PROJECT];
    }
  },

  getActiveProjectId(): string {
    const active = localStorage.getItem(STORAGE_KEYS.ACTIVE_PROJECT_ID);
    if (active) return active;
    const projects = this.getProjects();
    const firstId = projects[0]?.id || DEFAULT_PROJECT.id;
    localStorage.setItem(STORAGE_KEYS.ACTIVE_PROJECT_ID, firstId);
    return firstId;
  },

  setActiveProjectId(id: string): void {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_PROJECT_ID, id);
    window.dispatchEvent(new CustomEvent('dev_planner_project_changed', { detail: id }));
  },

  getActiveProject(): Project | null {
    const activeId = this.getActiveProjectId();
    const projects = this.getProjects();
    return projects.find(p => p.id === activeId) || projects[0] || null;
  },

  saveProject(project: Project): Project[] {
    const list = this.getProjects();
    const index = list.findIndex(p => p.id === project.id);
    let updated: Project[];
    if (index >= 0) {
      updated = [...list];
      updated[index] = project;
    } else {
      updated = [...list, project];
    }
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(updated));
    return updated;
  },

  deleteProject(id: string): Project[] {
    const list = this.getProjects();
    const updated = list.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(updated));

    // Se apagou o ativo, troca o ativo para o primeiro remanescente
    if (this.getActiveProjectId() === id && updated.length > 0) {
      this.setActiveProjectId(updated[0].id);
    }

    // Limpa os dados do projeto deletado
    const allFeatures = this.getRawFeatures().filter(f => f.projectId !== id);
    localStorage.setItem(STORAGE_KEYS.FEATURES, JSON.stringify(allFeatures));

    const allItems = this.getRawItems().filter(i => i.projectId !== id);
    localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(allItems));

    const allDocs = this.getRawDocs().filter(d => d.projectId !== id);
    localStorage.setItem(STORAGE_KEYS.DOCS, JSON.stringify(allDocs));

    return updated;
  },

  // === CATEGORIAS (GLOBAIS) ===
  getCategories(): Category[] {
    const raw = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
      return DEFAULT_CATEGORIES;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_CATEGORIES;
    }
  },

  saveCategory(category: Category): Category[] {
    const list = this.getCategories();
    const index = list.findIndex(c => c.id === category.id);
    let updated: Category[];
    if (index >= 0) {
      updated = [...list];
      updated[index] = category;
    } else {
      updated = [...list, category];
    }
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(updated));
    return updated;
  },

  deleteCategory(id: string): Category[] {
    const list = this.getCategories();
    const updated = list.filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(updated));
    return updated;
  },

  // === MÉTODOS RAW INTERNOS COM MIGRAÇÃO ===
  getRawFeatures(): Feature[] {
    const raw = localStorage.getItem(STORAGE_KEYS.FEATURES);
    if (!raw) return [];
    try {
      const list: any[] = JSON.parse(raw);
      const activeId = this.getActiveProjectId();
      return list.map(f => ({
        ...f,
        projectId: f.projectId || activeId,
      }));
    } catch {
      return [];
    }
  },

  getRawItems(): PlannerItem[] {
    const raw = localStorage.getItem(STORAGE_KEYS.ITEMS);
    if (!raw) return [];
    try {
      const list: any[] = JSON.parse(raw);
      const activeId = this.getActiveProjectId();
      return list.map(i => ({
        ...i,
        projectId: i.projectId || activeId,
      }));
    } catch {
      return [];
    }
  },

  getRawDocs(): FeatureDoc[] {
    const raw = localStorage.getItem(STORAGE_KEYS.DOCS);
    if (!raw) return [];
    try {
      const list: any[] = JSON.parse(raw);
      const activeId = this.getActiveProjectId();
      return list.map(d => ({
        ...d,
        projectId: d.projectId || activeId,
      }));
    } catch {
      return [];
    }
  },

  // === FEATURES (FILTRADAS PELO PROJETO ATIVO) ===
  getFeatures(projectId?: string): Feature[] {
    const targetProjectId = projectId || this.getActiveProjectId();
    const all = this.getRawFeatures();
    return all.filter(f => f.projectId === targetProjectId);
  },

  saveFeature(feature: Feature): Feature[] {
    const currentProjectId = feature.projectId || this.getActiveProjectId();
    const featWithProj = { ...feature, projectId: currentProjectId };
    const all = this.getRawFeatures();
    const index = all.findIndex(f => f.id === featWithProj.id);
    let updatedAll: Feature[];
    if (index >= 0) {
      updatedAll = [...all];
      updatedAll[index] = featWithProj;
    } else {
      updatedAll = [...all, featWithProj];
    }
    localStorage.setItem(STORAGE_KEYS.FEATURES, JSON.stringify(updatedAll));
    return updatedAll.filter(f => f.projectId === currentProjectId);
  },

  deleteFeature(id: string): Feature[] {
    const currentProjectId = this.getActiveProjectId();
    const all = this.getRawFeatures().filter(f => f.id !== id);
    localStorage.setItem(STORAGE_KEYS.FEATURES, JSON.stringify(all));

    // Remove itens e docs da feature
    const items = this.getRawItems().filter(i => i.featureId !== id);
    localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));

    const docs = this.getRawDocs().filter(d => d.featureId !== id);
    localStorage.setItem(STORAGE_KEYS.DOCS, JSON.stringify(docs));

    return all.filter(f => f.projectId === currentProjectId);
  },

  // === ITEMS DO KANBAN (FILTRADOS PELO PROJETO ATIVO) ===
  getItems(projectId?: string): PlannerItem[] {
    const targetProjectId = projectId || this.getActiveProjectId();
    const all = this.getRawItems();
    return all.filter(i => i.projectId === targetProjectId);
  },

  saveItem(item: PlannerItem): PlannerItem[] {
    const currentProjectId = item.projectId || this.getActiveProjectId();
    const itemWithProj = { 
      ...item, 
      projectId: currentProjectId,
      createdAt: item.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const all = this.getRawItems();
    const index = all.findIndex(i => i.id === itemWithProj.id);
    let updatedAll: PlannerItem[];
    if (index >= 0) {
      updatedAll = [...all];
      updatedAll[index] = itemWithProj;
    } else {
      updatedAll = [...all, itemWithProj];
    }
    localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(updatedAll));
    return updatedAll.filter(i => i.projectId === currentProjectId);
  },

  updateItemStatus(id: string, newStatus: ItemStatus): PlannerItem[] {
    const currentProjectId = this.getActiveProjectId();
    const all = this.getRawItems();
    const updatedAll = all.map(item => 
      item.id === id 
        ? { ...item, status: newStatus, updatedAt: new Date().toISOString() } 
        : item
    );
    localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(updatedAll));
    return updatedAll.filter(i => i.projectId === currentProjectId);
  },

  deleteItem(id: string): PlannerItem[] {
    const currentProjectId = this.getActiveProjectId();
    const all = this.getRawItems().filter(i => i.id !== id);
    localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(all));
    return all.filter(i => i.projectId === currentProjectId);
  },

  // === DOCUMENTAÇÕES (FILTRADAS PELO PROJETO ATIVO) ===
  getAllDocs(projectId?: string): FeatureDoc[] {
    const targetProjectId = projectId || this.getActiveProjectId();
    const all = this.getRawDocs();
    return all.filter(d => d.projectId === targetProjectId);
  },

  getDocByFeatureId(featureId: string, projectId?: string): FeatureDoc | null {
    const targetProjectId = projectId || this.getActiveProjectId();
    const docs = this.getAllDocs(targetProjectId);
    return docs.find(d => d.featureId === featureId) || null;
  },

  saveDoc(doc: FeatureDoc): FeatureDoc {
    const currentProjectId = doc.projectId || this.getActiveProjectId();
    const docWithProj = { ...doc, projectId: currentProjectId, updatedAt: new Date().toISOString() };
    const all = this.getRawDocs();
    const index = all.findIndex(d => d.featureId === docWithProj.featureId);
    let updatedAll: FeatureDoc[];
    if (index >= 0) {
      updatedAll = [...all];
      updatedAll[index] = docWithProj;
    } else {
      updatedAll = [...all, docWithProj];
    }
    localStorage.setItem(STORAGE_KEYS.DOCS, JSON.stringify(updatedAll));
    return docWithProj;
  },

  // Exportar / Importar backup JSON
  exportBackup() {
    return JSON.stringify({
      projects: this.getProjects(),
      activeProjectId: this.getActiveProjectId(),
      features: this.getRawFeatures(),
      categories: this.getCategories(),
      items: this.getRawItems(),
      docs: this.getRawDocs(),
      exportedAt: new Date().toISOString(),
    }, null, 2);
  },

  importBackup(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.projects) localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(parsed.projects));
      if (parsed.activeProjectId) localStorage.setItem(STORAGE_KEYS.ACTIVE_PROJECT_ID, parsed.activeProjectId);
      if (parsed.features) localStorage.setItem(STORAGE_KEYS.FEATURES, JSON.stringify(parsed.features));
      if (parsed.categories) localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(parsed.categories));
      if (parsed.items) localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(parsed.items));
      if (parsed.docs) localStorage.setItem(STORAGE_KEYS.DOCS, JSON.stringify(parsed.docs));
      return true;
    } catch {
      return false;
    }
  }
};
