export enum Language {
  EN = 'en',
  HE = 'he',
  ZH = 'zh',
  RU = 'ru',
  HI = 'hi',
  ES = 'es',
  DE = 'de',
  FR = 'fr',
}

export enum Theme {
  DARK = 'dark',
  LIGHT = 'light',
}

export interface Task {
  id: string;
  subject: string;
  description: string;
  dueDate: string; // ISO string
  completed: boolean;
  flagColor: string; // Hex code
  createdAt: number;
  order: number;
}

export interface AppSettings {
  language: Language;
  theme: Theme;
  userLogo: string | null; // Data URL or Image URL
  userName: string;
}

export type TranslationKey = 
  | 'appTitle'
  | 'addTask'
  | 'editTask'
  | 'deleteTask'
  | 'markDone'
  | 'markUndone'
  | 'subject'
  | 'description'
  | 'dueDate'
  | 'flag'
  | 'save'
  | 'cancel'
  | 'settings'
  | 'language'
  | 'theme'
  | 'about'
  | 'exportAll'
  | 'printAll'
  | 'search'
  | 'copyright'
  | 'feedback'
  | 'overdue'
  | 'dueIn'
  | 'completed'
  | 'share'
  | 'userLogo'
  | 'uploadLogo'
  | 'noTasks'
  | 'sortBy'
  | 'sortManual'
  | 'sortDueDate'
  | 'sortCreated'
  | 'sortPriority'
  | 'sortDueToday';

export type Translations = Record<Language, Record<TranslationKey, string>>;