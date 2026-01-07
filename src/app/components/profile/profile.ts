import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService, UserDto } from '../../services/user/user.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.scss']
})
export class ProfileComponent implements OnInit {
  private userService = inject(UserService);
  private router = inject(Router);

  user: UserDto | null = null;
  isLoading = true;
  error = '';
  isEditing = false;

  // Editable fields
  editData = {
    bio: '',
    age: 0,
    height: 0,
    city: ''
  };

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    this.isLoading = true;
    this.error = '';

    this.userService.getCurrentUser().subscribe({
      next: (user: UserDto) => {
        this.user = user;
        this.editData = {
          bio: user.bio || '',
          age: user.age || 0,
          height: user.height || 0,
          city: user.city || ''
        };
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading profile:', err);
        this.error = 'Failed to load profile. Please try again.';
        this.isLoading = false;
      }
    });
  }

  getImageUrl(imageData: string): string {
    if (!imageData) return '';
    if (imageData.startsWith('data:')) {
      return imageData;
    }
    return `data:image/jpeg;base64,${imageData}`;
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    if (!this.isEditing && this.user) {
      // Reset edit data if cancelled
      this.editData = {
        bio: this.user.bio || '',
        age: this.user.age || 0,
        height: this.user.height || 0,
        city: this.user.city || ''
      };
    }
  }

  saveProfile(): void {
    if (!this.user) return;

    const formData = new FormData();
    formData.append('bio', this.editData.bio);
    formData.append('age', this.editData.age.toString());
    formData.append('height', this.editData.height.toString());
    formData.append('location', this.editData.city);

    this.userService.updateProfile(this.user.id, formData).subscribe({
      next: () => {
        this.isEditing = false;
        this.loadUserProfile();
      },
      error: (err) => {
        console.error('Error updating profile:', err);
        this.error = 'Failed to update profile. Please try again.';
      }
    });
  }

  getGenderLabel(gender?: number): string {
    const labels: { [key: number]: string } = {
      0: 'Male',
      1: 'Female',
      2: 'Non-binary'
    };
    return gender !== undefined ? labels[gender] || 'Unknown' : 'Unknown';
  }

  getOrientationLabel(orientation?: number): string {
    const labels: { [key: number]: string } = {
      0: 'Straight',
      1: 'Gay',
      2: 'Lesbian',
      3: 'Bisexual',
      4: 'Other'
    };
    return orientation !== undefined ? labels[orientation] || 'Unknown' : 'Unknown';
  }

  getRelationshipGoalLabel(goal?: number): string {
    const labels: { [key: number]: string } = {
      0: 'Casual',
      1: 'Serious Relationship',
      2: 'Marriage'
    };
    return goal !== undefined ? labels[goal] || 'Unknown' : 'Unknown';
  }

  logout(): void {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}
