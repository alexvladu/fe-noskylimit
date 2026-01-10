# NoSkyLimit - Frontend Application

## Cuprins

- [Despre Proiect](#despre-proiect)
- [Tehnologii](#tehnologii)
- [Arhitectură](#arhitectură)
- [Structura Proiectului](#structura-proiectului)
- [Componente](#componente)
- [Servicii](#servicii)
- [Rutare și Guards](#rutare-și-guards)
- [Autentificare](#autentificare)
- [Instalare](#instalare)
- [Comenzi](#comenzi)
- [Ghid Dezvoltare](#ghid-dezvoltare)

---

## Despre Proiect

NoSkyLimit este o aplicație web Angular pentru autentificare, înregistrare și management de profil utilizatori. Aplicația folosește cele mai recente practici Angular cu standalone components și zoneless change detection.

## Tehnologii

**Framework și Versiuni:**

- Angular 20.3.0 (Standalone Components)
- TypeScript 5.9.2
- RxJS 7.8.0
- SCSS

**Dependențe Principale:**

- `@angular/core`, `@angular/router`, `@angular/forms` - Core Angular
- `@fortawesome/angular-fontawesome` - Iconuri
- `js-yaml` - Parsare YAML

**Tools:**

- Angular CLI 20.3.6
- Karma + Jasmine - Unit testing
- Prettier - Code formatting

**Caracteristici:**

- Zoneless Change Detection - Performanță îmbunătățită
- Standalone Components - Fără NgModule
- Functional Guards - Guards moderne
- HTTP Interceptors - Adăugare automată JWT

## Arhitectură

Aplicația folosește arhitectură component-based cu următoarele principii:

**Standalone Components:**
Toate componentele sunt standalone (fără NgModule).

**Dependency Injection:**
Servicii injectate cu `inject()` function sau constructor injection.

**Route Guards:**

- **AuthGuard** - Protejează rute autentificate
- **GuestGuard** - Restricționează acces utilizatori autentificați la pagini publice

**HTTP Interceptors:**

- **AuthInterceptor** - Adaugă automat JWT token în header-ul fiecărei cereri

**Layouts:**

- **MainLayout** - Layout pentru pagini autentificate cu navigare

## Structura Proiectului

```
src/app/
├── components/              # Componente UI
│   ├── login/              # Autentificare (email, password)
│   ├── register/           # Înregistrare utilizatori
│   ├── setup-profile/      # Configurare profil după înregistrare
│   ├── home/               # Pagina principală (AuthGuard)
│   ├── inbox/              # Mesaje (AuthGuard)
│   └── navigation/         # Bară navigare + settings modal
│
├── services/               # Business logic
│   ├── auth/              # AuthService - login, logout, token management
│   ├── user/              # SetupProfileService - gestionare profil
│   └── ping/              # PingService - health check backend
│
├── guards/                # Protecție rute
│   ├── auth.guard.ts     # Verifică token, redirect la /login
│   └── guest.guard.ts    # Redirect la /home dacă autentificat
│
├── interceptors/          # HTTP interceptors
│   └── auth-interceptor.ts  # Adaugă Bearer token, gestionează 401
│
├── interfaces/            # TypeScript DTOs
│   ├── login-dto.ts
│   ├── login-response.ts
│   └── setup-profile-dto.ts
│
├── layouts/              # Layout wrappers
│   └── main-layout/     # Include navigation + router-outlet
│
├── app.config.ts        # Configurare providers (HttpClient, Interceptors, Router)
├── app.routes.ts        # Definire rute și guards
└── app.ts              # Root component

src/
├── enviroment.ts        # Configurare backend URL
├── index.html           # HTML principal
├── main.ts              # Entry point
└── styles.scss          # Stiluri globale
```

## Componente

**LoginComponent** (`components/login/`)

- Formular autentificare (email, password)
- Integrare cu AuthService
- Salvare JWT în localStorage
- Redirect la /home după login

**RegisterComponent** (`components/register/`)

- Formular înregistrare (nume, email, password)
- Validare formular
- Redirect după înregistrare

**SetupProfile** (`components/setup-profile/`)

- Configurare profil după înregistrare
- Completare informații suplimentare
- Integrare SetupProfileService

**HomeComponent** (`components/home/`)

- Pagina principală
- Protejată de AuthGuard

**InboxComponent** (`components/inbox/`)

- Gestiune mesaje
- Protejată de AuthGuard

**NavigationComponent** (`components/navigation/`)

- Bară de navigare
- Include SettingsModalComponent
- Vizibil doar pentru utilizatori autentificați

**MainLayoutComponent** (`layouts/main-layout/`)

- Wrapper pentru rute autentificate
- Include NavigationComponent
- Router-outlet pentru child routes

## Servicii

**AuthService** (`services/auth/auth.service.ts`)

Metode:

- `login(loginDto: LoginDto): Observable<LoginResponse>` - Autentificare utilizator
- `register(user)` - Înregistrare (placeholder pentru implementare viitoare)
- `logout()` - Elimină token din localStorage
- `saveToken(token: string)` - Salvează JWT în localStorage
- `getToken(): string | null` - Returnează token curent
- `isLoggedIn(): boolean` - Verifică dacă utilizatorul este autentificat

Configurare:

- API URL: `http://127.0.0.1:5098/` (definit în `enviroment.ts`)
- Endpoint login: `POST /api/login`

**SetupProfileService** (`services/user/setup-profile.service.ts`)

- Gestionează configurarea profilului utilizatorului
- Operații CRUD pentru profil

**PingService** (`services/ping/ping.service.ts`)

- Verifică conectivitatea cu backend
- Health check endpoint

## Rutare și Guards

**Configurare Rute** (`app.routes.ts`)

| Rută             | Component           | Guard      | Descriere                        |
| ---------------- | ------------------- | ---------- | -------------------------------- |
| `/login`         | LoginComponent      | GuestGuard | Pagină autentificare             |
| `/register`      | RegisterComponent   | GuestGuard | Înregistrare                     |
| `/setup-profile` | SetupProfile        | GuestGuard | Configurare profil               |
| `/home`          | HomeComponent       | AuthGuard  | Pagină principală                |
| `/inbox`         | InboxComponent      | AuthGuard  | Inbox mesaje                     |
| `/`              | MainLayoutComponent | -          | Layout parent, redirect la /home |
| `/**`            | -                   | -          | Redirect la /login               |

**AuthGuard** (`guards/auth.guard.ts`)

- Verifică dacă există token în localStorage
- Dacă lipsește token → redirect la `/login`
- Returnează `true` dacă autentificat

**GuestGuard** (`guards/guest.guard.ts`)

- Permite acces doar utilizatorilor neautentificați
- Dacă utilizatorul este autentificat → redirect la `/home`
- Previne accesul la login/register pentru utilizatori autentificați

## Autentificare

**Flux de Autentificare:**

1. Utilizator completează formular login (email, password)
2. LoginComponent apelează AuthService.login()
3. POST request la `http://127.0.0.1:5098/api/login`
4. Backend returnează JWT token
5. Token salvat în localStorage (key: `token`)
6. Redirect la `/home`

**HTTP Interceptor** (`auth-interceptor.ts`)

Funcționalități:

- Adaugă automat header `Authorization: Bearer <token>` la toate cererile HTTP
- Interceptează răspunsuri 401 (Unauthorized)
- La eroare 401: logout automat + ștergere token + redirect la /login

Implementare:

```typescript
const authReq = token
  ? req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`),
    })
  : req;
```

**Storage Token:**

- Stocare: localStorage (key: `token`)
- Persistență: până la logout explicit
- Securitate: Token transmis în header la fiecare request

**Protecție Rute:**

- Rute protejate: `/home`, `/inbox` (necesită AuthGuard)
- Rute guest: `/login`, `/register`, `/setup-profile` (necesită GuestGuard)

## Instalare

**Prerequisite:**

- Node.js 18+
- npm 9+

**Pași:**

```bash
# Instalare dependențe
npm install

# Configurare backend URL
# Editați src/enviroment.ts:
export const environment = {
  baseUrl: 'http://127.0.0.1:5098/'  // URL-ul serverului backend
};

# Pornire development server
npm start

# Aplicația va rula la http://localhost:4200/
```

## Comenzi

**Dezvoltare:**

```bash
npm start                # Pornește dev server (ng serve)
npm run watch           # Build watch mode
```

**Build:**

```bash
npm run build           # Build producție
```

**Testing:**

```bash
npm test                # Rulează unit tests (Karma + Jasmine)
```

**Angular CLI:**

```bash
ng generate component components/<name> --standalone
ng generate service services/<name>/<name>
ng generate guard guards/<name>
ng build --configuration production
```

## Ghid Dezvoltare

**Adăugare Componentă:**

```bash
ng generate component components/profile --standalone
```

Fișiere generate: `.ts`, `.html`, `.scss`, `.spec.ts`

**Adăugare Serviciu:**

```bash
ng generate service services/my-service/my-service
```

Serviciul va fi `providedIn: 'root'` (singleton).

**Adăugare Rută:**

În `app.routes.ts`:

```typescript
{
  path: 'profile',
  component: ProfileComponent,
  canActivate: [AuthGuard]  // Dacă necesită autentificare
}
```

**Adăugare Interface:**

În `src/app/interfaces/`:

```typescript
// user.dto.ts
export interface UserDto {
  id: number;
  name: string;
  email: string;
}
```

**HTTP Requests:**

Token-ul JWT este adăugat automat de `authInterceptor`. Nu trebuie să setați manual header-ul Authorization.

```typescript
import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../enviroment';

export class DataService {
  private http = inject(HttpClient);
  private apiUrl = environment.baseUrl;

  getData() {
    return this.http.get(`${this.apiUrl}api/data`);
    // Header Authorization adăugat automat
  }
}
```

**Best Practices:**

- Folosiți standalone components
- Injectați servicii cu `inject()` sau constructor
- Separați logica în servicii reutilizabile
- Folosiți TypeScript interfaces pentru type safety
- Naming: `*.component.ts`, `*.service.ts`, `*.guard.ts`, `*.dto.ts`
- SCSS pentru stiluri component-specific
- Scrieți unit tests (coverage minim 70%)

**Integrare Backend:**

Endpoints necesare:

```
POST /api/login
Body: { email: string, password: string }
Response: { token: string, ... }

POST /api/setup-profile
Headers: Authorization: Bearer <token>
Body: SetupProfileDto
Response: { ... }
```

CORS: Backend-ul trebuie să permită cereri de la:

- `http://localhost:4200` (dezvoltare)
- Domeniul de producție

**Debugging:**

Verificare token:

```javascript
localStorage.getItem('token'); // În Chrome DevTools Console
```

Șterge token manual:

```javascript
localStorage.removeItem('token');
```

Network Tab (Chrome DevTools):

- Verificați header `Authorization: Bearer <token>`
- Monitorizați statusuri 401 Unauthorized

**Configurare App** (`app.config.ts`):

```typescript
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideRouter(routes),
  ],
};
```

---

**Versiune Angular:** 20.3.0 | **TypeScript:** 5.9.2 | **Actualizat:** Ianuarie 2026
