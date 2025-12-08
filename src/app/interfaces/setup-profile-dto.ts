export interface SetupProfileDto {
  age: number;
  gender: string;
  height: number;
  location: string;
  languages: string[];
  hobbies: string[];
  bio: string;
  sexualOrientation: string;
  relationshipType: string;
  ageRangeMin: number;
  ageRangeMax: number;
}

export interface SetupProfileResponse {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

