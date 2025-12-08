# Ghid de Implementare Backend - Setup Profile

## Prezentare Generală

Acest document explică cum funcționează componenta `setup-profile` din frontend și oferă specificații detaliate pentru implementarea endpoint-urilor necesare în backend (.NET).

Componenta permite utilizatorilor să-și completeze profilul în 4 pași:
1. **Informații de bază** - vârstă, sex, înălțime, locație, limbi
2. **Fotografii** - încărcare poze profil (minim 2)
3. **Interese** - hobby-uri (max 5) și bio
4. **Preferințe** - orientare sexuală, tip relație, interval vârstă dorit

---

## Structura de Date (DTO-uri)

### SetupProfileDto (Frontend → Backend)

```typescript
interface SetupProfileDto {
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
```

### SetupProfileResponse (Backend → Frontend)

```typescript
interface SetupProfileResponse {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}
```

---

## Endpoint-uri Necesare

### 1. PUT `/api/users/{userId}/setup-profile`

**Descriere:** Completează/actualizează profilul utilizatorului cu toate informațiile + fotografii.

**Metoda HTTP:** `PUT`

**Parametri URL:**
- `userId` (long) - ID-ul utilizatorului autentificat

**Request Body:** `multipart/form-data` (FormData)

Structura FormData trimisă de frontend:
```
age: string (convertit din number)
gender: string
height: string (convertit din number)
location: string
languages: string[] (array de stringuri)
photos: File[] (array de fișiere imagine)
hobbies: string[] (array de stringuri)
bio: string
sexualOrientation: string
relationshipType: string
ageRangeMin: string (convertit din number)
ageRangeMax: string (convertit din number)
```

**Response:** `SetupProfileResponse` (JSON)

**Status Codes:**
- `200 OK` - Profil completat cu succes
- `400 Bad Request` - Date invalide
- `401 Unauthorized` - Utilizator neautentificat
- `404 Not Found` - Utilizator inexistent
- `500 Internal Server Error` - Eroare server

**Exemplu de implementare .NET:**

```csharp
[HttpPut("{userId}/setup-profile")]
[ProducesResponseType(StatusCodes.Status200OK)]
[ProducesResponseType(StatusCodes.Status400BadRequest)]
[ProducesResponseType(StatusCodes.Status401Unauthorized)]
[Authorize] // Asigură-te că utilizatorul este autentificat
public async Task<ActionResult<SetupProfileResponse>> SetupProfile(
    long userId,
    [FromForm] SetupProfileRequest request)
{
    // Validare: userId din token == userId din URL
    var authenticatedUserId = GetUserIdFromToken();
    if (authenticatedUserId != userId)
    {
        return Unauthorized("You can only update your own profile");
    }

    // Validare request
    if (!ModelState.IsValid)
    {
        return BadRequest(ModelState);
    }

    // Procesare fotografii
    var photoUrls = await ProcessPhotos(request.Photos);

    // Actualizare profil în baza de date
    var response = await _userService.SetupProfileAsync(userId, request, photoUrls);

    return Ok(response);
}
```

**DTO Request .NET:**

```csharp
public class SetupProfileRequest
{
    [Required]
    [Range(18, 120)]
    public int Age { get; set; }

    [Required]
    [StringLength(50)]
    public string Gender { get; set; }

    [Required]
    [Range(100, 250)]
    public int Height { get; set; }

    [Required]
    [StringLength(100)]
    public string Location { get; set; }

    [Required]
    [MinLength(1)]
    public List<string> Languages { get; set; }

    [Required]
    [MinLength(2)]
    [MaxLength(6)]
    public List<IFormFile> Photos { get; set; }

    [Required]
    [MinLength(1)]
    [MaxLength(5)]
    public List<string> Hobbies { get; set; }

    [Required]
    [StringLength(500, MinimumLength = 10)]
    public string Bio { get; set; }

    [Required]
    [StringLength(50)]
    public string SexualOrientation { get; set; }

    [Required]
    [StringLength(50)]
    public string RelationshipType { get; set; }

    [Required]
    [Range(18, 100)]
    public int AgeRangeMin { get; set; }

    [Required]
    [Range(18, 120)]
    public int AgeRangeMax { get; set; }
}
```

**Validări Importante:**
- `AgeRangeMax` > `AgeRangeMin`
- Minim 2 poze, maxim 6
- Minim 1 hobby, maxim 5
- Bio între 10-500 caractere
- Verifică că limbile și hobby-urile trimise există în baza de date

---

### 2. POST `/api/users/{userId}/photos`

**Descriere:** Upload separat de fotografii (opțional, dacă vrei să permiți upload incremental).

