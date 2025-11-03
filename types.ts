import React from 'react';

export interface Project {
  id: string;
  name: string;
  address?: string;
  size?: number;
  logo?: string;
  startDate?: string;
  endDate?: string;
  constructorId?: string;
  artNumber?: string;
  creaNumber?: string;
  technicalManager?: string;
  status: 'active' | 'completed' | 'on-hold';
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // Used for creation/update only, never stored in state
  whatsapp?: string;
  role: 'admin' | 'gestor' | 'campo';
  createdBy?: string;
  accessLevel: 'trial' | 'full' | 'none';
  trialEndsAt: number | null;
  assignedProjectIds?: string[];
  kiwifyPaymentUrl?: string;
}

export interface Constructor {
  id: string;
  name: string;
  logo?: string;
  cnpj?: string;
}

export interface LogData {
  projectName: string;
  engineer: string;
  responsible: string;
  date: string;
  weather: string;
  workHours?: string;
  tempMin?: string;
  tempMax?: string;
  observations?: string;
}

export interface Task {
  id: string;
  text: string;
  location?: string;
  reason?: string;
}

export interface Worker {
  id: string;
  role: string;
  count: number;
}

export interface ImageFile {
  id: string;
  dataUrl: string;
}

export interface AnalysisResult {
  id: string;
  imageId: string;
  imagePreview: string;
  suggestion: string;
}

export interface PlatformSettings {
  name: string;
  logo: string;
  termsOfService?: string;
  privacyPolicy?: string;
}

export interface SavedInsight {
  id: string;
  date: string;
  content: string;
  authorType: 'ia' | 'user';
  authorName: string;
}

export interface FullLog {
    logData: LogData;
    tasks: Task[];
    impossibleTasks: Task[];
    workers: Worker[];
    images: ImageFile[];
    constructor?: Constructor;
    elapsedDays?: number | null;
    platformSettings: PlatformSettings;
}

export interface PrintableViewProps {
    project: Project;
    logData: LogData;
    tasks: Task[];
    impossibleTasks: Task[];
    workers: Worker[];
    images: ImageFile[];
    constructor?: Constructor;
    elapsedDays?: number | null;
    platformSettings: PlatformSettings;
}