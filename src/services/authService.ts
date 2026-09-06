import { storageAdapter } from './storageAdapter';

export interface UserSession {
  id: string;
  name: string;
  email: string;
}

const AUTH_KEYS = {
  TOKEN: 'dev_planner_token',
  USER: 'dev_planner_user',
};

export const authService = {
  getToken(): string | null {
    return localStorage.getItem(AUTH_KEYS.TOKEN);
  },

  getUser(): UserSession | null {
    const raw = localStorage.getItem(AUTH_KEYS.USER);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  isAuthenticated(): boolean {
    return Boolean(this.getToken() && this.getUser());
  },

  async login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Erro ao entrar.' };
      }

      localStorage.setItem(AUTH_KEYS.TOKEN, data.token);
      localStorage.setItem(AUTH_KEYS.USER, JSON.stringify(data.user));
      window.dispatchEvent(new CustomEvent('dev_planner_auth_changed'));

      // Tenta puxar dados da nuvem após login
      await this.fetchFromCloud();

      return { success: true };
    } catch (err: any) {
      return { success: false, error: 'Não foi possível conectar ao servidor.' };
    }
  },

  async register(name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Erro ao cadastrar.' };
      }

      localStorage.setItem(AUTH_KEYS.TOKEN, data.token);
      localStorage.setItem(AUTH_KEYS.USER, JSON.stringify(data.user));
      window.dispatchEvent(new CustomEvent('dev_planner_auth_changed'));

      // Sincroniza os dados atuais locais para a nova conta
      await this.syncToCloud();

      return { success: true };
    } catch (err: any) {
      return { success: false, error: 'Não foi possível conectar ao servidor.' };
    }
  },

  logout(): void {
    localStorage.removeItem(AUTH_KEYS.TOKEN);
    localStorage.removeItem(AUTH_KEYS.USER);
    window.dispatchEvent(new CustomEvent('dev_planner_auth_changed'));
  },

  async syncToCloud(): Promise<boolean> {
    const token = this.getToken();
    if (!token) return false;

    try {
      const backupData = JSON.parse(storageAdapter.exportBackup());
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(backupData),
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  async fetchFromCloud(): Promise<boolean> {
    const token = this.getToken();
    if (!token) return false;

    try {
      const res = await fetch('/api/sync', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!res.ok) return false;
      const data = await res.json();
      if (data && !data.empty) {
        storageAdapter.importBackup(JSON.stringify(data));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }
};