**Metoda HTTP:** `POST`

**Parametri URL:**
- `userId` (long) - ID-ul utilizatorului

**Request Body:** `multipart/form-data`

```
photos: File[] (array de fișiere imagine)
```

**Response:** 
```json
{
  "uploadedPhotos": [
    {
      "photoId": 1,
      "url": "https://storage.example.com/users/123/photo1.jpg",
      "isPrimary": true
    },
    {
      "photoId": 2,
      "url": "https://storage.example.com/users/123/photo2.jpg",
      "isPrimary": false
    }
  ]
}
```

**Status Codes:**
- `200 OK` - Fotografii încărcate cu succes
- `400 Bad Request` - Fișiere invalide sau prea multe poze
- `401 Unauthorized` - Utilizator neautentificat
- `413 Payload Too Large` - Fișiere prea mari

**Exemplu implementare .NET:**

```csharp
[HttpPost("{userId}/photos")]
[ProducesResponseType(StatusCodes.Status200OK)]
[ProducesResponseType(StatusCodes.Status400BadRequest)]
[Authorize]
public async Task<ActionResult<PhotoUploadResponse>> UploadPhotos(
    long userId,
    [FromForm] List<IFormFile> photos)
{
    // Validare autorizare
    var authenticatedUserId = GetUserIdFromToken();
    if (authenticatedUserId != userId)
    {
        return Unauthorized();
    }

    // Validare poze
    if (photos == null || photos.Count == 0)
    {
        return BadRequest("No photos provided");
    }

    if (photos.Count > 6)
    {
        return BadRequest("Maximum 6 photos allowed");
    }

    // Validare tip fișier și dimensiune
    var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp" };
    const long maxFileSize = 5 * 1024 * 1024; // 5MB

    foreach (var photo in photos)
    {
        var extension = Path.GetExtension(photo.FileName).ToLowerInvariant();
        if (!allowedExtensions.Contains(extension))
        {
            return BadRequest($"Invalid file type: {photo.FileName}");
        }

        if (photo.Length > maxFileSize)
        {
            return BadRequest($"File too large: {photo.FileName}");
        }
    }

    // Upload și salvare
    var uploadedPhotos = await _photoService.UploadPhotosAsync(userId, photos);

    return Ok(new PhotoUploadResponse { UploadedPhotos = uploadedPhotos });
}
```

**Considerații Storage:**
- Salvează pozele pe disk, Azure Blob Storage, AWS S3, sau alt serviciu cloud
- Generează thumbnail-uri pentru optimizare
- Stochează calea/URL-ul în baza de date
- Prima poză devine automat poza de profil (isPrimary = true)

---

### 3. GET `/api/hobbies`

**Descriere:** Returnează lista de hobby-uri disponibile.

**Metoda HTTP:** `GET`

**Request Body:** Niciunul

**Response:** `string[]` (JSON)

```json
[
  "Gym",
  "Travel",
  "Gaming",
  "Cooking",
  "Music",
  "Hiking",
  "Art",
  "Tech",
  "Movies",
  "Pets",
  "Sports",
  "Dancing",
  "Reading",
  "Photography",
  "Yoga",
  "Crafts",
  "Gardening",
  "Fishing",
  "Volunteering"
]
```

**Status Codes:**
- `200 OK` - Lista returnată cu succes

**Exemplu implementare .NET:**

```csharp
[HttpGet("hobbies")]
[ProducesResponseType(StatusCodes.Status200OK)]
public async Task<ActionResult<IEnumerable<string>>> GetHobbies()
{
    var hobbies = await _hobbyService.GetAllHobbiesAsync();
    return Ok(hobbies);
}
```

**Implementare Service:**
```csharp
public async Task<IEnumerable<string>> GetAllHobbiesAsync()
{
    // Opțiune 1: Citire din baza de date
    return await _context.Hobbies
        .OrderBy(h => h.Name)
        .Select(h => h.Name)
        .ToListAsync();

    // Opțiune 2: Lista hardcoded (mai simplu pentru început)
    return new List<string>
    {
        "Gym", "Travel", "Gaming", "Cooking",
        "Music", "Hiking", "Art", "Tech", "Movies", "Pets",
        "Sports", "Dancing", "Reading", "Photography",
        "Yoga", "Crafts", "Gardening", "Fishing", "Volunteering"
    };
}
```

---

### 4. GET `/api/languages`

**Descriere:** Returnează lista de limbi disponibile.

**Metoda HTTP:** `GET`

**Request Body:** Niciunul

**Response:** `string[]` (JSON)

