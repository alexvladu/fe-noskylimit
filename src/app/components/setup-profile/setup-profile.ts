import {Component, inject, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Router} from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';

interface RegistrationData {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
}

@Component({
  selector: 'app-setup-profile',
  imports: [CommonModule, FormsModule],
  templateUrl: './setup-profile.html',
  styleUrl: './setup-profile.scss',
})
export class SetupProfile implements OnInit {
  step = 1;
  totalSteps = 4;
  isSubmitting = false;
  error = '';

  private router = inject(Router);
  private authService = inject(AuthService);

  // Data Pools (Provizoriu)
  availableHobbies: string[] = [
    'Gym', 'Travel', 'Gaming', 'Cooking',
    'Music', 'Hiking', 'Art', 'Tech', 'Movies', 'Pets',
    'Sports', 'Dancing', 'Reading', 'Photography',
    'Yoga', 'Crafts', 'Gardening', 'Fishing', 'Volunteering'
  ];
  availableLanguages: string[] = ['English', 'Romanian', 'Spanish', 'French', 'German'];

  registrationData: RegistrationData | null = null;

  profile = {
    age: null as number | null,
    gender: '',
    height: null as number | null,
    location: '',
    languages: [] as string[],

    photos: [] as File[],
    photoPreviews: [] as string[],

    hobbies: [] as string[],
    bio: '',

    sexualOrientation: '',
    relationshipType: '',
    ageRangeMin: 18,
    ageRangeMax: 50
  };

  ngOnInit() {
    // Get registration data from session storage
    const data = sessionStorage.getItem('registerData');
    if (!data) {
      this.error = 'Registration data not found. Please register first.';
      setTimeout(() => this.router.navigate(['/register']), 2000);
      return;
    }

    try {
      this.registrationData = JSON.parse(data);
    } catch (e) {
      this.error = 'Invalid registration data. Please register again.';
      setTimeout(() => this.router.navigate(['/register']), 2000);
    }
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
    }
  }

  removePhoto(index: number) {
    this.profile.photos.splice(index, 1);
    this.profile.photoPreviews.splice(index, 1);
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
          this.error = 'Please complete all fields.';
          return false;
        }
        break;
      case 2:
        if (this.profile.photos.length < 2) {
          this.error = 'Please upload at least 2 photos.';
          return false;
        }
        break;
      case 3:
        if (this.profile.hobbies.length === 0 || !this.profile.bio) {
          this.error = 'Please select at least one hobby and provide a bio.';
          return false;
        }
        break;
      case 4:
        if (!this.profile.sexualOrientation || !this.profile.relationshipType || !this.profile.ageRangeMin || !this.profile.ageRangeMax) {
          this.error = 'Please complete all fields.';
          return false;
        }
        break;
    }
    this.error = '';
    return true;
  }

  prevStep() {
    if (this.step > 1) this.step--;
    this.error = '';
  }

  submitProfile() {
    if (!this.registrationData) {
      this.error = 'Registration data missing. Please register again.';
      return;
    }

    this.isSubmitting = true;
    this.error = '';

    const formData = new FormData();

    // Add credentials from registration
    formData.append('firstName', this.registrationData.firstName);
    formData.append('lastName', this.registrationData.lastName);
    formData.append('email', this.registrationData.email);
    formData.append('password', this.registrationData.password);

    // Add profile data from setup
    formData.append('age', this.profile.age?.toString() || '25');
    formData.append('height', this.profile.height?.toString() || '180');
    formData.append('gender', this.mapGender(this.profile.gender));
    formData.append('location', this.profile.location);
    formData.append('bio', this.profile.bio);
    formData.append('relationshipGoal', this.mapRelationshipGoal(this.profile.relationshipType));
    formData.append('sexualOrientation', this.mapSexualOrientation(this.profile.sexualOrientation));
    formData.append('preferredAgeMin', this.profile.ageRangeMin.toString());
    formData.append('preferredAgeMax', this.profile.ageRangeMax.toString());

    // Add languages
    this.profile.languages.forEach((lang, index) => {
      formData.append(`languages[${index}]`, this.mapLanguage(lang));
    });

    // Add hobbies/interests
    this.profile.hobbies.forEach((hobby, index) => {
      formData.append(`hobbies[${index}]`, this.mapHobby(hobby));
    });

    // Add photos
    this.profile.photos.forEach((photo) => {
      formData.append('photos', photo);
    });

    // Call register endpoint
    this.authService.registerComplete(formData).subscribe({
      next: (response: any) => {
        if (response && response.token) {
          this.authService.saveToken(response.token);
          sessionStorage.removeItem('registerData');
          this.router.navigate(['/']);
        } else {
          this.error = 'Registration successful but no token received.';
          this.isSubmitting = false;
        }
      },
      error: (err) => {
        console.error('Registration failed', err);
        this.error = err?.error?.message || err?.error?.title || 'Registration failed. Please try again.';
        this.isSubmitting = false;
      }
    });
  }

  private mapGender(gender: string): string {
    const map: { [key: string]: string } = {
      'male': '0',
      'female': '1',
      'non-binary': '2'
    };
    return map[gender] || '0';
  }

  private mapLanguage(language: string): string {
    const map: { [key: string]: string } = {
      'English': '0',
      'Romanian': '1',
      'Spanish': '2',
      'French': '3',
      'German': '4'
    };
    return map[language] || '0';
  }

  private mapHobby(hobby: string): string {
    const map: { [key: string]: string } = {
      'Gym': '0',
      'Travel': '1',
      'Gaming': '2',
      'Cooking': '3',
      'Music': '4',
      'Hiking': '5',
      'Art': '6',
      'Tech': '7',
      'Movies': '8',
      'Pets': '9',
      'Sports': '10',
      'Dancing': '11',
      'Reading': '12',
      'Photography': '13',
      'Yoga': '14',
      'Crafts': '15',
      'Gardening': '16',
      'Fishing': '17',
      'Volunteering': '18'
    };
    return map[hobby] || '0';
  }

  private mapRelationshipGoal(type: string): string {
    const map: { [key: string]: string } = {
      'casual': '0',
      'serious': '1',
      'marriage': '2'
    };
    return map[type] || '0';
  }

  private mapSexualOrientation(orientation: string): string {
    const map: { [key: string]: string } = {
      'straight': '0',
      'gay': '1',
      'lesbian': '2',
      'bisexual': '3'
    };
    return map[orientation] || '0';
  }
}
