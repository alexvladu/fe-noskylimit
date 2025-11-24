import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminService, AdminSummary } from '../../services/admin/admin.service';
import { AdminUser } from '../../interfaces/admin-user';
import { forkJoin } from 'rxjs';

type AdminFilter = 'all' | 'reporters';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
})
export class AdminComponent implements OnInit {
  private adminService = inject(AdminService);

  summary: AdminSummary | null = null;
  users: AdminUser[] = [];
  filteredUsers: AdminUser[] = [];
  selectedUser: AdminUser | null = null;

  filter: AdminFilter = 'all';
  searchTerm = '';

  isLoading = true;
  error = '';

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    this.error = '';

    forkJoin({
      users: this.adminService.getUsers(),
      summary: this.adminService.getSummary(),
    }).subscribe({
      next: ({ users, summary }) => {
        this.users = users;
        this.summary = summary;
        this.applyFilters();
        this.selectDefaultUser();
        this.isLoading = false;
      },
      error: () => {
        this.error = 'Unable to load admin data right now.';
        this.isLoading = false;
      },
    });
  }

  selectUser(user: AdminUser): void {
    this.selectedUser = user;
  }

  applyFilters(): void {
    const normalizedSearch = this.searchTerm.trim().toLowerCase();

    this.filteredUsers = this.users.filter((user) => {
      const matchesFilter =
        this.filter === 'all' ? true : user.reports.length > 0;
      const matchesSearch =
        !normalizedSearch ||
        user.name.toLowerCase().includes(normalizedSearch) ||
        user.email.toLowerCase().includes(normalizedSearch);

      return matchesFilter && matchesSearch;
    });
  }

  setFilter(filter: AdminFilter): void {
    if (this.filter === filter) {
      return;
    }

    this.filter = filter;
    this.applyFilters();
    this.selectDefaultUser();
  }

  onSearchChange(): void {
    this.applyFilters();
    this.selectDefaultUser();
  }

  getTotalReports(user: AdminUser | null | undefined): number {
    return user?.reports?.length ?? 0;
  }

  getOpenReports(user: AdminUser | null | undefined): number {
    if (!user?.reports?.length) {
      return 0;
    }

    return user.reports.filter((report) => report.status === 'open').length;
  }

  private selectDefaultUser(): void {
    const current = this.filteredUsers.find(
      (user) => user.id === this.selectedUser?.id,
    );

    if (current) {
      this.selectedUser = current;
      return;
    }

    this.selectedUser = this.filteredUsers[0] ?? null;
  }
}