```json
[
  "English",
  "Romanian",
  "Spanish",
  "French",
  "German",
  "Italian",
  "Portuguese",
  "Chinese",
  "Japanese",
  "Arabic"
]
```

**Status Codes:**
- `200 OK` - Lista returnată cu succes

**Exemplu implementare .NET:**

```csharp
[HttpGet("languages")]
[ProducesResponseType(StatusCodes.Status200OK)]
public async Task<ActionResult<IEnumerable<string>>> GetLanguages()
{
    var languages = await _languageService.GetAllLanguagesAsync();
    return Ok(languages);
}
```

---

## Structura Bazei de Date

### Tabel: Users (extins)

```sql
CREATE TABLE Users (
    Id BIGINT PRIMARY KEY IDENTITY(1,1),
    FirstName NVARCHAR(100) NOT NULL,
    LastName NVARCHAR(100) NOT NULL,
    Email NVARCHAR(255) NOT NULL UNIQUE,
    Password NVARCHAR(255) NOT NULL,
    IsAdmin BIT NOT NULL DEFAULT 0,
    
    -- Informații profil
    Age INT NULL,
    Gender NVARCHAR(50) NULL,
    Height INT NULL,
    Location NVARCHAR(100) NULL,
    Bio NVARCHAR(500) NULL,
    SexualOrientation NVARCHAR(50) NULL,
    RelationshipType NVARCHAR(50) NULL,
    AgeRangeMin INT NULL,
    AgeRangeMax INT NULL,
    ProfileCompleted BIT NOT NULL DEFAULT 0,
    
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NULL
);
```

### Tabel: UserPhotos

```sql
CREATE TABLE UserPhotos (
    Id BIGINT PRIMARY KEY IDENTITY(1,1),
    UserId BIGINT NOT NULL,
    PhotoUrl NVARCHAR(500) NOT NULL,
    IsPrimary BIT NOT NULL DEFAULT 0,
    UploadedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    
    FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE
);
```

### Tabel: Hobbies

```sql
CREATE TABLE Hobbies (
    Id INT PRIMARY KEY IDENTITY(1,1),
    Name NVARCHAR(50) NOT NULL UNIQUE
);
```

### Tabel: UserHobbies (Many-to-Many)

```sql
CREATE TABLE UserHobbies (
    UserId BIGINT NOT NULL,
    HobbyId INT NOT NULL,
    
    PRIMARY KEY (UserId, HobbyId),
    FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE,
    FOREIGN KEY (HobbyId) REFERENCES Hobbies(Id) ON DELETE CASCADE
);
```

### Tabel: Languages

```sql
CREATE TABLE Languages (
    Id INT PRIMARY KEY IDENTITY(1,1),
    Name NVARCHAR(50) NOT NULL UNIQUE
);
```

### Tabel: UserLanguages (Many-to-Many)

```sql
CREATE TABLE UserLanguages (
    UserId BIGINT NOT NULL,
    LanguageId INT NOT NULL,
    
    PRIMARY KEY (UserId, LanguageId),
    FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE,
    FOREIGN KEY (LanguageId) REFERENCES Languages(Id) ON DELETE CASCADE
);
```

---

## Fluxul de Date (Flow)

### 1. Utilizatorul accesează pagina de setup profile

```
Frontend                          Backend
   |                                 |
   |------ GET /api/hobbies -------->|
   |<----- ["Gym", "Travel", ...] ---|
   |                                 |
   |------ GET /api/languages ------>|
   |<----- ["English", "Romanian"...]|
```

### 2. Utilizatorul completează formularul și trimite

```
Frontend                                    Backend
   |                                           |
   |-- PUT /api/users/123/setup-profile ------>|
   |   (multipart/form-data cu toate datele)   |
   |                                           |
   |                                        [Validare]
   |                                        [Procesare poze]
   |                                        [Update DB]
   |                                           |
   |<----- SetupProfileResponse --------------|
   |   { id, firstName, lastName, email }     |
   |                                           |
   |------- Navigate to /home ----------------|
```

---

## Service Layer (.NET)

### IUserService Interface

```csharp
public interface IUserService
{
    Task<SetupProfileResponse> SetupProfileAsync(
        long userId, 
        SetupProfileRequest request, 
        List<string> photoUrls);
    
    Task<UserDto> GetUserAsync(GetUserRequest request);
    Task<IEnumerable<UserDto>> GetAllUsersAsync();
    Task<UserDto> AddUserAsync(AddUserRequest request);
    Task<UserDto> EditUserAsync(EditUserRequest request);
}
```

### UserService Implementation

