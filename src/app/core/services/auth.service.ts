import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService, ApiResponse } from './api.service';
import { firstValueFrom } from 'rxjs';

export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  designation?: string;
  organization?: {
    _id?: string;
    name?: string;
    slug?: string;
  };
  permissions?: string[];
}

export interface LoginPayload {
  identifier: string;
  password: string;
  slug: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

const TOKEN_KEY = 'corely_token';
const USER_KEY = 'corely_user';
const SLUG_KEY = 'corely_slug';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _user = signal<User | null>(this.loadUser());
  private _token = signal<string | null>(this.loadToken());

  readonly user = this._user.asReadonly();
  readonly isAuthenticated = computed(() => !!this._token());

  constructor(
    private api: ApiService,
    private router: Router,
  ) {}

  async login(payload: LoginPayload): Promise<void> {
    const res = await firstValueFrom(this.api.post<LoginResponse>('/auth/login', payload));

    if (res.success && res.data) {
      const { access_token, user } = res.data;
      localStorage.setItem(TOKEN_KEY, access_token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      localStorage.setItem(SLUG_KEY, payload.slug);
      this._token.set(access_token);
      this._user.set(user);
    } else {
      throw new Error(res.error?.message || 'Login failed');
    }
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(SLUG_KEY);
    this._token.set(null);
    this._user.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return this._token();
  }

  getSlug(): string | null {
    return localStorage.getItem(SLUG_KEY);
  }

  private loadToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  private loadUser(): User | null {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }
}
