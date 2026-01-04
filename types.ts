export enum AppView {
  GENERATOR = 'GENERATOR',
  COMPARATOR = 'COMPARATOR',
}

export interface ProjectData {
  projectName: string;
  projectType: string;
  disciplines: string[];
  software: string[];
  lod: string;
  standards: string;
  additionalNotes: string;
}

export enum AnalysisStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export interface ComparisonResult {
  analysis: string;
  score: number;
}