```csharp
public async Task<SetupProfileResponse> SetupProfileAsync(
    long userId, 
    SetupProfileRequest request, 
    List<string> photoUrls)
{
    // 1. Găsește utilizatorul
    var user = await _unitOfWork.UserRepository.GetByIdAsync(userId);
    if (user == null)
    {
        throw new NotFoundException($"User with ID {userId} not found");
    }

    // 2. Actualizează câmpurile utilizatorului
    user.UpdateAge(request.Age);
    user.UpdateGender(request.Gender);
    user.UpdateHeight(request.Height);
    user.UpdateLocation(request.Location);
    user.UpdateBio(request.Bio);
    user.UpdateSexualOrientation(request.SexualOrientation);
    user.UpdateRelationshipType(request.RelationshipType);
    user.UpdateAgeRange(request.AgeRangeMin, request.AgeRangeMax);
    user.MarkProfileAsCompleted();

    // 3. Procesează hobby-urile
    await _hobbyService.UpdateUserHobbiesAsync(userId, request.Hobbies);

    // 4. Procesează limbile
    await _languageService.UpdateUserLanguagesAsync(userId, request.Languages);

    // 5. Salvează pozele
    await _photoService.SaveUserPhotosAsync(userId, photoUrls);

    // 6. Salvează în baza de date
    await _unitOfWork.SaveChangesAsync();

    // 7. Returnează răspunsul
    return new SetupProfileResponse
    {
        Id = user.Id,
        FirstName = user.FirstName,
        LastName = user.LastName,
        Email = user.Email
    };
}
```

---

## Photo Service (.NET)

```csharp
public interface IPhotoService
{
    Task<List<string>> UploadPhotosAsync(long userId, List<IFormFile> photos);
    Task SaveUserPhotosAsync(long userId, List<string> photoUrls);
    Task<List<UserPhotoDto>> GetUserPhotosAsync(long userId);
}

public class PhotoService : IPhotoService
{
    private readonly IWebHostEnvironment _environment;
    private readonly IUnitOfWork _unitOfWork;

    public async Task<List<string>> UploadPhotosAsync(long userId, List<IFormFile> photos)
    {
        var photoUrls = new List<string>();
        var uploadsFolder = Path.Combine(_environment.WebRootPath, "uploads", "users", userId.ToString());
        
        // Creează directorul dacă nu există
        Directory.CreateDirectory(uploadsFolder);

        foreach (var photo in photos)
        {
            // Generează nume unic pentru fișier
            var uniqueFileName = $"{Guid.NewGuid()}_{photo.FileName}";
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            // Salvează fișierul
            using (var fileStream = new FileStream(filePath, FileMode.Create))
            {
                await photo.CopyToAsync(fileStream);
            }

            // Construiește URL-ul
            var photoUrl = $"/uploads/users/{userId}/{uniqueFileName}";
            photoUrls.Add(photoUrl);
        }

        return photoUrls;
    }

    public async Task SaveUserPhotosAsync(long userId, List<string> photoUrls)
    {
        // Șterge pozele existente
        var existingPhotos = await _unitOfWork.PhotoRepository.GetByUserIdAsync(userId);
        foreach (var photo in existingPhotos)
        {
            await _unitOfWork.PhotoRepository.DeleteAsync(photo);
        }

        // Adaugă pozele noi
        for (int i = 0; i < photoUrls.Count; i++)
        {
            var photo = UserPhoto.Create(userId, photoUrls[i], i == 0); // Prima poză = primary
            await _unitOfWork.PhotoRepository.AddAsync(photo);
        }
    }
}
```

---

## Autentificare și Autorizare

### Extragerea User ID din Token JWT

```csharp
private long GetUserIdFromToken()
{
    var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
    if (userIdClaim == null)
    {
        throw new UnauthorizedException("User ID not found in token");
    }

    return long.Parse(userIdClaim.Value);
}
```

### Validare Ownership

```csharp
private async Task<bool> ValidateUserOwnership(long userId)
{
    var authenticatedUserId = GetUserIdFromToken();
    return authenticatedUserId == userId;
}
```

---

## Gestionarea Erorilor

### Custom Exceptions

```csharp
public class NotFoundException : Exception
{
    public NotFoundException(string message) : base(message) { }
}

public class UnauthorizedException : Exception
{
    public UnauthorizedException(string message) : base(message) { }
}

public class BadRequestException : Exception
{
    public BadRequestException(string message) : base(message) { }
}
```

### Global Exception Handler

