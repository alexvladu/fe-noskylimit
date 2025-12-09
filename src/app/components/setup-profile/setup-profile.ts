import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SetupProfileService } from '../../services/user/setup-profile.service';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-setup-profile',
  imports: [CommonModule, FormsModule],
  templateUrl: './setup-profile.html',
  styleUrl: './setup-profile.scss',
})
export class SetupProfile implements OnInit {
  private setupProfileService = inject(SetupProfileService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  step = 0; // Start at 0 for credentials
  totalSteps = 5; // 0: credentials, 1: basics, 2: photos, 3: hobbies, 4: preferences

  // Data Pools (Provizoriu)
  availableHobbies: string[] = [
    'Gym', 'Travel', 'Gaming', 'Cooking',
    'Music', 'Hiking', 'Art', 'Tech', 'Movies', 'Pets',
    'Sports', 'Dancing', 'Reading', 'Photography',
    'Yoga', 'Crafts', 'Gardening', 'Fishing', 'Volunteering'
  ];
  availableLanguages: string[] = ['English', 'Romanian', 'Spanish', 'French', 'German'];

  // Credentials (collected from register or added here)
  credentials = {
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  };

  profile = {
    age: null as number | null,
    gender: null as number | null, // Backend enum: 0=Male, 1=Female, 2=Other
    height: null as number | null,
    location: '',
    languages: [] as number[], // Backend enum values
    photos: [] as File[],
    photoPreviews: [] as string[],
    hobbies: [] as number[], // Backend enum values (Interest)
    bio: '',
    sexualOrientation: null as number | null, // Backend enum: 0=Straight, 1=Gay, 2=Bisexual, 3=Other
    relationshipGoal: null as number | null, // Backend enum: 0=SeriousRelationship, 1=CasualDating, 2=Friendship
    ageRangeMin: 18,
    ageRangeMax: 50
  };

  ngOnInit() {
    // Check if credentials are available from register page
    const storedCredentials = sessionStorage.getItem('registrationCredentials');
    if (storedCredentials) {
      try {
        this.credentials = JSON.parse(storedCredentials);
        // If credentials are loaded, skip step 0 and start from step 1
        this.step = 1;
        this.totalSteps = 4; // Only 4 steps now (basics, photos, hobbies, preferences)
      } catch (error) {
        console.error('Error parsing credentials:', error);
      }
    }

    // Load hobbies and languages from API
    // TODO: Uncomment when backend implements these endpoints
    // this.setupProfileService.getAvailableHobbies().subscribe({
    //   next: (hobbies) => this.availableHobbies = hobbies,
    //   error: (err) => console.error('Error loading hobbies:', err)
    // });

    // this.setupProfileService.getAvailableLanguages().subscribe({
    //   next: (languages) => this.availableLanguages = languages,
    //   error: (err) => console.error('Error loading languages:', err)
    // });
  }

  // --- Logică pentru Hobbies (Max 5) ---
  // Mapping between display names and backend enum values
  private hobbyEnumMap: { [key: string]: number } = {
    'Gym': 0, 'Travel': 1, 'Gaming': 2, 'Cooking': 3, 'Music': 4,
    'Hiking': 5, 'Art': 6, 'Tech': 7, 'Movies': 8, 'Pets': 9,
    'Sports': 10, 'Dancing': 11, 'Reading': 12, 'Photography': 13,
    'Yoga': 14, 'Crafts': 15, 'Gardening': 16, 'Fishing': 17, 'Volunteering': 18
  };

  toggleHobby(hobby: string) {
    const hobbyEnum = this.hobbyEnumMap[hobby];
    const index = this.profile.hobbies.indexOf(hobbyEnum);

    if (index > -1) {
      this.profile.hobbies.splice(index, 1);
    } else {
      if (this.profile.hobbies.length < 5) {
        this.profile.hobbies.push(hobbyEnum);
      } else {
        alert('You can select up to 5 hobbies only.');
      }
    }
  }

  isHobbySelected(hobby: string): boolean {
    const hobbyEnum = this.hobbyEnumMap[hobby];
    return this.profile.hobbies.includes(hobbyEnum);
  }

  // --- Logică pentru Languages (Multiple selection) ---
  toggleLanguage(languageEnum: number) {
    const index = this.profile.languages.indexOf(languageEnum);

    if (index > -1) {
      // Language already selected, remove it
      this.profile.languages.splice(index, 1);
    } else {
      // Language not selected, add it
      this.profile.languages.push(languageEnum);
    }
  }

  isLanguageSelected(languageEnum: number): boolean {
    return this.profile.languages.includes(languageEnum);
  }

  // --- Logică pentru Photos ---
  async onFileSelected(event: any) {
    const files: FileList = event.target.files;

    if (!files || files.length === 0) {
      return;
    }

    // Check if adding these files would exceed the maximum
    const totalPhotos = this.profile.photos.length + files.length;
    if (totalPhotos > 6) {
      alert(`You can upload a maximum of 6 photos. You currently have ${this.profile.photos.length} photo(s) and tried to add ${files.length} more.`);
      // Reset the input
      event.target.value = '';
      return;
    }

    // Convert FileList to array
    const filesArray = Array.from(files);

    // Add all files to photos array immediately
    filesArray.forEach((file: File) => {
      this.profile.photos.push(file);
    });

    // Create previews for all files using Promise.all to maintain order
    try {
      const previews = await Promise.all(
        filesArray.map((file: File) => this.readFileAsDataURL(file))
      );

      // Add all previews in correct order
      previews.forEach((preview) => {
        this.profile.photoPreviews.push(preview);
      });

      // Manually trigger change detection to update the view
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error reading files:', error);
      alert('Error loading photo previews. Please try again.');
    }

    // Reset the input so the same files can be selected again if needed
    event.target.value = '';
  }

  // Helper method to read a file as DataURL using Promise
  private readFileAsDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e: any) => {
        resolve(e.target.result);
      };

