export type ReportStatus = 'open' | 'investigating' | 'resolved';

export interface ReportSummary {
  id: number;
  targetId: number;
  targetName: string;
  reason: string;
  createdAt: string;
  status: ReportStatus;
}

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: 'member' | 'moderator' | 'admin';
  lastActive: string;
  totalMatches: number;
  activeReports: number;
  reports: ReportSummary[];
}

