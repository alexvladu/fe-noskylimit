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
  isLoading = false;
  error = '';
  isEditing = false;
  isSaving = false;

  // Original values to prevent deselection
  originalLanguages: number[] = [];
  originalInterests: number[] = [];

  // Available options
  availableHobbies = [
    'Gym', 'Travel', 'Gaming', 'Cooking', 'Music', 'Hiking',
    'Art', 'Tech', 'Movies', 'Pets', 'Sports', 'Dancing',
    'Reading', 'Photography', 'Yoga', 'Crafts', 'Gardening',
    'Fishing', 'Volunteering'
  ];

  availableLanguages = [
    'English', 'Romanian', 'Spanish', 'French', 'German',
    'Italian', 'Portuguese', 'Russian', 'Chinese', 'Japanese',
    'Korean', 'Arabic', 'Hindi', 'Turkish', 'Polish',
    'Dutch', 'Greek', 'Swedish', 'Norwegian', 'Danish', 'Finnish'
  ];

  // Editable fields
  editData = {
    bio: '',
    age: 0,
    height: 0,
    city: '',
    gender: 0,
    sexualOrientation: 0,
    relationshipGoal: 0,
    preferredAgeMin: 18,
    preferredAgeMax: 50,
    languages: [] as number[],
    interests: [] as number[],
    photos: [] as File[],
    photoPreviews: [] as string[],
    existingPhotos: [] as string[],
    photosToDelete: [] as number[]
  };

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    this.error = '';

    this.userService.getCurrentUser().subscribe({
      next: (user: UserDto) => {
        this.user = user;
        this.resetEditData();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading profile:', err);
        this.error = 'Failed to load profile. Please try again.';
        this.isLoading = false;
      }
    });
  }

  resetEditData(): void {
    if (!this.user) return;

    // Convert string names from backend to numeric indices for editing
    const languageIndices = (this.user.languages || []).map(lang =>
      this.availableLanguages.indexOf(lang)
    ).filter(index => index !== -1);

    const interestIndices = (this.user.interests || []).map(interest =>
      this.availableHobbies.indexOf(interest)
    ).filter(index => index !== -1);

    // Store original values to prevent deselection
    this.originalLanguages = [...languageIndices];
    this.originalInterests = [...interestIndices];

    // Convert backend string enums to numeric values for edit dropdowns
    let genderValue = 0;
    if (typeof this.user.gender === 'string') {
      const genderMap: { [key: string]: number } = { 'Male': 0, 'Female': 1, 'NonBinary': 2 };
      genderValue = genderMap[this.user.gender] ?? 0;
    } else {
      genderValue = this.user.gender ?? 0;
    }

    let orientationValue = 0;
    if (typeof this.user.sexualOrientation === 'string') {
      const orientationMap: { [key: string]: number } = { 'Straight': 0, 'Gay': 1, 'Lesbian': 2, 'Bisexual': 3, 'Other': 4 };
      orientationValue = orientationMap[this.user.sexualOrientation] ?? 0;
    } else {
      orientationValue = this.user.sexualOrientation ?? 0;
    }

    let relationshipValue = 0;
    if (typeof this.user.relationshipGoal === 'string') {
      const relationshipMap: { [key: string]: number } = { 'CasualDating': 0, 'SeriousRelationship': 1, 'Marriage': 2 };
      relationshipValue = relationshipMap[this.user.relationshipGoal] ?? 0;
    } else {
      relationshipValue = this.user.relationshipGoal ?? 0;
    }

    this.editData = {
      bio: this.user.bio || '',
      age: this.user.age || 0,
      height: this.user.height || 0,
      city: this.user.city || '',
      gender: genderValue,
      sexualOrientation: orientationValue,
      relationshipGoal: relationshipValue,
      preferredAgeMin: this.user.preferredAgeMin || 18,
      preferredAgeMax: this.user.preferredAgeMax || 50,
      languages: [...this.originalLanguages],
      interests: [...this.originalInterests],
      photos: [] as File[],
      photoPreviews: [] as string[],
      existingPhotos: this.user.photos || [],
      photosToDelete: []
    };
  }

  getImageUrl(imageData: string): string {
    if (!imageData) return '';
    if (imageData.startsWith('data:')) {
      return imageData;
    }
    return `data:image/jpeg;base64,${imageData}`;
  }

  // Convert base64 to Blob (much faster than fetch)
  base64ToBlob(base64: string, contentType: string = 'image/jpeg'): Blob {
    // Remove data URL prefix if present
    const base64Data = base64.includes(',') ? base64.split(',')[1] : base64;

    const byteCharacters = atob(base64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    return new Blob(byteArrays, { type: contentType });
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      this.resetEditData();
    }
  }

  onFileSelected(event: any): void {
    const files = event.target.files;
    if (files && files.length > 0) {
      const totalPhotos = this.editData.existingPhotos.length + this.editData.photos.length - this.editData.photosToDelete.length;
      const availableSlots = 6 - totalPhotos;

      if (availableSlots <= 0) {
        this.error = 'Maximum 6 photos allowed';
        return;
      }

      for (let i = 0; i < Math.min(files.length, availableSlots); i++) {
        const file = files[i];
        this.editData.photos.push(file);

        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.editData.photoPreviews.push(e.target.result);
        };
        reader.readAsDataURL(file);
      }

      if (files.length > availableSlots) {
        this.error = `Only ${availableSlots} photos added. Maximum 6 photos allowed.`;
      }
    }
  }

  removeNewPhoto(index: number): void {
    this.editData.photos.splice(index, 1);
    this.editData.photoPreviews.splice(index, 1);
  }

  removeExistingPhoto(index: number): void {
    this.editData.photosToDelete.push(index);
  }

  isPhotoMarkedForDeletion(index: number): boolean {
    return this.editData.photosToDelete.includes(index);
  }

  undoPhotoDelete(index: number): void {
    const deleteIndex = this.editData.photosToDelete.indexOf(index);
    if (deleteIndex > -1) {
      this.editData.photosToDelete.splice(deleteIndex, 1);
    }
  }

  toggleLanguage(langIndex: number): void {
    // Prevent deselecting original languages
    if (this.originalLanguages.includes(langIndex)) {
      return;
    }

    const index = this.editData.languages.indexOf(langIndex);
    if (index > -1) {
      this.editData.languages.splice(index, 1);
    } else {
      // Prevent duplicates
      if (!this.editData.languages.includes(langIndex)) {
        this.editData.languages.push(langIndex);
      }
    }
  }

  isLanguageSelected(langIndex: number): boolean {
    return this.editData.languages.includes(langIndex);
  }

  isLanguageDisabled(langIndex: number): boolean {
    return this.originalLanguages.includes(langIndex);
  }

  toggleInterest(interestIndex: number): void {
    // Prevent deselecting original interests
    if (this.originalInterests.includes(interestIndex)) {
      return;
    }

    const index = this.editData.interests.indexOf(interestIndex);
    if (index > -1) {
      this.editData.interests.splice(index, 1);
    } else {
      if (this.editData.interests.length >= 5) {
        this.error = 'Maximum 5 interests allowed';
        return;
      }
      // Prevent duplicates
      if (!this.editData.interests.includes(interestIndex)) {
        this.editData.interests.push(interestIndex);
      }
    }
  }

  isInterestSelected(interestIndex: number): boolean {
    return this.editData.interests.includes(interestIndex);
  }

  isInterestDisabled(interestIndex: number): boolean {
    return this.originalInterests.includes(interestIndex);
  }

  saveProfile(): void {
    if (!this.user) return;

    // Validation
    const activePhotosCount = this.editData.existingPhotos.length - this.editData.photosToDelete.length + this.editData.photos.length;
    if (activePhotosCount < 2) {
      this.error = 'At least 2 photos are required';
      return;
    }

    if (this.editData.languages.length === 0) {
      this.error = 'At least one language is required';
      return;
    }

    if (this.editData.interests.length === 0) {
      this.error = 'At least one interest is required';
      return;
    }

    this.isSaving = true;
    this.error = '';

    const formData = new FormData();

    // Add all fields - IMPORTANT: Use exact property names from SetupProfileRequest.cs
    formData.append('age', this.editData.age.toString());
    formData.append('height', this.editData.height.toString());
    formData.append('gender', this.editData.gender.toString());
    formData.append('location', this.editData.city);
    formData.append('bio', this.editData.bio);
    formData.append('sexualOrientation', this.editData.sexualOrientation.toString());
    formData.append('relationshipType', this.editData.relationshipGoal.toString());
    formData.append('ageRangeMin', this.editData.preferredAgeMin.toString());
    formData.append('ageRangeMax', this.editData.preferredAgeMax.toString());

    // Add languages (deduplicate to avoid database unique constraint errors)
    const uniqueLanguages = [...new Set(this.editData.languages)];
    uniqueLanguages.forEach((lang, index) => {
      formData.append(`languages[${index}]`, lang.toString());
    });

    // Add interests (deduplicate to avoid database unique constraint errors)
    const uniqueInterests = [...new Set(this.editData.interests)];
    uniqueInterests.forEach((interest, index) => {
      formData.append(`hobbies[${index}]`, interest.toString());
    });

    // Convert existing photos (NOT marked for deletion) to Files - FAST conversion
    const existingPhotosToKeep = this.editData.existingPhotos
      .map((photo, index) => ({ photo, index }))
      .filter(item => !this.editData.photosToDelete.includes(item.index))
      .map(item => item.photo);

    // Convert base64 to File synchronously (much faster than fetch)
    const existingPhotoFiles: File[] = [];
    existingPhotosToKeep.forEach((photoBase64, index) => {
      try {
        const blob = this.base64ToBlob(photoBase64);
        const file = new File([blob], `photo_${index}.jpg`, { type: 'image/jpeg' });
        existingPhotoFiles.push(file);
      } catch (error) {
        console.error('Error converting photo:', error);
      }
    });

    // Add existing photos that we're keeping
    existingPhotoFiles.forEach(file => {
      formData.append('photos', file);
    });

    // Add new photos uploaded by user
    this.editData.photos.forEach((photo) => {
      formData.append('photos', photo);
    });

    // Send the update request
    this.userService.updateProfile(this.user!.id, formData).subscribe({
      next: () => {
        this.isEditing = false;
        this.isSaving = false;
        // Reload the page to see the updated profile
        window.location.reload();
      },
      error: (err) => {
        console.error('Error updating profile:', err);
        this.error = err?.error?.message || err?.error?.title || 'Failed to update profile. Please try again.';
        this.isSaving = false;
      }
    });
  }

  getGenderLabel(gender?: number | string): string {
    if (gender === null || gender === undefined) return 'Not set';
    // If it's already a string from backend, return it directly (with formatting)
    if (typeof gender === 'string') {
      // Convert 'NonBinary' to 'Non-binary'
      if (gender === 'NonBinary') return 'Non-binary';
      return gender;
    }
    // If it's a number (for edit mode), map it
    const labels: { [key: number]: string } = {
      0: 'Male',
      1: 'Female',
      2: 'Non-binary'
    };
    return labels[gender] || 'Not set';
  }

  getOrientationLabel(orientation?: number | string): string {
    if (orientation === null || orientation === undefined) return 'Not set';
    // If it's already a string from backend, return it directly
    if (typeof orientation === 'string') {
      return orientation;
    }
    // If it's a number (for edit mode), map it
    const labels: { [key: number]: string } = {
      0: 'Straight',
      1: 'Gay',
      2: 'Lesbian',
      3: 'Bisexual',
      4: 'Other'
    };
    return labels[orientation] || 'Not set';
  }

  getRelationshipGoalLabel(goal?: number | string): string {
    if (goal === null || goal === undefined) return 'Not set';
    // If it's already a string from backend, return it with formatting
    if (typeof goal === 'string') {
      // Convert 'CasualDating' to 'Casual Dating', 'SeriousRelationship' to 'Serious Relationship'
      if (goal === 'CasualDating') return 'Casual Dating';
      if (goal === 'SeriousRelationship') return 'Serious Relationship';
      return goal;
    }
    // If it's a number (for edit mode), map it
    const labels: { [key: number]: string } = {
      0: 'Casual',
      1: 'Serious Relationship',
      2: 'Marriage'
    };
    return labels[goal] || 'Not set';
  }

  getLanguageLabel(lang: number | string): string {
    // If it's already a string (from backend), return it directly
    if (typeof lang === 'string') {
      return lang;
    }
    // If it's a number (for edit mode), map it to label
    const labels: string[] = [
      'English', 'Romanian', 'Spanish', 'French', 'German',
      'Italian', 'Portuguese', 'Russian', 'Chinese', 'Japanese',
      'Korean', 'Arabic', 'Hindi', 'Turkish', 'Polish',
      'Dutch', 'Greek', 'Swedish', 'Norwegian', 'Danish', 'Finnish'
    ];
    return labels[lang] || 'Unknown';
  }

  getInterestLabel(interest: number | string): string {
    // If it's already a string (from backend), return it directly
    if (typeof interest === 'string') {
      return interest;
    }
    // If it's a number (for edit mode), map it to label
    const labels: string[] = [
      'Gym', 'Travel', 'Gaming', 'Cooking', 'Music', 'Hiking',
      'Art', 'Tech', 'Movies', 'Pets', 'Sports', 'Dancing',
      'Reading', 'Photography', 'Yoga', 'Crafts', 'Gardening',
      'Fishing', 'Volunteering'
    ];
    return labels[interest] || 'Unknown';
  }

  logout(): void {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}
