export interface ClientProfile {
  id: string;
  fullName: string;
  avatarUrl?: string;
  domicileStates: ('FL' | 'PA')[];
  maritalStatus: 'single' | 'married' | 'widowed' | 'divorced';
  tracks: Array<'EstatePlanning' | 'ElderLaw' | 'Guardianship' | 'Probate' | 'Medicaid'>;
  confidenceScore: number; // 0-100
  nextAppointment?: CalendarEvent;
}
export interface CalendarEvent { id: string; title: string; startIso: string; joinUrl?: string; location?: string; }
export interface Milestone { id: string; label: string; status: 'not_started' | 'in_progress' | 'done' | 'blocked'; dueIso?: string; track?: string; }
export interface TodoItem { id: string; text: string; dueIso?: string; priority?: 'low' | 'med' | 'high'; completed: boolean; link?: string; }
export interface EducationItem { id: string; kind: 'video' | 'pdf' | 'article' | 'book'; title: string; durationMin?: number; tag: 'Trusts' | 'Medicaid' | 'Guardianship' | 'Probate' | 'Taxes' | 'SpecialNeeds'; url: string; recommended: boolean; }
export interface MessageThreadSummary { id: string; unreadCount: number; lastSnippet: string; updatedIso: string; }
export interface VaultItem { id: string; name: string; kind: 'pdf' | 'docx' | 'image' | 'other'; uploadedIso: string; sizeKb: number; signed?: boolean; previewUrl?: string; downloadUrl: string; }
export interface ScenarioPreset { id: string; label: string; summary: string; link: string; }
