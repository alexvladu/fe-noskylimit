import {Component, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Router} from '@angular/router';

@Component({
  selector: 'app-setup-profile',
  imports: [CommonModule, FormsModule],
  templateUrl: './setup-profile.html',
  styleUrl: './setup-profile.scss',
})
export class SetupProfile {
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

  profile = {
    age: null,
    gender: '',
    height: null,
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

  constructor(private router: Router) {}

  ngOnInit() {
    // TODO: BACKEND - GET hobbies, languages from API if needed
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
    // TODO: BACKEND - implementare apel API pentru salvare profil

    /* const formData = new FormData();

    // Logica adaugare campuri in formData...

    this.apiService.completeProfile(formData).subscribe({
      next: () => this.router.navigate(['/home']),
      error: (err) => console.error(err)
    });
    */
  }
}
