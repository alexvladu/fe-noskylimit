import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { AdminUser } from '../../interfaces/admin-user';

export interface AdminSummary {
  totalUsers: number;
  reporters: number;
  openReports: number;
}

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private readonly users: AdminUser[] = [
    {
      id: 1,
      name: 'Isabella Flores',
      email: 'isabella@example.com',
      role: 'member',
      lastActive: '2025-11-20T09:45:00Z',
      totalMatches: 38,
      activeReports: 0,
      reports: [],
    },
    {
      id: 2,
      name: 'Michael Davis',
      email: 'michael@example.com',
      role: 'moderator',
      lastActive: '2025-11-22T13:10:00Z',
      totalMatches: 112,
      activeReports: 2,
      reports: [
        {
          id: 91,
          targetId: 13,
          targetName: 'Emma West',
          reason: 'Harassment in chat',
          createdAt: '2025-11-21T16:35:00Z',
          status: 'investigating',
        },
        {
          id: 87,
          targetId: 9,
          targetName: 'Sophie Reed',
          reason: 'Fake profile suspicion',
          createdAt: '2025-11-20T10:05:00Z',
          status: 'open',
        },
      ],
    },
    {
      id: 3,
      name: 'Daniel Cho',
      email: 'daniel@example.com',
      role: 'member',
      lastActive: '2025-11-23T18:25:00Z',
      totalMatches: 52,
      activeReports: 1,
      reports: [
        {
          id: 79,
          targetId: 4,
          targetName: 'Logan Wilde',
          reason: 'Spam links',
          createdAt: '2025-11-22T20:40:00Z',
          status: 'resolved',
        },
      ],
    },
    {
      id: 4,
      name: 'Sophie Carter',
      email: 'sophie@example.com',
      role: 'member',
      lastActive: '2025-11-19T12:00:00Z',
      totalMatches: 9,
      activeReports: 0,
      reports: [],
    },
  ];

  getUsers(): Observable<AdminUser[]> {
    return of(this.users).pipe(delay(300));
  }

  getSummary(): Observable<AdminSummary> {
    return of(this.buildSummary(this.users)).pipe(delay(150));
  }

  private buildSummary(users: AdminUser[]): AdminSummary {
    const totalUsers = users.length;
    const reporters = users.filter((user) => user.reports.length > 0).length;
    const openReports = users.reduce(
      (acc, user) =>
        acc +
        user.reports.filter((report) => report.status === 'open').length,
      0,
    );

    return { totalUsers, reporters, openReports };
  }
}

