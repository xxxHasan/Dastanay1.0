import { StudyPack, StudyMaterial, QuizAttempt, UserPreferences, User, ThemeMode } from '../types';

const STORAGE_KEYS = {
  PACKS: 'dastanay_user_study_packs_v2',
  MATERIALS: 'dastanay_user_materials_v2',
  ATTEMPTS: 'dastanay_user_attempts_v2',
  PREFERENCES: 'dastanay_user_preferences_v2',
  AUTH_USER: 'dastanay_auth_current_user_v2',
  REGISTERED_USERS: 'dastanay_registered_accounts_v2',
  THEME: 'dastanay_theme_preference_v2',
};

export const DEFAULT_PREFERENCES: UserPreferences = {
  name: 'Guest Scholar',
  email: 'guest@dastanay.app',
  isGuest: true,
  theme: 'system',
  defaultDifficulty: 'Exam Focused',
  defaultQuizSize: 10,
  defaultPdfStyle: 'modern',
  language: 'English',
  prefersReducedMotion: false,
};

// ==========================================
// THEME MANAGEMENT (Light / Dark / System)
// ==========================================
export function getStoredTheme(): ThemeMode {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME) as ThemeMode;
    if (saved && (saved === 'light' || saved === 'dark' || saved === 'system')) {
      return saved;
    }
    return 'system';
  } catch {
    return 'system';
  }
}

export function applyTheme(theme: ThemeMode): void {
  try {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
    const root = document.documentElement;
    let isDark = false;

    if (theme === 'dark') {
      isDark = true;
    } else if (theme === 'light') {
      isDark = false;
    } else {
      // System default
      isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  } catch (err) {
    console.warn('Failed to apply theme:', err);
  }
}

// ==========================================
// AUTHENTICATION SYSTEM (Sign Up, Log In, Guest Mode)
// ==========================================
export function getAuthUser(): User {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // fallback
  }

  // Default to guest user for hackathon demo
  const guestUser: User = {
    id: 'guest-user',
    name: 'Guest Scholar',
    email: 'guest@dastanay.app',
    isGuest: true,
    createdAt: new Date().toISOString(),
  };
  return guestUser;
}

export function setAuthUser(user: User): void {
  try {
    localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(user));
  } catch (err) {
    console.warn('Failed to set auth user:', err);
  }
}

export function registerUser(name: string, email: string, password: string): { success: boolean; user?: User; error?: string } {
  try {
    if (!name.trim() || !email.trim() || !password.trim()) {
      return { success: false, error: 'Please fill in all registration fields.' };
    }
    if (password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters.' };
    }

    const raw = localStorage.getItem(STORAGE_KEYS.REGISTERED_USERS);
    const users: Array<User & { passwordHash: string }> = raw ? JSON.parse(raw) : [];

    const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return { success: false, error: 'An account with this email already exists.' };
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      isGuest: false,
      createdAt: new Date().toISOString(),
    };

    users.push({ ...newUser, passwordHash: btoa(password) });
    localStorage.setItem(STORAGE_KEYS.REGISTERED_USERS, JSON.stringify(users));
    setAuthUser(newUser);

    return { success: true, user: newUser };
  } catch (err) {
    return { success: false, error: 'Failed to create account.' };
  }
}

export function loginUser(email: string, password: string): { success: boolean; user?: User; error?: string } {
  try {
    if (!email.trim() || !password.trim()) {
      return { success: false, error: 'Please enter your email and password.' };
    }

    const raw = localStorage.getItem(STORAGE_KEYS.REGISTERED_USERS);
    const users: Array<User & { passwordHash: string }> = raw ? JSON.parse(raw) : [];

    const matched = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!matched) {
      return { success: false, error: 'No account found with this email. Please sign up.' };
    }

    if (matched.passwordHash !== btoa(password)) {
      return { success: false, error: 'Incorrect password. Please try again.' };
    }

    const user: User = {
      id: matched.id,
      name: matched.name,
      email: matched.email,
      isGuest: false,
      createdAt: matched.createdAt,
    };

    setAuthUser(user);
    return { success: true, user };
  } catch (err) {
    return { success: false, error: 'Login failed. Please try again.' };
  }
}

