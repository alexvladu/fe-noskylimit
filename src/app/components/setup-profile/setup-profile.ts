import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SetupProfileService } from '../../services/user/setup-profile.service';

@Component({
  selector: 'app-setup-profile',
  imports: [CommonModule, FormsModule],
  templateUrl: './setup-profile.html',
  styleUrl: './setup-profile.scss',
})
export class SetupProfile implements OnInit {
  private setupProfileService = inject(SetupProfileService);
  private router = inject(Router);

  step = 1;
  totalSteps = 4;

  // Data Pools (Provizoriu)
  availableHobbies: string[] = [
    'Gym', 'Travel', 'Gaming', 'Cooking',
    'Music', 'Hiking', 'Art', 'Tech', 'Movies', 'Pets',
    'Sports', 'Dancing', 'Reading', 'Photography',
    'Yoga', 'Crafts', 'Gardening', 'Fishing', 'Volunteering'
  ];
  availableLanguages: string[] = ['English', 'Romanian', 'Spanish', 'French', 'German'];

  profile: {
    age: number | null;
    gender: string;
    height: number | null;
    location: string;
    languages: string[];
    photos: File[];
    photoPreviews: string[];
    hobbies: string[];
    bio: string;
    sexualOrientation: string;
    relationshipType: string;
    ageRangeMin: number;
    ageRangeMax: number;
  } = {
    age: null,
    gender: '',
    height: null,
    location: '',
    languages: [],
    photos: [],
    photoPreviews: [],
    hobbies: [],
    bio: '',
    sexualOrientation: '',
    relationshipType: '',
    ageRangeMin: 18,
    ageRangeMax: 50
  };

  ngOnInit() {
    // Load hobbies and languages from API
    this.setupProfileService.getAvailableHobbies().subscribe({
      next: (hobbies) => this.availableHobbies = hobbies,
      error: (err) => console.error('Error loading hobbies:', err)
    });

    this.setupProfileService.getAvailableLanguages().subscribe({
      next: (languages) => this.availableLanguages = languages,
      error: (err) => console.error('Error loading languages:', err)
    });
  }

  // --- Logică pentru Hobbies (Max 5) ---
  toggleHobby(hobby: string) {
    const index = this.profile.hobbies.indexOf(hobby);

    if (index > -1) {
      this.profile.hobbies.splice(index, 1);
    } else {
      if (this.profile.hobbies.length < 5) {
        this.profile.hobbies.push(hobby);
      } else {
        alert('You can select up to 5 hobbies only.');
      }
    }
  }

  isHobbySelected(hobby: string): boolean {
    return this.profile.hobbies.includes(hobby);
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.profile.photos.push(file);

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.profile.photoPreviews.push(e.target.result);
      };
      reader.readAsDataURL(file);

      // TODO: BACKEND this.uploadPhoto(file);
    }
  }

  nextStep() {
    if (!this.validateStep()) {
      return;
    }

    if (this.step < this.totalSteps) {
      this.step++;
    } else {
      this.submitProfile();
    }
  }

  validateStep(): boolean {
    switch (this.step) {
      case 1:
        if (!this.profile.age || !this.profile.height || !this.profile.gender || !this.profile.location || this.profile.languages.length === 0) {
          alert('Please complete all fields.');
          return false;
        }
        break;
      case 2:
        if (this.profile.photos.length < 2) {
          alert('Please upload at least 2 photos.');
          return false;
        }
        break;
      case 3:
        if (this.profile.hobbies.length === 0 || !this.profile.bio) {
          alert('Please select at least one hobby and provide a bio.');
          return false;
        }
        break;
      case 4:
        if (!this.profile.sexualOrientation || !this.profile.relationshipType || !this.profile.ageRangeMin || !this.profile.ageRangeMax) {
          alert('Please complete all fields.');
          return false;
        }
        break;
    }
    return true;
  }

  prevStep() {
    if (this.step > 1) this.step--;
  }

  submitProfile() {
    const userId = this.getUserIdFromAuth(); // TODO: Implement this method based on your auth system

    const formData = new FormData();
    formData.append('age', this.profile.age!.toString());
    formData.append('gender', this.profile.gender.toString());
    formData.append('height', this.profile.height!.toString());
    formData.append('location', this.profile.location);

    this.profile.languages.forEach(language => formData.append('languages', language));
    this.profile.photos.forEach(photo => formData.append('photos', photo));
    this.profile.hobbies.forEach(hobby => formData.append('hobbies', hobby));

    formData.append('bio', this.profile.bio);
    formData.append('sexualOrientation', this.profile.sexualOrientation);
    formData.append('relationshipType', this.profile.relationshipType);
    formData.append('ageRangeMin', this.profile.ageRangeMin.toString());
    formData.append('ageRangeMax', this.profile.ageRangeMax.toString());

    this.setupProfileService.completeProfile(userId, formData).subscribe({
      next: (response) => {
        console.log('Profile setup successful:', response);
        this.router.navigate(['/home']);
      },
      error: (err) => {
        console.error('Error setting up profile:', err);
        alert('Failed to setup profile. Please try again.');
      }
    });
  }

  //TODO: Implement this based on your authentication system
  private getUserIdFromAuth(): number {
    const token = localStorage.getItem('token');
    if (token) {
      // implementation to extract user ID from token
      return 1;
    }
    throw new Error('User not authenticated');
  }
}
