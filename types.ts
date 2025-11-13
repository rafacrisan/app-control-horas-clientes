export interface Company {
  id: number;
  name: string;
  isFavorite: boolean;
  lastUsed: number | null;
}

export type TimeLog = Record<number, number>;

export interface Comment {
  id: number;
  companyId: number;
  text: string;
  timestamp: number;
}

export interface AppState {
  companies: Company[];
  timeLog: TimeLog;
  comments: Comment[];
}