export function loginAsGuest(): User {
  const guestUser: User = {
    id: `guest-${Date.now()}`,
    name: 'Guest Scholar',
    email: 'guest@dastanay.app',
    isGuest: true,
    createdAt: new Date().toISOString(),
  };
  setAuthUser(guestUser);
  return guestUser;
}

export function logoutUser(): void {
  loginAsGuest();
}

// ==========================================
// STUDY PACKS & USER LIBRARY (NO PRELOADED DATA!)
// ==========================================
export function getStoredStudyPacks(): StudyPack[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PACKS);
    if (!raw) {
      // Real user library MUST BE COMPLETELY EMPTY by default!
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Ensure no demo items ever get returned in the real user library
    return parsed.filter(p => !p.isDemo && p.id !== 'demo-physics-projectile');
  } catch {
    return [];
  }
}

export function saveStudyPack(pack: StudyPack): void {
  try {
    if (pack.isDemo || pack.id === 'demo-physics-projectile') {
      // NEVER save demo pack into the real user library!
      return;
    }
    const packs = getStoredStudyPacks();
    const existingIndex = packs.findIndex(p => p.id === pack.id);
    if (existingIndex >= 0) {
      packs[existingIndex] = pack;
    } else {
      packs.unshift(pack);
    }
    localStorage.setItem(STORAGE_KEYS.PACKS, JSON.stringify(packs));
  } catch (err) {
    console.warn('Failed to save study pack to localStorage:', err);
  }
}

export function deleteStudyPack(packId: string): boolean {
  try {
    const packs = getStoredStudyPacks().filter(p => p.id !== packId);
    localStorage.setItem(STORAGE_KEYS.PACKS, JSON.stringify(packs));
    return true;
  } catch (err) {
    console.warn('Failed to delete study pack:', err);
    return false;
  }
}

export function renameStudyPack(packId: string, newTitle: string): boolean {
  try {
    const packs = getStoredStudyPacks();
    const target = packs.find(p => p.id === packId);
    if (target) {
      target.title = newTitle;
      localStorage.setItem(STORAGE_KEYS.PACKS, JSON.stringify(packs));
      return true;
    }
    return false;
  } catch (err) {
    console.warn('Failed to rename study pack:', err);
    return false;
  }
}

// ==========================================
// STUDY MATERIALS & ATTEMPTS (REAL DATA ONLY)
// ==========================================
export function getStoredMaterials(): StudyMaterial[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MATERIALS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveMaterial(material: StudyMaterial): void {
  try {
    const materials = getStoredMaterials();
    materials.unshift(material);
    localStorage.setItem(STORAGE_KEYS.MATERIALS, JSON.stringify(materials));
  } catch (err) {
    console.warn('Failed to save material:', err);
  }
}

export function getStoredQuizAttempts(): QuizAttempt[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ATTEMPTS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveQuizAttempt(attempt: QuizAttempt): void {
  try {
    const attempts = getStoredQuizAttempts();
    attempts.unshift(attempt);
    localStorage.setItem(STORAGE_KEYS.ATTEMPTS, JSON.stringify(attempts));
  } catch (err) {
    console.warn('Failed to save quiz attempt:', err);
  }
}

export function deleteQuizAttempt(attemptId: string): void {
  try {
    const attempts = getStoredQuizAttempts().filter(a => a.id !== attemptId);
    localStorage.setItem(STORAGE_KEYS.ATTEMPTS, JSON.stringify(attempts));
  } catch (err) {
    console.warn('Failed to delete attempt:', err);
  }
}

// ==========================================
// PREFERENCES
// ==========================================
export function getStoredPreferences(): UserPreferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
    if (!raw) return DEFAULT_PREFERENCES;
    return { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function savePreferences(prefs: UserPreferences): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(prefs));
  } catch (err) {
    console.warn('Failed to save preferences:', err);
  }
}

export function clearAllLocalUserData(): void {
  localStorage.removeItem(STORAGE_KEYS.PACKS);
  localStorage.removeItem(STORAGE_KEYS.MATERIALS);
  localStorage.removeItem(STORAGE_KEYS.ATTEMPTS);
}