      reader.onerror = (error) => {
        reject(error);
      };

      reader.readAsDataURL(file);
    });
  }

  removePhoto(index: number) {
    if (index >= 0 && index < this.profile.photos.length) {
      this.profile.photos.splice(index, 1);
      this.profile.photoPreviews.splice(index, 1);
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
      case 0:
        // Validate credentials
        if (!this.credentials.firstName || !this.credentials.lastName) {
          alert('Please provide your first and last name.');
          return false;
        }
        if (!this.credentials.email || !this.credentials.email.includes('@')) {
          alert('Please provide a valid email address.');
          return false;
        }
        if (!this.credentials.password || this.credentials.password.length < 6) {
          alert('Password must be at least 6 characters long.');
          return false;
        }
        break;
      case 1:
        if (!this.profile.age || !this.profile.height || this.profile.gender === null || !this.profile.location || this.profile.languages.length === 0) {
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
        if (this.profile.hobbies.length === 0 || !this.profile.bio || this.profile.bio.length < 10) {
          alert('Please select at least one hobby and provide a bio (minimum 10 characters).');
          return false;
        }
        break;
      case 4:
        if (this.profile.sexualOrientation === null || this.profile.relationshipGoal === null || !this.profile.ageRangeMin || !this.profile.ageRangeMax) {
          alert('Please complete all fields.');
          return false;
        }
        break;
    }
    return true;
  }

  prevStep() {
    // Check if credentials came from register (via sessionStorage)
    const hasStoredCredentials = sessionStorage.getItem('registrationCredentials') !== null;

    // If credentials are from register, don't go back before step 1
    const minStep = hasStoredCredentials ? 1 : 0;

    if (this.step > minStep) {
      this.step--;
    }
  }

  submitProfile() {
    // Build FormData to match backend's RegisterUserRequest
    const formData = new FormData();

    // Basic Information (Step 1)
    formData.append('Age', this.profile.age!.toString());
    formData.append('Height', this.profile.height!.toString());
    formData.append('Gender', this.profile.gender!.toString());
    formData.append('Location', this.profile.location);

    // Languages (as enum values)
    this.profile.languages.forEach((language, index) => {
      formData.append(`Languages[${index}]`, language.toString());
    });

    // Photos (Step 2) - must have at least 2
    this.profile.photos.forEach((photo) => {
      formData.append(`Photos`, photo, photo.name);
    });

    // Passions & Interests (Step 3)
    this.profile.hobbies.forEach((hobby, index) => {
      formData.append(`Hobbies[${index}]`, hobby.toString());
    });
    formData.append('Bio', this.profile.bio);

    // Preferences (Step 4)
    formData.append('RelationshipGoal', this.profile.relationshipGoal!.toString());
    formData.append('SexualOrientation', this.profile.sexualOrientation!.toString());
    formData.append('PreferredAgeMin', this.profile.ageRangeMin.toString());
    formData.append('PreferredAgeMax', this.profile.ageRangeMax.toString());

    // Login credentials (required by RegisterUserRequest)
    formData.append('FirstName', this.credentials.firstName);
    formData.append('LastName', this.credentials.lastName);
    formData.append('Email', this.credentials.email);
    formData.append('Password', this.credentials.password);

    // Call the register endpoint
    this.setupProfileService.registerUserWithProfile(formData).subscribe({
      next: (response) => {
        console.log('Registration successful:', response);

        // After successful registration, automatically login to get token
        this.authService.login({
          email: this.credentials.email,
          password: this.credentials.password
        }).subscribe({
          next: (loginResponse) => {
            console.log('Auto-login successful:', loginResponse);

            // Save the token from login response
            if (loginResponse && loginResponse.token) {
              this.authService.saveToken(loginResponse.token);
            }

            // Clear credentials from sessionStorage after successful login
            sessionStorage.removeItem('registrationCredentials');

            // Navigate to home
            this.router.navigate(['/home']);
          },
          error: (loginErr) => {
            console.error('Auto-login failed after registration:', loginErr);

            // Clear credentials anyway
            sessionStorage.removeItem('registrationCredentials');

            // Registration was successful but login failed, redirect to login page
            alert('Registration successful! Please login to continue.');
            this.router.navigate(['/login']);
          }
        });
      },
      error: (err) => {
        console.error('Error during registration:', err);
        alert('Failed to complete registration. Please try again.');
      }
    });
  }

  /**
   * Decode JWT token to extract user ID
   * The token contains a 'userId' claim as per backend implementation
   */
  private getUserIdFromAuth(): number | null {
    const token = localStorage.getItem('token');
    if (!token) {
      return null;
    }

    try {
      // JWT tokens have 3 parts separated by dots: header.payload.signature
      const payload = token.split('.')[1];
      const decodedPayload = JSON.parse(atob(payload));
      return decodedPayload.userId ? parseInt(decodedPayload.userId) : null;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }
}