```csharp
public class ExceptionHandlerMiddleware
{
    private readonly RequestDelegate _next;

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (NotFoundException ex)
        {
            context.Response.StatusCode = StatusCodes.Status404NotFound;
            await context.Response.WriteAsJsonAsync(new { error = ex.Message });
        }
        catch (UnauthorizedException ex)
        {
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            await context.Response.WriteAsJsonAsync(new { error = ex.Message });
        }
        catch (BadRequestException ex)
        {
            context.Response.StatusCode = StatusCodes.Status400BadRequest;
            await context.Response.WriteAsJsonAsync(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            context.Response.StatusCode = StatusCodes.Status500InternalServerError;
            await context.Response.WriteAsJsonAsync(new { error = "An error occurred" });
        }
    }
}
```

---

## Testing

### Exemplu Request cu Postman/cURL

```bash
curl -X PUT "http://localhost:5098/api/users/123/setup-profile" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "age=25" \
  -F "gender=Male" \
  -F "height=180" \
  -F "location=Bucharest" \
  -F "languages=English" \
  -F "languages=Romanian" \
  -F "hobbies=Gym" \
  -F "hobbies=Travel" \
  -F "hobbies=Gaming" \
  -F "bio=Love traveling and meeting new people!" \
  -F "sexualOrientation=Straight" \
  -F "relationshipType=Long-term" \
  -F "ageRangeMin=22" \
  -F "ageRangeMax=30" \
  -F "photos=@photo1.jpg" \
  -F "photos=@photo2.jpg"
```

### Unit Test Example

```csharp
[Fact]
public async Task SetupProfile_ValidRequest_ReturnsSuccess()
{
    // Arrange
    var userId = 123L;
    var request = new SetupProfileRequest
    {
        Age = 25,
        Gender = "Male",
        Height = 180,
        Location = "Bucharest",
        Languages = new List<string> { "English", "Romanian" },
        Hobbies = new List<string> { "Gym", "Travel" },
        Bio = "Test bio",
        SexualOrientation = "Straight",
        RelationshipType = "Long-term",
        AgeRangeMin = 22,
        AgeRangeMax = 30
    };

    // Act
    var result = await _controller.SetupProfile(userId, request);

    // Assert
    var okResult = Assert.IsType<OkObjectResult>(result.Result);
    var response = Assert.IsType<SetupProfileResponse>(okResult.Value);
    Assert.Equal(userId, response.Id);
}
```

---

## Checklist Implementare

- [ ] Creează migration pentru extinderea tabelului Users
- [ ] Creează tabelele UserPhotos, Hobbies, UserHobbies, Languages, UserLanguages
- [ ] Implementează `SetupProfileRequest` DTO cu validări
- [ ] Implementează `SetupProfileResponse` DTO
- [ ] Creează endpoint `PUT /api/users/{userId}/setup-profile`
- [ ] Implementează `IPhotoService` pentru upload poze
- [ ] Creează endpoint `POST /api/users/{userId}/photos`
- [ ] Creează endpoint `GET /api/hobbies`
- [ ] Creează endpoint `GET /api/languages`
- [ ] Implementează logica în `UserService.SetupProfileAsync()`
- [ ] Adaugă validări pentru autentificare și autorizare
- [ ] Testează toate endpoint-urile cu Postman
- [ ] Adaugă unit tests
- [ ] Configurează storage pentru poze (local/cloud)
- [ ] Documentează API-ul cu Swagger

---

## Note Importante

1. **Securitate:**
   - Întotdeauna verifică că utilizatorul autentificat poate modifica doar propriul profil
   - Validează dimensiunea și tipul fișierelor încărcate
   - Sanitizează input-urile pentru a preveni SQL injection și XSS

2. **Performance:**
   - Folosește thumbnail-uri pentru poze
   - Consideră caching pentru hobby-uri și limbi
   - Optimizează query-urile pentruMany-to-Many relationships

3. **Scalabilitate:**
   - Folosește cloud storage (Azure Blob, AWS S3) pentru poze în producție
   - Implementează queue-uri pentru procesarea pozelor (resize, thumbnail)
   - Consideră CDN pentru servirea pozelor

4. **Extensibilitate:**
   - Profilul poate fi extins cu mai multe câmpuri în viitor
   - Endpoint-ul de update profile poate fi reutilizat pentru editări ulterioare

---

## Resurse Utile

- [ASP.NET Core File Upload](https://learn.microsoft.com/en-us/aspnet/core/mvc/models/file-uploads)
- [Entity Framework Relationships](https://learn.microsoft.com/en-us/ef/core/modeling/relationships)
- [JWT Authentication in .NET](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/jwt-authn)
- [Model Validation in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/mvc/models/validation)

---

## Contact

Pentru întrebări sau clarificări despre implementare, contactează echipa de frontend.

**Ultima actualizare:** 2025-12-08

